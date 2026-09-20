import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { ctaClass } from '@/components/ctaStyle'
import { CPU_DIFFICULTY_LABEL, setupChips } from '@/game/copy'
import {
  CPU_DIFFICULTY_OPTIONS,
  DEFAULT_SETUP,
  GUARD_COOLDOWN_OPTIONS,
  INITIAL_HP_OPTIONS,
  matchRecommendedSetup,
  RECOMMENDED_SETUPS,
} from '@/game/presets'
import type { BattleSetup } from '@/game/types'
import { SegmentedOption } from '@/pages/PresetSelect/SegmentedOption'

const RECOMMENDED_BUTTON_BASE =
  'flex flex-1 touch-manipulation flex-col gap-2 rounded-card border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page'
/*
 * カードの枠線と面が表すのは「選択中かどうか」だけで、tone では変えない。
 * 3枚が取りうるのはこの2つの定数のどちらかだけなので、どれが選ばれているかが
 * 一目で分かる。サドンデスの danger は文字とチップが担う（上の tone のコメントを参照）。
 */
// 選択中。ActionButton は選択中にホバーを持たないが、ここでは持たせる。3枚並ぶので
// 選択中の1枚だけ無反応だと押せない要素に見えてしまうため。平常時が既に accent なので
// 薄くする方向は使えず、accent-hover（明るい側）へ動かす。
// 面は持ち上げない。既に上がっており、さらに明るい面のトークンがない。
const RECOMMENDED_BUTTON_ACTIVE = 'border-accent bg-bg-surface-active hover:border-accent-hover'
// 未選択。ホバーの accent/60 は ActionButton と同じ（components/ActionButton.tsx を参照）。
// 平常時の accent が「選んである」ことを表すので、ホバーはそれより薄くして「選べる」に留める。
const RECOMMENDED_BUTTON_IDLE =
  'border-border-default bg-bg-card hover:border-accent/60 hover:bg-bg-surface'

/*
 * 設定値のチップ。おすすめカードと、折りたたんだ個別設定の summary の両方で使う。
 * 2箇所で同じ見た目になっていることを、定数の共有そのもので担保する。
 */
