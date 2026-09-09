import { ROLE_STYLE } from '@/components/roleStyle'
import type { BattlePreset } from '@/game/types'

interface BattleIntroProps {
  preset: BattlePreset
  secondsRemaining: number
}

export function BattleIntro({ preset, secondsRemaining }: BattleIntroProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-text-tertiary">
        まもなく対戦開始
      </span>

      <div className="flex items-center gap-6">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border ${ROLE_STYLE.player.surfaceClass} font-sans text-sm font-bold text-text-primary shadow-card`}
        >
          あなた
        </div>
        <span className="font-mono text-xs font-bold tracking-[0.06em] text-text-tertiary">VS</span>
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border ${ROLE_STYLE.opponent.surfaceClass} font-sans text-sm font-bold text-text-primary shadow-card`}
        >
          CPU
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2 rounded-chip border border-dashed border-border-default px-4 py-3 font-mono text-[11px] text-text-secondary">
        <div className="flex items-center justify-between">
          <span>初期HP</span>
          <span className="text-text-primary">{preset.initialHp}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ガードクールダウン</span>
          <span className="text-text-primary">{preset.guardCooldownTurns}ターン</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-text-secondary">
          対戦開始まで
        </span>
        <span
          className="font-sans text-4xl font-extrabold text-text-primary tabular-nums"
          aria-live="polite"
          aria-label={`残り${secondsRemaining}秒`}
        >
          {secondsRemaining}
        </span>
      </div>
    </div>
  )
}
