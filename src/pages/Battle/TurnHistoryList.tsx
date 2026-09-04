import type { Action, TurnRecord } from '@/game/types'
import { ACTION_LABEL, outcomeHistoryLine } from '@/game/copy'

interface TurnHistoryListProps {
  history: TurnRecord[]
}

const ACTION_COLOR_CLASS: Record<Action, string> = {
  charge: 'text-charge',
  attack: 'text-attack',
  guard: 'text-guard',
}

export function TurnHistoryList({ history }: TurnHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <HistoryHeader />
        <p className="rounded-chip border border-border-default bg-bg-row px-3 py-3 text-center font-sans text-xs text-text-tertiary">
          まだ履歴はありません
        </p>
      </div>
    )
  }

  const [latest, ...rest] = history

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <HistoryHeader />
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <li
          key={latest.turn}
          className="flex flex-none flex-col gap-1.5 rounded-chip border border-l-[3px] border-border-emphasis border-l-accent bg-bg-surface px-3.5 py-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-text-secondary">
              TURN {latest.turn}
            </span>
            <span className="rounded-[4px] bg-accent px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-bg-page">
              LATEST
            </span>
          </div>
          <div className="flex items-center gap-2 font-sans text-sm font-bold text-text-primary">
            <span className={ACTION_COLOR_CLASS[latest.playerAction]}>
              {ACTION_LABEL[latest.playerAction]}
            </span>
            <span className="font-mono text-[9px] font-semibold text-text-tertiary">VS</span>
            <span className={ACTION_COLOR_CLASS[latest.cpuAction]}>
              {ACTION_LABEL[latest.cpuAction]}
            </span>
          </div>
          <p className="font-mono text-[11px] font-medium text-text-secondary">
            {outcomeHistoryLine(latest.outcome)}
          </p>
        </li>

        {rest.map((record) => (
          <li
            key={record.turn}
            className="flex flex-none items-center gap-3 rounded-chip border border-border-default px-3.5 py-2.5"
          >
            <span className="w-[46px] flex-none font-mono text-[10px] font-semibold text-text-tertiary">
              TURN {record.turn}
            </span>
            <span className="font-sans text-xs font-medium text-text-secondary">
              {ACTION_LABEL[record.playerAction]} vs {ACTION_LABEL[record.cpuAction]}
              <span className="ml-2 text-text-tertiary">{outcomeHistoryLine(record.outcome)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HistoryHeader() {
  return (
    <div className="flex flex-none items-center gap-2 px-0.5">
      <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-text-tertiary">
        TURN HISTORY
      </span>
      <div className="h-px flex-1 bg-bg-track" />
    </div>
  )
}
