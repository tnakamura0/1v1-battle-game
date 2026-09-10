import { StatusPanel } from '@/components/StatusPanel'
import { ACTION_STYLE } from '@/components/actionStyle'
import { ROLE_STYLE } from '@/components/roleStyle'
import { ActionIcon } from '@/components/ActionIcon'
import { ACTION_LABEL, outcomeHeadline } from '@/game/copy'
import { RESULT_DURATION_MS, RESULT_DURATION_ON_VICTORY_MS } from '@/game/presets'
import type { BattlePreset, TurnRecord } from '@/game/types'

interface TurnResultProps {
  lastTurn: TurnRecord
  preset: BattlePreset
  turn: number
  secondsRemaining: number
  isFinal: boolean
}

function outcomeSubline(outcome: TurnRecord['outcome']): string {
  switch (outcome) {
    case 'player-hit-cpu':
      return '相手に 1 ダメージ'
    case 'cpu-hit-player':
      return '自分が 1 ダメージを受けた'
    case 'clash':
      return 'お互いの攻撃が相殺された'
    case 'player-guarded':
      return '相手の攻撃をガードした（自分のエネルギー+1）'
    case 'cpu-guarded':
      return '攻撃をガードされた（相手のエネルギー+1）'
    default:
      return ''
  }
}

interface ChangeRow {
  label: string
  beforeText: string
  afterText: string
  colorClass: string
  /** 誰の変化かを行の左端の帯で示す */
  edgeClass: string
}

/**
 * HPの行の text-attack は「ダメージ」を表す色で、attack という行動を表しているわけではない。
 * 色の値はたまたま同じだが軸が違うので、ACTION_STYLE には寄せずに直接書いている。
 * 一方でエネルギーの行は「ガードで増えた／チャージで増えた」という行動由来なので ACTION_STYLE を使う。
 */
function buildChangeRows(lastTurn: TurnRecord): ChangeRow[] {
  const rows: ChangeRow[] = []

  if (lastTurn.cpuBefore.hp !== lastTurn.cpuAfter.hp) {
    rows.push({
      label: '相手 HP',
      beforeText: String(lastTurn.cpuBefore.hp),
      afterText: String(lastTurn.cpuAfter.hp),
      colorClass: 'text-attack',
      edgeClass: ROLE_STYLE.opponent.edgeClass,
    })
  }
  if (lastTurn.playerBefore.hp !== lastTurn.playerAfter.hp) {
    rows.push({
      label: '自分 HP',
      beforeText: String(lastTurn.playerBefore.hp),
      afterText: String(lastTurn.playerAfter.hp),
      colorClass: 'text-attack',
      edgeClass: ROLE_STYLE.player.edgeClass,
    })
  }
  if (lastTurn.playerBefore.energy !== lastTurn.playerAfter.energy) {
    rows.push({
      label: '自分 ENERGY',
      beforeText: String(lastTurn.playerBefore.energy),
      afterText: String(lastTurn.playerAfter.energy),
      colorClass:
        lastTurn.outcome === 'player-guarded'
          ? ACTION_STYLE.guard.textClass
          : ACTION_STYLE.charge.textClass,
      edgeClass: ROLE_STYLE.player.edgeClass,
    })
  }
  if (lastTurn.cpuBefore.energy !== lastTurn.cpuAfter.energy) {
    rows.push({
      label: '相手 ENERGY',
      beforeText: String(lastTurn.cpuBefore.energy),
      afterText: String(lastTurn.cpuAfter.energy),
      colorClass:
        lastTurn.outcome === 'cpu-guarded'
          ? ACTION_STYLE.guard.textClass
          : ACTION_STYLE.charge.textClass,
      edgeClass: ROLE_STYLE.opponent.edgeClass,
    })
  }
  if (
    lastTurn.playerAction === 'guard' &&
    lastTurn.playerBefore.guardCooldownRemaining !== lastTurn.playerAfter.guardCooldownRemaining
  ) {
    rows.push({
      label: '自分 ガード',
      beforeText: 'READY',
      afterText: `${lastTurn.playerAfter.guardCooldownRemaining}T`,
      colorClass: 'text-accent-hover',
      edgeClass: ROLE_STYLE.player.edgeClass,
    })
  }

  return rows
}

