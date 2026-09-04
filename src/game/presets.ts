import type { BattlePreset } from '@/game/types'

export const INITIAL_HP_OPTIONS = [3, 5] as const

export const GUARD_COOLDOWN_OPTIONS = [2, 3] as const

export const DEFAULT_PRESET: BattlePreset = {
  initialHp: 5,
  guardCooldownTurns: 2,
}

export const MAX_ENERGY = 5

export const INTRO_DURATION_MS = 1800
export const RESULT_DURATION_MS = 8000
export const RESULT_DURATION_ON_VICTORY_MS = 3000
