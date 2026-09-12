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
  /**
   * danger は「一撃で決まる特殊なモード」を色でも伝えるためのもの。
   * 枠線とチップにだけ乗せて面は塗らない（面を塗ると3枚のうち1枚だけ光り、
   * accentが表す「選択中」と紛らわしくなる）。
   */
  tone?: 'default' | 'danger'
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
  {
    key: 'sudden-death',
    title: 'サドンデス',
    description: '一撃で決着',
    setup: { initialHp: 1, guardCooldownTurns: 1, cpuDifficulty: 'strong' },
    tone: 'danger',
  },
]

const RECOMMENDED_BUTTON_BASE =
  'flex flex-1 touch-manipulation flex-col gap-2 rounded-card border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
// 選択中は tone に関係なく accent。dangerに「選択中」の意味を持たせない
const RECOMMENDED_BUTTON_ACTIVE = 'border-accent bg-bg-surface-active'
const RECOMMENDED_BUTTON_IDLE = 'border-border-default bg-bg-card hover:border-border-emphasis'
const RECOMMENDED_BUTTON_IDLE_DANGER = 'border-danger/45 bg-bg-card hover:border-danger'

/**
 * 設定値を3つのチップに分ける。1本の文字列（`HP2 ／ ガード3ターン ／ CPUふつう`）だと
 * カードが3枚並んだときに幅が足りず、区切り文字の途中で折り返して読みにくくなる。
 */
function setupChips(setup: BattleSetup): string[] {
  return [
    `HP${setup.initialHp}`,
    `ガード${setup.guardCooldownTurns}T`,
    CPU_DIFFICULTY_LABEL[setup.cpuDifficulty],
  ]
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
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden lg:max-w-3xl">
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
          {/*
            ルール画面の「HOW TO PLAY」と同じ作りのメタラベル。
            この画面で accent は「選択中」を表すので装飾には使わない方針だが、
            それはセクション見出し（選べるカードのすぐ上に出る）についての話。
            操作要素から離れたページ最上部のラベルは取り違えようがないので例外とする。
          */}
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent">
            BATTLE SETUP
          </span>
          <h1 className="font-sans text-2xl font-extrabold text-text-primary">対戦ルールを選ぶ</h1>
          <p className="font-sans text-sm text-text-secondary">
            初期HP・ガードのクールダウン・CPUの強さを設定してください。
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <SectionTitle ordinal="01">おすすめ設定</SectionTitle>
            {/*
              おすすめも3枚になったので「下の3つの設定」だとどちらの3つか紛らわしい。
              数を言わずに「個別の設定」と呼ぶ。02のセクション名とも揃う。
            */}
            <p id="recommended-setups-hint" className="font-sans text-xs text-text-tertiary">
              選ぶと個別の設定がまとめて切り替わります。あとから変更できます。
            </p>
          </div>
          {/*
            3枚になったので sm では横に並べない。smのコンテナは448pxしかなく、
            3列にすると1枚126pxまで縮んでチップが1つずつ折り返す。
            横並びはコンテナが768pxになる lg 以上だけにする。
          */}
          <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-3 lg:gap-3">
            {RECOMMENDED_SETUPS.map((recommended) => {
              const isActive = isSameSetup(setup, recommended.setup)
              const isDanger = recommended.tone === 'danger'
              const idleClass = isDanger ? RECOMMENDED_BUTTON_IDLE_DANGER : RECOMMENDED_BUTTON_IDLE
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
                  className={`${RECOMMENDED_BUTTON_BASE} ${isActive ? RECOMMENDED_BUTTON_ACTIVE : idleClass}`}
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
                  <span className="flex flex-wrap gap-1.5">
                    {setupChips(recommended.setup).map((chip) => (
                      <span
                        key={chip}
                        className={`rounded-chip border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          isDanger
                            ? 'border-danger/45 text-danger'
                            : 'border-border-emphasis text-text-secondary'
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
          <p role="status" className="sr-only">
            {appliedTitle ? `${appliedTitle}の設定を反映しました` : ''}
          </p>
        </section>

        {/*
          セクション内の間隔を、親が子の間に空ける間隔より詰めることで、3つの設定が
          1つのまとまりとして読めるようにしている。同じ間隔だと、上のおすすめ設定と
          並列に並んだ4つ目・5つ目の項目に見えてしまう。
        */}
        <section className="flex flex-col gap-5 border-t border-border-default pt-5">
          <SectionTitle ordinal="02">個別に設定する</SectionTitle>

          {/*
            lg以上は3つの設定を横並びにする。選択肢が2〜3個しかないので、コンテナを
            広げるだけでは1つの選択肢が横に伸びるだけになる（幅の使い道が「2」の一文字に
            なってしまう）。縦積みを横並びに変えることで幅を使う。
          */}
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-6">
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
        </section>
      </div>

      {/* lg以上は幅いっぱいに伸ばさない。768px幅の主ボタンは画面の中で重すぎる */}
      <button
        type="button"
        onClick={() => navigate('/battle', { state: { preset: setup }, replace: true })}
        className="mx-6 mb-6 mt-6 flex h-13 flex-none touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page lg:mx-auto lg:w-80"
      >
        対戦を始める
      </button>
    </main>
  )
}

/**
 * h1（24px）と legend（11px）の間に挟むセクション見出し。
 * この段がないと「おすすめ設定」と legend が同じ強さになり、おすすめ設定が
 * 下の3項目と並列の設定項目に見えてしまう。
 * 16pxなのは、配下にあるおすすめカードのタイトル（14px bold）より一段上に置くため。
 * 他画面の SectionHeading（18px＋accentの縦バー）は使わない。この画面はh1が24pxと
 * スケールが小さく、かつ accent が「選択中」を表しているため、装飾で使うと意味が重なる。
 * 代わりに序数でリズムを作る。番号は tertiary のmonoで、accentは使わない。
 * 「まずおすすめを選び、次に個別に詰める」というこの画面の流れとも一致する。
 */
function SectionTitle({ ordinal, children }: { ordinal: string; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-2.5 font-sans text-base font-bold text-text-primary">
      {/*
        序数は aria-hidden。読み上げに「01」は不要で、見出しの名前も
        「おすすめ設定」のままにしておきたい（番号が混ざると見出しで引きにくくなる）。
      */}
      <span
        aria-hidden
        className="font-mono text-[11px] font-bold tracking-[0.14em] text-text-tertiary"
      >
        {ordinal}
      </span>
      {children}
    </h2>
  )
}

/**
 * 設定1項目。Tier 1のカードで囲って、3つが独立した項目として立つようにする。
 * 枠がないと、見出しと選択肢が地の上に直に並んで画面が平坦に見える。
 */
function SettingGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-card border border-border-default bg-bg-card p-4 shadow-card">
      <legend className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
        {legend}
      </legend>
      <div className="flex gap-2.5">{children}</div>
    </fieldset>
  )
}
