interface GuardBadgeProps {
  guardCooldownRemaining: number
}

/**
 * 枠で囲った極小ラベルなので text-chip（10px）。隣の PLAYER / OPPONENT は text-meta（11px）で、
 * 1px違うのは意図したもの。ターン履歴の TURN n（11px）と LATEST チップ（10px）と同じ関係で、
 * 「地の上の文字」と「チップの中の文字」を1段分けている（index.css のはしごを参照）。
 *
 * このバッジの高さは対戦画面の上下の固定ブロックにそのまま乗る。11px にすると
 * 両ブロックで計3px 伸び、375×667 ではその分だけターン履歴の表示領域が削られる。
 */
export function GuardBadge({ guardCooldownRemaining }: GuardBadgeProps) {
  const isReady = guardCooldownRemaining === 0

  return (
    <span
      className={
        isReady
          ? 'rounded-pill border border-accent/40 bg-accent/5 px-2 py-1 font-mono text-chip font-semibold tracking-[0.08em] text-accent-muted'
          : 'rounded-pill border border-border-default bg-transparent px-2 py-1 font-mono text-chip font-semibold tracking-[0.08em] text-text-tertiary'
      }
    >
      {isReady ? 'GUARD READY' : `あと${guardCooldownRemaining}T`}
    </span>
  )
}
