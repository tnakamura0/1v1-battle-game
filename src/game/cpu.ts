import { getLegalActions, resolveTurn } from '@/game/rules'
import type { Action, BattlePreset, CpuDifficulty, PlayerState, TurnRecord } from '@/game/types'

const BASE_WEIGHT = 1

// 「つよい」の期待値評価に使う価値の単位。
// ダメージを基準（10）とし、エネルギー1点・ガードのクールダウン1ターン分を
// それより十分小さい値に置くことで「ダメージ最優先・ただしリソースも見る」評価になる。
const DAMAGE_VALUE = 10
const LETHAL_MULTIPLIER = 1.5
const ENERGY_VALUE = 2.5
const GUARD_TEMPO_PER_TURN = 1.5
/**
 * 解決後に自分が選べる手が1つ多いことの価値（Issue #135 / #134）。
 *
 * **テストが通る範囲は [1.75, 2.5] で、2 はそのほぼ中央。** 下回ると報告された
 * 攻略法に対する最悪プリセット（hp2/cd3）が落ち、上回るとガードを切らなくなりすぎて
 * ランダムな相手への勝率が落ちる。窓が広いので、この値は特定のシードに
 * 当てはめたものではない。動かすときは両端を測り直すこと。
 *
 * **GUARD_TEMPO_PER_TURN を下げて相殺しないこと。** この項はガードを
 * 「次ターンの選択肢を1つ失う行為」として罰するので guardTempo と重なって見えるが、
 * guardTempo はクールダウンの長さに比例し、こちらは長さによらない定数で、別のものを
 * 測っている。実測でも 1.5 → 1.0 → 0.5 と下げるほど全プリセットで悪化した。
 */
const MOBILITY_VALUE = 2
// 相手の行動頻度を予測にどれだけ強く反映するか（一様な事前分布に対する倍率）
const PATTERN_BIAS = 3
// 相手の行動履歴を1ターン遡るごとに掛ける減衰率。直近の手ほど重く見る
const RECENCY_DECAY = 0.7
// 盤面の状況から読み取れる相手の動機（後がない・こちらがガードできない）の倍率
const SITUATIONAL_BIAS = 2.5
// softmaxの温度。小さいほど最善手に偏り、大きいほど散らばる
const TEMPERATURE = 1.5

interface CpuDecisionContext {
  difficulty?: CpuDifficulty
  history?: TurnRecord[]
}

export function decideCpuAction(
  cpu: PlayerState,
  human: PlayerState,
  preset: BattlePreset,
  rng: () => number = Math.random,
  { difficulty = 'normal', history = [] }: CpuDecisionContext = {},
): Action {
  if (difficulty === 'strong') {
    return pickWeighted(toSoftmaxWeights(scoreStrongActions(cpu, human, preset, history)), rng)
  }

  const legalActions = getLegalActions(cpu, human)
  const weights = new Map<Action, number>(legalActions.map((action) => [action, BASE_WEIGHT]))

  const bumpWeight = (action: Action, multiplier: number) => {
    const current = weights.get(action)
    if (current === undefined) return
    weights.set(action, current * multiplier)
  }

  // 相手のHPが少ない、または自エネルギーが潤沢なときは攻撃を優先する
  if (human.hp <= 1) {
    bumpWeight('attack', 3)
  } else if (cpu.energy >= 4) {
    bumpWeight('attack', 2)
  }

  // 自エネルギーが少ないときはチャージを優先する
  if (cpu.energy === 0) {
    bumpWeight('charge', 4)
  } else if (cpu.energy <= 1) {
    bumpWeight('charge', 2)
  }

  // 相手が攻撃してくる可能性がある（エネルギーを持っている）ときはガードを優先する
  if (human.energy > 0) {
    bumpWeight('guard', 2.5)
  }

  return pickWeighted(weights, rng)
}

/**
 * 「つよい」の思考の中核。自分の合法手それぞれについて、相手の予測行動分布で
 * 重み付けした1ターン先の期待値を返す。
 *
 * 盤面の評価は実際のルール（resolveTurn）を回した結果の差分から求めるため、
 * ガード成功時の+1エネルギーやエネルギー上限といった仕様が自動的に反映される。
 *
 * 見るのは1手先だけだが、**解決後に選べる手の数**（scorePair の mobility）を
 * 項に持つことで、「その手を指すと次に動けなくなる」ことだけは1手先の評価に入る。
 * それ以上の読みが要るように見えたときは、まず2手先読みではなく、
 * 盤面から読み取れる情報を項として足せないかを疑うこと。
 */
