import { describe, expect, it } from 'vitest'
import { decideCpuAction, scoreStrongActions } from '@/game/cpu'
import {
  DEFAULT_PRESET,
  GUARD_COOLDOWN_OPTIONS,
  INITIAL_HP_OPTIONS,
  MAX_ENERGY,
} from '@/game/presets'
import { checkVictory, createInitialPlayerState, getLegalActions, resolveTurn } from '@/game/rules'
import type { Action, BattlePreset, CpuDifficulty, PlayerState, TurnRecord } from '@/game/types'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }

function state(overrides: Partial<PlayerState> = {}): PlayerState {
  return { hp: 3, energy: 2, guardCooldownRemaining: 0, ...overrides }
}

/** 相手が指定の行動を選んだ履歴。after側は実際のルールで解決して辻褄を合わせる */
function buildHistory(playerActions: Action[]): TurnRecord[] {
  return playerActions.map((playerAction, index) => {
    const playerBefore = state()
    const cpuBefore = state()
    const resolved = resolveTurn(playerBefore, cpuBefore, playerAction, 'charge', preset)
    return {
      turn: index + 1,
      playerAction,
      cpuAction: 'charge',
      playerBefore,
      playerAfter: resolved.player,
      cpuBefore,
      cpuAfter: resolved.cpu,
      outcome: resolved.outcome,
    }
  })
}

/** 1ターン目は双方エネルギー0でチャージ以外を選べない、意思の表れていない手 */
const FORCED_FIRST_TURN: TurnRecord = {
  turn: 1,
  playerAction: 'charge',
  cpuAction: 'charge',
  playerBefore: { hp: 2, energy: 0, guardCooldownRemaining: 0 },
  playerAfter: { hp: 2, energy: 1, guardCooldownRemaining: 0 },
  cpuBefore: { hp: 2, energy: 0, guardCooldownRemaining: 0 },
  cpuAfter: { hp: 2, energy: 1, guardCooldownRemaining: 0 },
  outcome: 'no-effect',
}

function scoreOf(scores: Map<Action, number>, action: Action): number {
  const score = scores.get(action)
  if (score === undefined) throw new Error(`${action} は評価対象に含まれていません`)
  return score
}

function bestAction(scores: Map<Action, number>): Action {
  return Array.from(scores.entries()).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  )[0]
}

type Strategy = (own: PlayerState, opponent: PlayerState, rng: () => number) => Action

/** ユーザーから報告された攻略法：溜めておき、相手がガードできないターンに撃つ */
const exploitStrategy: Strategy = (own, opponent) => {
  const legal = getLegalActions(own, opponent)
  if (own.hp <= 1 && legal.includes('guard')) return 'guard'
  if (opponent.guardCooldownRemaining > 0 && legal.includes('attack')) return 'attack'
  if (opponent.hp <= 1 && legal.includes('attack')) return 'attack'
  return 'charge'
}

/**
 * 溜めすぎない相手。上限に達したら溜めずに撃つ点**だけ**が exploitStrategy と違う。
 *
 * exploitStrategy は上限に達しても（増えないのに）溜め続けるため、
 * **全ターンの74.8%をチャージに費やす**（hp2/cd3・200戦の実測）。チャージは攻撃に
 * 対して負ける側なので、CPUはそこを撃つだけで一方的に得点できてしまい、
 * **資源管理の弱さが表に出ない**。上限で撃ち返してくる相手を別に用意することで、
 * 「自分を動けない状態に追い込んでいないか」（Issue #135）が勝率に現れるようになる。
 *
 * 分岐を複製せず exploitStrategy に委譲しているのは、「違いは1点だけ」という
 * この説明を、コードの形そのもので保つため。
 */
const cappedExploitStrategy: Strategy = (own, opponent, rng) => {
  const chosen = exploitStrategy(own, opponent, rng)
  if (chosen !== 'charge' || own.energy < MAX_ENERGY) return chosen
  // 上限に達している＝エネルギーは0でないので、攻撃は必ず合法
  return 'attack'
}

const randomStrategy: Strategy = (own, opponent, rng) => {
  const legal = getLegalActions(own, opponent)
  return legal[Math.floor(rng() * legal.length)]
}

