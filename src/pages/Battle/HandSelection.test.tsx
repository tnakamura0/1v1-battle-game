import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MAX_ENERGY } from '@/game/presets'
import type { BattlePreset, PlayerState } from '@/game/types'
import { HandSelection } from '@/pages/Battle/HandSelection'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 3 }

function playerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return { hp: 3, energy: 2, guardCooldownRemaining: 0, ...overrides }
}

function renderHands(player: PlayerState, cpu: PlayerState) {
  return render(
    <HandSelection
      player={player}
      cpu={cpu}
      preset={preset}
      turn={1}
      history={[]}
      onSelectAction={() => {}}
    />,
  )
}

const actionButton = (name: RegExp) => screen.getByRole('button', { name })

/*
 * 押せない理由のチップ（HandSelection の reasonLabel）。
 *
 * Battle.test.tsx ではCPUが実際の乱数で動くため、エネルギーを上限まで
 * 溜める盤面を安定して作れない。盤面を直接渡せるここで固定する。
 * ロジック（rules.ts の getIllegalReason）だけ直して表示が取り残される、
 * という事故を防ぐのが目的。
 */
describe('HandSelection の押せない理由', () => {
  it('エネルギーが上限ならチャージを無効にして ENERGY MAX を出す', () => {
    renderHands(playerState({ energy: MAX_ENERGY }), playerState({ energy: 2 }))

    const charge = actionButton(/チャージ/)
    expect(charge).toBeDisabled()
    expect(charge).toHaveTextContent('ENERGY MAX')
    // 上限では攻撃が必ず残る。3つとも押せない盤面は作れない
    expect(actionButton(/攻撃/)).toBeEnabled()
  })

  it('エネルギーが上限未満ならチャージは押せて EN +1 のまま', () => {
    renderHands(playerState({ energy: MAX_ENERGY - 1 }), playerState({ energy: 2 }))

    const charge = actionButton(/チャージ/)
    expect(charge).toBeEnabled()
    expect(charge).toHaveTextContent('EN +1')
  })

  it('エネルギーが0なら攻撃を無効にして ENERGY 0 を出す', () => {
    renderHands(playerState({ energy: 0 }), playerState({ energy: 2 }))

    const attack = actionButton(/攻撃/)
    expect(attack).toBeDisabled()
    expect(attack).toHaveTextContent('ENERGY 0')
  })

  it('相手のエネルギーが0ならガードを無効にして 相手EN 0 を出す', () => {
    renderHands(playerState(), playerState({ energy: 0 }))

    const guard = actionButton(/ガード/)
    expect(guard).toBeDisabled()
    expect(guard).toHaveTextContent('相手EN 0')
  })

  it('ガードがクールダウン中なら残りターン数を出す', () => {
    renderHands(playerState({ guardCooldownRemaining: 2 }), playerState({ energy: 2 }))

    const guard = actionButton(/ガード/)
    expect(guard).toBeDisabled()
    expect(guard).toHaveTextContent('あと2T')
  })
})
