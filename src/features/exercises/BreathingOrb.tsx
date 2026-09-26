import { useState } from 'react'
import type { TimerPhase } from '@/hooks/useHoldTimer'
import { breathCycle, holdOrbScale, ORB_MIN } from '@/lib/breath'
import { useI18n } from '@/i18n'

const SIZE = 196
const HOLD = '#5cc8b0'
const REST = '#f2c86b'
const IDLE = '#9aa1b5'

const fmt = (ms: number, long: boolean) => {
  const s = Math.ceil(ms / 1000)
  return long ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : String(s)
}

/**
 * Exercise timer as a breathing orb: it swells over each hold and settles back
 * during the relax. Long timed activities (1 min+) run a slow 4 s in / 6 s out
 * breathing loop instead, since a 15-minute fill would look frozen.
 */
export function BreathingOrb({ phase, remainingMs, durationMs, running }: { phase: TimerPhase; remainingMs: number; durationMs: number; running: boolean }) {
  const { m, n } = useI18n()
  const t = m.timer
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const long = durationMs >= 60_000
  const elapsedMs = Math.max(0, durationMs - remainingMs)
  const breath = breathCycle(elapsedMs)

  let scale: number
  if (reduced) scale = phase === 'hold' ? 1 : long && phase !== 'idle' ? (1 + ORB_MIN) / 2 : ORB_MIN
  else if (long) scale = phase === 'idle' ? ORB_MIN : breath.scale
  else scale = holdOrbScale(phase, durationMs > 0 ? elapsedMs / durationMs : 0)

  const color = phase === 'idle' ? IDLE : phase === 'rest' ? REST : HOLD
  const breathing = long && running && !reduced
  const label = breathing ? (breath.inhaling ? t.breatheIn : t.breatheOut) : phase === 'hold' ? t.hold : phase === 'rest' ? t.relax : t.ready

  return (
    <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
      {/* The full size the orb fills to; static, so the eye rests on the orb, not a sweeping edge. */}
      <span className="absolute inset-0 rounded-full border border-line/70" aria-hidden />
      <span
        className="absolute inset-0 rounded-full will-change-transform"
        style={{
          transform: `scale(${scale})`,
          // Per-frame updates while running; ease into place when paused, stopped or idle.
          transition: `transform ${running ? 0 : 500}ms cubic-bezier(.4,0,.2,1), background 600ms, box-shadow 600ms, opacity 400ms`,
          background: `radial-gradient(circle, ${color}66 0%, ${color}38 55%, ${color}12 100%)`,
          boxShadow: `0 0 ${Math.round(24 + 36 * scale)}px ${color}${phase === 'idle' ? '1a' : '40'}`,
          opacity: !running && phase !== 'idle' ? 0.7 : 1,
        }}
        aria-hidden
      />
      <div className="relative text-center" aria-live="polite">
        <span className={`block text-xs font-bold tracking-[0.2em] uppercase ${phase === 'rest' ? 'text-warning' : phase === 'idle' ? 'text-mute' : 'text-brand'}`}>{label}</span>
        <span className="block text-5xl font-bold text-ink tabular-nums" dir="ltr">
          {n(fmt(remainingMs, long))}
        </span>
        <span className="block text-xs text-mute">{phase === 'idle' ? (long ? t.minutes : t.secondHold) : running ? (long ? t.remaining : t.seconds) : t.paused}</span>
      </div>
    </div>
  )
}
