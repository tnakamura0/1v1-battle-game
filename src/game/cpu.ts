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

  return damageDealt - damageTaken + energyDelta * ENERGY_VALUE + guardTempo
}

/**
 * 期待値を抽選用の重みに変換する。最大値を引いてから指数化してオーバーフローを避ける。
 *
 * getLegalActions は必ずチャージを含むため scores が空になることはない。
 * 空だと best が -Infinity になり、続く pickWeighted も候補なしで破綻する。
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
