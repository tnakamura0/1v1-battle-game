import type { Action } from '@/game/types'
import { ACTION_LABEL } from '@/game/copy'
import { ActionIcon } from '@/components/ActionIcon'

export type ActionButtonStatus = 'idle' | 'selected' | 'disabled'

interface ActionButtonProps {
  action: Action
  status: ActionButtonStatus
  /** status==='disabled' のときに表示する理由チップの文言（未指定時は既定キャプション） */
  reasonLabel?: string
  onSelect: () => void
}

const DEFAULT_CAPTION: Record<Action, string> = {
  charge: 'EN +1',
  attack: 'COST 1',
  guard: 'READY',
}

const ACTION_COLOR_CLASS: Record<Action, string> = {
  charge: 'text-charge',
  attack: 'text-attack',
  guard: 'text-guard',
}

export function ActionButton({ action, status, reasonLabel, onSelect }: ActionButtonProps) {
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
      className={`relative flex min-h-[120px] flex-1 touch-manipulation flex-col items-center justify-center gap-2.5 rounded-action p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:cursor-not-allowed ${stateClassName}`}
    >
      {isSelected && (
        <span className="absolute right-2 top-2 rounded-chip bg-accent px-[5px] py-[2px] font-mono text-[8px] font-bold tracking-[0.08em] text-bg-page">
          SELECTED
        </span>
      )}
      <span className={isDisabled ? 'text-text-tertiary' : ACTION_COLOR_CLASS[action]}>
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
            ? 'font-mono text-[9px] font-semibold tracking-[0.06em] text-text-tertiary'
            : `font-mono text-[9px] font-semibold tracking-[0.06em] ${ACTION_COLOR_CLASS[action]}`
        }
      >
        {caption}
      </span>
    </button>
  )
}
