import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Battle } from '@/pages/Battle/Battle'
import { INTRO_DURATION_MS, RESULT_DURATION_MS } from '@/game/presets'
import type { BattlePreset } from '@/game/types'
import { expectRenderedBefore } from '@/test/domOrder'

const preset: BattlePreset = { initialHp: 3, guardCooldownTurns: 2 }

function renderBattle(state?: { preset: BattlePreset }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/battle', state: state ?? null }]}>
      <Routes>
        <Route path="/battle" element={<Battle />} />
        <Route path="/preset" element={<div>preset select screen</div>} />
        <Route path="/battle/result" element={<div>final result screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

/**
 * 左カラム（intro / 行動選択 / 結果が入れ替わる領域）。
 * lg以上では右にターン履歴が並び、"TURN 1" のようなテキストは両方に出る。
 * どちらの話をしているかが曖昧にならないよう、この領域で絞ってから引く。
 */
function battleArea() {
  return screen.getByRole('region', { name: 'バトル' })
}

function turnHistory() {
  return screen.getByRole('complementary', { name: 'ターン履歴' })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Battle', () => {
  it('redirects to /preset when no preset was passed via navigation state', () => {
    renderBattle(undefined)
    expect(screen.getByText('preset select screen')).toBeInTheDocument()
  })

  it('shows a countdown during the intro, then moves to hand selection', () => {
    renderBattle({ preset })
    expect(screen.getByLabelText('残り3秒')).toBeInTheDocument()
    // introと行動選択中は同じ Versus を共有している。両フェーズで出ることを
    // 固定しておかないと、片方から消えても気づけない
    expect(screen.getByText('あなた')).toBeInTheDocument()
    expect(screen.getByText('CPU')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByLabelText('残り2秒')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    expect(screen.getByText('行動を選択してください')).toBeInTheDocument()
  })

  // Issue #82 の再発防止：LPのプレビューがこの並びを再現している。
  // 片側だけ固定しても乖離は防げないので、実物側の並びもここで固定する。
  // 対になる検証が Home.test.tsx にある。
  it('puts the player status above the action buttons', () => {
    renderBattle({ preset })
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    expectRenderedBefore(screen.getByText('YOU'), screen.getByRole('button', { name: /チャージ/ }))
  })

  it('resolves a turn on submit and auto-advances to the next turn', () => {
    renderBattle({ preset })
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    act(() => {
      screen.getByRole('button', { name: /チャージ/ }).click()
    })

    const battle = within(battleArea())
    expect(battle.getByText('TURN 1')).toBeInTheDocument()
    expect(battle.getByText('変化なし')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(RESULT_DURATION_MS)
    })

    expect(within(battleArea()).getByText('TURN 2')).toBeInTheDocument()
    expect(screen.getByText('行動を選択してください')).toBeInTheDocument()
  })

  // Issue #87：lg以上で履歴が右へ移ったあとの空きに置く対峙の表現。
  // 表示・非表示はCSS（幅と高さ）で決めておりjsdomでは判定できないので、
  // 「どのフェーズのDOMに置かれるか」だけを固定する。
  it('shows the versus arena while choosing an action, but not in the result', () => {
    renderBattle({ preset })
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    const caption = '両者の行動は同時に公開されます'
    const battle = within(battleArea())
    expect(battle.getByText(caption)).toBeInTheDocument()
    // 対峙の円そのものも固定する。キャプションだけだと、Versus が別物に
    // 差し替わっても気づけない
    expect(battle.getByText('あなた')).toBeInTheDocument()
    expect(battle.getByText('CPU')).toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: /チャージ/ }).click()
    })

    expect(screen.queryByText(caption)).not.toBeInTheDocument()
  })

  // Issue #84：lg以上で右カラムに出す履歴。フェーズをまたいで出しっぱなしにするので、
  // 結果フェーズでも過去のターンを追えることをここで固定する
  it('keeps the turn history alongside the battle in every phase', () => {
    renderBattle({ preset })
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS)
    })

    expect(within(turnHistory()).getByText('まだ履歴はありません')).toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: /チャージ/ }).click()
    })

    // 結果表示中も履歴は残り、今解決したターンが最新として入っている
    expect(within(turnHistory()).getByText('TURN 1')).toBeInTheDocument()
    expect(within(turnHistory()).getByText('LATEST')).toBeInTheDocument()
  })
})
