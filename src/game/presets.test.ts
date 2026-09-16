import { describe, expect, it } from 'vitest'
import { DEFAULT_PRESET, matchRecommendedSetup, RECOMMENDED_SETUPS } from '@/game/presets'

describe('matchRecommendedSetup', () => {
  it.each(RECOMMENDED_SETUPS.map((r) => [r.title, r] as const))(
    'matches %s by its own setup',
    (_title, recommended) => {
      expect(matchRecommendedSetup(recommended.setup)?.key).toBe(recommended.key)
    },
  )

  /*
   * cpuDifficulty は BattlePreset では optional。省略したまま比較すると
   * undefined !== 'normal' で「サクッと遊ぶ」に一致しなくなり、既定値で遊んだ人だけ
   * ルール名を名乗れなくなる。
   */
  it('treats a missing cpuDifficulty as the default', () => {
    const { initialHp, guardCooldownTurns } = DEFAULT_PRESET
    expect(matchRecommendedSetup({ initialHp, guardCooldownTurns })?.title).toBe('サクッと遊ぶ')
  })

  it('returns undefined when the setup matches no recommendation', () => {
    expect(
      matchRecommendedSetup({ initialHp: 2, guardCooldownTurns: 2, cpuDifficulty: 'strong' }),
    ).toBeUndefined()
  })

  // 「サクッと遊ぶ」が既定値と一致していることが、ルール選択画面の初期表示で
  // このカードが選択中に見える根拠になっている（presets.ts のコメントを参照）
  it('keeps サクッと遊ぶ in sync with the default preset', () => {
    expect(matchRecommendedSetup(DEFAULT_PRESET)?.title).toBe('サクッと遊ぶ')
  })
})
