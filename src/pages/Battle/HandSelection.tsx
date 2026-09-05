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
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden lg:max-w-6xl lg:flex-row lg:gap-6 lg:p-6">
      {/* 情報カラム：上部（相手情報+TURN+プロンプト）と下部（自分情報+行動選択）は常に固定、
          モバイルではその間にターン履歴、デスクトップでは右サイドバーに履歴を出すため空ける */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:w-full lg:max-w-md lg:flex-none lg:justify-between lg:overflow-visible">
        <div className="flex flex-none flex-col gap-3 p-4 pb-3 lg:p-0 lg:pb-0">
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
          モバイル専用：余った領域にターン履歴を表示（スクロール、全ターン表示は不要）。
          `TurnHistoryList` はこことデスクトップ用サイドバーの2箇所に描画しているが、
          純粋な表示コンポーネントで共有可変状態は持たないため安全。ただし
          `src/test/setup.ts` はCSSを読み込まずjsdomでは`hidden`/`lg:*`が効かないため、
          このコンポーネント内のテキストを`getByText`等で単数取得するテストは追加しないこと
          （`getAllByText`を使うか、`HandSelection`を経由しない単体テストにすること）。
        */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 lg:hidden">
          <TurnHistoryList history={history} />
        </div>

        <div className="flex flex-none flex-col gap-3 border-t border-border-default p-4 pt-3 lg:border-t-0 lg:p-0 lg:pt-6">
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

      {/* デスクトップ専用：常設のターン履歴サイドバー */}
      <div className="hidden min-h-0 flex-1 lg:flex lg:flex-col lg:overflow-hidden lg:rounded-card lg:border lg:border-border-default lg:bg-bg-card lg:p-4 lg:shadow-card">
        <TurnHistoryList history={history} />
      </div>
    </div>
  )
}
