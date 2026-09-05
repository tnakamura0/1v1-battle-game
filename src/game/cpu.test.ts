import { describe, expect, it } from 'vitest'
import { decideCpuAction } from '@/game/cpu'
import type { BattlePreset, PlayerState } from '@/game/types'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }

function state(overrides: Partial<PlayerState> = {}): PlayerState {
  return { hp: 3, energy: 2, guardCooldownRemaining: 0, ...overrides }
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
})
