import type { Action } from '@/game/types'

interface ActionIconProps {
  action: Action
  size?: number
  strokeWidth?: number
}

export function ActionIcon({ action, size = 26, strokeWidth = 1.8 }: ActionIconProps) {
  const strokeProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (action === 'charge') {
    return (
      <svg {...strokeProps}>
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
      </svg>
    )
  }
  if (action === 'attack') {
    return (
      <svg {...strokeProps} strokeWidth={1.3}>
        <path d="M12 1.2 L13.7 5 L13.7 12.6 L10.3 12.6 L10.3 5 Z" />
        <path d="M4.4 15.2 L8 12.4 L16 12.4 L19.6 15.2 L15.8 15.4 L8.2 15.4 Z" />
        <rect x="10.9" y="15.4" width="2.2" height="4.6" rx="1.1" />
        <circle cx="12" cy="21.3" r="1.5" />
      </svg>
    )
  }
  return (
    <svg {...strokeProps}>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3Z" />
    </svg>
  )
}
