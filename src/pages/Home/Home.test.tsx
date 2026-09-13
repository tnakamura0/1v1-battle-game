import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Home } from '@/pages/Home/Home'
import { expectRenderedBefore } from '@/test/domOrder'

function renderHome() {
  render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>,
  )
}

describe('Home', () => {
  it('renders the hero heading', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: '読み合いの1対1バトル' })).toBeInTheDocument()
  })

  it('links the primary CTA to the preset selection screen', () => {
    renderHome()
    const ctaLinks = screen.getAllByRole('link', { name: '対戦を始める' })
    expect(ctaLinks.length).toBeGreaterThan(0)
    for (const link of ctaLinks) {
      expect(link).toHaveAttribute('href', '/preset')
    }
  })

  // Issue #70 の再発防止：3つの行動がテキストのみで表現されていた
  it('shows each action with its label and its effect badge', () => {
    renderHome()
    // 行動色はアイコン（aria-hidden のSVG）とバッジに乗るのでロールでは引けない。
    // 「ラベルと効果が同じ項目に並んでいる」ことをテキストで固定しておく。
    const showcase = screen.getByRole('list', { name: '3つの行動' })
    expect(
      within(showcase)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['チャージENERGY +1', '攻撃ENERGY COST 1', 'ガード攻撃を防ぐ'])
  })

  it('gives every landing section its own heading', () => {
    renderHome()
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      '操作は3択、それだけ',
      '相手を読む、という奥深さ',
      '1ターンの流れ',
      '最初の対戦を始めよう',
    ])
  })

  // Issue #82 の再発防止：プレビューだけ自分のステータスと行動ボタンが上下逆だった。
  // 実コンポーネントを使っていても並び順までは揃わないので、順序そのものを固定する。
  // 対になる検証が Battle.test.tsx にもある。両方揃って初めて乖離を防げる。
  it('stacks the preview like the real battle screen, with the player status above the actions', () => {
    renderHome()
    expectRenderedBefore(
      screen.getByText('PLAYER'),
      screen.getByRole('button', { name: /チャージ/ }),
    )
  })

  // Issue #103：行動ボタンは三角形（上段中央=チャージ／下段左=攻撃／下段右=ガード）。
  // 見た目の順序と読み上げ・タブ順が一致していることを、DOM順として固定する。
  // 三角形かどうかはCSSなので jsdom では見えない。配置そのものはブラウザで実測している。
  // 対になる検証が Battle.test.tsx にもある。
  it('keeps the action buttons in charge/attack/guard order', () => {
    renderHome()
    const button = (name: string) => screen.getByRole('button', { name: new RegExp(name) })
    expectRenderedBefore(button('チャージ'), button('攻撃'))
    expectRenderedBefore(button('攻撃'), button('ガード'))
  })

  // プレビューは飾りなので、中の行動ボタンを操作させない。
  // jsdom は inert をロール計算に反映しないため、ここでは「ボタンが inert の中にいる」
  // という構造だけを固定し、実際にフォーカスが到達しないことはブラウザで実測している。
  it('keeps the battle preview out of reach', () => {
    renderHome()
    for (const action of ['チャージ', '攻撃', 'ガード']) {
      const button = screen.getByRole('button', { name: new RegExp(action) })
      expect(button.closest('[inert]')).not.toBeNull()
    }
  })
})
