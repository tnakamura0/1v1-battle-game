import type { BattlePreset } from '@/game/types'

// 1はサドンデス用。1発で決着するため運の比重が上がる（cpu.test.ts の勝率のしきい値も参照）
export const INITIAL_HP_OPTIONS = [1, 2, 3] as const

export const GUARD_COOLDOWN_OPTIONS = [1, 2, 3] as const

export const CPU_DIFFICULTY_OPTIONS = ['normal', 'strong'] as const

export const DEFAULT_PRESET: BattlePreset = {
  initialHp: 2,
  guardCooldownTurns: 3,
  cpuDifficulty: 'normal',
}

export const MAX_ENERGY = 5

// 3→2→1 と自然にカウントダウン表示できるよう秒単位で区切っている
export const INTRO_DURATION_MS = 3000
export const RESULT_DURATION_MS = 8000
export const RESULT_DURATION_ON_VICTORY_MS = 5000
