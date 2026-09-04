import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Home } from './Home'

describe('Home', () => {
  it('renders the hero heading', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )
    expect(screen.getByRole('heading', { name: '読み合いの1対1バトル' })).toBeInTheDocument()
  })

  it('links the primary CTA to the preset selection screen', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )
    const ctaLinks = screen.getAllByRole('link', { name: '対戦を始める' })
    for (const link of ctaLinks) {
      expect(link).toHaveAttribute('href', '/preset')
    }
  })
})
