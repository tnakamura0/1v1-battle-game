import { Navigate, useLocation, useNavigate } from 'react-router'
import { RESULT_DELAY } from '@/components/motion'
import { ROLE_STYLE, type BattleRole } from '@/components/roleStyle'
import { ruleLabel } from '@/game/copy'
import { buildShareUrl } from '@/pages/BattleResult/share'
import type { BattleSummary } from '@/game/types'

interface BattleResultLocationState {
  summary?: BattleSummary
}

export function BattleResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const summary = (location.state as BattleResultLocationState | null)?.summary

  if (!summary) {
    return <Navigate to="/preset" replace />
  }

  const won = summary.winner === 'player'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <span className="animate-fade-rise font-mono text-meta font-bold tracking-[0.18em] text-text-tertiary">
        GAME OVER
      </span>

      {/*
        見出しには、対戦画面の決着ターンと同じ final-pop を使う。同じ動きで出すことで、
        直前に見た「決着」の見出しがそのままこの画面に引き継がれたように見える。
      */}
      <div className={`animate-final-pop ${RESULT_DELAY.headline} flex flex-col gap-2`}>
        <h1
          className={
            won
              ? 'font-sans text-5xl font-extrabold text-accent-hover'
              : 'font-sans text-5xl font-extrabold text-lose'
          }
        >
          {won ? '勝利' : '敗北'}
        </h1>
        <span className="font-sans text-sm font-semibold text-text-secondary">
          {won ? 'あなたの勝ちです' : 'あなたの負けです'}
        </span>
      </div>

      {/* 枠も1行目と同時に出す。枠だけ先に出ていると空の箱が置かれたままに見える */}
      <div
        className={`animate-fade-rise ${RESULT_DELAY.stats[0]} flex w-full flex-col gap-px overflow-hidden rounded-chip border border-border-default bg-bg-track`}
      >
        {/*
          ルールを先頭に置く。下に続く数字（最終HP・ターン数）をどう読めばいいかの
          前提になる情報なので（HP1のサドンデスとHP3の真剣勝負では意味が違う）。
          共有テキストも同じ ruleLabel を使うので、共有文で初めて見る名前にならない。
        */}
        <StatRow
          label="ルール"
          value={ruleLabel(summary.preset)}
          delayClass={RESULT_DELAY.stats[0]}
        />
        <StatRow
          label="最終HP（自分）"
          value={`${summary.player.hp}/${summary.preset.initialHp}`}
          role="player"
          delayClass={RESULT_DELAY.stats[1]}
        />
        <StatRow
          label="最終HP（相手）"
          value={`${summary.cpu.hp}/${summary.preset.initialHp}`}
          role="opponent"
          delayClass={RESULT_DELAY.stats[2]}
        />
        <StatRow
          label="ターン数"
          value={`${summary.turnCount}ターン`}
          delayClass={RESULT_DELAY.stats[3]}
        />
      </div>

      <div className={`animate-fade-rise ${RESULT_DELAY.actions} flex w-full flex-col gap-3`}>
        <button
          type="button"
          onClick={() =>
            navigate('/battle', {
              state: { preset: summary.preset },
              replace: true,
            })
          }
          className="flex h-13 touch-manipulation items-center justify-center rounded-xl bg-accent font-sans text-sm font-bold text-bg-page transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          もう一度対戦する
        </button>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="flex h-13 touch-manipulation items-center justify-center rounded-xl border border-border-emphasis font-sans text-sm font-bold text-text-secondary transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
        >
          トップページに戻る
        </button>
      </div>

      <a
        href={buildShareUrl(summary)}
        target="_blank"
        rel="noopener noreferrer"
        className={`animate-fade-rise ${RESULT_DELAY.actions} mt-2 inline-flex items-center font-sans text-sm font-semibold text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page`}
      >
        Xで結果をシェアする
      </a>
    </main>
  )
}

function StatRow({
  label,
  value,
  role,
  delayClass,
}: {
  label: string
  value: string
  /** 自分/相手の情報を表す行だけ指定する。持ち主のいない行（ターン数など）は省略する */
  role?: BattleRole
  /** 上から順に出すための遅延。値は RESULT_DELAY.stats（components/motion.ts） */
  delayClass: string
}) {
  // 持ち主のいない行も同じ3pxを透明で確保して、テキストの左端を揃える
  const edgeClass = role ? ROLE_STYLE[role].edgeClass : 'border-l-transparent'
  return (
    <div
      className={`animate-row-in ${delayClass} flex items-center justify-between border-l-[3px] ${edgeClass} bg-bg-row px-4 py-3`}
    >
      <span className="font-mono text-meta font-semibold tracking-[0.06em] text-text-secondary">
        {label}
      </span>
      <span className="font-sans text-sm font-bold tabular-nums text-text-primary">{value}</span>
    </div>
  )
}
