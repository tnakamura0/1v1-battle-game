import { describe, expect, it } from 'vitest'
import {
  checkVictory,
  createInitialPlayerState,
  getIllegalReason,
  getLegalActions,
  isActionLegal,
  resolveTurn,
} from '@/game/rules'
import { MAX_ENERGY } from '@/game/presets'
import type { Action, BattlePreset, PlayerState } from '@/game/types'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }

function player(overrides: Partial<PlayerState> = {}): PlayerState {
  return { hp: 5, energy: 2, guardCooldownRemaining: 0, ...overrides }
}

describe('getLegalActions / getIllegalReason', () => {
  it('allows charge while below the energy cap', () => {
    const own = player({ energy: 0 })
    const opponent = player({ energy: 0 })
    expect(getLegalActions(own, opponent)).toEqual(['charge'])
    expect(getIllegalReason('charge', player({ energy: MAX_ENERGY - 1 }), opponent)).toBeNull()
  })

  // Issue #134：上限では増えないうえ、攻撃に対しては負ける側になるだけのターンになる
  it('disallows charge once own energy is at the cap', () => {
    const own = player({ energy: MAX_ENERGY })
    const opponent = player({ energy: 0 })
    expect(isActionLegal('charge', own, opponent)).toBe(false)
    expect(getIllegalReason('charge', own, opponent)).toBe('own-energy-max')
    expect(getLegalActions(own, opponent)).not.toContain('charge')
  })

  /*
   * getLegalActions が空を返さないことは、CPUの抽選（game/cpu.ts の toSoftmaxWeights と
   * predictHumanDistribution）が依存している前提。チャージが外れるのは上限のときだけで、
   * そのとき攻撃は必ず合法（energy > 0）なので成り立つ。
   * 相手のエネルギーが0でガードも非合法という、いちばん選択肢が少ない盤面で固定する。
   */
  it('never returns an empty list, even at the cap with guard unavailable', () => {
    const own = player({ energy: MAX_ENERGY, guardCooldownRemaining: 0 })
    const opponent = player({ energy: 0 })
    expect(getLegalActions(own, opponent)).toEqual(['attack'])
  })

  /*
   * 上のスポットチェックだけだと、将来 attack 側に非合法の条件が増えたときに
   * すり抜ける。CPUの2箇所（cpu.ts の toSoftmaxWeights と predictHumanDistribution）が
   * この不変条件に依存しているので、到達しうる状態を総当たりして機械的に固定する。
   */
  it('never returns an empty list for any reachable state', () => {
    for (let ownEnergy = 0; ownEnergy <= MAX_ENERGY; ownEnergy += 1) {
      for (let cooldown = 0; cooldown <= 3; cooldown += 1) {
        for (let opponentEnergy = 0; opponentEnergy <= MAX_ENERGY; opponentEnergy += 1) {
          const own = player({ energy: ownEnergy, guardCooldownRemaining: cooldown })
          const opponent = player({ energy: opponentEnergy })
          expect(getLegalActions(own, opponent).length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('disallows attack when own energy is 0', () => {
    const own = player({ energy: 0 })
    const opponent = player({ energy: 3 })
    expect(isActionLegal('attack', own, opponent)).toBe(false)
    expect(getIllegalReason('attack', own, opponent)).toBe('own-energy-zero')
  })

  it('allows attack when own energy is positive', () => {
    const own = player({ energy: 1 })
    const opponent = player()
    expect(getIllegalReason('attack', own, opponent)).toBeNull()
  })

  it('disallows guard when opponent energy is 0', () => {
    const own = player({ guardCooldownRemaining: 0 })
    const opponent = player({ energy: 0 })
    expect(getIllegalReason('guard', own, opponent)).toBe('opponent-energy-zero')
  })

  it('disallows guard while on cooldown even if opponent has energy', () => {
    const own = player({ guardCooldownRemaining: 1 })
    const opponent = player({ energy: 1 })
    expect(getIllegalReason('guard', own, opponent)).toBe('guard-cooldown')
  })

  it('allows guard when opponent has energy and no cooldown', () => {
    const own = player({ guardCooldownRemaining: 0 })
    const opponent = player({ energy: 1 })
    expect(getIllegalReason('guard', own, opponent)).toBeNull()
  })

  it('returns all three actions when everything is legal', () => {
    const own = player({ energy: 2, guardCooldownRemaining: 0 })
    const opponent = player({ energy: 2 })
    expect(getLegalActions(own, opponent)).toEqual(['charge', 'attack', 'guard'])
  })
})

describe('resolveTurn — full 3x3 outcome matrix', () => {
  const cases: Array<{
    playerAction: Action
    cpuAction: Action
    outcome: string
    playerHpDelta: number
    cpuHpDelta: number
  }> = [
    {
      playerAction: 'charge',
      cpuAction: 'charge',
      outcome: 'no-effect',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'charge',
      cpuAction: 'attack',
      outcome: 'cpu-hit-player',
      playerHpDelta: -1,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'charge',
      cpuAction: 'guard',
      outcome: 'no-effect',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'attack',
      cpuAction: 'charge',
      outcome: 'player-hit-cpu',
      playerHpDelta: 0,
      cpuHpDelta: -1,
    },
    {
      playerAction: 'attack',
      cpuAction: 'attack',
      outcome: 'clash',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'attack',
      cpuAction: 'guard',
      outcome: 'cpu-guarded',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'guard',
      cpuAction: 'charge',
      outcome: 'no-effect',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'guard',
      cpuAction: 'attack',
      outcome: 'player-guarded',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
    {
      playerAction: 'guard',
      cpuAction: 'guard',
      outcome: 'no-effect',
      playerHpDelta: 0,
      cpuHpDelta: 0,
    },
  ]

  it.each(cases)(
    'player=$playerAction vs cpu=$cpuAction -> $outcome',
    ({ playerAction, cpuAction, outcome, playerHpDelta, cpuHpDelta }) => {
      const before = { player: player({ energy: 2 }), cpu: player({ energy: 2 }) }
      const result = resolveTurn(before.player, before.cpu, playerAction, cpuAction, preset)

      expect(result.outcome).toBe(outcome)
      expect(result.player.hp).toBe(before.player.hp + playerHpDelta)
      expect(result.cpu.hp).toBe(before.cpu.hp + cpuHpDelta)

      const expectedPlayerEnergy = Math.min(
        MAX_ENERGY,
        before.player.energy +
          (playerAction === 'charge' ? 1 : playerAction === 'attack' ? -1 : 0) +
          (outcome === 'player-guarded' ? 1 : 0),
      )
      const expectedCpuEnergy = Math.min(
        MAX_ENERGY,
        before.cpu.energy +
          (cpuAction === 'charge' ? 1 : cpuAction === 'attack' ? -1 : 0) +
          (outcome === 'cpu-guarded' ? 1 : 0),
      )
      expect(result.player.energy).toBe(expectedPlayerEnergy)
      expect(result.cpu.energy).toBe(expectedCpuEnergy)
    },
  )

  /*
   * Issue #134 以降、上限でのチャージは非合法になったので、この状況は正規の操作では
   * 起きない。それでも固定しているのは、resolveTurn も battleReducer も行動の
   * 合法性を検証しておらず（押させないのはUIだけ）、ここが最後の砦になるため。
   * 下の「ガード成功での上限」は今も正規の経路で効く。
   */
  it('caps energy gain from charge at MAX_ENERGY', () => {
    const result = resolveTurn(
      player({ energy: 5 }),
      player({ energy: 5 }),
      'charge',
      'charge',
      preset,
    )
    expect(result.player.energy).toBe(5)
    expect(result.cpu.energy).toBe(5)
  })

  it('caps energy gain from guard success at MAX_ENERGY', () => {
    const result = resolveTurn(
      player({ energy: 5 }),
      player({ energy: 2 }),
      'guard',
      'attack',
      preset,
    )
    expect(result.player.energy).toBe(5)
  })

  it('grants the guarding player +1 energy on a successful guard', () => {
    const result = resolveTurn(
      player({ energy: 1 }),
      player({ energy: 2 }),
      'guard',
      'attack',
      preset,
    )
    expect(result.player.energy).toBe(2)
  })

  it('never lets HP drop below 0', () => {
    const result = resolveTurn(
      player({ hp: 1, energy: 0 }),
      player({ hp: 5, energy: 2 }),
      'charge',
      'attack',
      preset,
    )
    expect(result.player.hp).toBe(0)
  })
})

describe('guard cooldown ticking', () => {
  it('becomes usable again exactly N turns later for cooldown=2', () => {
    const cd2Preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }
    let self = player({ guardCooldownRemaining: 0 })
    const opponent = player({ energy: 3 })

    // Turn 1: use guard
    let result = resolveTurn(self, opponent, 'guard', 'charge', cd2Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(2)
    expect(isActionLegal('guard', self, opponent)).toBe(false)

    // Turn 2: cannot guard, must do something else
    result = resolveTurn(self, opponent, 'charge', 'charge', cd2Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(1)
    expect(isActionLegal('guard', self, opponent)).toBe(false)

    // Turn 3: cooldown expired, guard usable again
    result = resolveTurn(self, opponent, 'charge', 'charge', cd2Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(0)
    expect(isActionLegal('guard', self, opponent)).toBe(true)
  })

  it('becomes usable again exactly N turns later for cooldown=3', () => {
    const cd3Preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 3 }
    let self = player({ guardCooldownRemaining: 0 })
    const opponent = player({ energy: 3 })

    let result = resolveTurn(self, opponent, 'guard', 'charge', cd3Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(3)

    result = resolveTurn(self, opponent, 'charge', 'charge', cd3Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(2)
    expect(isActionLegal('guard', self, opponent)).toBe(false)

    result = resolveTurn(self, opponent, 'charge', 'charge', cd3Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(1)
    expect(isActionLegal('guard', self, opponent)).toBe(false)

    result = resolveTurn(self, opponent, 'charge', 'charge', cd3Preset)
    self = result.player
    expect(self.guardCooldownRemaining).toBe(0)
    expect(isActionLegal('guard', self, opponent)).toBe(true)
  })
})

describe('checkVictory', () => {
  it('returns null while both players have HP remaining', () => {
    expect(checkVictory(player({ hp: 3 }), player({ hp: 2 }))).toBeNull()
  })

  it('returns cpu when the player HP hits 0', () => {
    expect(checkVictory(player({ hp: 0 }), player({ hp: 2 }))).toBe('cpu')
  })

  it('returns player when the cpu HP hits 0', () => {
    expect(checkVictory(player({ hp: 2 }), player({ hp: 0 }))).toBe('player')
  })
})

describe('createInitialPlayerState', () => {
  it('sets HP from the preset and zeroed energy/cooldown', () => {
    expect(createInitialPlayerState({ initialHp: 3, guardCooldownTurns: 2 })).toEqual({
      hp: 3,
      energy: 0,
      guardCooldownRemaining: 0,
    })
  })
})
