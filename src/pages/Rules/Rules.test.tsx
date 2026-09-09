import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Rules } from '@/pages/Rules/Rules'

function renderRules() {
  render(
    <MemoryRouter>
      <Rules />
    </MemoryRouter>,
  )
}

/** 行見出し（自分の行動）から、組み合わせ表の該当行のセルを取り出す */
function matchupCellsFor(own: string) {
  const rows = within(screen.getByRole('table')).getAllByRole('row')
  const target = rows.find((row) => within(row).queryByRole('rowheader', { name: own }))
  if (!target) {
    throw new Error(`自分の行動が「${own}」の行が見つかりません`)
  }
  return within(target).getAllByRole('cell')
}

describe('Rules', () => {
  it('renders the page heading and the action matchup table', () => {
    renderRules()
    expect(screen.getByRole('heading', { name: 'ルール / 遊び方', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('行動の組み合わせ')).toBeInTheDocument()
    // モバイル用のカードとPC用の表に分かれていた実装を1つの表に統合したので、表は常に1つだけ
    expect(screen.getAllByRole('table')).toHaveLength(1)
  })

  it('states up front that damage only happens on attack versus charge', () => {
    renderRules()
    expect(
      screen.getByText('ダメージが発生するのは、片方が攻撃・もう片方がチャージのときだけです。'),
    ).toBeInTheDocument()
    expect(screen.getByText('— ＝ ダメージなし（数字は減るHPの量）')).toBeInTheDocument()
  })

  it('labels the rows as the player and the columns as the opponent', () => {
    renderRules()
    const table = screen.getByRole('table')
    expect(within(table).getByText('行＝自分の行動 / 列＝相手の行動')).toBeInTheDocument()
    // 以降のセルの検証は列の並び順に依存するので、順序そのものをここで固定する
    // （先頭列は行見出しの列なので、アクセシブルネームを持たない）
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['自分の行動', 'チャージ', '攻撃', 'ガード'])
  })

  it('shows the damage outcome of every combination, with its nuance as a note', () => {
    renderRules()

    const [chargeVsCharge, chargeVsAttack, chargeVsGuard] = matchupCellsFor('チャージ')
    expect(chargeVsCharge).toHaveTextContent(/^—ダメージなし$/)
    expect(chargeVsAttack).toHaveTextContent(/^自分に1自分に1ダメージ$/)
    expect(chargeVsGuard).toHaveTextContent(/^—ダメージなし$/)

    const [attackVsCharge, attackVsAttack, attackVsGuard] = matchupCellsFor('攻撃')
    expect(attackVsCharge).toHaveTextContent(/^相手に1相手に1ダメージ$/)
    expect(attackVsAttack).toHaveTextContent(/^—ダメージなし相打ち$/)
    expect(attackVsGuard).toHaveTextContent(/^—ダメージなしガードされる$/)

    const [guardVsCharge, guardVsAttack, guardVsGuard] = matchupCellsFor('ガード')
    expect(guardVsCharge).toHaveTextContent(/^—ダメージなし$/)
    expect(guardVsAttack).toHaveTextContent(/^—ダメージなしガード成功$/)
    expect(guardVsGuard).toHaveTextContent(/^—ダメージなし$/)
  })
})
