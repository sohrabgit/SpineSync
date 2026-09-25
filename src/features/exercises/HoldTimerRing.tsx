import type { TimerPhase } from '@/hooks/useHoldTimer'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useI18n } from '@/i18n'

const fmt = (ms: number, long: boolean) => {
  const s = Math.ceil(ms / 1000)
  return long ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : String(s)
}

export function HoldTimerRing({ phase, remainingMs, durationMs, running }: { phase: TimerPhase; remainingMs: number; durationMs: number; running: boolean }) {
  const { m, n } = useI18n()
  const t = m.timer
  const long = durationMs >= 60_000
  const elapsed = durationMs > 0 ? 1 - remainingMs / durationMs : 0
  const color = phase === 'rest' ? '#f2c86b' : '#5cc8b0'
  const label = phase === 'hold' ? t.hold : phase === 'rest' ? t.relax : t.ready

  return (
    <ProgressRing value={phase === 'idle' ? 0 : elapsed} size={196} stroke={12} color={color} track="#2c3140" instant>
      <div className="text-center" aria-live="polite">
        <span className={`block text-xs font-bold tracking-[0.2em] uppercase ${phase === 'rest' ? 'text-warning' : 'text-brand'}`}>{label}</span>
        <span className="block text-5xl font-bold text-ink tabular-nums" dir="ltr">
          {n(fmt(remainingMs, long))}
        </span>
        <span className="block text-xs text-dim">{phase === 'idle' ? (long ? t.minutes : t.secondHold) : running ? (long ? t.remaining : t.seconds) : t.paused}</span>
      </div>
    </ProgressRing>
  )
}
