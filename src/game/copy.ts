import type { Action, TurnOutcome } from '@/game/types'

export const ACTION_LABEL: Record<Action, string> = {
  charge: 'チャージ',
  attack: '攻撃',
  guard: 'ガード',
}

export function outcomeHeadline(outcome: TurnOutcome): string {
  switch (outcome) {
    case 'player-hit-cpu':
    case 'cpu-hit-player':
      return '命中'
    case 'clash':
      return '相打ち'
    case 'player-guarded':
    case 'cpu-guarded':
      return 'ガード成功'
    case 'no-effect':
      return '変化なし'
    default:
      return '変化なし'
  }
}

export function outcomeHistoryLine(outcome: TurnOutcome): string {
  switch (outcome) {
    case 'player-hit-cpu':
      return '→ 相手 HP -1'
    case 'cpu-hit-player':
      return '→ 自分 HP -1'
    case 'clash':
      return '→ 相打ち・ダメージなし'
    case 'player-guarded':
    case 'cpu-guarded':
      return '→ ガード成功・ダメージなし'
    case 'no-effect':
      return '→ 変化なし'
    default:
      return '→ 変化なし'
  }
}
