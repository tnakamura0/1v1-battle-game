import { decideCpuAction } from '@/game/cpu'
import { createInitialPlayerState, checkVictory, resolveTurn } from '@/game/rules'
import type { Action, BattlePreset, PlayerKey, PlayerState, TurnRecord } from '@/game/types'

export type BattlePhase = 'intro' | 'selecting' | 'result'

export interface BattleReducerState {
  preset: BattlePreset
  phase: BattlePhase
  turn: number
  player: PlayerState
  cpu: PlayerState
  history: TurnRecord[]
  lastTurn: TurnRecord | null
  winner: PlayerKey | null
}

export type BattleReducerAction =
  | { type: 'INTRO_COMPLETE' }
  | { type: 'SUBMIT_PLAYER_ACTION'; action: Action; rng?: () => number }
  | { type: 'ADVANCE_TURN' }

export function createInitialBattleState(preset: BattlePreset): BattleReducerState {
  return {
    preset,
    phase: 'intro',
    turn: 1,
    player: createInitialPlayerState(preset),
    cpu: createInitialPlayerState(preset),
    history: [],
    lastTurn: null,
    winner: null,
  }
}

export function battleReducer(
  state: BattleReducerState,
  action: BattleReducerAction,
): BattleReducerState {
  switch (action.type) {
    case 'INTRO_COMPLETE': {
      if (state.phase !== 'intro') return state
      return { ...state, phase: 'selecting' }
    }

    case 'SUBMIT_PLAYER_ACTION': {
      if (state.phase !== 'selecting') return state

      const cpuAction = decideCpuAction(state.cpu, state.player, state.preset, action.rng)
      const { player, cpu, outcome } = resolveTurn(
        state.player,
        state.cpu,
        action.action,
        cpuAction,
        state.preset,
      )
      const turnRecord: TurnRecord = {
        turn: state.turn,
        playerAction: action.action,
        cpuAction,
        playerBefore: state.player,
        playerAfter: player,
        cpuBefore: state.cpu,
        cpuAfter: cpu,
        outcome,
      }
      const winner = checkVictory(player, cpu)

      return {
        ...state,
        phase: 'result',
        player,
        cpu,
        history: [turnRecord, ...state.history],
        lastTurn: turnRecord,
        winner,
      }
    }

    case 'ADVANCE_TURN': {
      if (state.phase !== 'result' || state.winner !== null) return state
      return {
        ...state,
        phase: 'selecting',
        turn: state.turn + 1,
        lastTurn: null,
      }
    }

    default:
      return state
  }
}
