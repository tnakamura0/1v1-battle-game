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
  /**
   * 「今回失ったセル」を光らせる遅延のクラス（例: '[animation-delay:440ms]'）。
   *
   * 遅延の値をここに直接書かないのは、それが対戦画面の演出の段取りであって
   * ステータスパネルの都合ではないため。結果画面では見出しと同時に光らせたいので
   * TurnResult が REVEAL_DELAY.headline を渡す。hpBefore と同じく、
   * 「いつどう見せたいか」は呼び出し側が決める。
   */
  damageFlashDelayClass?: string
}

/**
 * 自分と相手を一目で見分けられるよう、識別色を面（ティントと枠線）・HPバー・
 * ラベルの3箇所に効かせる。画面内で持ち主を判断する基準点になるパネルなので、
 * ラベルの文字色を残す数少ない例外にしている。
 * 行動色（チャージ・攻撃・ガード）とは別軸の情報なので、エネルギーの粒や
 * 行動アイコンの色には使わない。
 */
export function StatusPanel({
  role,
  state,
  maxHp,
  hpBefore,
  damageFlashDelayClass = '',
}: StatusPanelProps) {
  const { label, textClass, hpCellClass, surfaceClass } = ROLE_STYLE[role]
  const justDamagedIndex = hpBefore !== undefined && hpBefore > state.hp ? state.hp : null

  return (
    // 背景のティントと枠線で持ち主を示す（Tier 1のカードに識別色を重ねた派生形）
    <div className={`flex flex-col gap-3 rounded-card border ${surfaceClass} p-4 shadow-card`}>
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
            /*
              今回失ったセルは、いったん塗りつぶされてから枠線だけに戻る（damage-flash）。
              アニメーションの終了状態は、これを入れる前の見た目とまったく同じ
              （枠線 damage・面は透明）。いつ光らせるかは damageFlashDelayClass 任せで、
              渡されなければ即座に光る。

              この分岐に入るのは hpBefore が渡されたときだけで、渡しているのは
              TurnResult のみ。つまり結果フェーズ限定であることは構造で保証されている。
            */
            const cellClassName = filled
              ? `h-[7px] flex-1 rounded-[2px] ${hpCellClass}`
              : justDamaged
                ? `h-[7px] flex-1 rounded-[2px] border border-damage bg-transparent animate-damage-flash ${damageFlashDelayClass}`
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
                    ? 'h-[7px] w-[7px] rounded-full bg-energy'
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
