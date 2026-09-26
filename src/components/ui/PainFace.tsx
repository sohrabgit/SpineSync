import { vasColor } from './tone'

/**
 * A face that reads the VAS score at a glance: a smile at 0 that flattens and turns
 * into a frown with knitted brows as pain rises. Decorative; the number carries the meaning.
 */
export function PainFace({ vas, size = 40 }: { vas: number; size?: number }) {
  const color = vasColor(vas)
  const t = Math.min(10, Math.max(0, vas)) / 10
  // Mouth corners stay put; the control point moves from below (smile) to above (frown).
  const curve = 39 - 17 * t
  const brow = t > 0.55 ? (t - 0.55) * 10 : 0
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <circle cx="24" cy="24" r="21" fill={color} fillOpacity={0.14} stroke={color} strokeWidth="2.5" />
      <circle cx="17" cy="20" r="2.4" fill={color} />
      <circle cx="31" cy="20" r="2.4" fill={color} />
      {brow > 0 && (
        <g stroke={color} strokeWidth="2.2" strokeLinecap="round">
          <path d={`M13 ${14 - brow * 0.2} L20 ${14 + brow * 0.6}`} />
          <path d={`M35 ${14 - brow * 0.2} L28 ${14 + brow * 0.6}`} />
        </g>
      )}
      <path
        d={`M15 31 Q24 ${curve} 33 31`}
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        style={{ transition: 'd 200ms ease' }}
      />
    </svg>
  )
}
