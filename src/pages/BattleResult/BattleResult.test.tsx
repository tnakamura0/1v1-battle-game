import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BattleResult } from '@/pages/BattleResult/BattleResult'
import type { BattleSummary } from '@/game/types'

const summary: BattleSummary = {
  preset: { initialHp: 5, guardCooldownTurns: 2 },
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

  it('shows a lose headline when the cpu wins', () => {
    renderPage({ summary: { ...summary, winner: 'cpu' } })
    expect(screen.getByRole('heading', { name: '敗北' })).toBeInTheDocument()
  })
})
