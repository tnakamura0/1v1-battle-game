import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BattleResult } from '@/pages/BattleResult/BattleResult'
import { buildShareUrl } from '@/pages/BattleResult/share'
import type { BattleSummary } from '@/game/types'

const summary: BattleSummary = {
  // 「真剣勝負」の設定そのもの（Issue #131 の「ルール」行がルール名を出す側）
  preset: { initialHp: 3, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
  winner: 'player',
  player: { hp: 2, energy: 1, guardCooldownRemaining: 0 },
  cpu: { hp: 0, energy: 0, guardCooldownRemaining: 0 },
  turnCount: 7,
}

function renderPage(state?: { summary: BattleSummary }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/battle/result', state: state ?? null }]}>
      <Routes>
        <Route path="/battle/result" element={<BattleResult />} />
        <Route path="/preset" element={<div>preset select screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BattleResult', () => {
  it('redirects to /preset when no summary was passed via navigation state', () => {
    renderPage(undefined)
    expect(screen.getByText('preset select screen')).toBeInTheDocument()
  })

  it('shows a win headline and the final stats', () => {
    renderPage({ summary })
    expect(screen.getByRole('heading', { name: '勝利' })).toBeInTheDocument()
    expect(screen.getByText('7ターン')).toBeInTheDocument()
  })

  /*
   * Issue #131：数字（最終HP・ターン数）をどう読めばいいかの前提になるので、
   * 成績表の先頭にルールを出す。共有テキストと同じ ruleLabel を使うため、
   * 共有文で初めて見る名前にはならない。
   */
  describe('ルールの行', () => {
    it('names the recommendation the battle was played with', () => {
      renderPage({ summary })
      expect(screen.getByText('ルール')).toBeInTheDocument()
      expect(screen.getByText('真剣勝負')).toBeInTheDocument()
    })

    it('lists the actual settings when the setup matches no recommendation', () => {
      renderPage({
        summary: {
          ...summary,
          preset: { initialHp: 2, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
        },
      })
      expect(screen.getByText('HP2・ガード2ターン・CPUつよい')).toBeInTheDocument()
    })
  })

  it('shows a lose headline when the cpu wins', () => {
    renderPage({ summary: { ...summary, winner: 'cpu' } })
    expect(screen.getByRole('heading', { name: '敗北' })).toBeInTheDocument()
  })

  describe('X共有リンク', () => {
    it('renders an external link to the twitter intent URL for the result', () => {
      renderPage({ summary })

      const link = screen.getByRole('link', { name: 'Xで結果をシェアする' })
      expect(link).toHaveAttribute('href', buildShareUrl(summary))
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
