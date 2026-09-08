import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  CPU_DIFFICULTY_OPTIONS,
  DEFAULT_PRESET,
  GUARD_COOLDOWN_OPTIONS,
  INITIAL_HP_OPTIONS,
} from '@/game/presets'
import type { BattlePreset } from '@/game/types'
import { SegmentedOption } from '@/pages/PresetSelect/SegmentedOption'

/** 3項目すべてが確定した対戦設定 */
type BattleSetup = Required<BattlePreset>

const CPU_DIFFICULTY_LABEL: Record<(typeof CPU_DIFFICULTY_OPTIONS)[number], string> = {
  normal: 'ふつう',
  strong: 'つよい',
}

const RECOMMENDED_SETUPS: ReadonlyArray<{
  key: string
  title: string
  description: string
  setup: BattleSetup
}> = [
  {
    key: 'casual',
    title: 'サクッと遊ぶ',
    description: '短期決戦でテンポよく',
    setup: { initialHp: 2, guardCooldownTurns: 3, cpuDifficulty: 'normal' },
  },
  {
    key: 'serious',
    title: '真剣勝負',
    description: '読み合いをじっくり',
    setup: { initialHp: 3, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
  },
]

function summarizeSetup(setup: BattleSetup): string {
  return `HP ${setup.initialHp} ／ ${setup.guardCooldownTurns}ターン ／ ${CPU_DIFFICULTY_LABEL[setup.cpuDifficulty]}`
}

function isSameSetup(a: BattleSetup, b: BattleSetup): boolean {
  return (
    a.initialHp === b.initialHp &&
    a.guardCooldownTurns === b.guardCooldownTurns &&
    a.cpuDifficulty === b.cpuDifficulty
  )
}

export function PresetSelect() {
  const navigate = useNavigate()
  const [setup, setSetup] = useState<BattleSetup>({
    initialHp: DEFAULT_PRESET.initialHp,
    guardCooldownTurns: DEFAULT_PRESET.guardCooldownTurns,
    cpuDifficulty: DEFAULT_PRESET.cpuDifficulty ?? 'normal',
  })

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden p-6">
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto">
        <Link
          to="/"
          className="w-fit font-mono text-xs font-semibold text-text-tertiary hover:text-accent-hover"
        >
          ← 戻る
        </Link>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-sans text-2xl font-extrabold text-text-primary">対戦ルールを選ぶ</h1>
          <p className="font-sans text-sm text-text-secondary">
            初期HP・ガードのクールダウン・CPUの強さを設定してください。
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
            おすすめ設定
          </h2>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {RECOMMENDED_SETUPS.map((recommended) => {
              const isActive = isSameSetup(setup, recommended.setup)
              return (
                <button
                  key={recommended.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSetup(recommended.setup)}
                  className={
                    isActive
                      ? 'flex flex-1 touch-manipulation flex-col gap-1 rounded-[10px] border border-accent bg-bg-surface-active p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
                      : 'flex flex-1 touch-manipulation flex-col gap-1 rounded-[10px] border border-border-default bg-bg-card p-3.5 text-left transition-colors hover:border-border-emphasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
                  }
                >
                  <span
                    className={
                      isActive
                        ? 'font-sans text-sm font-bold text-text-primary'
                        : 'font-sans text-sm font-bold text-text-secondary'
                    }
                  >
                    {recommended.title}
                  </span>
                  <span className="font-sans text-xs text-text-tertiary">
                    {recommended.description}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-text-secondary">
                    {summarizeSetup(recommended.setup)}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <SettingGroup legend="初期HP">
          {INITIAL_HP_OPTIONS.map((option) => (
            <SegmentedOption
              key={option}
              name="initialHp"
              value={String(option)}
              label={String(option)}
              checked={setup.initialHp === option}
              onChange={() => setSetup((current) => ({ ...current, initialHp: option }))}
            />
          ))}
        </SettingGroup>

        <SettingGroup legend="ガード再使用クールダウン">
          {GUARD_COOLDOWN_OPTIONS.map((option) => (
            <SegmentedOption
              key={option}
              name="guardCooldownTurns"
              value={String(option)}
              label={`${option}ターン`}
              checked={setup.guardCooldownTurns === option}
              onChange={() => setSetup((current) => ({ ...current, guardCooldownTurns: option }))}
            />
          ))}
        </SettingGroup>

        <SettingGroup legend="CPUの強さ">
          {CPU_DIFFICULTY_OPTIONS.map((option) => (
            <SegmentedOption
              key={option}
              name="cpuDifficulty"
              value={option}
              label={CPU_DIFFICULTY_LABEL[option]}
              checked={setup.cpuDifficulty === option}
              onChange={() => setSetup((current) => ({ ...current, cpuDifficulty: option }))}
            />
          ))}
        </SettingGroup>
      </div>

      <div className="flex flex-none flex-col pt-6">
        <button
          type="button"
          onClick={() => navigate('/battle', { state: { preset: setup }, replace: true })}
          className="flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          対戦を始める
        </button>
      </div>
    </main>
  )
}

function SettingGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    // contain:layout は、Chromiumで<fieldset>のレイアウトはみ出しが祖先のoverflowを
    // 突き抜け、ページ全体を余白分だけスクロールできてしまうのを防ぐためのもの。
    // overflow-hiddenでも防げるが、選択肢のフォーカスリングが切れてしまうため使わない。
    <fieldset className="flex flex-col gap-3 contain-layout">
      <legend className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
        {legend}
      </legend>
      <div className="flex gap-2.5">{children}</div>
    </fieldset>
  )
}
