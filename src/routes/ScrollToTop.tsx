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
 * 戻る/進む（POP）のときは何もしない。ブラウザ自身が元の位置を復元するので、
 * ここでも先頭へ戻すと復元処理と競合し、どちらが勝つかが環境任せになる。
 * 「戻ったら元の位置に戻る」のは期待どおりの挙動でもあるため、任せている。
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
