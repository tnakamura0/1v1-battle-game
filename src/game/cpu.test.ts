import { describe, expect, it } from 'vitest'
import { decideCpuAction } from '@/game/cpu'
import type { Action, BattlePreset, PlayerState, TurnRecord } from '@/game/types'

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

  describe('strong difficulty — reads the opponent’s recent pattern', () => {
    it('counters a repeated charge pattern with a heavier attack weight', () => {
      const cpu = state({ energy: 2 })
      const human = state({ energy: 0 })
      const history = buildHistory(['charge', 'charge', 'charge'])
      // baseline (no pattern read): charge=1, attack=1, total=2 -> charge[0,1) attack[1,2)
      expect(decideCpuAction(cpu, human, preset, () => 0.3)).toBe('charge')
      // strong: predicted='charge' -> attack *3 -> charge=1, attack=3, total=4 -> charge[0,1) attack[1,4)
      expect(
        decideCpuAction(cpu, human, preset, () => 0.3, { difficulty: 'strong', history }),
      ).toBe('attack')
    })

    it('counters a repeated attack pattern with a heavier guard weight', () => {
      const cpu = state({ energy: 2 })
      const human = state({ energy: 1 })
      const history = buildHistory(['attack', 'attack', 'attack'])
      // baseline: charge=1, attack=1, guard=2.5, total=4.5 -> charge[0,1) attack[1,2) guard[2,4.5)
      expect(decideCpuAction(cpu, human, preset, () => 0.4)).toBe('attack')
      // strong: predicted='attack' -> guard *3 -> guard=7.5, total=9.5 -> charge[0,1) attack[1,2) guard[2,9.5)
      expect(
        decideCpuAction(cpu, human, preset, () => 0.4, { difficulty: 'strong', history }),
      ).toBe('guard')
    })

    it('counters a repeated guard pattern by favoring charge over a risky attack', () => {
      const cpu = state({ energy: 2 })
      const human = state({ energy: 1 })
      const history = buildHistory(['guard', 'guard', 'guard'])
      // baseline: charge=1, attack=1, guard=2.5, total=4.5 -> charge[0,1) attack[1,2) guard[2,4.5)
      expect(decideCpuAction(cpu, human, preset, () => 0.5)).toBe('guard')
      // strong: predicted='guard' -> charge *3, attack *1/3 -> charge=3, attack=1/3, guard=2.5,
      // total=5.8333... -> charge[0,3) attack[3,3.333...) guard[3.333...,5.8333...)
      expect(
        decideCpuAction(cpu, human, preset, () => 0.5, { difficulty: 'strong', history }),
      ).toBe('charge')
    })

    it('does not react to a mixed pattern with no clear tendency', () => {
      const cpu = state({ energy: 2 })
      const human = state({ energy: 1 })
      const history = buildHistory(['charge', 'attack', 'guard'])
      const rng = () => 0.5
      expect(decideCpuAction(cpu, human, preset, rng, { difficulty: 'strong', history })).toBe(
        decideCpuAction(cpu, human, preset, rng),
      )
    })

    it('does not predict from a single turn of history', () => {
      const cpu = state({ energy: 2 })
      const human = state({ energy: 1 })
      const history = buildHistory(['charge'])
      const rng = () => 0.5
      expect(decideCpuAction(cpu, human, preset, rng, { difficulty: 'strong', history })).toBe(
        decideCpuAction(cpu, human, preset, rng),
      )
    })

    it('ignores history when difficulty is normal', () => {
      const cpu = state({ energy: 2 })
      const human = state({ energy: 0 })
      const history = buildHistory(['charge', 'charge', 'charge'])
      expect(
        decideCpuAction(cpu, human, preset, () => 0.3, { difficulty: 'normal', history }),
      ).toBe('charge')
    })
  })
})
