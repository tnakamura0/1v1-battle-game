import { MAX_ENERGY } from '@/game/presets'
import type {
  Action,
  BattlePreset,
  IllegalReason,
  PlayerKey,
  PlayerState,
  TurnOutcome,
} from '@/game/types'

export function createInitialPlayerState(preset: BattlePreset): PlayerState {
  return {
    hp: preset.initialHp,
    energy: 0,
    guardCooldownRemaining: 0,
  }
}

export function getIllegalReason(
  action: Action,
  own: PlayerState,
  opponent: PlayerState,
): IllegalReason | null {
  if (action === 'attack') {
    return own.energy > 0 ? null : 'own-energy-zero'
  }
  if (action === 'guard') {
    if (opponent.energy === 0) return 'opponent-energy-zero'
    if (own.guardCooldownRemaining > 0) return 'guard-cooldown'
    return null
  }
  return null
}

export function isActionLegal(action: Action, own: PlayerState, opponent: PlayerState): boolean {
  return getIllegalReason(action, own, opponent) === null
}

export function getLegalActions(own: PlayerState, opponent: PlayerState): Action[] {
  const actions: Action[] = ['charge']
  if (isActionLegal('attack', own, opponent)) actions.push('attack')
  if (isActionLegal('guard', own, opponent)) actions.push('guard')
  return actions
}

function nextGuardCooldown(
  current: number,
  usedGuardThisTurn: boolean,
  guardCooldownTurns: number,
): number {
  if (usedGuardThisTurn) return guardCooldownTurns
  return Math.max(0, current - 1)
}

function applyOwnAction(state: PlayerState, action: Action): PlayerState {
  if (action === 'charge') {
    return { ...state, energy: Math.min(MAX_ENERGY, state.energy + 1) }
  }
  if (action === 'attack') {
    return { ...state, energy: state.energy - 1 }
  }
  return { ...state }
}

export function resolveTurn(
  player: PlayerState,
  cpu: PlayerState,
  playerAction: Action,
  cpuAction: Action,
  preset: BattlePreset,
): { player: PlayerState; cpu: PlayerState; outcome: TurnOutcome } {
  let nextPlayer = applyOwnAction(player, playerAction)
  let nextCpu = applyOwnAction(cpu, cpuAction)

  let outcome: TurnOutcome = 'no-effect'

  if (playerAction === 'attack' && cpuAction === 'attack') {
    outcome = 'clash'
  } else if (playerAction === 'attack' && cpuAction === 'charge') {
    nextCpu = { ...nextCpu, hp: Math.max(0, nextCpu.hp - 1) }
    outcome = 'player-hit-cpu'
  } else if (cpuAction === 'attack' && playerAction === 'charge') {
    nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - 1) }
    outcome = 'cpu-hit-player'
  } else if (playerAction === 'attack' && cpuAction === 'guard') {
    outcome = 'cpu-guarded'
  } else if (cpuAction === 'attack' && playerAction === 'guard') {
    outcome = 'player-guarded'
  }

  nextPlayer = {
    ...nextPlayer,
    guardCooldownRemaining: nextGuardCooldown(
      player.guardCooldownRemaining,
      playerAction === 'guard',
      preset.guardCooldownTurns,
    ),
  }
  nextCpu = {
    ...nextCpu,
    guardCooldownRemaining: nextGuardCooldown(
      cpu.guardCooldownRemaining,
      cpuAction === 'guard',
      preset.guardCooldownTurns,
    ),
  }

  return { player: nextPlayer, cpu: nextCpu, outcome }
}

export function checkVictory(player: PlayerState, cpu: PlayerState): PlayerKey | null {
  if (player.hp <= 0) return 'cpu'
  if (cpu.hp <= 0) return 'player'
  return null
}
