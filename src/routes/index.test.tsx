import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from '@/routes'

const NOT_FOUND_HEADING = 'ページが見つかりません'

// AppRoutes は ScrollToTop を含んでいて描画時に window.scrollTo を呼ぶ。
// jsdomのwindow.scrollToは実際にはスクロールせずエラーを出すだけなので差し替える
// （ScrollToTop.test.tsx と同じ理由。差し替えないとテストは通るが出力が汚れる）
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

/** AppRoutes 全体を指定のパスで描画する。Routes はマッチした1つしか描画しない */
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

/*
  Issue #154 の回帰テスト。

  vercel.json のSPAフォールバック（Issue #150）でサーバーが404を返さなくなったため、
  キャッチオール（path="*"）を消すと存在しないパスが**空の画面**になる。
  NotFound のコンポーネント単体のテストは、ルートを消しても通ってしまうので、
  ここでルーティングとして固定している。
*/
describe('AppRoutes', () => {
  it('renders the not-found screen for an unknown path', () => {
    renderAt('/does-not-exist')
    expect(screen.getByRole('heading', { name: NOT_FOUND_HEADING, level: 1 })).toBeInTheDocument()
  })

  it('renders the matching screen instead of the not-found screen', () => {
    renderAt('/rules')
    expect(screen.getByRole('heading', { name: 'ルール / 遊び方', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: NOT_FOUND_HEADING })).not.toBeInTheDocument()
  })

  /*
    定義済みのルートがキャッチオールに吸われないことの確認。
    ルートを消したり path を打ち間違えたりすると、そのパスは NotFound に落ちる。
    各画面の中身ではなく「NotFoundに落ちないこと」だけを見ているので、
    画面の文言を変えてもこのテストは壊れない。
    /battle は state なしだと /preset にリダイレクトするが、それもNotFoundではない。

    **「キャッチオールを先頭に置いてしまう」誤りはここでは捕まえられない。**
    v7 は記述順ではなく具体度でマッチするため、先頭に置いても壊れないから。
  */
  it.each(['/', '/rules', '/preset', '/battle', '/battle/result'])(
    'does not fall through to the not-found screen at %s',
    (path) => {
      renderAt(path)
      expect(screen.queryByRole('heading', { name: NOT_FOUND_HEADING })).not.toBeInTheDocument()
    },
  )
})
