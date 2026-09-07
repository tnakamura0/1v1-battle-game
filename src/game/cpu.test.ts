import { describe, expect, it } from 'vitest'
import { decideCpuAction, scoreStrongActions } from '@/game/cpu'
import { DEFAULT_PRESET, MAX_ENERGY } from '@/game/presets'
import { checkVictory, createInitialPlayerState, getLegalActions, resolveTurn } from '@/game/rules'
import type { Action, BattlePreset, CpuDifficulty, PlayerState, TurnRecord } from '@/game/types'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }

function state(overrides: Partial<PlayerState> = {}): PlayerState {
  return { hp: 3, energy: 2, guardCooldownRemaining: 0, ...overrides }
}

function buildHistory(playerActions: Action[]): TurnRecord[] {
  return playerActions.map((playerAction, index) => ({
    turn: index + 1,
    playerAction,
    cpuAction: 'charge',
    playerBefore: state(),
    playerAfter: state(),
    cpuBefore: state(),
    cpuAfter: state(),
    outcome: 'no-effect',
  }))
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

const randomStrategy: Strategy = (own, opponent, rng) => {
  const legal = getLegalActions(own, opponent)
  return legal[Math.floor(rng() * legal.length)]
}

const BATTLE_COUNT = 300
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
): 'player' | 'cpu' | null {
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
    if (winner !== null) return winner
  }
  return null
}

function simulate(
  battlePreset: BattlePreset,
  difficulty: CpuDifficulty,
  strategy: Strategy,
): { wins: number; losses: number } {
  let wins = 0
  let losses = 0
  for (let seed = 1; seed <= BATTLE_COUNT; seed += 1) {
    const winner = playBattle(battlePreset, difficulty, strategy, seededRng(seed))
    if (winner === 'cpu') wins += 1
    else if (winner === 'player') losses += 1
  }
  return { wins, losses }
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
    it('never returns an illegal action across the full rng range', () => {
      const cpu = state({ energy: 0, guardCooldownRemaining: 1 })
      const human = state({ energy: 3 })
      const history = buildHistory(['attack', 'attack', 'attack'])

      for (let i = 0; i <= 20; i += 1) {
        const action = decideCpuAction(cpu, human, preset, () => i / 20, {
          difficulty: 'strong',
          history,
        })
        expect(action).toBe('charge')
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
  describe('strong difficulty wins more than normal in simulated battles', () => {
    const opponents: [string, Strategy][] = [
      ['チャージで溜めてガードのクールダウン中に攻める攻略法', exploitStrategy],
      ['合法手からランダムに選ぶ相手', randomStrategy],
    ]

    for (const battlePreset of [DEFAULT_PRESET, { initialHp: 3, guardCooldownTurns: 2 } as const]) {
      for (const [label, strategy] of opponents) {
        it(`hp${battlePreset.initialHp}/cd${battlePreset.guardCooldownTurns}: ${label}`, () => {
          const normal = simulate(battlePreset, 'normal', strategy)
          const strong = simulate(battlePreset, 'strong', strategy)
          expect(strong.wins).toBeGreaterThan(normal.wins)
          expect(strong.losses).toBeLessThan(normal.losses)
        })
      }
    }

    it('turns the reported winning strategy around instead of merely narrowing the gap', () => {
      const normal = simulate(DEFAULT_PRESET, 'normal', exploitStrategy)
      const strong = simulate(DEFAULT_PRESET, 'strong', exploitStrategy)
      // 「ふつう」は攻略法にほぼ勝てないが、「つよい」は勝ち越す
      expect(normal.wins / BATTLE_COUNT).toBeLessThan(0.3)
      expect(strong.wins / BATTLE_COUNT).toBeGreaterThan(0.6)
    })
  })
})
