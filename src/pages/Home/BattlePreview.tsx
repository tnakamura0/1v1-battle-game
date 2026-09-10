import type { ReactNode } from 'react'
import { StatusPanel } from '@/components/StatusPanel'
import type { PlayerState } from '@/game/types'
import { ActionButton } from '@/components/ActionButton'

/**
 * LPに置く対戦画面のプレビュー。
 *
 * 見た目を手で複製すると対戦画面の変更に追従できず、いずれ実物と食い違う。
 * そこで StatusPanel と ActionButton をそのまま描画している。ここに出ている
 * アイコン・行動色・HPバーは、対戦画面で実際に見えるものと同一。
 *
 * ターンタイマーは描かない。参照デザインには秒数とプログレスバーがあるが、
 * それはリアルタイム対人戦を前提にした別仕様のもので、このゲームには存在しない。
 */
const OPPONENT: PlayerState = { hp: 2, energy: 3, guardCooldownRemaining: 0 }
const PLAYER: PlayerState = { hp: 3, energy: 2, guardCooldownRemaining: 0 }
// 「相手を読む」の例なので、ガードが切れていて攻撃が通る局面を映す
const OPPONENT_ON_COOLDOWN: PlayerState = { hp: 2, energy: 3, guardCooldownRemaining: 2 }
const PREVIEW_MAX_HP = 3

export function BattlePreview() {
  return (
    <PreviewFrame>
      <div className="flex flex-col gap-3 p-4">
        <StatusPanel role="opponent" state={OPPONENT} maxHp={PREVIEW_MAX_HP} />
        <span className="font-mono text-[13px] font-bold tracking-widest text-text-primary">
          TURN 3
        </span>
        <div className="rounded-chip border border-accent/25 bg-accent/10 px-3 py-4 text-center font-sans text-sm font-semibold text-accent-light">
          行動を選択してください
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <ActionButton action="charge" status="idle" onSelect={noop} />
          <ActionButton action="attack" status="idle" onSelect={noop} />
          <ActionButton action="guard" status="idle" onSelect={noop} />
        </div>
        <StatusPanel role="player" state={PLAYER} maxHp={PREVIEW_MAX_HP} />
      </div>
    </PreviewFrame>
  )
}

/** 「相手を読む」セクションに置く、相手のステータスパネルだけのプレビュー */
export function OpponentStatusPreview() {
  return (
    <PreviewFrame>
      <div className="p-4">
        <StatusPanel role="opponent" state={OPPONENT_ON_COOLDOWN} maxHp={PREVIEW_MAX_HP} />
      </div>
    </PreviewFrame>
  )
}

/**
 * プレビューは飾りなので、中の要素を操作させない。
 * inert はフォーカス不能化とアクセシビリティツリーからの除去を同時に行うので、
 * aria-hidden と tabIndex={-1} を手で付けて回るより正確で漏れがない。
 * ただし inert は :hover までは止めないので、pointer-events-none を併用する。
 * これがないと行動ボタンの枠がホバーで光り、押せそうに見えて何も起きない。
 */
function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div
      inert
      className="pointer-events-none w-full max-w-sm overflow-hidden rounded-card border border-border-default bg-bg-card shadow-card"
    >
      {children}
    </div>
  )
}

function noop() {}
