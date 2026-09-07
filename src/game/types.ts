export type Action = 'charge' | 'attack' | 'guard'

export type PlayerKey = 'player' | 'cpu'

export type CpuDifficulty = 'normal' | 'strong'

export interface BattlePreset {
  initialHp: 2 | 3
  guardCooldownTurns: 2 | 3
  cpuDifficulty?: CpuDifficulty
}

export interface PlayerState {
  hp: number
  energy: number
  guardCooldownRemaining: number
}

export type TurnOutcome =
  'player-hit-cpu' | 'cpu-hit-player' | 'clash' | 'player-guarded' | 'cpu-guarded' | 'no-effect'

export interface TurnRecord {
  turn: number
  playerAction: Action
  cpuAction: Action
  playerBefore: PlayerState
  playerAfter: PlayerState
  cpuBefore: PlayerState
  cpuAfter: PlayerState
  outcome: TurnOutcome
}

export interface BattleSummary {
  preset: BattlePreset
  winner: PlayerKey
  player: PlayerState
  cpu: PlayerState
  turnCount: number
}

export type IllegalReason = 'own-energy-zero' | 'opponent-energy-zero' | 'guard-cooldown'
