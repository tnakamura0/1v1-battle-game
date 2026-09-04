import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Home } from './Home'

describe('Home', () => {
  it('renders the heading', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )
    expect(
      screen.getByRole('heading', { name: 'React + Claude Code Template' }),
    ).toBeInTheDocument()
  })
})
