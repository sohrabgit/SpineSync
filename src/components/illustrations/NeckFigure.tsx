import type { CSSProperties, ReactNode } from 'react'
import type { ExerciseId, PostureIssue, SideId } from '@/types/recovery'
import { cn } from '@/components/ui/cn'

/*
 * Head-and-shoulders figures that show a move instead of describing it. Each pose
 * loops a gentle 4 s animation (see the `fig-*` keyframes in index.css); reduced
 * motion freezes them on the key frame. Decorative: the step list and labels carry
 * the meaning for screen readers.
 */

export type FigurePose = ExerciseId | 'stand_reach'

const BODY = '#3f4558'
const SKIN = '#5a6278'
const SKIN_DARK = '#4b5266'
const EYE = '#12141b'

/** Rotation/translation around a point given in viewBox units. */
const origin = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' })

function Frame({ size, className, children }: { size: number; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={cn('fig overflow-visible', className)} aria-hidden>
      {children}
    </svg>
  )
}

// ── Building blocks ───────────────────────────────────────────────────────

/** Side view, facing the reading direction's start (right in LTR art). */
function SideHead({ className, style, face = true }: { className?: string; style?: CSSProperties; face?: boolean }) {
  return (
    <g className={className} style={style}>
      <rect x="57" y="48" width="13" height="36" rx="6.5" fill={SKIN_DARK} />
      <circle cx="64" cy="37" r="15" fill={SKIN} />
      <path d="M77.5 32 L83 39.5 L77.5 42 Z" fill={SKIN} />
      <path d="M71 48 Q76 49 78 44" fill="none" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
      {face && <circle cx="72" cy="34" r="1.7" fill={EYE} />}
      <ellipse cx="61" cy="38.5" rx="2.6" ry="3.6" fill={SKIN_DARK} />
    </g>
  )
}

const SIDE_TORSO = 'M40 120 V98 C40 84 48 77 58 75 H70 C81 77 87 85 87 99 V120 Z'
const FRONT_TORSO = 'M14 120 V101 C14 87 29 81 44 80 H76 C91 81 106 87 106 101 V120 Z'

function FrontHead({ className, style, face = true }: { className?: string; style?: CSSProperties; face?: boolean }) {
  return (
    <g className={className} style={style}>
      <rect x="53" y="50" width="14" height="36" rx="7" fill={SKIN_DARK} />
      <ellipse cx="46.5" cy="40" rx="2.6" ry="4" fill={SKIN_DARK} />
      <ellipse cx="73.5" cy="40" rx="2.6" ry="4" fill={SKIN_DARK} />
      <ellipse cx="60" cy="37" rx="14" ry="16.5" fill={SKIN} />
      {face && (
        <>
          <circle cx="55" cy="36" r="1.6" fill={EYE} />
          <circle cx="65" cy="36" r="1.6" fill={EYE} />
        </>
      )}
    </g>
  )
}

/** A straight arrow with a head, drawn in the accent colour; `cue` fades it in time with the move. */
function Arrow({ d, head, color, cue = true }: { d: string; head: string; color: string; cue?: boolean }) {
  return (
    <g className={cue ? 'fig-cue' : undefined} stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} />
      <path d={head} />
    </g>
  )
}

