import type { Action } from '@/game/types'
import { ACTION_LABEL } from '@/game/copy'
import { ACTION_STYLE } from '@/components/actionStyle'
import { ActionIcon } from '@/components/ActionIcon'

export type ActionButtonStatus = 'idle' | 'selected' | 'disabled'

interface ActionButtonProps {
  action: Action
  status: ActionButtonStatus
  /** status==='disabled' のときに表示する理由チップの文言（未指定時は既定キャプション） */
  reasonLabel?: string
  onSelect: () => void
  /**
   * 並べる側がグリッド上の位置を渡すために使う（例: 'col-start-2 col-span-2'）。
   * 配置はボタン自身ではなく並べる側の関心なので、ここで受け取って外から決められるようにする。
   * 実際の指定は components/ActionTriangle.tsx にある。
   */
  className?: string
}

const DEFAULT_CAPTION: Record<Action, string> = {
  charge: 'EN +1',
  attack: 'COST 1',
  guard: 'READY',
}

export function ActionButton({
  action,
  status,
  reasonLabel,
  onSelect,
  className,
}: ActionButtonProps) {
  const isDisabled = status === 'disabled'
  const isSelected = status === 'selected'
  const caption = isDisabled ? (reasonLabel ?? DEFAULT_CAPTION[action]) : DEFAULT_CAPTION[action]

  const stateClassName = isSelected
    ? 'border-[1.5px] border-accent bg-bg-surface-active shadow-[inset_0_0_0_1px_rgba(34,211,238,0.12)]'
    : isDisabled
      ? 'border border-dashed border-border-default bg-[repeating-linear-gradient(45deg,#0e141b,#0e141b_6px,#111820_6px,#111820_12px)] opacity-80'
      : 'border border-border-emphasis bg-bg-surface hover:border-accent/60'

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onSelect}
      /*
       * 三角形に並ぶと2段になり、行動ボタンの占める高さが約130px増える（Issue #103）。
       * 対戦画面ではその分がターン履歴の表示領域から引かれるので、背の低い画面だけ詰める。
       * 375×667 で実測したところ、120pxのままだと履歴が56pxしか残らず、
       * 履歴1行（当時の実測で約88.5px）すら表示できなかった。
       *
       * 高さだけでなく余白と間隔も詰めているのは、min-h を下げても中身の高さが
       * 下限になってしまい、それ以上縮まなかったため。
       * 背の高い画面はこれまでどおり（120px / p-3 / gap-2.5）で変えていない。
       * 幅ではなく高さの条件なのは、足りなくなるのが縦だから。
       *
       * 詰める量は 96px / p-2.5 / gap-1.5 から 88px / p-2 / gap-1 に一段深くした（Issue #120）。
       * キャプションを9pxから11pxに上げるとボタンの中身が 96.5px まで伸び、その分
       * 375×667 のスクロール領域が削られて、履歴の最新行が17pxはみ出していたため
       * （結果の行が文字の途中で断ち切られて見えていた）。ボタンは2段あるので、
       * 1つ8px詰めると履歴には16px戻る。
       *
       * **なお「最新行がぴったり収まる」状態はもともと存在しない。** 375×667 の実測で、
       * 最新行は変更前 88.5px（2.5pxはみ出し）→ 変更後 91.5px（1pxはみ出し）。
       * 行自体が3px伸びているのは、その中の LATEST を8→10px、TURN n を10→11px に
       * 上げたため。はみ出しは 2.5px → 1px と減っており、変更前より改善している。
       * はみ出す1pxは行の下padding側なので文字は最後まで読めるが、
       * **スクリーンショット目視では判定できない。** 触るときは li の
       * getBoundingClientRect().height とスクロール領域の下端を実測で比べること。
       *
       * min-h は現状効いていない（中身が88.5pxで min-h-[88px] を上回るため）。
       * 下げても375×667では何も変わらず、上げると効き始めるという非対称があるので、
       * 高さを詰めたいときに動かすのは p と gap のほう。
       *
       * 詰める理由は「三角形に並べたから」で本来は並べる側の都合だが、指定はここに置く。
       * className は文字列の末尾に連結されるだけで、外から渡した min-h が
       * ここの指定に勝つとは限らないため（tailwind-merge を使っていない）。
       *
       * 700px は HandSelection のアリーナの閾値と同じ値だが、根拠は別
       * （あちらは円が切れない高さ、こちらは履歴を1行残せる高さ）。連動させないこと。
       */
      className={`relative flex min-h-[88px] flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-action p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:cursor-not-allowed [@media(min-height:700px)]:min-h-[120px] [@media(min-height:700px)]:gap-2.5 [@media(min-height:700px)]:p-3 ${stateClassName} ${className ?? ''}`}
    >
      {isSelected && (
        <span className="absolute right-2 top-2 rounded-chip bg-accent px-[5px] py-[2px] font-mono text-chip font-bold tracking-[0.08em] text-bg-page">
          SELECTED
        </span>
      )}
      <span className={isDisabled ? 'text-text-tertiary' : ACTION_STYLE[action].textClass}>
        <ActionIcon action={action} />
      </span>
      <span
        className={
          isDisabled
            ? 'font-sans text-sm font-bold text-text-tertiary'
            : 'font-sans text-sm font-bold text-text-primary'
        }
      >
        {ACTION_LABEL[action]}
      </span>
      <span
        className={
          isDisabled
            ? 'font-mono text-meta font-semibold tracking-[0.06em] text-text-tertiary'
            : `font-mono text-meta font-semibold tracking-[0.06em] ${ACTION_STYLE[action].textClass}`
        }
      >
        {caption}
      </span>
    </button>
  )
}
