import type { TimerPhase } from '@/hooks/useHoldTimer'
import { ProgressRing } from '@/components/ui/ProgressRing'

const fmt = (ms: number, long: boolean) => {
  const s = Math.ceil(ms / 1000)
  return long ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : String(s)
}

export function HoldTimerRing({ phase, remainingMs, durationMs, running }: { phase: TimerPhase; remainingMs: number; durationMs: number; running: boolean }) {
  const long = durationMs >= 60_000
  const elapsed = durationMs > 0 ? 1 - remainingMs / durationMs : 0
  const color = phase === 'rest' ? '#f59e0b' : '#0f766e'
  const label = phase === 'hold' ? 'Hold' : phase === 'rest' ? 'Relax' : 'Ready'

  return (
    <ProgressRing value={phase === 'idle' ? 0 : elapsed} size={196} stroke={12} color={color} track="#e2e8f0" instant>
      <div className="text-center" aria-live="polite">
        <span className={`block text-xs font-bold tracking-[0.2em] uppercase ${phase === 'rest' ? 'text-amber-600' : 'text-teal-700'}`}>{label}</span>
        <span className="block text-5xl font-bold text-slate-900 tabular-nums">{fmt(remainingMs, long)}</span>
        <span className="block text-xs text-slate-400">{phase === 'idle' ? (long ? 'minutes' : 'second hold') : running ? (long ? 'remaining' : 'seconds') : 'paused'}</span>
      </div>
    </ProgressRing>
  )
}
