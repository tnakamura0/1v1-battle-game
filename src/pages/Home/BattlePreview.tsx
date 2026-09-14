import type { ReactNode } from 'react'
import { ActionPromptBand } from '@/components/ActionPromptBand'
import { ActionTriangle } from '@/components/ActionTriangle'
import { BattleFrame } from '@/components/BattleFrame'
import { StatusPanel } from '@/components/StatusPanel'
import type { PlayerState } from '@/game/types'

/**
 * LPに置く対戦画面のプレビュー。
 *
 * 見た目を手で複製すると対戦画面の変更に追従できず、いずれ実物と食い違う。
 * そこで**枠ごと BattleFrame をそのまま描画している**。ここに出ているアイコン・行動色・
 * HPバー・行動ボタンの三角配置に加えて、**ブロックの並び順も対戦画面と同一**になる。
 *
 * ## なぜ枠ごと共有しているか
 *
 * この乖離は2回起きている。
 * - Issue #82 … 行動ボタンをグリッドごと手書きしていて、自分のステータスとの上下が逆だった
 *   → 配置を ActionTriangle に寄せて複製をなくした
 * - Issue #117 … ActionTriangle を使っても「ブロック同士の並び順」は手書きのまま残っており、
 *   対戦画面が TURN n → 帯 → 相手ステータス に変わった（Issue #115）のに
 *   プレビューだけ 相手ステータス → TURN n → 帯 の旧い並びで取り残された
 *   → 並び順そのものを持っている BattleFrame ごと共有して止めた
 *
 * **実コンポーネントを部品として使うだけでは、部品の「並べ方」は複製されたまま残る。**
 * 2度とも同じ形で再発しているので、ここに手書きのレイアウトを足さないこと。
 * 対戦画面に見えていて、ここに出したいものが増えたときは、
 * BattleFrame のスロット（statusBand / actions / children）に載せる。
 *
 * ターンタイマーは描かない。参照デザインには秒数とプログレスバーがあるが、
 * それはリアルタイム対人戦を前提にした別仕様のもので、このゲームには存在しない。
 */
const OPPONENT: PlayerState = { hp: 2, energy: 3, guardCooldownRemaining: 0 }
const PLAYER: PlayerState = { hp: 3, energy: 2, guardCooldownRemaining: 0 }
// 「相手を読む」の例なので、ガードが切れていて攻撃が通る局面を映す
const OPPONENT_ON_COOLDOWN: PlayerState = { hp: 2, energy: 3, guardCooldownRemaining: 2 }
const PREVIEW_MAX_HP = 3
// 序盤でも終盤でもない、読み合いが続いている途中の局面に見せる
const PREVIEW_TURN = 3

export function BattlePreview() {
  return (
    <PreviewFrame>
      {/*
        中身（children）は渡さない。対戦画面ではここにターン履歴や対峙の円が入るが、
        プレビューは1画面に収める飾りなので出さない。中央の領域は高さ0になり、
        相手ステータスと自分ステータスが直に並ぶ。
      */}
      <BattleFrame
        maxHp={PREVIEW_MAX_HP}
        turn={PREVIEW_TURN}
        opponent={{ state: OPPONENT }}
        player={{ state: PLAYER }}
        statusBand={<ActionPromptBand />}
        actions={<ActionTriangle onSelect={noop} />}
      />
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
