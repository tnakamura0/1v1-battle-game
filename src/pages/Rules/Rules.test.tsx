import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Rules } from '@/pages/Rules/Rules'

describe('Rules', () => {
  it('renders the page heading and the action matchup table', () => {
    render(
      <MemoryRouter>
        <Rules />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'ルール / 遊び方', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('行動の組み合わせ')).toBeInTheDocument()
  })
})