export function scoreStrongActions(
  cpu: PlayerState,
  human: PlayerState,
  preset: BattlePreset,
  history: TurnRecord[],
): Map<Action, number> {
  const humanDistribution = predictHumanDistribution(human, cpu, history)

  const scores = new Map<Action, number>()
  for (const cpuAction of getLegalActions(cpu, human)) {
    let expected = 0
    for (const [humanAction, probability] of humanDistribution) {
      expected += probability * scorePair(cpu, human, preset, cpuAction, humanAction)
    }
    scores.set(cpuAction, expected)
  }
  return scores
}

/**
 * 相手が次に取る行動の確率分布。合法手を等確率とした一様な事前分布に、
 * 相手のこれまでの行動の出現頻度（直近ほど重い）を PATTERN_BIAS 倍で混ぜる。
 *
 * 「直近N手の最頻出行動」のような決め打ちの予測にしないのは、攻撃と
 * チャージを交互に選ぶような相手に対して予測が毎ターン裏返り、かえって
 * 損な行動を選び続けてしまうため。頻度を滑らかに混ぜることで、偏った
 * 相手には強く反応しつつ、規則的に散らす相手には過剰反応しなくなる。
 *
 * 相手のガードがクールダウン中なら getLegalActions が guard を除くため、
 * 「今は攻撃をガードされる心配がない」という読みが専用のコードなしで入る。
 */
function predictHumanDistribution(
  human: PlayerState,
  cpu: PlayerState,
  history: TurnRecord[],
): Map<Action, number> {
  const legalActions = getLegalActions(human, cpu)
  const frequency = recentActionFrequency(history)

  const weights = new Map<Action, number>(
    legalActions.map((action) => [
      action,
      BASE_WEIGHT + PATTERN_BIAS * (frequency.get(action) ?? 0),
    ]),
  )

  // 履歴に表れない、盤面から読み取れる相手の動機も加味する。
  // あと1発で負ける相手はガードを選びやすく、こちらがガードできないターンは
  // 相手が安心して攻撃してくる。
  const bias = (action: Action, multiplier: number) => {
    const current = weights.get(action)
    if (current === undefined) return
    weights.set(action, current * multiplier)
  }
  if (human.hp <= 1) bias('guard', SITUATIONAL_BIAS)
  if (cpu.guardCooldownRemaining > 0) bias('attack', SITUATIONAL_BIAS)

  const total = Array.from(weights.values()).reduce((sum, weight) => sum + weight, 0)
  return new Map(Array.from(weights, ([action, weight]) => [action, weight / total]))
}

/**
 * 相手の行動の出現頻度（合計1）。historyは新しい順なので、古い手ほど減衰させる。
 *
 * 選択肢が1つしかなかったターン（エネルギー0で攻撃もガードもできず、チャージ
 * しか選べないなど）は相手の意思を表していないため数えない。これを数えると
 * 「エネルギーが尽きるたびに強制されたチャージ」を相手の癖と誤読してしまう。
 */
function recentActionFrequency(history: TurnRecord[]): Map<Action, number> {
  const counts = new Map<Action, number>()
  let total = 0

  history.forEach((turn, index) => {
    if (getLegalActions(turn.playerBefore, turn.cpuBefore).length <= 1) return
    const weight = RECENCY_DECAY ** index
    counts.set(turn.playerAction, (counts.get(turn.playerAction) ?? 0) + weight)
    total += weight
  })

  if (total === 0) return counts
  return new Map(Array.from(counts, ([action, count]) => [action, count / total]))
}

