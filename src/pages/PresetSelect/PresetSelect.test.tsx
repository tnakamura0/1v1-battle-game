import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PresetSelect } from '@/pages/PresetSelect/PresetSelect'

/** 遷移先に渡された設定を検証できるよう、location.stateをそのまま描画する */
function BattleScreenProbe() {
  const location = useLocation()
  return <div>battle screen {JSON.stringify(location.state)}</div>
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/preset']}>
      <Routes>
        <Route path="/preset" element={<PresetSelect />} />
        <Route path="/battle" element={<BattleScreenProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

function casualButton() {
  return screen.getByRole('button', { name: /サクッと遊ぶ/ })
}

function seriousButton() {
  return screen.getByRole('button', { name: /真剣勝負/ })
}

function suddenDeathButton() {
  return screen.getByRole('button', { name: /サドンデス/ })
}

describe('PresetSelect', () => {
  it('defaults to HP 2 / cooldown 3 turns / ふつう', () => {
    renderPage()
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '3ターン' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'ふつう' })).toBeChecked()
  })

  it('offers every option of each setting', () => {
    renderPage()
    const valuesIn = (group: string) =>
      within(screen.getByRole('group', { name: group }))
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('value'))

    expect(valuesIn('初期HP')).toEqual(['1', '2', '3'])
    expect(valuesIn('ガード再使用クールダウン')).toEqual(['1', '2', '3'])
    expect(valuesIn('CPUの強さ')).toEqual(['normal', 'strong'])
  })

  it('lets the user change the setup before starting', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('radio', { name: '3' }))
    await user.click(screen.getByRole('radio', { name: '2ターン' }))
    await user.click(screen.getByRole('radio', { name: 'つよい' }))

    expect(screen.getByRole('radio', { name: '3' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '2ターン' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'つよい' })).toBeChecked()
  })

  it('navigates to the battle screen when starting', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '対戦を始める' }))

    expect(screen.getByText(/battle screen/)).toBeInTheDocument()
  })

  it('hands the chosen setup to the battle screen', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(seriousButton())
    await user.click(screen.getByRole('button', { name: '対戦を始める' }))

    expect(
      screen.getByText(/"preset":{"initialHp":3,"guardCooldownTurns":2,"cpuDifficulty":"strong"}/),
    ).toBeInTheDocument()
  })

  // Issue #54 の再発防止：設定はプリセットから選ぶ仕様ではない
  it('does not describe the settings as presets', () => {
    renderPage()
    expect(screen.queryByText(/プリセット/)).not.toBeInTheDocument()
  })

  /*
   * Issue #129：個別設定は初期状態で閉じておく。
   *
   * jsdom は details が閉じていても子をアクセシビリティツリーから外さないので、
   * このファイルの他のテストが getByRole('radio') を閉じたまま引けてしまう。
   * 折りたたみ自体はここで open 属性を直接見て固定する。
   */
  describe('個別設定の折りたたみ', () => {
    const individualSettings = () =>
      screen.getByRole('heading', { level: 2, name: /個別に調整する/ }).closest('details')!

    it('starts collapsed', () => {
      renderPage()
      expect(individualSettings().open).toBe(false)
    })

    it('expands when the summary is clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByText('個別に調整する'))

      expect(individualSettings().open).toBe(true)
    })

    /*
     * 閉じた状態で現在の設定を示すのは summary のチップだけ。個別に変更すると
     * おすすめ3枚はすべて aria-pressed=false になるので、ここが消えると
     * 今どの設定で始まるのかが画面から分からなくなる。
     */
    it('keeps showing the current setup in the summary when it matches no recommendation', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(seriousButton())
      await user.click(screen.getByRole('radio', { name: '2' }))

      expect(casualButton()).toHaveAttribute('aria-pressed', 'false')
      expect(seriousButton()).toHaveAttribute('aria-pressed', 'false')
      expect(suddenDeathButton()).toHaveAttribute('aria-pressed', 'false')

      const summary = individualSettings().querySelector('summary')!
      for (const chip of ['HP2', 'ガード2ターン', 'CPUつよい']) {
        expect(within(summary).getByText(chip)).toBeInTheDocument()
      }
    })
  })

  // Issue #95：個別の調整は必須の手順ではないので、任意であることを見出しで示す
  it('marks the individual settings as optional', () => {
    renderPage()
    // 「任意」は序数と違い読み上げる価値のある情報なので、見出しの名前に含める
    expect(screen.getByRole('heading', { level: 2, name: /任意/ })).toBeInTheDocument()
    expect(screen.getByText('おすすめのままでも始められます。')).toBeInTheDocument()
  })

  /*
   * Issue #170：「おすすめのままでも始められます。」は開いたあとも出し続ける。
   * 開いている間も「おすすめのままで始めてよい」ことは変わらないため。
   * 逆に現在値のチップは、開けば同じ値が下に見えるので閉じているときだけ出す。
   *
   * 出し分けは group-open:hidden（CSS）なので jsdom では結果が見えない。
   * このファイルの Issue #98 のテスト2つと同じ形で、クラスの有無として固定する。
   */
  it('keeps the optional note visible while hiding the chips once expanded', () => {
    renderPage()

    expect(screen.getByText('おすすめのままでも始められます。').className).not.toContain(
      'group-open:hidden',
    )
    expect(screen.getByText('現在の設定:').parentElement!.className).toContain('group-open:hidden')
  })

  // Issue #170：すぐ下に「個別に調整する」があるので、言い添えなくても分かる
  it('does not spell out that the setup can be changed later', () => {
    renderPage()
    expect(screen.queryByText(/あとから変更できます/)).not.toBeInTheDocument()
  })

  // Issue #95 の再発防止：順番に進む操作に見えるので序数はやめた
  it('does not number the sections', () => {
    renderPage()
    expect(screen.queryByText('01')).not.toBeInTheDocument()
    expect(screen.queryByText('02')).not.toBeInTheDocument()
  })

  // Issue #67 の再発防止：おすすめ設定と個別設定が同じ強さで並んでいた
  it('separates the recommendations from the individual settings', () => {
    renderPage()
    // 2つのセクションが同じレベルの見出しとして立っていること。
    // 個別設定だけ部分一致なのは、見出しに「任意」バッジが含まれるため（Issue #95）
    expect(screen.getByRole('heading', { level: 2, name: 'おすすめ設定' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /個別に調整する/ })).toBeInTheDocument()
    // 個別の設定は「見出し」ではなくフィールドのグループであること
    // （見出しと同じ強さで並んでいたのが Issue #67 の原因なので、ここを分けて固定する）
    for (const name of ['初期HP', 'ガード再使用クールダウン', 'CPUの強さ']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name })).not.toBeInTheDocument()
    }
  })

  describe('おすすめ設定', () => {
    it('applies all three settings at once for 真剣勝負', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(seriousButton())

      expect(screen.getByRole('radio', { name: '3' })).toBeChecked()
      expect(screen.getByRole('radio', { name: '2ターン' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'つよい' })).toBeChecked()
    })

    // Issue #92：初期HP1・クールダウン1で一撃で決着するモード
    it('applies all three settings at once for サドンデス', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(suddenDeathButton())

      expect(screen.getByRole('radio', { name: '1' })).toBeChecked()
      expect(screen.getByRole('radio', { name: '1ターン' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'つよい' })).toBeChecked()
      expect(suddenDeathButton()).toHaveAttribute('aria-pressed', 'true')
    })

    it('applies all three settings at once for サクッと遊ぶ', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(seriousButton())
      await user.click(casualButton())

      expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
      expect(screen.getByRole('radio', { name: '3ターン' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'ふつう' })).toBeChecked()
    })

    /*
     * Issue #98 の再発防止：カードの枠線と面は「選択中かどうか」だけを表す。
     * サドンデスの枠線を danger にしていたせいで、選ぶと accent に変わり、
     * 1本の枠線が「モードの性格」と「選択されている状態」で意味を乗り換えていた。
     * 色そのものは jsdom では見えない（CSSが評価されない）ので、
     * 「tone がカード自身のクラスに影響しない」という形で固定する。
     */
    it('styles the sudden death card like the others in both states', async () => {
      const user = userEvent.setup()
      renderPage()

      // 初期値は「サクッと遊ぶ」と一致するので、残り2枚はどちらも未選択
      expect(suddenDeathButton()).toHaveAttribute('aria-pressed', 'false')
      expect(seriousButton()).toHaveAttribute('aria-pressed', 'false')
      expect(suddenDeathButton().className).toBe(seriousButton().className)

      // 選択中どうしでも揃っていること。ここを見ないと、選択中のクラスにだけ
      // tone の分岐を足す退行を素通ししてしまう
      await user.click(seriousButton())
      const seriousActiveClass = seriousButton().className
      await user.click(suddenDeathButton())
      expect(suddenDeathButton()).toHaveAttribute('aria-pressed', 'true')
      expect(suddenDeathButton().className).toBe(seriousActiveClass)
    })

    /*
     * Issue #98 のもう一方の柱：性格は状態で変化しないものが担う。
     * タイトルの色が選択で動くと、選んだ瞬間に danger が薄れてしまう。
     */
    it('keeps the sudden death title styled the same whether selected or not', async () => {
      const user = userEvent.setup()
      renderPage()

      const suddenTitle = () => within(suddenDeathButton()).getByText('サドンデス')
      const seriousTitle = () => within(seriousButton()).getByText('真剣勝負')
      const suddenIdleClass = suddenTitle().className
      const seriousIdleClass = seriousTitle().className

      await user.click(suddenDeathButton())
      expect(suddenDeathButton()).toHaveAttribute('aria-pressed', 'true')
      expect(suddenTitle().className).toBe(suddenIdleClass)

      // 他の2枚は従来どおり選択で明るくなること。これがないと「全部のタイトルを
      // 固定した」退行も通ってしまうので、サドンデスだけの例外であることを固定する
      await user.click(seriousButton())
      expect(seriousTitle().className).not.toBe(seriousIdleClass)
    })

    it('marks the recommendation matching the current setup as pressed', async () => {
      const user = userEvent.setup()
      renderPage()

      // 初期値は「サクッと遊ぶ」と同じ組み合わせ
      expect(casualButton()).toHaveAttribute('aria-pressed', 'true')
      expect(seriousButton()).toHaveAttribute('aria-pressed', 'false')

      await user.click(seriousButton())

      expect(casualButton()).toHaveAttribute('aria-pressed', 'false')
      expect(seriousButton()).toHaveAttribute('aria-pressed', 'true')
    })

    it('lets the user tweak a single setting afterwards without resetting the others', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(seriousButton())
      await user.click(screen.getByRole('radio', { name: '2' }))

      expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
      expect(screen.getByRole('radio', { name: '2ターン' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'つよい' })).toBeChecked()
      // どのおすすめとも一致しなくなるので、どちらも選択中ではなくなる
      expect(casualButton()).toHaveAttribute('aria-pressed', 'false')
      expect(seriousButton()).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
