import type { BattlePreset } from '@/game/types'

interface BattleIntroProps {
  preset: BattlePreset
}

export function BattleIntro({ preset }: BattleIntroProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-6 text-center">
      <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-text-tertiary">
        まもなく対戦開始
      </span>

      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border-emphasis bg-bg-surface font-sans text-sm font-bold text-accent-light">
          あなた
        </div>
        <span className="font-mono text-xs font-bold tracking-[0.06em] text-text-tertiary">VS</span>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border-emphasis bg-bg-surface font-sans text-sm font-bold text-text-secondary">
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

      <span className="font-sans text-sm font-semibold text-text-secondary">対戦開始</span>
    </div>
  )
}