/** 自分と相手が特定の行動を選んだ1ターンの結果を、CPU視点の点数に換算する */
function scorePair(
  cpu: PlayerState,
  human: PlayerState,
  preset: BattlePreset,
  cpuAction: Action,
  humanAction: Action,
): number {
  // resolveTurn は (player, cpu, playerAction, cpuAction, preset) の並びなので相手をplayer側に置く
  const { player: nextHuman, cpu: nextCpu } = resolveTurn(
    human,
    cpu,
    humanAction,
    cpuAction,
    preset,
  )

  // 勝敗が決まる一撃は通常のダメージより価値が高い
  const damageDealt =
    (human.hp - nextHuman.hp) * DAMAGE_VALUE * (nextHuman.hp <= 0 ? LETHAL_MULTIPLIER : 1)
  const damageTaken =
    (cpu.hp - nextCpu.hp) * DAMAGE_VALUE * (nextCpu.hp <= 0 ? LETHAL_MULTIPLIER : 1)

  const energyDelta = nextCpu.energy - cpu.energy - (nextHuman.energy - human.energy)

  // ガードを使うと数ターン再使用できなくなる。相手がガードを切ったならその分こちらの得。
  const guardTempo =
    ((humanAction === 'guard' ? 1 : 0) - (cpuAction === 'guard' ? 1 : 0)) *
    preset.guardCooldownTurns *
    GUARD_TEMPO_PER_TURN

  /*
   * 解決後に自分が選べる手の数。Issue #135 で導入し、Issue #134 で形を見直した。
   *
   * これがないと、**自分を動けない状態に追い込む手を避けられない**。導入前の実測では、
   * CPUが受けたダメージの62.6%が「合法手が1つしかない局面」で起きていた。
   * 典型は、ガードのクールダウン中にエネルギーを使い切ってチャージ一択になった状態で、
   * 相手から見れば的でしかない。
   *
   * 効くのは2箇所。どちらも専用の分岐を書かずに同じ式から出てくる。
   * - **ガードを切る判断**：ガードは次ターンの選択肢を1つ減らすので罰が増える
   * - **最後の1エネルギーを使う判断**：0にすると攻撃を失う。予備があるときの攻撃と
   *   区別が付くようになる（この項がないと両者は完全に同点になる）
   *
   * ## 相手の選択肢を引き算しないこと
   *
   * 当初は「自分 − 相手」だったが、**この減算は自分側の罰をほとんど打ち消す**。
   * ガードの合法性は「相手のエネルギーが0でないこと」なので（rules.ts）、
   * 自分がエネルギーを使い切ると相手のガードも同時に非合法になり、
   * 両者の選択肢が揃って1つ減る枝が生まれるため。減算をやめたことで、
   * 報告された攻略法に対する最悪プリセット（hp2/cd3）の勝率は 0.495 → 0.680 になった。
   *
   * ## 決着した盤面でもそのまま数えること
   *
   * かつては `hp <= 0` の盤面で0にしていたが、**この項は常に正なので、
   * 0にすると「相手を倒す手」だけが減点される**。とどめを刺すのをためらう
   * CPUになるので、ゲートを置かないこと（cpu.test.ts の
   * `values a finishing blow above an ordinary hit` がこれを固定している）。
   *
   * 自分が倒れる枝で選択肢を数えてしまうのは無意味だが、そちらは damageTaken
   * （致命傷は -15）に負ける。mobility は最大でも 3手 × 2 = 6 で、枝の間の**差**は
   * 高々4なので、-15 を覆せない。**MOBILITY_VALUE を大きくするとこの前提が崩れる**
   * ので、上げるときはここも見直すこと。
   * なお「自分が倒れる枝だけ0にする」中間案も試したが、そちらは
   * `決着が長引きすぎない` が落ちる。ゲートなしの素直な形が実測上いちばん良い。
   */
  const mobility = getLegalActions(nextCpu, nextHuman).length * MOBILITY_VALUE

  return damageDealt - damageTaken + energyDelta * ENERGY_VALUE + guardTempo + mobility
}

/**
 * 期待値を抽選用の重みに変換する。最大値を引いてから指数化してオーバーフローを避ける。
 *
 * **scores が空になることはない。** かつての根拠は「getLegalActions は必ずチャージを含む」
 * だったが、上限でのチャージが非合法になった（Issue #134）のでそれは成り立たない。
 * いまの根拠は、チャージが外れるのはエネルギーが上限のときだけで、
 * そのとき攻撃が必ず合法（`energy > 0`）だから。getLegalActions 側にも同じことを書いてある。
 *
 * 空だと best が -Infinity になり、続く pickWeighted も候補なしで破綻する。
 * 同じ前提に predictHumanDistribution も乗っている（合計0で割ることになる）。
 */
function toSoftmaxWeights(scores: Map<Action, number>): Map<Action, number> {
  const best = Math.max(...scores.values())
  return new Map(
    Array.from(scores, ([action, score]) => [action, Math.exp((score - best) / TEMPERATURE)]),
  )
}

function pickWeighted(weights: Map<Action, number>, rng: () => number): Action {
  const entries = Array.from(weights.entries())
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  const threshold = rng() * total

  let cumulative = 0
  for (const [action, weight] of entries) {
    cumulative += weight
    if (threshold < cumulative) return action
  }

  // 浮動小数点誤差でしきい値を超えなかった場合のフォールバック
  return entries[entries.length - 1][0]
}
