import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ActionIcon } from '@/components/ActionIcon'
import type { Action } from '@/game/types'

const TURN_STEPS = [
  '3つの行動から1つを選ぶ（時間制限なし）',
  '選んだ行動がお互いに公開される',
  '行動の組み合わせで勝敗が決まる',
  '結果を確認する',
  '次のターンに進む',
]

const ACTIONS: Array<{ key: Action; name: string; color: string; description: string }> = [
  {
    key: 'charge',
    name: 'チャージ',
    color: 'text-charge',
    description: '自分のエネルギーを+1する（最大5）。',
  },
  {
    key: 'attack',
    name: '攻撃',
    color: 'text-attack',
    description: 'エネルギーを1消費して相手を攻撃する。自分のエネルギーが0のときは選択できない。',
  },
  {
    key: 'guard',
    name: 'ガード',
    color: 'text-guard',
    description:
      '相手の攻撃を防ぐ。相手のエネルギーが0のときは選択できない。使用後は設定したターン数の間、再使用できない。',
  },
]

interface MatchupCell {
  text: string
  emphasis?: boolean
}

const MATCHUP_ROWS: Array<{
  own: string
  color: string
  vsCharge: MatchupCell
  vsAttack: MatchupCell
  vsGuard: MatchupCell
}> = [
  {
    own: 'チャージ',
    color: 'text-charge',
    vsCharge: { text: '変化なし' },
    vsAttack: { text: '自分に1ダメージ', emphasis: true },
    vsGuard: { text: '変化なし' },
  },
  {
    own: '攻撃',
    color: 'text-attack',
    vsCharge: { text: '相手に1ダメージ', emphasis: true },
    vsAttack: { text: '相打ち・ダメージなし' },
    vsGuard: { text: 'ガードされる・ダメージなし' },
  },
  {
    own: 'ガード',
    color: 'text-guard',
    vsCharge: { text: '変化なし' },
    vsAttack: { text: 'ガード成功・ダメージなし' },
    vsGuard: { text: '変化なし' },
  },
]

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
        <p className="max-w-md font-sans text-sm leading-relaxed text-text-secondary">
          相手を読み、駆け引きを制する。対戦前に基本ルールを確認しましょう。
        </p>
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
          {ACTIONS.map((action) => (
            <div
              key={action.name}
              className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-4 shadow-card"
            >
              <span className={action.color}>
                <ActionIcon action={action.key} size={28} />
              </span>
              <span className={`font-sans text-base font-extrabold ${action.color}`}>
                {action.name}
              </span>
              <p className="font-sans text-xs leading-relaxed text-text-secondary">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="エネルギー">
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          初期値は0、最大値は5です。チャージで+1、攻撃で-1されます。
        </p>
      </Section>

      <Section title="行動の組み合わせ">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-card border border-border-default text-left font-sans text-sm">
            <thead>
              <tr>
                <th className="border-b border-r border-border-default bg-bg-row p-3 font-mono text-[11px] font-semibold text-text-tertiary">
                  自分＼相手
                </th>
                <th className="border-b border-r border-border-default bg-bg-row p-3 text-charge">
                  チャージ
                </th>
                <th className="border-b border-r border-border-default bg-bg-row p-3 text-attack">
                  攻撃
                </th>
                <th className="border-b border-border-default bg-bg-row p-3 text-guard">ガード</th>
              </tr>
            </thead>
            <tbody>
              {MATCHUP_ROWS.map((row) => (
                <tr key={row.own}>
                  <th
                    className={`border-b border-r border-border-default bg-bg-row p-3 font-semibold ${row.color}`}
                  >
                    {row.own}
                  </th>
                  <td className="border-b border-r border-border-default p-3 text-text-secondary">
                    <MatchupOutcome cell={row.vsCharge} />
                  </td>
                  <td className="border-b border-r border-border-default p-3 text-text-secondary">
                    <MatchupOutcome cell={row.vsAttack} />
                  </td>
                  <td className="border-b border-border-default p-3 text-text-secondary">
                    <MatchupOutcome cell={row.vsGuard} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 sm:hidden">
          {MATCHUP_ROWS.map((row) => (
            <div
              key={row.own}
              className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-4 shadow-card"
            >
              <span className={`font-sans text-sm font-bold ${row.color}`}>自分：{row.own}</span>
              <ul className="flex flex-col gap-1 font-sans text-xs text-text-secondary">
                <li>
                  相手がチャージ → <MatchupOutcome cell={row.vsCharge} />
                </li>
                <li>
                  相手が攻撃 → <MatchupOutcome cell={row.vsAttack} />
                </li>
                <li>
                  相手がガード → <MatchupOutcome cell={row.vsGuard} />
                </li>
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="ガードのクールダウン">
        <p className="font-sans text-sm leading-relaxed text-text-secondary">
          ガード使用後は、対戦開始時に選んだターン数が経過するまで再使用できません（2ターン または
          3ターン）。
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

function MatchupOutcome({ cell }: { cell: MatchupCell }) {
  return <span className={cell.emphasis ? 'font-bold text-attack' : undefined}>{cell.text}</span>
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-sans text-lg font-bold text-text-primary">{title}</h2>
      {children}
    </section>
  )
}
