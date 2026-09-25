import type { ReactNode } from 'react'

interface ProgressRingProps {
  /** 0–1 */
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
  label?: string
  /** Disable the CSS transition (e.g. for per-frame timer updates). */
  instant?: boolean
}

export function ProgressRing({ value, size = 64, stroke = 7, color = '#0f766e', track = '#e2e8f0', children, label, instant }: ProgressRingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, value))
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: instant ? 'stroke 200ms' : 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1), stroke 200ms' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