const CHIP_BASE = 'rounded-chip border px-1.5 py-0.5 font-mono text-chip font-semibold'
const CHIP_NEUTRAL = 'border-border-emphasis text-text-secondary'
const CHIP_DANGER = 'border-danger/45 text-danger-light'

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

  // 一致するおすすめは高々1枚なので、カードごとに判定せず一度だけ引く。
  // どれとも一致しなければ undefined で、3枚とも未選択になる。
  const activeKey = matchRecommendedSetup(setup)?.key

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
            <span className="font-mono text-meta font-bold tracking-[0.18em] text-accent">
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
                const isActive = activeKey === recommended.key
                const isDanger = recommended.tone === 'danger'
                /*
                 * 分岐するのは色だけ。danger のタイトルは選択中かどうかで変えない。
                 * 他の2枚は secondary → primary と明るくなって選択中を補強するが、
                 * ここでは性格を表し続けることを優先する（状態は枠線と面が表す）。
                 * danger そのものではなく danger-light なのは、乗りうる3つの面すべてで
                 * AAを満たすため（index.css の --color-danger-light の定義に3値とも記載）。
                 */
                const titleColorClass = isDanger
                  ? 'text-danger-light'
                  : isActive
                    ? 'text-text-primary'
                    : 'text-text-secondary'
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
                    <span className={`font-sans text-sm font-bold ${titleColorClass}`}>
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
                          className={`${CHIP_BASE} ${isDanger ? CHIP_DANGER : CHIP_NEUTRAL}`}
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
            個別設定は初期状態で閉じる（Issue #129）。「任意」バッジと
            「おすすめのままでも始められます。」で言葉の上では任意だと伝えていたが、
            展開したままだと画面の半分以上を占め、初見では「設定しないと始められない画面」に
            見えていた。閉じることで初見の画面が「見出し＋おすすめ3枚＋対戦を始める」になる。

            コントロールドな button + aria-expanded ではなくネイティブの details を使う。
            この画面は SegmentedOption が素のradio、設定のまとまりが fieldset/legend と、
            一貫してプラットフォームに任せている。キーボード操作（Enter/Space）と
            支援技術への開閉状態の露出が無償で手に入る。

            なお details は jsdom では閉じていても子がアクセシビリティツリーから消えない。
            テスト側で getByRole('radio') が閉じたまま引けるのはそのためで、
            折りたたみ自体は open 属性を見るテストで別に固定している。
          */}
          <details className="group border-t border-border-default pt-5">
            {/*
              cursor-pointer はここには書かない。index.css の @layer base が
              summary にも一律で当てている（同ファイルのコメントが「summary を使い始めたら
              ここを見直すこと」と名指ししていた箇所で、この Issue で足した）。
            */}
            <summary className="flex list-none flex-col gap-1 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page [&::-webkit-details-marker]:hidden">
              <SectionTitle badge="任意" trailing={<Chevron />}>
                個別に調整する
              </SectionTitle>
              {/*
                閉じているときだけ出す2つ。開けば設定そのものが下に見えるので、
                「おすすめのままでも始められます」も現在値のチップも用が済む。
                出しっぱなしにすると、開いた状態で同じ値が二重に並んで再び密になる。

                p ではなく span なのは、summary の内容モデルが phrasing content と
                heading content に限られるため（div や p は置けない）。
              */}
              <span className="block font-sans text-xs text-text-tertiary group-open:hidden">
                おすすめのままでも始められます。
              </span>
              {/*
                閉じた状態で現在値を示す唯一の手がかり。個別に変更するとおすすめ3枚は
                すべて aria-pressed=false になるので、これがないと今の設定が画面から消える。
                読み上げでは summary の名前の一部になるため、何の値なのかを sr-only で添える。

                その結果、閉じている間だけ summary の名前が
                「個別に調整する 任意 おすすめのままでも始められます。 現在の設定: HP2 …」と長くなる。
                開けば group-open:hidden で「個別に調整する 任意」まで縮むので、
                長い名前が出るのは中身が見えていないときだけ、という対応になっている。
                （Chromium の AXツリーで実測。h2 は summary の中でも heading ノードとして
                残るので、見出しナビゲーションからも従来どおり辿れる）
              */}
              <span className="flex flex-wrap items-center gap-1.5 pt-0.5 group-open:hidden">
                <span className="sr-only">現在の設定:</span>
                {setupChips(setup).map((chip) => (
                  <span key={chip} className={`${CHIP_BASE} ${CHIP_NEUTRAL}`}>
                    {chip}
                  </span>
                ))}
              </span>
            </summary>

            {/*
              lg以上は3つの設定を横並びにする。選択肢が2〜3個しかないので、コンテナを
              広げるだけでは1つの選択肢が横に伸びるだけになる（幅の使い道が「2」の一文字に
              なってしまう）。縦積みを横並びに変えることで幅を使う。

              均等な3列ではなく4列にして、ガードだけ2列分を取る。必要な幅は選択肢の
              文字数で大きく違い（HPは1文字、ガードは「1ターン」で4文字）、均等だと
              HPには余ってガードには足りないため。合計幅は変えず配分だけ中身に合わせる。

              summary との間の mt-5 は、親が子の間に空ける間隔（gap-8）より詰めてある。
              3つの設定が「個別に調整する」配下の1つのまとまりとして読めるようにするため。
              同じ間隔だと、上のおすすめ設定と並列に並んだ項目に見えてしまう。
            */}
            <div className="mt-5 flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
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
          </details>
        </div>
      </div>

      {/* lg以上は幅いっぱいに伸ばさない。768px幅の主ボタンは画面の中で重すぎる */}
      <button
        type="button"
        onClick={() => navigate('/battle', { state: { preset: setup }, replace: true })}
        className={`${ctaClass('primary', 'fill')} mx-6 mb-6 mt-6 flex-none lg:mx-auto lg:w-80`}
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
 *
 * trailing は行の右端に寄せる装飾のスロット。個別設定の開閉シェブロンだけが使う。
 * シェブロンを summary の直下に置けないのでここで受けている（summary の内容モデルは
 * phrasing content と heading content だけで、左右に分ける div を挟めない）。
 */
function SectionTitle({
  badge,
  trailing,
  children,
}: {
  badge?: string
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <h2 className="flex items-baseline gap-2.5 font-sans text-base font-bold text-text-primary">
      {children}
      {/*
        序数と違い aria-hidden にしない。「任意」は読み上げても意味のある情報で、
        見出しのアクセシブルネーム（「個別に調整する 任意」）に含まれてよい。
        配色に accent を使わないのは、この画面では accent が「選択中」を表すため。
      */}
      {badge && (
        <span className="rounded-chip border border-border-emphasis px-1.5 py-0.5 font-mono text-chip font-semibold text-text-secondary">
          {badge}
        </span>
      )}
      {trailing && <span className="ml-auto self-center">{trailing}</span>}
    </h2>
  )
}

/**
 * 個別設定の開閉を示すシェブロン。閉じているとき下向き、開くと反転して上を向く。
 *
 * aria-hidden にしているのは、開閉状態を支援技術に伝えるのは details 自身の役目で、
 * ここで重ねて言うと同じことを二度読み上げることになるため。
 * 既定の三角マーカーは summary 側で消している（list-none と ::-webkit-details-marker）。
 * シェブロンだけが当たり判定に見えないよう、summary 全体をクリック領域にしている。
 */
function Chevron() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-text-tertiary transition-transform group-open:rotate-180"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
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
      <legend className="font-mono text-meta font-semibold tracking-[0.06em] text-text-secondary">
        {legend}
      </legend>
      <div className="flex gap-2.5">{children}</div>
    </fieldset>
  )
}