/** Expanding rings that mark a contact or a spot to check. */
function Pulse({ x, y, color, r = 9 }: { x: number; y: number; color: string; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 0.55} fill={color} fillOpacity="0.25" />
      {[0, 0.6].map((delay) => (
        <circle
          key={delay}
          cx={x}
          cy={y}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          className="fig-ring origin-center [transform-box:fill-box]"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </g>
  )
}

// ── Poses ─────────────────────────────────────────────────────────────────

function ChinTuck({ color }: { color: string }) {
  return (
    <>
      <SideHead className="fig-tuck" />
      <path d={SIDE_TORSO} fill={BODY} />
      <Arrow d="M100 38 H88" head="M92.5 33.5 L88 38 L92.5 42.5" color={color} />
    </>
  )
}

function TrapStretch({ color }: { color: string }) {
  return (
    <>
      <FrontHead className="fig-tilt" style={origin(60, 82)} />
      {/* The stretched side of the neck lights up as the head tilts away from it. */}
      <path d="M67 58 Q70 74 88 81" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" className="fig-cue" />
      <path d={FRONT_TORSO} fill={BODY} />
      <Arrow d="M34 22 Q26 32 30 44" head="M25.5 40 L30 44 L34 39.5" color={color} />
    </>
  )
}

function Isometric({ color, side }: { color: string; side: SideId }) {
  if (side === 'left' || side === 'right') {
    const flip = side === 'right'
    return (
      <g transform={flip ? 'translate(120 0) scale(-1 1)' : undefined}>
        <FrontHead />
        <path d={FRONT_TORSO} fill={BODY} />
        <path d="M30 92 Q14 62 40 42" fill="none" stroke={SKIN_DARK} strokeWidth="9" strokeLinecap="round" />
        <rect x="36" y="31" width="9" height="15" rx="4.5" fill={SKIN} />
        <Pulse x={45} y={38} color={color} />
      </g>
    )
  }
  const back = side === 'backward'
  return (
    <>
      <SideHead />
      <path d={SIDE_TORSO} fill={BODY} />
      {back ? (
        <>
          <path d="M50 102 Q32 76 45 42" fill="none" stroke={SKIN_DARK} strokeWidth="9" strokeLinecap="round" />
          <rect x="41" y="28" width="9" height="15" rx="4.5" fill={SKIN} />
          <Pulse x={49} y={36} color={color} />
        </>
      ) : (
        <>
          <path d="M76 102 Q100 80 87 38" fill="none" stroke={SKIN_DARK} strokeWidth="9" strokeLinecap="round" />
          <rect x="80" y="22" width="9" height="15" rx="4.5" fill={SKIN} />
          <Pulse x={80} y={30} color={color} />
        </>
      )}
    </>
  )
}

function Retraction({ color }: { color: string }) {
  // Back view: the shoulder blades glide toward the spine.
  return (
    <>
      <FrontHead face={false} />
      <path d={FRONT_TORSO} fill={BODY} />
      <path d="M60 84 V120" stroke={SKIN_DARK} strokeWidth="2" strokeDasharray="3 3" />
      <path d="M36 90 L50 88 L47 110 Z" fill={SKIN} strokeLinejoin="round" stroke={SKIN} strokeWidth="4" className="fig-squeeze-l" />
      <path d="M84 90 L70 88 L73 110 Z" fill={SKIN} strokeLinejoin="round" stroke={SKIN} strokeWidth="4" className="fig-squeeze-r" />
      <Arrow d="M18 70 H30" head="M25.5 65.5 L30 70 L25.5 74.5" color={color} />
      <Arrow d="M102 70 H90" head="M94.5 65.5 L90 70 L94.5 74.5" color={color} />
    </>
  )
}

function ShoulderRolls({ color }: { color: string }) {
  return (
    <>
      <SideHead />
      <path d={SIDE_TORSO} fill={BODY} />
      <circle cx="64" cy="84" r="10" fill={SKIN_DARK} className="fig-roll" />
      {/* A backward circle around the shoulder. */}
      <g stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" className="fig-spin" style={origin(64, 84)}>
        <path d="M82 84 A18 18 0 1 0 64 102" />
        <path d="M60 97.5 L64 102 L59.5 106" strokeLinejoin="round" />
      </g>
    </>
  )
}

function Walk({ color }: { color: string }) {
  return (
    <>
      <path d="M18 108 H102" stroke={color} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 6" className="fig-ground" />
      <rect x="55" y="62" width="10" height="36" rx="5" fill={SKIN_DARK} className="fig-leg-a" style={origin(60, 66)} />
      <rect x="55" y="62" width="10" height="36" rx="5" fill={SKIN} className="fig-leg-b" style={origin(60, 66)} />
      <rect x="52" y="34" width="16" height="34" rx="8" fill={BODY} />
      <rect x="56" y="38" width="8" height="28" rx="4" fill={SKIN_DARK} className="fig-leg-b" style={origin(60, 41)} />
      <circle cx="62" cy="22" r="10" fill={SKIN} />
      <circle cx="67" cy="20" r="1.4" fill={EYE} />
      <rect x="56" y="38" width="8" height="28" rx="4" fill={SKIN} className="fig-leg-a" style={origin(60, 41)} />
    </>
  )
}

function Pack({ hot }: { hot: boolean }) {
  const color = hot ? '#f3a66a' : '#82d2e6'
  return (
    <>
      <SideHead />
      <path d={SIDE_TORSO} fill={BODY} />
      <ellipse cx="50" cy="62" rx="16" ry="22" fill={color} fillOpacity="0.28" className="fig-glow" />
      <rect x="44" y="46" width="13" height="32" rx="6" fill={color} />
      {hot
        ? [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${40 + i * 7} 40 q-3 -4 0 -8 q3 -4 0 -8`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              className="fig-rise"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))
        : [
            [34, 44],
            [30, 60],
            [36, 74],
          ].map(([x, y], i) => (
            <g key={i} stroke={color} strokeWidth="1.8" strokeLinecap="round" className="fig-twinkle" style={{ animationDelay: `${i * 0.6}s` }}>
              <path d={`M${x! - 3.5} ${y} h7 M${x! - 1.75} ${y! - 3} l3.5 6 M${x! + 1.75} ${y! - 3} l-3.5 6`} />
            </g>
          ))}
    </>
  )
}

function Rest({ color }: { color: string }) {
  return (
    <>
      <path d="M8 96 H112" stroke={SKIN_DARK} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="84" rx="18" ry="9" fill={SKIN_DARK} />
      <ellipse cx="96" cy="88" rx="10" ry="7" fill={SKIN_DARK} />
      <g className="fig-breathe" style={origin(70, 94)}>
        <rect x="36" y="70" width="80" height="20" rx="10" fill={BODY} />
      </g>
      <rect x="32" y="70" width="12" height="11" rx="5" fill={SKIN_DARK} />
      <circle cx="24" cy="70" r="13" fill={SKIN} />
      <circle cx="28" cy="63" r="1.5" fill={EYE} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${60 + i * 12} 60 q3 -4 6 0 q3 4 6 0`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="fig-rise"
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </>
  )
}

function StandReach({ color }: { color: string }) {
  return (
    <g className="fig-tall">
      <rect x="23" y="84" width="11" height="34" rx="5.5" fill={SKIN_DARK} className="fig-reach-l" style={origin(28.5, 88)} />
      <rect x="86" y="84" width="11" height="34" rx="5.5" fill={SKIN_DARK} className="fig-reach-r" style={origin(91.5, 88)} />
      <FrontHead />
      <path d={FRONT_TORSO} fill={BODY} />
      <Arrow d="M60 16 V4" head="M55.5 8.5 L60 4 L64.5 8.5" color={color} />
    </g>
  )
}

/** Illustrated exercise or break move. `side` picks the contact point for 4-way isometrics. */
export function ExerciseFigure({ pose, color = '#5cc8b0', side = 'forward', size = 140, className }: { pose: FigurePose; color?: string; side?: SideId | null; size?: number; className?: string }) {
  const body = (() => {
    switch (pose) {
      case 'chin_tuck':
        return <ChinTuck color={color} />
      case 'upper_trap_stretch':
        return <TrapStretch color={color} />
      case 'isometric_4way':
        return <Isometric color={color} side={side ?? 'forward'} />
      case 'scapular_retraction':
        return <Retraction color={color} />
      case 'shoulder_rolls':
        return <ShoulderRolls color={color} />
      case 'brisk_walk':
        return <Walk color={color} />
      case 'heat_therapy':
        return <Pack hot />
      case 'cold_therapy':
        return <Pack hot={false} />
      case 'supported_rest':
        return <Rest color={color} />
      case 'stand_reach':
        return <StandReach color={color} />
    }
  })()
  return (
    <Frame size={size} className={className}>
      {body}
    </Frame>
  )
}

/** Seated at a desk, with the spot a posture question is about highlighted. */
export function PostureFigure({ focus, color = '#f2c86b', size = 140, className }: { focus: PostureIssue; color?: string; size?: number; className?: string }) {
  return (
    <Frame size={size} className={className}>
      <g transform="translate(-16 0)">
        <SideHead />
        <path d={SIDE_TORSO} fill={BODY} />
      </g>
      {/* Desk and monitor, seen from the side. */}
      <path d="M72 96 H118" stroke={SKIN_DARK} strokeWidth="4" strokeLinecap="round" />
      <path d="M104 96 V66" stroke={SKIN_DARK} strokeWidth="3" />
      <rect x="99" y="28" width="7" height="38" rx="2" fill={focus === 'screen' ? color : SKIN} fillOpacity={focus === 'screen' ? 0.9 : 1} />
      {/* Gaze line from the eye to the top of the screen: level when the screen is set right. */}
      <path d="M57 34 H96" stroke={focus === 'screen' ? color : SKIN_DARK} strokeWidth="1.6" strokeDasharray="3 4" />
      {focus === 'chin' && <Pulse x={61} y={46} color={color} r={10} />}
      {focus === 'shoulders' && <Pulse x={48} y={80} color={color} r={12} />}
      {focus === 'screen' && <Pulse x={102} y={34} color={color} r={10} />}
    </Frame>
  )
}
