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
   * 乗せるのは**タイトルの文字とチップだけ**で、カードの枠線と面には乗せない。
   *
   * 枠線に乗せないのは、枠線が「選択中」を表すチャンネルだから。かつては未選択時だけ
   * 枠線を danger にしていたが、選択すると accent に変わるため、1本の枠線が
   * 「モードの性格」と「選択されている状態」のあいだで意味を乗り換えていた。
   * 選んだ瞬間にいちばん強い手がかりが消えるうえ、1つのチャンネルに2つの意味を
   * 同じ場所で載せないという既定方針（index.css 冒頭を参照）にも反する。
   * 文字とチップは状態で変化しないので、選んでも性格が消えない。
   *
   * 面を塗らないのは、3枚のうち1枚だけ光ると accent が表す「選択中」と
   * 紛らわしくなるため。
   */
  tone?: 'danger'
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
  'flex flex-1 cursor-pointer touch-manipulation flex-col gap-2 rounded-card border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
/*
 * 未選択のホバーは ActionButton と同じ accent/60（components/ActionButton.tsx を参照）。
 * 平常時の accent が「選んである」ことを表すので、ホバーはそれより薄くして
 * 「選べる」に留める。
 * ActionButton は選択中にホバーを持たないが、ここでは持たせる。おすすめは3枚が並ぶので、
 * 選択中の1枚だけ無反応だと押せない要素に見えてしまうため。選択中は平常時が既に accent
 * なので、薄くする方向は使えず accent-hover（明るい側）へ動かす。
 * 面の持ち上げは未選択にだけ入れる。選択中は既に面が上がっており、
 * さらに明るい面のトークンがない。
 */
/*
 * カードの枠線と面は「選択中かどうか」だけを表す。tone では変えない。
 * 3枚とも同じ2状態しか取らないので、どれが選ばれているかが一目で分かる。
 * サドンデスの danger は文字とチップが担う（上の tone のコメントを参照）。
 */
const RECOMMENDED_BUTTON_ACTIVE = 'border-accent bg-bg-surface-active hover:border-accent-hover'
const RECOMMENDED_BUTTON_IDLE =
  'border-border-default bg-bg-card hover:border-accent/60 hover:bg-bg-surface'

/**
 * 設定値を3つのチップに分ける。1本の文字列（`HP2 ／ ガード3ターン ／ CPUふつう`）だと
 * カードが3枚並んだときに幅が足りず、区切り文字の途中で折り返して読みにくくなる。
 * チップ単位なら折り返しても意味の切れ目で折れる。
 *
 * 「ターン」を「T」に略さず、「つよい」に CPU を付けたままにしているのは、
 * チップがボタンのアクセシブルネームの一部として読み上げられるため。
 * 「サドンデス 一撃で決着 HP1 ガード1T つよい」では何がつよいのか分からない。
 */
