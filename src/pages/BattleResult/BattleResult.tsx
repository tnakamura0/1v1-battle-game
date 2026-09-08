import { Navigate, useLocation, useNavigate } from 'react-router'
import { ROLE_STYLE, type BattleRole } from '@/components/roleStyle'
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
      <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-text-tertiary">
        GAME OVER
      </span>

      <div className="flex flex-col gap-2">
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

      <div className="flex w-full flex-col gap-px overflow-hidden rounded-chip border border-border-default bg-bg-track">
        <StatRow
          label="最終HP（自分）"
          value={`${summary.player.hp}/${summary.preset.initialHp}`}
          role="player"
        />
        <StatRow
          label="最終HP（相手）"
          value={`${summary.cpu.hp}/${summary.preset.initialHp}`}
          role="opponent"
        />
        <StatRow label="ターン数" value={`${summary.turnCount}ターン`} />
      </div>

      <div className="flex w-full flex-col gap-3">
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
        className="mt-2 inline-flex items-center font-sans text-sm font-semibold text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page"
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
}: {
  label: string
  value: string
  /** 自分/相手の情報を表す行だけ指定する。持ち主のいない行（ターン数など）は省略する */
  role?: BattleRole
}) {
  const labelClass = role ? ROLE_STYLE[role].textClass : 'text-text-secondary'
  return (
    <div className="flex items-center justify-between bg-bg-row px-4 py-3">
      <span className={`font-mono text-[11px] font-semibold tracking-[0.06em] ${labelClass}`}>
        {label}
      </span>
      <span className="font-sans text-sm font-bold tabular-nums text-text-primary">{value}</span>
    </div>
  )
}