const BATTLE_COUNT = 200
const MAX_SIMULATED_TURNS = 100

/** テストを決定的にするためのシード付き疑似乱数（mulberry32） */
function seededRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function playBattle(
  battlePreset: BattlePreset,
  difficulty: CpuDifficulty,
  strategy: Strategy,
  rng: () => number,
): { winner: 'player' | 'cpu' | null; turns: number } {
  let player = createInitialPlayerState(battlePreset)
  let cpu = createInitialPlayerState(battlePreset)
  let history: TurnRecord[] = []

  for (let turn = 1; turn <= MAX_SIMULATED_TURNS; turn += 1) {
    const playerAction = strategy(player, cpu, rng)
    const cpuAction = decideCpuAction(cpu, player, battlePreset, rng, { difficulty, history })
    const result = resolveTurn(player, cpu, playerAction, cpuAction, battlePreset)

    history = [
      {
        turn,
        playerAction,
        cpuAction,
        playerBefore: player,
        playerAfter: result.player,
        cpuBefore: cpu,
        cpuAfter: result.cpu,
        outcome: result.outcome,
      },
      ...history,
    ]
    player = result.player
    cpu = result.cpu

    const winner = checkVictory(player, cpu)
    if (winner !== null) return { winner, turns: turn }
  }
  return { winner: null, turns: MAX_SIMULATED_TURNS }
}

function simulate(
  battlePreset: BattlePreset,
  difficulty: CpuDifficulty,
  strategy: Strategy,
): { wins: number; losses: number } {
  let wins = 0
  let losses = 0
  for (let seed = 1; seed <= BATTLE_COUNT; seed += 1) {
    const { winner } = playBattle(battlePreset, difficulty, strategy, seededRng(seed))
    if (winner === 'cpu') wins += 1
    else if (winner === 'player') losses += 1
  }
  return { wins, losses }
}

/** 決着までのターン数を昇順で返す */
function turnCounts(
  battlePreset: BattlePreset,
  difficulty: CpuDifficulty,
  strategy: Strategy,
): number[] {
  const lengths: number[] = []
  for (let seed = 1; seed <= BATTLE_COUNT; seed += 1) {
    lengths.push(playBattle(battlePreset, difficulty, strategy, seededRng(seed)).turns)
  }
  return lengths.sort((a, b) => a - b)
}

