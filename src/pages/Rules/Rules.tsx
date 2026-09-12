import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ACTION_ORDER, ACTION_STYLE } from '@/components/actionStyle'
import { ActionIcon } from '@/components/ActionIcon'
import { SectionHeading } from '@/components/SectionHeading'
import { ACTION_LABEL } from '@/game/copy'
import type { Action } from '@/game/types'

const TURN_STEPS = [
  '3つの行動から1つを選ぶ',
  '行動が公開され、組み合わせに応じて勝敗が決まる',
  '次のターンに進む',
]

/** この画面でだけ出す行動の説明。名前は ACTION_LABEL、色は ACTION_STYLE を使う */
const ACTION_DESCRIPTION: Record<Action, string> = {
  charge: '自分のエネルギーを+1する（最大5）。',
  attack: 'エネルギーを1消費して相手を攻撃する。自分のエネルギーが0のときは選択できない。',
  guard:
    '相手の攻撃を防ぐ。相手のエネルギーが0のときは選択できない。ガードに成功すると自分のエネルギーが1増える。使用後は設定したターン数の間、再使用できない。',
}

interface MatchupCell {
  /** そのターンにHPが減る側。表の主となる情報 */
  damage: 'none' | 'self' | 'opponent'
  /** 相打ち・ガード成功といった補足。ダメージの結果には影響しない */
  note?: string
}

/**
 * 組み合わせごとの結果。外側のキーが自分の行動、内側のキーが相手の行動を表す。
 * 非対称なので、charge×attack（自分がチャージ・相手が攻撃）と attack×charge を取り違えないこと。
 */
const MATCHUP: Record<Action, Record<Action, MatchupCell>> = {
  charge: {
    charge: { damage: 'none' },
    attack: { damage: 'self' },
    guard: { damage: 'none' },
  },
  attack: {
    charge: { damage: 'opponent' },
    attack: { damage: 'none', note: '相打ち' },
    guard: { damage: 'none', note: 'ガードされる' },
  },
  guard: {
    charge: { damage: 'none' },
    attack: { damage: 'none', note: 'ガード成功' },
    guard: { damage: 'none' },
  },
}

/**
 * `text` は表の中に出す短い表記、`readAs` はスクリーンリーダー向けの読み上げ。
 * 「—」は音声だと意味をなさず、凡例（表の外・表より後ろ）もセルを辿る途中では届かないため、
 * セルごとに読み上げ用の文言を持たせている。
 */
const DAMAGE_LABEL: Record<MatchupCell['damage'], { text: string; readAs: string }> = {
  none: { text: '—', readAs: 'ダメージなし' },
  self: { text: '自分に1', readAs: '自分に1ダメージ' },
  opponent: { text: '相手に1', readAs: '相手に1ダメージ' },
}

const CELL_CLASS = 'border-border-default px-1 py-2 sm:px-3 sm:py-3'

/*
 * 表の外周は table の rounded-card + border が描き、内側の罫線は各セルの border-b / border-r が描く。
 * overflow-hidden で角を落とす手もあるが、それだと table 直下の caption まで一緒に切り取られて
 * 先頭の文字が欠けるため、角丸は四隅のセルに直接当てている。
 * 外周と重ならないよう、最終行・最終列のセルでは border-b / border-r を外す。
 */
const isLastRow = (row: number) => row === ACTION_ORDER.length - 1
const isLastColumn = (column: number) => column === ACTION_ORDER.length - 1