export function TurnResult({ lastTurn, preset, turn, secondsRemaining, isFinal }: TurnResultProps) {
  const changeRows = buildChangeRows(lastTurn)
  const subline = outcomeSubline(lastTurn.outcome)
  const isHit = lastTurn.outcome === 'player-hit-cpu' || lastTurn.outcome === 'cpu-hit-player'
  const totalSeconds = Math.ceil(
    (isFinal ? RESULT_DURATION_ON_VICTORY_MS : RESULT_DURATION_MS) / 1000,
  )

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col gap-4 p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <StatusPanel
            role="opponent"
            state={lastTurn.cpuAfter}
            maxHp={preset.initialHp}
            hpBefore={lastTurn.cpuBefore.hp}
            dimmed
          />
          <StatusPanel
            role="player"
            state={lastTurn.playerAfter}
            maxHp={preset.initialHp}
            hpBefore={lastTurn.playerBefore.hp}
            dimmed
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-text-primary">
            TURN {turn}
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary">
            RESULT
          </span>
        </div>

        <div className="flex items-stretch gap-2.5">
          <div
            className={`flex flex-1 flex-col items-center gap-3 rounded-card border ${ROLE_STYLE.player.surfaceClass} py-6 shadow-card`}
          >
            <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-text-secondary">
              {ROLE_STYLE.player.label}
            </span>
            <span className={ACTION_STYLE[lastTurn.playerAction].textClass}>
              <ActionIcon action={lastTurn.playerAction} size={40} strokeWidth={1.6} />
            </span>
            <span className="font-sans text-base font-extrabold text-text-primary">
              {ACTION_LABEL[lastTurn.playerAction]}
            </span>
          </div>
          <div className="flex w-8 flex-none items-center justify-center font-mono text-xs font-extrabold tracking-[0.06em] text-text-tertiary">
            VS
          </div>
          <div
            className={`flex flex-1 flex-col items-center gap-3 rounded-card border ${ROLE_STYLE.opponent.surfaceClass} py-6 shadow-card`}
          >
            <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-text-secondary">
              {ROLE_STYLE.opponent.label}
            </span>
            <span className={ACTION_STYLE[lastTurn.cpuAction].textClass}>
              <ActionIcon action={lastTurn.cpuAction} size={40} strokeWidth={1.6} />
            </span>
            <span className="font-sans text-base font-extrabold text-text-primary">
              {ACTION_LABEL[lastTurn.cpuAction]}
            </span>
          </div>
        </div>

        <div
          className={
            isHit
              ? 'flex flex-col items-center gap-2 rounded-card border border-attack/30 bg-attack/10 px-4 py-6'
              : 'flex flex-col items-center gap-2 rounded-card border border-border-default bg-bg-card px-4 py-6 shadow-card'
          }
        >
          <span
            className={
              isHit
                ? 'font-sans text-3xl font-extrabold text-attack'
                : 'font-sans text-3xl font-extrabold text-text-primary'
            }
          >
            {outcomeHeadline(lastTurn.outcome)}
          </span>
          {subline && (
            <span className="font-sans text-sm font-semibold text-text-primary">{subline}</span>
          )}
        </div>

        {changeRows.length > 0 ? (
          <div className="flex flex-none flex-col gap-px overflow-hidden rounded-chip border border-border-default bg-bg-track">
            {changeRows.map((row) => (
              <div
                key={row.label}
                className={`flex items-center justify-between border-l-[3px] ${row.edgeClass} bg-bg-row px-4 py-3`}
              >
                <span className="font-mono text-[11px] font-semibold tracking-[0.06em] text-text-secondary">
                  {row.label}
                </span>
                <span className="font-sans text-sm font-bold tabular-nums text-text-primary">
                  {row.beforeText} <span className="text-text-tertiary">→</span>{' '}
                  <span className={row.colorClass}>{row.afterText}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-chip border border-border-default bg-bg-card px-4 py-4 text-center font-sans text-sm font-semibold text-text-tertiary shadow-card">
            ステータス変化なし
          </p>
        )}
      </div>

      <div
        className="flex flex-none flex-col gap-2 border-t border-bg-track pt-4"
        aria-live="polite"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-text-secondary">
            {isFinal ? '対戦結果へ' : 'NEXT TURN IN'}
          </span>
          <span className="font-sans text-2xl font-bold tabular-nums text-text-primary">
            {secondsRemaining}
            <span className="font-mono text-[11px] font-semibold text-text-tertiary">s</span>
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-[2px] bg-bg-track">
          <div
            className="h-full rounded-[2px] bg-[#566B80] transition-[width]"
            style={{
              width: `${Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