describe('decideCpuAction', () => {
  it('never returns an illegal action across the full rng range', () => {
    const cpu = state({ energy: 0 })
    const human = state({ energy: 0 })

    for (let i = 0; i <= 20; i += 1) {
      const rng = () => i / 20
      expect(decideCpuAction(cpu, human, preset, rng)).toBe('charge')
    }
  })

  it('only picks between charge and guard when attack is illegal', () => {
    const cpu = state({ energy: 0 })
    const human = state({ energy: 3 })

    for (let i = 0; i <= 20; i += 1) {
      const rng = () => i / 20
      expect(['charge', 'guard']).toContain(decideCpuAction(cpu, human, preset, rng))
    }
  })

  it('never picks guard while the cpu is on guard cooldown', () => {
    const cpu = state({ energy: 2, guardCooldownRemaining: 1 })
    const human = state({ energy: 3 })

    for (let i = 0; i <= 20; i += 1) {
      const rng = () => i / 20
      expect(decideCpuAction(cpu, human, preset, rng)).not.toBe('guard')
    }
  })

  it('weights toward charge when cpu energy is 0', () => {
    const cpu = state({ energy: 0 })
    const human = state({ energy: 3 })
    // weights: charge=4, guard=2.5, total=6.5 -> charge covers [0, 4/6.5)
    expect(decideCpuAction(cpu, human, preset, () => 0)).toBe('charge')
    expect(decideCpuAction(cpu, human, preset, () => 0.5)).toBe('charge')
    expect(decideCpuAction(cpu, human, preset, () => 0.99)).toBe('guard')
  })

  it('weights toward attack when the human is nearly defeated', () => {
    const cpu = state({ energy: 2 })
    const human = state({ hp: 1, energy: 2 })
    // weights: charge=1, attack=3, guard=2.5, total=6.5
    // cumulative: charge [0,1) attack [1,4) guard [4,6.5)
    expect(decideCpuAction(cpu, human, preset, () => 0)).toBe('charge')
    expect(decideCpuAction(cpu, human, preset, () => 0.5)).toBe('attack')
    expect(decideCpuAction(cpu, human, preset, () => 0.99)).toBe('guard')
  })

  it('weights toward guard when the human has energy to attack with', () => {
    const cpu = state({ energy: 2 })
    const human = state({ hp: 5, energy: 1 })
    // weights: charge=1, attack=1, guard=2.5, total=4.5
    // cumulative: charge [0,1) attack [1,2) guard [2,4.5)
    expect(decideCpuAction(cpu, human, preset, () => 0.99)).toBe('guard')
  })

  it('ignores history when difficulty is normal', () => {
    const cpu = state({ energy: 2 })
    const human = state({ energy: 0 })
    const history = buildHistory(['charge', 'charge', 'charge'])
    // weights: charge=1, attack=1, total=2 -> charge[0,1) attack[1,2)
    expect(decideCpuAction(cpu, human, preset, () => 0.3, { difficulty: 'normal', history })).toBe(
      'charge',
    )
  })

  describe('strong difficulty', () => {
    it('never picks guard while on cooldown, across the full rng range', () => {
      // 攻撃の連打を読ませてガードを最も魅力的に見せた上で、それでもガードを
      // 選ばないこと（＝合法手の絞り込みが効いていること）を確かめる
      const cpu = state({ energy: 2, guardCooldownRemaining: 1 })
      const human = state({ energy: 3 })
      const history = buildHistory(['attack', 'attack', 'attack'])

      for (let i = 0; i <= 20; i += 1) {
        const action = decideCpuAction(cpu, human, preset, () => i / 20, {
          difficulty: 'strong',
          history,
        })
        expect(['charge', 'attack']).toContain(action)
      }
    })

    it('never picks attack without the energy to pay for it', () => {
      const cpu = state({ energy: 0 })
      const human = state({ energy: 3 })
      const history = buildHistory(['charge', 'charge', 'charge'])

      for (let i = 0; i <= 20; i += 1) {
        const action = decideCpuAction(cpu, human, preset, () => i / 20, {
          difficulty: 'strong',
          history,
        })
        expect(['charge', 'guard']).toContain(action)
      }
    })

    it('attacks into the window where the human cannot guard', () => {
      const scores = scoreStrongActions(
        state({ energy: 2 }),
        state({ energy: 1, guardCooldownRemaining: 2 }),
        preset,
        [],
      )
      expect(bestAction(scores)).toBe('attack')
    })

    it('ranks guard below attack on the second turn, when both sides hold one energy', () => {
      // ユーザーから「2ターン目のガードが多すぎる」と指摘された局面そのもの
      const scores = scoreStrongActions(
        { hp: 2, energy: 1, guardCooldownRemaining: 0 },
        { hp: 2, energy: 1, guardCooldownRemaining: 0 },
        DEFAULT_PRESET,
        [FORCED_FIRST_TURN],
      )
      expect(scoreOf(scores, 'guard')).toBeLessThan(scoreOf(scores, 'attack'))
    })

    it('ignores turns where the human had only one legal action', () => {
      const cpu = { hp: 2, energy: 1, guardCooldownRemaining: 0 }
      const human = { hp: 2, energy: 1, guardCooldownRemaining: 0 }
      // 1ターン目のチャージは強制された手なので、履歴なしと同じ評価になるべき
      expect(scoreStrongActions(cpu, human, DEFAULT_PRESET, [FORCED_FIRST_TURN])).toEqual(
        scoreStrongActions(cpu, human, DEFAULT_PRESET, []),
      )
    })

    it('reads a charge-heavy opponent and attacks', () => {
      const scores = scoreStrongActions(
        state({ energy: 2 }),
        state({ energy: 1 }),
        preset,
        buildHistory(['charge', 'charge', 'charge']),
      )
      expect(bestAction(scores)).toBe('attack')
    })

    it('reads an attack-heavy opponent and prefers guard over charge', () => {
      const scores = scoreStrongActions(
        state({ energy: 2 }),
        state({ energy: 1 }),
        preset,
        buildHistory(['attack', 'attack', 'attack']),
      )
      expect(scoreOf(scores, 'guard')).toBeGreaterThan(scoreOf(scores, 'charge'))
    })

    it('values a finishing blow above an ordinary hit', () => {
      const cpu = state({ energy: 2 })
      const openHuman = state({ guardCooldownRemaining: 2, energy: 1 })
      const finishable = scoreStrongActions(cpu, { ...openHuman, hp: 1 }, preset, [])
      const healthy = scoreStrongActions(cpu, { ...openHuman, hp: 3 }, preset, [])
      expect(scoreOf(finishable, 'attack')).toBeGreaterThan(scoreOf(healthy, 'attack'))
    })

    /*
     * Issue #135：自分を動けない状態に追い込む手を避けられること。
     *
     * この2つの局面は**解決前**の条件がすべて同じ（自分の合法手・相手の合法手・
     * ダメージ・エネルギー増減・guardTempo）で、違うのは解決後の選択肢の数だけ。
     * エネルギー1で撃つと0になり、ガードもクールダウン中なのでチャージ一択になる。
     *
     * ただし**解決後は相手の選択肢の数も変わる**。ガードの合法性は相手のエネルギーを
     * 見るので、自分が0になると相手もガードを失うため。相手がチャージ/攻撃を選ぶ枝では
     * 両者が1つずつ減って差が打ち消され、**差が残るのは相手がガードを選ぶ枝だけ**。
     * それでも合計では差が付く（実測 -1.000 対 -0.556）。
     *
     * mobility を外すと両者は完全に同点になり、このテストは落ちる。
     */
    it('penalises spending the last energy while its own guard is on cooldown', () => {
      const human = state({ energy: 2 })
      const lastEnergy = scoreStrongActions(
        state({ energy: 1, guardCooldownRemaining: 2 }),
        human,
        preset,
        [],
      )
      const withSpare = scoreStrongActions(
        state({ energy: 2, guardCooldownRemaining: 2 }),
        human,
        preset,
        [],
      )
      expect(scoreOf(lastEnergy, 'attack')).toBeLessThan(scoreOf(withSpare, 'attack'))
    })

    it('scores charge lowest once energy is capped', () => {
      const scores = scoreStrongActions(
        state({ energy: MAX_ENERGY }),
        state({ energy: 1 }),
        preset,
        [],
      )
      expect(bestAction(scores)).not.toBe('charge')
      expect(scoreOf(scores, 'charge')).toBeLessThan(scoreOf(scores, 'attack'))
    })
  })

  // 「つよい」が「ふつう」より実際に強いことを、シード固定の対戦シミュレーションで確かめる。
  // 個々の重み付けを手計算で検証するより、対戦成績で押さえたほうが定数の微調整に強い。
  //
  // 勝率のしきい値は「ふつうとの差」だけでなく絶対値でも表明する。差だけを見ると、
  // 両者が拮抗する相手（ランダム）では乱数のゆらぎに埋もれて実質何も検証しない
  // テストになりうるため。
  describe('strong difficulty wins more than normal in simulated battles', () => {
    // 選択可能なプリセットの全組み合わせを対象にする（プリセットごとに成績が変わるため）
    const allPresets = INITIAL_HP_OPTIONS.flatMap((initialHp) =>
      GUARD_COOLDOWN_OPTIONS.map((guardCooldownTurns) => ({ initialHp, guardCooldownTurns })),
    )

    /**
     * しきい値は初期HPで変える。HP1（サドンデス）だけ緩い。理由は2つある。
     *
     * 1. 最初に通った1発で決着するので、読みの差が勝敗に反映される機会が1回しかない。
     *    「ふつう」でも運で勝ち切ることが増える。
     * 2. exploitStrategy は `own.hp <= 1` ならガードを最優先するため、初期HPが1だと
     *    1ターン目から条件を満たし、**「溜めてクールダウン中に撃つ」という攻略法そのものが
     *    成立しない**。実質「ガードできるならガードする」相手との対戦になっている。
     *
     * HP2/3と同じ上限にすると hp1/cd3 が上限0.3に対して実測0.295（Issue #92 時点）で、
     * 200戦中1戦差でしか通らない。回帰ではなくノイズを検知するテストになり、CPUの定数を
     * 少し触るだけで落ちるため、HP1は上限を緩めて余裕を持たせる。
     *
     * 緩めるのは「ふつう」の上限と、ランダム相手の「つよい」の下限だけ。
     * 「つよい」が0.6を超えることと、両者の差そのものは緩めない。
     * サドンデスでも「つよい」が明確に強いことは変わらないため。
     */
    const thresholdsFor = (initialHp: BattlePreset['initialHp']) =>
      initialHp === 1
        ? { normalMaxVsExploit: 0.4, strongMinVsRandom: 0.6 }
        : { normalMaxVsExploit: 0.3, strongMinVsRandom: 0.65 }

    for (const battlePreset of allPresets) {
      const label = `hp${battlePreset.initialHp}/cd${battlePreset.guardCooldownTurns}`
      const { normalMaxVsExploit, strongMinVsRandom } = thresholdsFor(battlePreset.initialHp)

      it(`${label}: 報告された攻略法（溜めてガードのクールダウン中に撃つ）を跳ね返す`, () => {
        const normal = simulate(battlePreset, 'normal', exploitStrategy)
        const strong = simulate(battlePreset, 'strong', exploitStrategy)
        // 「ふつう」は攻略法にほぼ勝てないが、「つよい」ははっきり勝ち越す
        expect(normal.wins / BATTLE_COUNT).toBeLessThan(normalMaxVsExploit)
        expect(strong.wins / BATTLE_COUNT).toBeGreaterThan(0.6)
        expect(strong.losses).toBeLessThan(normal.losses)
      })

      it(`${label}: 合法手からランダムに選ぶ相手にも勝ち越す`, () => {
        const normal = simulate(battlePreset, 'normal', randomStrategy)
        const strong = simulate(battlePreset, 'strong', randomStrategy)
        expect(strong.wins / BATTLE_COUNT).toBeGreaterThan(strongMinVsRandom)
        expect(strong.wins).toBeGreaterThan(normal.wins)
      })

      /*
       * Issue #135：溜めすぎない相手に対する下限。
       *
       * 0.25 という低い値なのは、この相手が exploitStrategy よりはるかに強いため
       * （あちらは74.8%のターンをチャージに費やす）。上限ではなく**下限**として
       * 置いており、狙いは「自分を動けない状態に追い込む」退行を検知すること。
       *
       * 実効的に効いているのは hp2/cd2 と hp2/cd3 の2つだけで、残りは余裕がある。
       * 導入時の実測（cd1 / cd2 / cd3）:
       *   hp1: 0.925 / 0.895 / 0.740
       *   hp2: 0.865 / 0.305 / 0.310  ← ここが下限に近い
       *   hp3: 0.955 / 0.880 / 0.925
       * mobility を外すと hp2/cd2 が 0.185、hp2/cd3 が 0.190 まで落ちてここが落ちる。
       *
       * **hp2 系の余裕は200戦中11〜12戦しかない。** CPUの定数を触って落ちたときは、
       * しきい値を下げる前に「動けない局面を増やしていないか」をまず疑うこと。
       */
      it(`${label}: 溜めすぎない相手にも大きくは負け越さない`, () => {
        const normal = simulate(battlePreset, 'normal', cappedExploitStrategy)
        const strong = simulate(battlePreset, 'strong', cappedExploitStrategy)
        expect(strong.wins / BATTLE_COUNT).toBeGreaterThan(0.25)
        expect(strong.wins).toBeGreaterThan(normal.wins)
      })
    }

    it('決着が長引きすぎない', () => {
      // 強くする代わりに、読み合いが噛み合って延々と決着がつかなくなっていないこと
      const lengths = turnCounts(DEFAULT_PRESET, 'strong', exploitStrategy)
      const median = lengths[Math.floor(lengths.length / 2)]
      expect(median).toBeLessThan(15)
      expect(lengths.filter((turns) => turns >= MAX_SIMULATED_TURNS)).toHaveLength(0)
    })
  })
})
