import type { GUARD_COOLDOWN_OPTIONS, INITIAL_HP_OPTIONS } from '@/game/presets'

export type Action = 'charge' | 'attack' | 'guard'

export type PlayerKey = 'player' | 'cpu'

export type CpuDifficulty = 'normal' | 'strong'

/**
 * 選べる値は presets.ts の選択肢配列から導出する。ここにリテラルを書くと、
 * 選択肢を増やしたときに2箇所を直す必要があり、片方を忘れる。
 * presets.ts 側もこのファイルから型だけを import しているので型のみの循環参照になり、
 * ビルド時には消える。
 */
export interface BattlePreset {
  initialHp: (typeof INITIAL_HP_OPTIONS)[number]
  guardCooldownTurns: (typeof GUARD_COOLDOWN_OPTIONS)[number]
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
