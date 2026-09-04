import { StatusPanel } from '@/components/StatusPanel'
import { getIllegalReason } from '@/game/rules'
import type { Action, BattlePreset, PlayerState, TurnRecord } from '@/game/types'
import { ActionButton, type ActionButtonStatus } from '@/pages/Battle/ActionButton'
import { TurnHistoryList } from '@/pages/Battle/TurnHistoryList'

interface HandSelectionProps {
  player: PlayerState
  cpu: PlayerState
  preset: BattlePreset
  turn: number
  history: TurnRecord[]
  onSelectAction: (action: Action) => void
}

const ACTIONS: Action[] = ['charge', 'attack', 'guard']

function reasonLabel(
  reason: 'own-energy-zero' | 'opponent-energy-zero' | 'guard-cooldown',
  guardCooldownRemaining: number,
): string {
  if (reason === 'own-energy-zero') return 'ENERGY 0'
  if (reason === 'opponent-energy-zero') return '相手EN 0'
  return `あと${guardCooldownRemaining}T`
}

export function HandSelection({
  player,
  cpu,
  preset,
  turn,
  history,
  onSelectAction,
}: HandSelectionProps) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <StatusPanel role="opponent" state={cpu} maxHp={preset.initialHp} />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-text-primary">
          TURN {turn}
        </span>
      </div>

      <div
        className="flex-none rounded-chip border border-accent/25 bg-accent/10 px-3 py-4 text-center font-sans text-sm font-semibold text-accent-light"
        aria-live="polite"
      >
        行動を選択してください
      </div>

      <TurnHistoryList history={history} />

      <StatusPanel role="player" state={player} maxHp={preset.initialHp} />

      <div className="grid grid-cols-3 gap-2.5">
        {ACTIONS.map((action) => {
          const reason = getIllegalReason(action, player, cpu)
          const status: ActionButtonStatus = reason ? 'disabled' : 'idle'
          return (
            <ActionButton
              key={action}
              action={action}
              status={status}
              reasonLabel={reason ? reasonLabel(reason, player.guardCooldownRemaining) : undefined}
              onSelect={() => onSelectAction(action)}
            />
          )
        })}
      </div>
    </div>
  )
}
