import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from '@/routes/ScrollToTop'

// jsdomのwindow.scrollToは実際にはスクロールせずエラーを出すだけなので、
// 呼び出しを記録できるよう差し替える
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

/** 対戦結果画面からトップへ戻るときのように、履歴を置き換える遷移（REPLACE） */
function ReplaceLink() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/rules', { replace: true })}>
      置き換えて移動
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
              <ReplaceLink />
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

  // 対戦結果画面からトップへ戻る導線がこの形。スクロールするLPへ遷移するので、
  // ここが効かないと元の不具合が再発する
  it('scrolls to the top when the history entry is replaced', async () => {
    const user = userEvent.setup()
    const scrollTo = spyOnScrollTo()
    render(routerTree())

    scrollTo.mockClear()
    await user.click(screen.getByRole('button', { name: '置き換えて移動' }))

    expect(screen.getByText('rules')).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('does not scroll again while the path stays the same', async () => {
    const user = userEvent.setup()
    const scrollTo = spyOnScrollTo()
    const { rerender } = render(routerTree())

    // 初期表示のnavigationTypeはPOPなので、一度PUSHしてから再レンダーしないと
    // 「POPだから発火しなかった」のか「依存配列で弾かれた」のか区別できない
    await user.click(screen.getByRole('link', { name: 'ルールへ' }))

    scrollTo.mockClear()
    rerender(routerTree())

    expect(screen.getByText('rules')).toBeInTheDocument()
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
