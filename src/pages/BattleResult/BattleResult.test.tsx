import { isInaccessible, render, screen } from '@testing-library/react'
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

  /*
   * Issue #162：画面の冒頭に重ねる幕。見出しと同じ「勝利」「敗北」を大きく出すが、
   * 読み上げが二重にならないよう幕は aria-hidden にして、見出しは1つだけにしている。
   * 動き（勝ちの光輪・火花、負けの揺れ）は jsdom では見えないので、ブラウザで確かめること。
   */
  describe('冒頭の幕', () => {
    /** 見出しではないほうの「勝利」「敗北」。幕に大きく出している文字 */
    function curtainText(text: string) {
      const heading = screen.getByRole('heading', { name: text })
      const others = screen.getAllByText(text).filter((element) => element !== heading)
      expect(others).toHaveLength(1)
      return others[0]
    }

    it('repeats the win in a curtain that assistive technology skips', () => {
      renderPage({ summary })

      expect(screen.getAllByRole('heading')).toHaveLength(1)
      expect(isInaccessible(curtainText('勝利'))).toBe(true)
      expect(screen.queryByText('敗北')).not.toBeInTheDocument()
    })

    it('shows the loss in the curtain when the cpu wins', () => {
      renderPage({ summary: { ...summary, winner: 'cpu' } })

      expect(isInaccessible(curtainText('敗北'))).toBe(true)
      expect(screen.queryByText('勝利')).not.toBeInTheDocument()
    })
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