function setupChips(setup: BattleSetup): string[] {
  return [
    `HP${setup.initialHp}`,
    `ガード${setup.guardCooldownTurns}ターン`,
    `CPU${CPU_DIFFICULTY_LABEL[setup.cpuDifficulty]}`,
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

        {/*
          lg以上では画面が高く、中身が上に詰まって「対戦を始める」ボタンとの間だけが
          大きく空く。本体をここで上下中央に寄せて均す。「戻る」リンクだけは
          この外に置いて上端に残す（一緒に動くと画面の真ん中に戻るリンクが出る）。

          justify-center ではなく my-auto を使う。flexの auto マージンは余りがある
          ときだけ空間を吸い、あふれたときは 0 に解決されるので、justify-center の
          既知の不具合（中身が画面より高いと上端がスクロールで戻れなくなる）が起きない。
        */}
        <div className="flex flex-col gap-8 lg:my-auto">
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
            <h1 className="font-sans text-2xl font-extrabold text-text-primary">
              対戦ルールを選ぶ
            </h1>
            <p className="font-sans text-sm text-text-secondary">
              初期HP・ガードのクールダウン・CPUの強さを設定してください。
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <SectionTitle>おすすめ設定</SectionTitle>
              {/*
                おすすめも3枚になったので「下の3つの設定」だとどちらの3つか紛らわしい。
                数を言わずに「個別の設定」と呼ぶ。
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
                    {/*
                      danger のタイトルは選択中かどうかで変えない。他の2枚は
                      secondary → primary と明るくなって選択中を補強するが、
                      ここでは性格を表し続けることを優先する（状態は枠線と面が表す）。
                      danger そのものではなく danger-light なのは、乗りうる3つの面
                      すべてでAAを満たすため（index.css の定義を参照）。
                    */}
                    <span
                      className={
                        isDanger
                          ? 'font-sans text-sm font-bold text-danger-light'
                          : isActive
                            ? 'font-sans text-sm font-bold text-text-primary'
                            : 'font-sans text-sm font-bold text-text-secondary'
                      }
                    >
                      {recommended.title}
                    </span>
                    <span className="font-sans text-xs text-text-tertiary">
                      {recommended.description}
                    </span>
                    {/*
                      チップは選択中もdangerのまま。dangerが表すのは「このモードの性格」で、
                      枠線のaccentが表す「選択中」とは別の軸なので、選択しても消さない。
                      文字が danger-light なのは、danger そのものだと10pxの文字には
                      コントラストが足りないため（index.css の定義を参照）。
                    */}
                    <span className="flex flex-wrap gap-1.5">
                      {setupChips(recommended.setup).map((chip) => (
                        <span
                          key={chip}
                          className={`rounded-chip border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                            isDanger
                              ? 'border-danger/45 text-danger-light'
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
            <div className="flex flex-col gap-1">
              <SectionTitle badge="任意">個別に調整する</SectionTitle>
              <p className="font-sans text-xs text-text-tertiary">
                おすすめのままでも始められます。
              </p>
            </div>

            {/*
              lg以上は3つの設定を横並びにする。選択肢が2〜3個しかないので、コンテナを
              広げるだけでは1つの選択肢が横に伸びるだけになる（幅の使い道が「2」の一文字に
              なってしまう）。縦積みを横並びに変えることで幅を使う。

              均等な3列ではなく4列にして、ガードだけ2列分を取る。必要な幅は選択肢の
              文字数で大きく違い（HPは1文字、ガードは「1ターン」で4文字）、均等だと
              HPには余ってガードには足りないため。合計幅は変えず配分だけ中身に合わせる。
            */}
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
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

              <SettingGroup legend="ガード再使用クールダウン" wide>
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
      </div>

      {/* lg以上は幅いっぱいに伸ばさない。768px幅の主ボタンは画面の中で重すぎる */}
      <button
        type="button"
        onClick={() => navigate('/battle', { state: { preset: setup }, replace: true })}
        className="mx-6 mb-6 mt-6 flex h-13 flex-none cursor-pointer touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page lg:mx-auto lg:w-80"
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
 *
 * かつては「01」「02」の序数を添えていたが、順番に進まなければならない操作に見えた。
 * 実際にはおすすめを選んだだけで始める人が多く、個別の調整は必須の次の手順ではない。
 * 序数をやめ、任意であることは badge で直接伝える。
 */
function SectionTitle({ badge, children }: { badge?: string; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-2.5 font-sans text-base font-bold text-text-primary">
      {children}
      {/*
        序数と違い aria-hidden にしない。「任意」は読み上げても意味のある情報で、
        見出しのアクセシブルネーム（「個別に調整する 任意」）に含まれてよい。
        配色に accent を使わないのは、この画面では accent が「選択中」を表すため。
      */}
      {badge && (
        <span className="rounded-chip border border-border-emphasis px-1.5 py-0.5 font-mono text-[10px] font-semibold text-text-secondary">
          {badge}
        </span>
      )}
    </h2>
  )
}

/**
 * 設定1項目。Tier 1のカードで囲って、3つが独立した項目として立つようにする。
 * 枠がないと、見出しと選択肢が地の上に直に並んで画面が平坦に見える。
 *
 * wide は lg以上で2列分を占める指定。ガード再使用クールダウンにだけ渡している。
 * 選択肢が「1ターン」と4文字あり、均等な列幅では各ボタンが57pxまで縮んで窮屈になる。
 * 「1T」と略せば均等幅でも収まるが、ラジオのラベルはそのままアクセシブルネームになるので
 * 略さない。おすすめカードのチップで同じ判断をしている（setupChips のコメントを参照）。
 */
function SettingGroup({
  legend,
  wide = false,
  children,
}: {
  legend: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <fieldset
      className={`flex flex-col gap-3 rounded-card border border-border-default bg-bg-card p-4 shadow-card ${wide ? 'lg:col-span-2' : ''}`}
    >
      <legend className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
        {legend}
      </legend>
      <div className="flex gap-2.5">{children}</div>
    </fieldset>
  )
}
