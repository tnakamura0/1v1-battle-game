import { MAX_ENERGY } from '@/game/presets'
import type { PlayerState } from '@/game/types'
import { GuardBadge } from '@/components/GuardBadge'
import { ROLE_STYLE, type BattleRole } from '@/components/roleStyle'

interface StatusPanelProps {
  role: BattleRole
  state: PlayerState
  maxHp: number
  /** 直前のHP（結果画面での「今回失ったセル」の表示に使う） */
  hpBefore?: number
  dimmed?: boolean
}

/**
 * 自分と相手を一目で見分けられるよう、識別色をラベル・HPバー・左端の帯の
 * 3箇所に効かせる。行動色（チャージ・攻撃・ガード）とは別軸の情報なので、
 * 行動アイコンの色には使わない。
 */
export function StatusPanel({ role, state, maxHp, hpBefore, dimmed = false }: StatusPanelProps) {
  const { label, textClass, hpCellClass, edgeClass } = ROLE_STYLE[role]
  const justDamagedIndex = hpBefore !== undefined && hpBefore > state.hp ? state.hp : null

  return (
    // 枠線は全周1px、左端だけ3pxの識別色にする（border と border-l-* の併用）
    <div
      className={`flex flex-col gap-3 rounded-card border border-l-[3px] border-border-default ${edgeClass} bg-bg-card p-4 shadow-card ${dimmed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] font-bold tracking-[0.14em] ${textClass}`}>
          {label}
        </span>
        <GuardBadge guardCooldownRemaining={state.guardCooldownRemaining} />
      </div>

      <div className="flex items-center gap-2.5">
        <span className="font-sans text-lg font-bold text-text-primary tabular-nums">
          {state.hp}
          <span className="font-mono text-xs font-semibold text-text-tertiary">/{maxHp}</span>
        </span>

        <div className="flex flex-1 gap-[3px]" role="img" aria-label={`HP ${state.hp} / ${maxHp}`}>
          {Array.from({ length: maxHp }, (_, index) => {
            const filled = index < state.hp
            const justDamaged = index === justDamagedIndex
            const cellClassName = filled
              ? `h-[7px] flex-1 rounded-[2px] ${hpCellClass}`
              : justDamaged
                ? 'h-[7px] flex-1 rounded-[2px] border border-attack bg-transparent'
                : 'h-[7px] flex-1 rounded-[2px] bg-bg-hp-empty'
            return <div key={index} className={cellClassName} />
          })}
        </div>

        <div className="h-3.5 w-px shrink-0 bg-border-default" />

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-text-tertiary">
            EN
          </span>
          <div
            className="flex gap-[3px]"
            role="img"
            aria-label={`エネルギー ${state.energy} / ${MAX_ENERGY}`}
          >
            {Array.from({ length: MAX_ENERGY }, (_, index) => (
              <div
                key={index}
                className={
                  index < state.energy
                    ? 'h-[7px] w-[7px] rounded-full bg-charge'
                    : 'h-[7px] w-[7px] rounded-full bg-bg-energy-empty'
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
