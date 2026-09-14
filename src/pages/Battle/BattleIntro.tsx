import { INTRO_DELAY } from '@/components/motion'
import type { BattlePreset } from '@/game/types'
import { Versus } from '@/pages/Battle/Versus'

interface BattleIntroProps {
  preset: BattlePreset
  secondsRemaining: number
}

/**
 * 対戦開始前の3秒。上から順に「まもなく対戦開始 → 対峙 → 設定 → 残り秒数」と出す。
 *
 * 動きは Versus 自身ではなく、それを包む器に持たせている。Versus は
 * 行動選択中の画面（HandSelection の BattleArena）とも共有しているので、
 * 中で動かすと毎ターン円が動き直してしまう。
 */
export function BattleIntro({ preset, secondsRemaining }: BattleIntroProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <span className="animate-fade-rise font-mono text-meta font-bold tracking-[0.18em] text-text-tertiary">
        まもなく対戦開始
      </span>

      <div className={`animate-pop-in ${INTRO_DELAY.versus}`}>
        <Versus />
      </div>

      <div
        className={`animate-fade-rise ${INTRO_DELAY.preset} flex w-full max-w-xs flex-col gap-2 rounded-chip border border-dashed border-border-default px-4 py-3 font-mono text-meta text-text-secondary`}
      >
        <div className="flex items-center justify-between">
          <span>初期HP</span>
          <span className="text-text-primary">{preset.initialHp}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ガードクールダウン</span>
          <span className="text-text-primary">{preset.guardCooldownTurns}ターン</span>
        </div>
      </div>

      <div
        className={`animate-fade-rise ${INTRO_DELAY.countdown} flex flex-col items-center gap-1`}
      >
        <span className="font-mono text-meta font-semibold tracking-[0.14em] text-text-secondary">
          対戦開始まで
        </span>
        {/*
          aria-live と aria-label は外側に残し、動かすのは内側だけにしている。
          key を付けた要素は毎秒作り直されるので、これを live region 自体にすると
          「領域ごと消えて現れる」ことになり、読み上げが不安定になる。
          内側の差し替えなら、外側の live region が3→2→1を素直に読み上げる。

          transform（scale）を効かせるために inline-block が要る。
          素の span は inline のままで、transform が無視される。
        */}
        <span
          className="font-sans text-4xl font-extrabold text-text-primary tabular-nums"
          aria-live="polite"
          aria-label={`残り${secondsRemaining}秒`}
        >
          <span key={secondsRemaining} className="inline-block animate-tick">
            {secondsRemaining}
          </span>
        </span>
      </div>
    </div>
  )
}
