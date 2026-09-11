import { ActionButton, type ActionButtonStatus } from '@/components/ActionButton'
import { ACTION_ORDER } from '@/components/actionStyle'
import { StatusPanel } from '@/components/StatusPanel'
import { getIllegalReason } from '@/game/rules'
import type { Action, BattlePreset, PlayerState, TurnRecord } from '@/game/types'
import { TurnHistoryList } from '@/pages/Battle/TurnHistoryList'
import { Versus } from '@/pages/Battle/Versus'

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

/**
 * lg以上で履歴が右カラムへ移ったあとの空きに置く、対峙の表現。
 *
 * intro（誰と戦うか）→ 選択（対峙中）→ 結果（何が起きたか）を同じ構図でつなぐための
 * 装飾で、盤面から読み取れる情報を増やすものではない。この空きは lg 以上にしか
 * 存在しないため、ここに有利不利を左右するものを置くとデバイスで難易度が変わる。
 *
 * aria-hidden なのは、円が示す「自分と相手がいる」ことを StatusPanel が既に
 * 伝えているため。BattleIntro 側の Versus は本文なので aria-hidden にしていない。
 *
 * 高さの条件は、アリーナ（約150px）と上下の固定ブロック（約470px）の合計に余裕を
 * 見たもの。これがないと背の低いウィンドウで円が上下に切れる。
 */
function BattleArena() {
  return (
    <div
      aria-hidden
      className="hidden h-full flex-col items-center justify-center gap-4 lg:[@media(min-height:700px)]:flex"
    >
      <Versus />
      <p className="font-mono text-[11px] text-text-tertiary">両者の行動は同時に公開されます</p>
    </div>
  )
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
        lg未満は履歴、lg以上は対峙の表現。ちょうど裏返しの関係で入れ替わる。
        外側の flex-1 は残すこと。これを消すと上下のブロックがくっつき、
        自分のステータスと行動ボタンが画面下端から離れてしまう。
      */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 lg:overflow-hidden">
        {/* lg以上では履歴は右カラム（Battle.tsx の aside）に出るので、ここは隠す */}
        <div className="lg:hidden">
          <TurnHistoryList history={history} />
        </div>
        <BattleArena />
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
