import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPanel } from '@/components/StatusPanel'
import type { PlayerState } from '@/game/types'

const state: PlayerState = { hp: 3, energy: 2, guardCooldownRemaining: 0 }

describe('StatusPanel', () => {
  it('labels the player panel PLAYER', () => {
    render(<StatusPanel role="player" state={state} maxHp={5} />)
    expect(screen.getByText('PLAYER')).toBeInTheDocument()
  })

  it('labels the opponent panel OPPONENT', () => {
    render(<StatusPanel role="opponent" state={state} maxHp={5} />)
    expect(screen.getByText('OPPONENT')).toBeInTheDocument()
  })

  it('shows current/max HP and exposes an accessible HP summary', () => {
    render(<StatusPanel role="player" state={state} maxHp={5} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByLabelText('HP 3 / 5')).toBeInTheDocument()
  })

  it('exposes an accessible energy summary', () => {
    render(<StatusPanel role="player" state={state} maxHp={5} />)
    expect(screen.getByLabelText('エネルギー 2 / 5')).toBeInTheDocument()
  })

  it('shows the guard badge for the current cooldown state', () => {
    render(<StatusPanel role="player" state={{ ...state, guardCooldownRemaining: 1 }} maxHp={5} />)
    expect(screen.getByText('あと1T')).toBeInTheDocument()
  })
})
