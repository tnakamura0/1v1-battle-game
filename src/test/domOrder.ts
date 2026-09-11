import { expect } from 'vitest'

/**
 * `earlier` が `later` より先に描画されていることを検証する。
 *
 * Issue #82 は「LPのプレビューと実際の対戦画面で、自分のステータスと行動ボタンの
 * 上下が食い違う」というものだった。片側だけ固定しても乖離は防げないので、
 * Home.test.tsx と Battle.test.tsx の両方から同じ判定を呼べるようここに置いている。
 *
 * 上下関係はCSSではなくDOM順が決めているため、DOM順で判定してよい。
 * compareDocumentPosition の戻り値はビットマスクなので、他のビット（要素が入れ子に
 * なった場合の CONTAINED_BY など）が立っても順序の判定は変わらないようマスクを取る。
 */
export function expectRenderedBefore(earlier: Element, later: Element): void {
  const isBefore = Boolean(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING,
  )
  expect(isBefore, `${describe(earlier)} が ${describe(later)} より先に描画されていること`).toBe(
    true,
  )
}

function describe(element: Element): string {
  const text = element.textContent?.trim().slice(0, 20)
  return text ? `${element.tagName.toLowerCase()}「${text}」` : element.tagName.toLowerCase()
}
