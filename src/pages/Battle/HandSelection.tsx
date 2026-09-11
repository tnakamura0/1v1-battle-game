import { ActionButton, type ActionButtonStatus } from '@/components/ActionButton'
import { ACTION_ORDER } from '@/components/actionStyle'
import { StatusPanel } from '@/components/StatusPanel'
import { getIllegalReason } from '@/game/rules'
import type { Action, BattlePreset, PlayerState, TurnRecord } from '@/game/types'
import { TurnHistoryList } from '@/pages/Battle/TurnHistoryList'

interface HandSelectionProps {
  player: PlayerState
  cpu: PlayerState
  preset: BattlePreset
  turn: number
  history: TurnRecord[]
  onSelectAction: (action: Action) => void
}

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
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden">
      <div className="flex flex-none flex-col gap-3 p-4 pb-3">
        <StatusPanel role="opponent" state={cpu} maxHp={preset.initialHp} />
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] font-bold tracking-widest text-text-primary">
            TURN {turn}
          </span>
        </div>
        <div
          className="flex-none rounded-chip border border-accent/25 bg-accent/10 px-3 py-4 text-center font-sans text-sm font-semibold text-accent-light"
          aria-live="polite"
        >
          行動を選択してください
        </div>
      </div>

      {/*
        lg以上では履歴を右カラム（Battle.tsx の aside）に出すので、ここは隠す。
        外側の flex-1 は残すこと。これを消すと上下のブロックがくっつき、
        自分のステータスと行動ボタンが画面下端から離れてしまう。
      */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <div className="lg:hidden">
          <TurnHistoryList history={history} />
        </div>
      </div>

      <div className="flex flex-none flex-col gap-3 border-t border-border-default p-4 pt-3">
        <StatusPanel role="player" state={player} maxHp={preset.initialHp} />
        <div className="grid grid-cols-3 gap-2.5">
          {ACTION_ORDER.map((action) => {
            const reason = getIllegalReason(action, player, cpu)
            const status: ActionButtonStatus = reason ? 'disabled' : 'idle'
            return (
              <ActionButton
                key={action}
                action={action}
                status={status}
                reasonLabel={
                  reason ? reasonLabel(reason, player.guardCooldownRemaining) : undefined
                }
                onSelect={() => onSelectAction(action)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
