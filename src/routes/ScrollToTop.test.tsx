import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from '@/routes/ScrollToTop'

// jsdomはwindow.scrollToを実装していないため、呼び出しを記録できるよう差し替える
function spyOnScrollTo() {
  return vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
}

/** 履歴を戻る（POP）ボタン。Linkでは PUSH になってしまうため */
function BackButton() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      戻る
    </button>
  )
}

function routerTree() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <span>home</span>
              <Link to="/rules">ルールへ</Link>
            </div>
          }
        />
        <Route
          path="/rules"
          element={
            <div>
              <span>rules</span>
              <BackButton />
            </div>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ScrollToTop', () => {
  it('scrolls to the top when the path changes', async () => {
    const user = userEvent.setup()
    const scrollTo = spyOnScrollTo()
    render(routerTree())

    scrollTo.mockClear()
    await user.click(screen.getByRole('link', { name: 'ルールへ' }))

    expect(screen.getByText('rules')).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('does not scroll again while the path stays the same', () => {
    const scrollTo = spyOnScrollTo()
    const { rerender } = render(routerTree())

    scrollTo.mockClear()
    rerender(routerTree())

    expect(screen.getByText('home')).toBeInTheDocument()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('leaves the scroll position to the browser when going back', async () => {
    const user = userEvent.setup()
    const scrollTo = spyOnScrollTo()
    render(routerTree())

    await user.click(screen.getByRole('link', { name: 'ルールへ' }))
    expect(screen.getByText('rules')).toBeInTheDocument()

    scrollTo.mockClear()
    await user.click(screen.getByRole('button', { name: '戻る' }))

    expect(screen.getByText('home')).toBeInTheDocument()
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
