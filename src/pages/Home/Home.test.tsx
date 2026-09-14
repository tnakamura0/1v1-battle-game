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

  /*
    Issue #117 の再発防止：プレビューだけ 相手ステータス → TURN n → 帯 の旧い並びのまま
    取り残されていた（実物は Issue #115 で TURN n → 帯 → 相手ステータス に変わっていた）。

    上の Issue #82 のテストが固定しているのは「自分ステータスが行動ボタンより上」だけで、
    その手前の3ブロックの並びは誰も見ていなかったため検出できなかった。ここで残りを埋める。

    対になる検証が Battle.test.tsx の「keeps the same frame order」にある。
    **両方が同じ並びを主張していて初めて乖離を防げる**、というのが #82 / #117 の教訓。
    現在はどちらも BattleFrame を描いているので、片方だけ崩すことは構造上できない。
    このテストはその共有が外されたときに落ちる。
  */
  it('stacks the preview in the same frame order as the real battle screen', () => {
    renderHome()
    // LPには相手ステータスだけのプレビューも別にあるので、TURN n を持つほう（＝対戦画面の
    // プレビュー）に絞る。HPバー（role="img"）で引くのは、PLAYER / OPPONENT という文字列が
    // 行動カードのキャプションにも出て複数マッチしうるため（Battle.test.tsx と同じ理由）。
    const previewRoot = screen.getByText('TURN 3').closest<HTMLElement>('[inert]')
    expect(previewRoot).not.toBeNull()
    const preview = within(previewRoot!)
    const [opponentStatus, playerStatus] = preview.getAllByRole('img', { name: /^HP / })

    expectRenderedBefore(preview.getByText('TURN 3'), preview.getByText('行動を選択してください'))
    expectRenderedBefore(preview.getByText('行動を選択してください'), opponentStatus)
    expectRenderedBefore(opponentStatus, playerStatus)
    // 自分ステータスより下（行動ボタン）は、上の Issue #82 のテストが固定している
  })

  // Issue #103：行動ボタンは三角形（上段中央=チャージ／下段左=攻撃／下段右=ガード）。
  // 見た目の順序と読み上げ・タブ順が一致していることを、DOM順として固定する。
  // 三角形かどうかはCSSなので jsdom では見えない。配置そのものはブラウザで実測している。
  // 対になる検証が Battle.test.tsx にもある。
  it('keeps the action buttons in charge/attack/guard order', () => {
    renderHome()
    const action = (name: RegExp) => screen.getByRole('button', { name })
    expectRenderedBefore(action(/チャージ/), action(/攻撃/))
    expectRenderedBefore(action(/攻撃/), action(/ガード/))
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
