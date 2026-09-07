import type { BattleSummary } from '@/game/types'

export function buildShareText(summary: BattleSummary): string {
  const won = summary.winner === 'player'
  return `OUTWIT DUELでCPUと対戦し、${summary.turnCount}ターンで${won ? '勝利' : '敗北'}しました！`
}

export function buildShareUrl(summary: BattleSummary): string {
  const params = new URLSearchParams({
    text: buildShareText(summary),
    url: window.location.origin,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}
