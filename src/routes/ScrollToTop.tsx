import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * 新しい画面へ進んだときに、スクロール位置を先頭へ戻す。
 *
 * SPAではDOMが差し替わってもブラウザのスクロール位置が維持されるため、
 * 何もしないと遷移先のページを途中から見せてしまう。react-routerの
 * ScrollRestorationはデータルーター専用でこの構成では使えないので、
 * pathnameの変化を購読して自前で戻す。
 *
 * 戻る/進む（POP）のときは何もしない。ブラウザ自身がスクロール位置を復元
 * しようとするため、ここでも先頭へ戻すと競合し、どちらが勝つかが環境任せに
 * なる。なおSPAでは復元の時点でまだ遷移先が描画し切れておらず、元の位置に
 * 完全には戻らないこともある（Chromiumで実測すると1000pxが79pxになった）が、
 * それはブラウザ側の裁量なのでここでは介入しない。
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  return null
}
