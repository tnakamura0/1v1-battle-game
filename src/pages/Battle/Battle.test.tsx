import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Battle } from '@/pages/Battle/Battle'
import { INTRO_DURATION_MS, RESULT_DURATION_MS } from '@/game/presets'
import type { BattlePreset } from '@/game/types'

const preset: BattlePreset = { initialHp: 5, guardCooldownTurns: 2 }

function renderBattle(state?: { preset: BattlePreset }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/battle', state: state ?? null }]}>
      <Routes>
        <Route path="/battle" element={<Battle />} />
        <Route path="/preset" element={<div>preset select screen</div>} />
        <Route path="/battle/result" element={<div>final result screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Battle', () => {
  it('redirects to /preset when no preset was passed via navigation state', () => {
    renderBattle(undefined)
    expect(screen.getByText('preset select screen')).toBeInTheDocument()
  })

  it('shows the intro, then moves to hand selection', () => {
    renderBattle({ preset })
    expect(screen.getByText('対戦開始')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    expect(screen.getByText('行動を選択してください')).toBeInTheDocument()
  })

  it('resolves a turn on submit and auto-advances to the next turn', () => {
    renderBattle({ preset })
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    act(() => {
      screen.getByRole('button', { name: /チャージ/ }).click()
    })

    expect(screen.getByText('TURN 1')).toBeInTheDocument()
    expect(screen.getByText('変化なし')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(RESULT_DURATION_MS)
    })

    expect(screen.getByText('TURN 2')).toBeInTheDocument()
    expect(screen.getByText('行動を選択してください')).toBeInTheDocument()
  })
})
