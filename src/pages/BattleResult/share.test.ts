import { describe, expect, it } from 'vitest'
import { buildShareText, buildShareUrl } from '@/pages/BattleResult/share'
import type { BattleSummary } from '@/game/types'

const summary: BattleSummary = {
  preset: { initialHp: 3, guardCooldownTurns: 2 },
  winner: 'player',
  player: { hp: 2, energy: 1, guardCooldownRemaining: 0 },
  cpu: { hp: 0, energy: 0, guardCooldownRemaining: 0 },
  turnCount: 7,
}

describe('buildShareText', () => {
  it('describes a win with the turn count', () => {
    expect(buildShareText(summary)).toBe('OUTWIT DUELでCPUと対戦し、7ターンで勝利しました！')
  })

  it('describes a loss with the turn count', () => {
    expect(buildShareText({ ...summary, winner: 'cpu' })).toBe(
      'OUTWIT DUELでCPUと対戦し、7ターンで敗北しました！',
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
