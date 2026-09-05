import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GuardBadge } from '@/components/GuardBadge'

describe('GuardBadge', () => {
  it('shows GUARD READY when the cooldown is 0', () => {
    render(<GuardBadge guardCooldownRemaining={0} />)
    expect(screen.getByText('GUARD READY')).toBeInTheDocument()
  })

  it('shows the remaining cooldown turns otherwise', () => {
    render(<GuardBadge guardCooldownRemaining={2} />)
    expect(screen.getByText('あと2T')).toBeInTheDocument()
  })
})
