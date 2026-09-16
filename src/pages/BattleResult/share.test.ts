import { describe, expect, it } from 'vitest'
import { buildShareText, buildShareUrl } from '@/pages/BattleResult/share'
import type { BattleSummary } from '@/game/types'

const summary: BattleSummary = {
  // 「真剣勝負」の設定そのもの。cpuDifficulty まで揃えないとおすすめに一致せず、
  // ルール名ではなく設定値が出る（copy.ts の ruleLabel）
  preset: { initialHp: 3, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
  winner: 'player',
  player: { hp: 2, energy: 1, guardCooldownRemaining: 0 },
  cpu: { hp: 0, energy: 0, guardCooldownRemaining: 0 },
  turnCount: 7,
}

describe('buildShareText', () => {
  it('describes a win with the turn count and the rule', () => {
    expect(buildShareText(summary)).toBe(
      'OUTWIT DUELでCPUと対戦し、7ターンで勝利しました！（ルール：真剣勝負）',
    )
  })

  it('describes a loss with the turn count and the rule', () => {
    expect(buildShareText({ ...summary, winner: 'cpu' })).toBe(
      'OUTWIT DUELでCPUと対戦し、7ターンで敗北しました！（ルール：真剣勝負）',
    )
  })

  /*
   * Issue #131：どのおすすめとも一致しない設定でも、ターン数だけの文にはしない。
   * ルールが違えば同じターン数でも意味が変わるため、実際の設定値を並べる。
   */
  it('lists the actual settings when the setup matches no recommendation', () => {
    expect(
      buildShareText({
        ...summary,
        preset: { initialHp: 2, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
      }),
    ).toBe(
      'OUTWIT DUELでCPUと対戦し、7ターンで勝利しました！（ルール：HP2・ガード2ターン・CPUつよい）',
    )
  })
})

describe('buildShareUrl', () => {
  it('embeds the share text and the current origin as separate query params', () => {
    const url = new URL(buildShareUrl(summary))
    expect(url.origin + url.pathname).toBe('https://twitter.com/intent/tweet')
    expect(url.searchParams.get('text')).toBe(buildShareText(summary))
    expect(url.searchParams.get('url')).toBe(window.location.origin)
  })
})
