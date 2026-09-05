import { describe, expect, it } from 'vitest'
import {
  battleReducer,
  createInitialBattleState,
  type BattleReducerState,
} from '@/game/battleReducer'
import type { BattlePreset } from '@/game/types'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }
const alwaysFirstLegal = () => 0

describe('createInitialBattleState', () => {
  it('starts in the intro phase with fresh player state', () => {
    const state = createInitialBattleState(preset)
    expect(state.phase).toBe('intro')
    expect(state.turn).toBe(1)
    expect(state.player).toEqual({ hp: 3, energy: 0, guardCooldownRemaining: 0 })
    expect(state.cpu).toEqual({ hp: 3, energy: 0, guardCooldownRemaining: 0 })
    expect(state.history).toEqual([])
    expect(state.winner).toBeNull()
  })
})

describe('INTRO_COMPLETE', () => {
  it('moves from intro to selecting', () => {
    const state = createInitialBattleState(preset)
    const next = battleReducer(state, { type: 'INTRO_COMPLETE' })
    expect(next.phase).toBe('selecting')
  })

  it('is a no-op outside the intro phase', () => {
    const state: BattleReducerState = { ...createInitialBattleState(preset), phase: 'selecting' }
    const next = battleReducer(state, { type: 'INTRO_COMPLETE' })
    expect(next).toBe(state)
  })
})

describe('SUBMIT_PLAYER_ACTION', () => {
  function selectingState(overrides: Partial<BattleReducerState> = {}): BattleReducerState {
    return {
      ...createInitialBattleState(preset),
      phase: 'selecting',
      ...overrides,
    }
  }

  it('is a no-op outside the selecting phase', () => {
    const state = selectingState({ phase: 'intro' })
    const next = battleReducer(state, {
      type: 'SUBMIT_PLAYER_ACTION',
      action: 'charge',
    })
    expect(next).toBe(state)
  })

  it('resolves the turn, records history, and moves to the result phase', () => {
    const state = selectingState()
    const next = battleReducer(state, {
      type: 'SUBMIT_PLAYER_ACTION',
      action: 'charge',
      rng: alwaysFirstLegal,
    })

    expect(next.phase).toBe('result')
    expect(next.history).toHaveLength(1)
    expect(next.lastTurn).toEqual(next.history[0])
    expect(next.lastTurn?.turn).toBe(1)
    expect(next.lastTurn?.playerAction).toBe('charge')
  })

  it('prepends newer turns to the front of history', () => {
    let state = selectingState()
    state = battleReducer(state, {
      type: 'SUBMIT_PLAYER_ACTION',
      action: 'charge',
      rng: alwaysFirstLegal,
    })
    state = battleReducer(state, { type: 'ADVANCE_TURN' })
    state = battleReducer(state, {
      type: 'SUBMIT_PLAYER_ACTION',
      action: 'charge',
      rng: alwaysFirstLegal,
    })

    expect(state.history).toHaveLength(2)
    expect(state.history[0].turn).toBe(2)
    expect(state.history[1].turn).toBe(1)
  })

  it('declares the player the winner and stops when cpu HP hits 0', () => {
    const state = selectingState({
      player: { hp: 5, energy: 1, guardCooldownRemaining: 0 },
      cpu: { hp: 1, energy: 0, guardCooldownRemaining: 0 },
    })
    // cpu has no energy (attack illegal) and the player has energy (guard
    // legal), so legal cpu actions are [charge, guard]; rng=0 always selects
    // the first legal entry, which is charge.
    const next = battleReducer(state, {
      type: 'SUBMIT_PLAYER_ACTION',
      action: 'attack',
      rng: alwaysFirstLegal,
    })

    expect(next.lastTurn?.outcome).toBe('player-hit-cpu')
    expect(next.cpu.hp).toBe(0)
    expect(next.winner).toBe('player')
    expect(next.phase).toBe('result')
  })
})

describe('ADVANCE_TURN', () => {
  it('returns to selecting and increments the turn when the battle is undecided', () => {
    const state: BattleReducerState = {
      ...createInitialBattleState(preset),
      phase: 'result',
      turn: 3,
      winner: null,
      lastTurn: {
        turn: 3,
        playerAction: 'charge',
        cpuAction: 'charge',
        playerBefore: createInitialBattleState(preset).player,
        playerAfter: createInitialBattleState(preset).player,
        cpuBefore: createInitialBattleState(preset).cpu,
        cpuAfter: createInitialBattleState(preset).cpu,
        outcome: 'no-effect',
      },
    }
    const next = battleReducer(state, { type: 'ADVANCE_TURN' })
    expect(next.phase).toBe('selecting')
    expect(next.turn).toBe(4)
    expect(next.lastTurn).toBeNull()
  })

  it('is a no-op once a winner is decided', () => {
    const state: BattleReducerState = {
      ...createInitialBattleState(preset),
      phase: 'result',
      winner: 'player',
    }
    const next = battleReducer(state, { type: 'ADVANCE_TURN' })
    expect(next).toBe(state)
  })

  it('is a no-op outside the result phase', () => {
    const state: BattleReducerState = {
      ...createInitialBattleState(preset),
      phase: 'selecting',
    }
    const next = battleReducer(state, { type: 'ADVANCE_TURN' })
    expect(next).toBe(state)
  })
})
