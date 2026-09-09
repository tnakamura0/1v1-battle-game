import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ActionIcon } from '@/components/ActionIcon'
import { SectionHeading } from '@/components/SectionHeading'
import type { Action } from '@/game/types'

const TURN_STEPS = [
  '3つの行動から1つを選ぶ',
  '行動が公開され、組み合わせに応じて勝敗が決まる',
  '次のターンに進む',
]

const ACTION_META: Record<Action, { name: string; color: string; description: string }> = {
  charge: {
    name: 'チャージ',
    color: 'text-charge',
    description: '自分のエネルギーを+1する（最大5）。',
  },
  attack: {
    name: '攻撃',
    color: 'text-attack',
    description: 'エネルギーを1消費して相手を攻撃する。自分のエネルギーが0のときは選択できない。',
  },
  guard: {
    name: 'ガード',
    color: 'text-guard',
    description:
      '相手の攻撃を防ぐ。相手のエネルギーが0のときは選択できない。ガードに成功すると自分のエネルギーが1増える。使用後は設定したターン数の間、再使用できない。',
  },
}

/** 行動カードの並び順と、組み合わせ表の行・列の並び順を兼ねる */
const ACTION_ORDER: Action[] = ['charge', 'attack', 'guard']

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 p-6">
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

      <Section title="3つの行動">
        <div className="grid gap-3 sm:grid-cols-3">
          {ACTION_ORDER.map((action) => {
            const { name, color, description } = ACTION_META[action]
            return (
              <div
                key={action}
                className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-4 shadow-card"
              >
                <span className={color}>
                  <ActionIcon action={action} size={28} />
                </span>
                <span className={`font-sans text-base font-extrabold ${color}`}>{name}</span>
                <p className="font-sans text-xs leading-relaxed text-text-secondary">
                  {description}
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

      <Section title="行動の組み合わせ">
        <p className="-mt-1 font-sans text-sm font-semibold leading-relaxed text-text-primary">
          ダメージが発生するのは、片方が攻撃・もう片方がチャージのときだけです。
        </p>
        <p className="font-sans text-xs text-text-tertiary">
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

        <p className="font-mono text-[11px] text-text-tertiary">
          — ＝ ダメージなし（数字は減るHPの量）
        </p>
      </Section>

      <Section title="ガードのクールダウン">
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          ガード使用後は、対戦開始時に選んだターン数が経過するまで再使用できません。
        </p>
      </Section>

      <div className="mb-10 flex flex-col gap-3 sm:flex-row">
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
  const { name, color } = ACTION_META[action]
  return (
    <span className={`flex flex-col items-center gap-1 ${color}`}>
      <ActionIcon action={action} size={20} />
      <span className="font-sans text-[11px] font-bold sm:text-sm">{name}</span>
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
            ? 'text-[11px] font-bold text-attack sm:text-sm'
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={title} />
      {children}
    </section>
  )
}
