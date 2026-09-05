import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { DEFAULT_PRESET, GUARD_COOLDOWN_OPTIONS, INITIAL_HP_OPTIONS } from '@/game/presets'
import { SegmentedOption } from '@/pages/PresetSelect/SegmentedOption'

export function PresetSelect() {
  const navigate = useNavigate()
  const [initialHp, setInitialHp] = useState<(typeof INITIAL_HP_OPTIONS)[number]>(
    DEFAULT_PRESET.initialHp,
  )
  const [guardCooldownTurns, setGuardCooldownTurns] = useState<
    (typeof GUARD_COOLDOWN_OPTIONS)[number]
  >(DEFAULT_PRESET.guardCooldownTurns)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 p-6">
      <Link
        to="/"
        className="w-fit font-mono text-xs font-semibold text-text-tertiary hover:text-accent-hover"
      >
        ← 戻る
      </Link>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-sans text-2xl font-extrabold text-text-primary">対戦ルールを選ぶ</h1>
        <p className="font-sans text-sm text-text-secondary">
          初期HPとガードのクールダウンをプリセットから選択してください。
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
          初期HP
        </legend>
        <div className="flex gap-2.5">
          {INITIAL_HP_OPTIONS.map((option) => (
            <SegmentedOption
              key={option}
              name="initialHp"
              value={String(option)}
              label={String(option)}
              checked={initialHp === option}
              onChange={() => setInitialHp(option)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
          ガード再使用クールダウン
        </legend>
        <div className="flex gap-2.5">
          {GUARD_COOLDOWN_OPTIONS.map((option) => (
            <SegmentedOption
              key={option}
              name="guardCooldownTurns"
              value={String(option)}
              label={`${option}ターン`}
              checked={guardCooldownTurns === option}
              onChange={() => setGuardCooldownTurns(option)}
            />
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={() =>
          navigate('/battle', {
            state: { preset: { initialHp, guardCooldownTurns } },
            replace: true,
          })
        }
        className="mt-auto flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
      >
        対戦を始める
      </button>
    </main>
  )
}