export function Rules() {
  return (
    /*
      lg以上では外枠を広げるが、説明文は Section の既定値（prose）で672pxに留める。
      日本語の説明文は1行が長くなるほど次の行頭に視線が戻りにくくなるので、
      幅を使ってよいのはカードと表だけ。
    */
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 p-6 lg:max-w-4xl">
      <Link
        to="/"
        className="w-fit font-mono text-xs font-semibold text-text-tertiary hover:text-accent-hover"
      >
        ← トップへ戻る
      </Link>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent">
          HOW TO PLAY
        </span>
        <h1 className="font-sans text-3xl font-extrabold text-text-primary sm:text-4xl">
          ルール / 遊び方
        </h1>
      </div>

      <Section title="ゲームの目的">
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          1対1でCPUと対戦し、相手のHPを0にすれば勝利です。
        </p>
      </Section>

      <Section title="1ターンの流れ">
        <ol className="flex flex-col gap-2">
          {TURN_STEPS.map((step, index) => (
            <li key={step} className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] font-bold text-accent">STEP{index + 1}</span>
              <span className="font-sans text-sm text-text-secondary">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="3つの行動" width="wide">
        <div className="grid gap-3 sm:grid-cols-3">
          {ACTION_ORDER.map((action) => {
            const { textClass } = ACTION_STYLE[action]
            return (
              <div
                key={action}
                className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-4 shadow-card"
              >
                <span className={textClass}>
                  <ActionIcon action={action} size={28} />
                </span>
                <span className={`font-sans text-base font-extrabold ${textClass}`}>
                  {ACTION_LABEL[action]}
                </span>
                <p className="font-sans text-xs leading-relaxed text-text-secondary">
                  {ACTION_DESCRIPTION[action]}
                </p>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="エネルギー">
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          初期値は0、最大値は5です。チャージで+1、攻撃で-1、ガードに成功すると+1されます。
        </p>
      </Section>

      {/* 表だけは幅を使いたいが、前後の文章は本文なので個別に prose 幅に留める */}
      <Section title="行動の組み合わせ" width="wide">
        <p className="-mt-1 max-w-2xl font-sans text-sm font-semibold leading-relaxed text-text-primary">
          ダメージが発生するのは、片方が攻撃・もう片方がチャージのときだけです。
        </p>
        <p className="max-w-2xl font-sans text-xs text-text-tertiary">
          組み合わせによって発生するダメージの一覧です。エネルギーやガードの状態変化は含みません。
        </p>

        {/*
          9通りのうちダメージが出るのは2通りだけなので、セルは結果（—／自分に1／相手に1）を主とし、
          相打ち・ガード成功といったニュアンスは注記に落とす。この短さのおかげでモバイル幅でも
          横スクロールなしに4列が収まり、表を1つに統合できている。
        */}
        <table className="w-full table-fixed border-separate border-spacing-0 rounded-card border border-border-default text-center font-sans">
          <caption className="mb-2 text-left font-mono text-[11px] text-text-tertiary">
            行＝自分の行動 / 列＝相手の行動
          </caption>
          <thead>
            <tr>
              <th className={`w-[22%] rounded-tl-card bg-bg-row ${CELL_CLASS} border-b border-r`}>
                <span className="sr-only">自分の行動</span>
              </th>
              {ACTION_ORDER.map((action, column) => (
                <th
                  key={action}
                  scope="col"
                  className={`bg-bg-row ${CELL_CLASS} border-b ${
                    isLastColumn(column) ? 'rounded-tr-card' : 'border-r'
                  }`}
                >
                  <ActionHeading action={action} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTION_ORDER.map((own, row) => (
              <tr key={own}>
                <th
                  scope="row"
                  className={`bg-bg-row ${CELL_CLASS} border-r ${
                    isLastRow(row) ? 'rounded-bl-card' : 'border-b'
                  }`}
                >
                  <ActionHeading action={own} />
                </th>
                {ACTION_ORDER.map((against, column) => (
                  <td
                    key={against}
                    className={`${CELL_CLASS} ${isLastRow(row) ? '' : 'border-b'} ${
                      isLastColumn(column) ? '' : 'border-r'
                    } ${isLastRow(row) && isLastColumn(column) ? 'rounded-br-card' : ''}`}
                  >
                    <MatchupOutcome cell={MATCHUP[own][against]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="max-w-2xl font-mono text-[11px] text-text-tertiary">
          — ＝ ダメージなし（数字は減るHPの量）
        </p>
      </Section>

      <Section title="ガードのクールダウン">
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          ガード使用後は、対戦開始時に選んだターン数が経過するまで再使用できません。
        </p>
      </Section>

      {/* 本文と同じ幅に留める。896px幅に2つ並ぶと1つあたりが440px近くになって間延びする */}
      <div className="mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Link
          to="/preset"
          className="flex h-14 w-full flex-none touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-base font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page sm:h-13 sm:w-auto sm:flex-1 sm:text-sm"
        >
          対戦を始める
        </Link>
        <Link
          to="/"
          className="flex h-14 w-full flex-none touch-manipulation items-center justify-center rounded-xl border border-border-emphasis font-sans text-base font-bold text-text-secondary transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page sm:h-13 sm:w-auto sm:flex-1 sm:text-sm"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  )
}

/** 表の行・列の見出し。アイコンと名前を縦に積んで、狭い幅でも行動を見分けられるようにする */
function ActionHeading({ action }: { action: Action }) {
  return (
    <span className={`flex flex-col items-center gap-1 ${ACTION_STYLE[action].textClass}`}>
      <ActionIcon action={action} size={20} />
      <span className="font-sans text-[11px] font-bold sm:text-sm">{ACTION_LABEL[action]}</span>
    </span>
  )
}

function MatchupOutcome({ cell }: { cell: MatchupCell }) {
  const { text, readAs } = DAMAGE_LABEL[cell.damage]
  const damaged = cell.damage !== 'none'
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span
        aria-hidden
        className={
          damaged
            ? 'text-[11px] font-bold text-damage sm:text-sm'
            : 'text-[11px] text-text-tertiary sm:text-sm'
        }
      >
        {text}
      </span>
      <span className="sr-only">{readAs}</span>
      {cell.note && (
        <span className="text-[10px] text-text-tertiary sm:text-[11px]">{cell.note}</span>
      )}
    </span>
  )
}

interface SectionProps {
  title: string
  /**
   * prose = 本文として読ませる幅（672px）に収める。この画面はほとんどが説明文なので既定値。
   * wide  = 親の幅いっぱいまで使う。カードや表など、横に広いほうが見やすいもの用。
   *
   * 「広い/狭い」ではなく「中身が何か」で名前を付けている。適切な幅はブレークポイントに
   * よって変わる（lg未満では親が672pxなので両者は同じ幅になる）ため、見た目の値で
   * 持たせると値のほうが先に嘘になる。既定値を多数派の prose にしてあるのは、
   * 指定を忘れたセクションが正しい側に倒れるようにするため（SectionIntro の align と同じ考え）。
   */
  width?: 'prose' | 'wide'
  children: ReactNode
}

function Section({ title, width = 'prose', children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={title} />
      <div className={`flex flex-col gap-3 ${width === 'prose' ? 'max-w-2xl' : ''}`}>
        {children}
      </div>
    </section>
  )
}
