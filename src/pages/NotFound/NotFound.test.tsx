import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotFound } from '@/pages/NotFound/NotFound'

describe('NotFound', () => {
  it('renders the heading and a single way back to the top page', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'ページが見つかりません', level: 1 }),
    ).toBeInTheDocument()

    // 迷子の受け皿なので出口は1つに絞っている。増やすなら意図的に増やすこと
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('トップへ戻る')
    expect(links[0]).toHaveAttribute('href', '/')
  })
})
