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

describe('PresetSelect', () => {
  it('defaults to HP 2 / cooldown 3 turns / ふつう', () => {
    renderPage()
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '3ターン' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'ふつう' })).toBeChecked()
  })

  it('lets the user change the preset before starting', async () => {
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
})
