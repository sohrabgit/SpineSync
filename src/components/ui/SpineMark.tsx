import { useEffect, useId, useState } from 'react'
import { PAIN_DISC, VERTEBRA_COUNT, WIDTHS, bodyPath, discPath, pose, processPath, spineColor, waveProgress } from '@/lib/spine'

const HEALTHY = Array<number>(VERTEBRA_COUNT).fill(1)
const PAINFUL = Array<number>(VERTEBRA_COUNT).fill(0)

/**
 * The brand mark: a side view of the neck's spine. `progress` holds one value per
 * vertebra (C1 first), 0 = forward-head and painful, 1 = healthy curve.
 */
export function SpineMark({ progress = HEALTHY, className }: { progress?: number[]; className?: string }) {
  const glowId = useId()
  const ps = pose(progress)
  const at = (j: number) => progress[j] ?? 1
  const pain = 1 - (at(PAIN_DISC) + at(PAIN_DISC + 1)) / 2
  const discs = Array.from({ length: VERTEBRA_COUNT - 1 }, (_, j) => {
    const t = (at(j) + at(j + 1)) / 2
    const hurts = j === PAIN_DISC
    return { ...discPath(ps, j, hurts ? pain : 0), color: spineColor(t, hurts), opacity: hurts ? 0.45 + 0.55 * pain : 0.45 }
  })
  const tip = discs[PAIN_DISC]!.tip

  return (
    <svg viewBox="0 0 64 64" className={className} overflow="visible" aria-hidden>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#f2706b" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f2706b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {pain > 0.01 && (
        <g opacity={pain}>
          <circle cx={tip[0]} cy={tip[1]} r="11" fill={`url(#${glowId})`} />
          {[0, 0.6].map((delay) => (
            <circle
              key={delay}
              cx={tip[0]}
              cy={tip[1]}
              r="8"
              fill="none"
              stroke="#f2706b"
              strokeWidth="0.7"
              className="origin-center animate-pain-ring [transform-box:fill-box]"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </g>
      )}
      {discs.map((d, j) => (
        <path key={j} d={d.d} fill={d.color} fillOpacity={d.opacity} />
      ))}
      {ps.p.map(([x, y], j) => {
        const color = spineColor(at(j))
        return (
          <g key={j} transform={`translate(${x} ${y}) rotate(${ps.th[j]!})`} fill={color}>
            <path d={processPath(WIDTHS[j]!)} fillOpacity="0.6" />
            <path d={bodyPath(WIDTHS[j]!)} />
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Plays the correction while `active`: holds the painful pose for `holdMs`, then
 * a wave climbs from the base to the top. Resets when inactive; reduced motion skips to healthy.
 */
export function useSpineCorrection(active: boolean, holdMs = 900, durationMs = 1100, staggerMs = 110): number[] {
  const [progress, setProgress] = useState(PAINFUL)

  useEffect(() => {
    if (!active) {
      setProgress(PAINFUL)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(HEALTHY)
      return
    }
    const start = performance.now()
    const end = holdMs + durationMs + staggerMs * (VERTEBRA_COUNT - 1)
    let frame = 0
    const tick = (now: number) => {
      const elapsed = now - start
      setProgress(waveProgress(elapsed - holdMs, durationMs, staggerMs))
      if (elapsed < end) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, holdMs, durationMs, staggerMs])

  return progress
}
