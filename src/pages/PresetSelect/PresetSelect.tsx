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

const DEFAULT_SETUP: BattleSetup = {
  initialHp: DEFAULT_PRESET.initialHp,
  guardCooldownTurns: DEFAULT_PRESET.guardCooldownTurns,
  cpuDifficulty: DEFAULT_PRESET.cpuDifficulty ?? 'normal',
}

// 「サクッと遊ぶ」は既定値そのものにする。初期表示でこのおすすめが選択中に
// 見えるのはこの一致によるものなので、DEFAULT_PRESETから導出して同期を保つ。
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
    setup: DEFAULT_SETUP,
  },
  {
    key: 'serious',
    title: '真剣勝負',
    description: '読み合いをじっくり',
    setup: { initialHp: 3, guardCooldownTurns: 2, cpuDifficulty: 'strong' },
  },
]

const RECOMMENDED_BUTTON_BASE =
  'flex flex-1 touch-manipulation flex-col gap-1 rounded-[10px] border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
const RECOMMENDED_BUTTON_ACTIVE = 'border-accent bg-bg-surface-active'
const RECOMMENDED_BUTTON_IDLE = 'border-border-default bg-bg-card hover:border-border-emphasis'

function summarizeSetup(setup: BattleSetup): string {
  return `HP${setup.initialHp} ／ ガード${setup.guardCooldownTurns}ターン ／ CPU${CPU_DIFFICULTY_LABEL[setup.cpuDifficulty]}`
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
  const [setup, setSetup] = useState<BattleSetup>(DEFAULT_SETUP)
  // おすすめを押すと下の設定がまとめて書き換わるが、画面外の変化には気づきにくい。
  // スクリーンリーダー向けに、反映されたことを読み上げるためだけの状態。
  const [appliedTitle, setAppliedTitle] = useState<string | null>(null)

  const updateSetup = (changes: Partial<BattleSetup>) => {
    setSetup((current) => ({ ...current, ...changes }))
    setAppliedTitle(null)
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden">
      {/*
        contain-layout がないと、このスクロール領域からあふれた分だけページ全体が
        スクロールできてしまう（祖先の overflow-hidden では止まらない）。
        レイアウトの伝播だけを断つので、描画（フォーカスリング）は切られない。
      */}
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 pt-6 contain-layout">
        <Link
          to="/"
          className="w-fit rounded-chip font-mono text-xs font-semibold text-text-tertiary transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
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
          <p id="recommended-setups-hint" className="-mt-1 font-sans text-xs text-text-tertiary">
            選ぶと下の3つの設定がまとめて切り替わります。あとから個別に変更できます。
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {RECOMMENDED_SETUPS.map((recommended) => {
              const isActive = isSameSetup(setup, recommended.setup)
              return (
                <button
                  key={recommended.key}
                  type="button"
                  aria-pressed={isActive}
                  aria-describedby="recommended-setups-hint"
                  onClick={() => {
                    setSetup({ ...recommended.setup })
                    setAppliedTitle(recommended.title)
                  }}
                  className={`${RECOMMENDED_BUTTON_BASE} ${isActive ? RECOMMENDED_BUTTON_ACTIVE : RECOMMENDED_BUTTON_IDLE}`}
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
          <p role="status" className="sr-only">
            {appliedTitle ? `${appliedTitle}の設定を反映しました` : ''}
          </p>
        </section>

        <SettingGroup legend="初期HP">
          {INITIAL_HP_OPTIONS.map((option) => (
            <SegmentedOption
              key={option}
              name="initialHp"
              value={String(option)}
              label={String(option)}
              checked={setup.initialHp === option}
              onChange={() => updateSetup({ initialHp: option })}
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
              onChange={() => updateSetup({ guardCooldownTurns: option })}
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
              onChange={() => updateSetup({ cpuDifficulty: option })}
            />
          ))}
        </SettingGroup>
      </div>

      <button
        type="button"
        onClick={() => navigate('/battle', { state: { preset: setup }, replace: true })}
        className="mx-6 mb-6 mt-6 flex h-13 flex-none touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
      >
        対戦を始める
      </button>
    </main>
  )
}

function SettingGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
        {legend}
      </legend>
      <div className="flex gap-2.5">{children}</div>
    </fieldset>
  )
}
