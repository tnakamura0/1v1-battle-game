import { ruleLabel } from '@/game/copy'
import type { BattleSummary } from '@/game/types'

/**
 * ルールは文に埋め込まず、末尾に括弧で足す。
 *
 * 埋め込む形（`OUTWIT DUELの「サクッと遊ぶ」でCPUと対戦し、…`）だと、おすすめと
 * 一致しなかったときに `「HP3・ガード2ターン・CPUつよい」` となり、設定値の羅列を
 * 固有名のように見せてしまう。末尾の括弧なら、名前でも実値でも同じ形で置ける。
 *
 * ターン数だけではルールが違うと意味が変わってしまう（サドンデスの7ターンと
 * 真剣勝負の7ターンは別物）ので、数字と同じ文にルールを添えている。
 */
export function buildShareText(summary: BattleSummary): string {
  const won = summary.winner === 'player'
  return `OUTWIT DUELでCPUと対戦し、${summary.turnCount}ターンで${won ? '勝利' : '敗北'}しました！（ルール：${ruleLabel(summary.preset)}）`
}

export function buildShareUrl(summary: BattleSummary): string {
  const params = new URLSearchParams({
    text: buildShareText(summary),
    url: window.location.origin,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}
