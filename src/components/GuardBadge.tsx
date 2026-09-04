interface GuardBadgeProps {
  guardCooldownRemaining: number
}

export function GuardBadge({ guardCooldownRemaining }: GuardBadgeProps) {
  const isReady = guardCooldownRemaining === 0

  return (
    <span
      className={
        isReady
          ? 'rounded-pill border border-border-emphasis bg-white/5 px-2 py-1 font-mono text-[9px] font-semibold tracking-[0.08em] text-accent-muted'
          : 'rounded-pill border border-border-default bg-transparent px-2 py-1 font-mono text-[9px] font-semibold tracking-[0.08em] text-text-tertiary'
      }
    >
      {isReady ? 'GUARD READY' : `あと${guardCooldownRemaining}T`}
    </span>
  )
}
