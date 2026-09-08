import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PresetSelect } from '@/pages/PresetSelect/PresetSelect'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/preset']}>
      <Routes>
        <Route path="/preset" element={<PresetSelect />} />
        <Route path="/battle" element={<div>battle screen</div>} />
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

describe('PresetSelect', () => {
  it('defaults to HP 2 / cooldown 3 turns / ふつう', () => {
    renderPage()
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '3ターン' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'ふつう' })).toBeChecked()
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

    expect(screen.getByText('battle screen')).toBeInTheDocument()
  })

  it('does not describe the settings as presets', () => {
    renderPage()
    expect(screen.queryByText(/プリセット/)).not.toBeInTheDocument()
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

    it('applies all three settings at once for サクッと遊ぶ', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(seriousButton())
      await user.click(casualButton())

      expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
      expect(screen.getByRole('radio', { name: '3ターン' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'ふつう' })).toBeChecked()
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
