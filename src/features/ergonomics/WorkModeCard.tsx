import { useState } from 'react'
import { Eye, Footprints, Laptop, Play, Square } from 'lucide-react'
import type { BreakInterval, WorkSession } from '@/types/recovery'
import { eyeNudgeLeft, formatClock, MINUTE_MS, msUntilBreak, sessionMinutes, SNOOZE_MIN } from '@/lib/workMode'
import { primeAudio } from '@/lib/cues'
import { useNow } from '@/hooks/useNow'
import { requestNotifications } from '@/hooks/useWorkModeAlerts'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { useBreakSheet } from './breakSheetStore'

/** 1 min is a dev-only interval for testing reminders. */
const INTERVALS: BreakInterval[] = import.meta.env.DEV ? [1, 30, 45, 60] : [30, 45, 60]

const INFO = '#7fa9f5'

export function WorkModeCard() {
  const session = useRecoveryStore((s) => s.work_session)
  return session ? <ActiveSession session={session} /> : <StartSession />
}

function StartSession() {
  const prefs = useRecoveryStore((s) => s.preferences)
  const startWork = useRecoveryStore((s) => s.startWork)
  const [choice, setChoice] = useState<BreakInterval>(INTERVALS.includes(prefs.break_interval_min) ? prefs.break_interval_min : 45)
  const [eye, setEye] = useState(prefs.eye_nudges)
  const { m, n } = useI18n()
  const t = m.workMode

  const start = () => {
    primeAudio()
    requestNotifications()
    startWork(choice, eye)
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="knob grid size-10 shrink-0 place-items-center bg-info text-bg">
          <Laptop className="size-5" strokeWidth={2.2} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{t.title}</h2>
          <p className="text-xs text-mute">{t.intro}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p id="work-interval" className="text-xs font-semibold text-ink">
          {t.every}
        </p>
        <div role="radiogroup" aria-labelledby="work-interval" className="flex overflow-hidden rounded-xl border border-line text-xs font-bold">
          {INTERVALS.map((min) => (
            <button
              key={min}
              type="button"
              role="radio"
              aria-checked={choice === min}
              onClick={() => setChoice(min)}
              className={cn('min-h-9 px-3 tabular-nums transition', choice === min ? 'bg-ink text-bg' : 'text-mute hover:text-ink')}
            >
              {t.minutes(n(min))}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink">{t.eyeNudges}</p>
          <p className="text-[11px] text-mute">{t.eyeNudgesHint}</p>
        </div>
        <Toggle checked={eye} onChange={setEye} label={t.eyeNudges} />
      </div>

      <Button className="mt-4 w-full" onClick={start}>
        <Play className="size-4" aria-hidden />
        {t.start}
      </Button>
      <p className="mt-2 text-[11px] text-dim">{t.caveat}</p>
    </Card>
  )
}

function ActiveSession({ session }: { session: WorkSession }) {
  const now = useNow(true)
  const snoozeBreak = useRecoveryStore((s) => s.snoozeBreak)
  const endWork = useRecoveryStore((s) => s.endWork)
  const showBreak = useBreakSheet((s) => s.show)
  const { m, n } = useI18n()
  const t = m.workMode

  const left = msUntilBreak(session, now)
  const due = left <= 0
  const clock = n(formatClock(left))
  const minutes = sessionMinutes(session, now)
  const eyeLeft = eyeNudgeLeft(session, now)

  return (
    <Card className={cn('transition-colors', due && 'border-info/60')}>
      <div className="flex items-center gap-4">
        <ProgressRing value={due ? 1 : left / (session.interval_min * MINUTE_MS)} size={88} stroke={7} color={due ? INFO : undefined} instant label={t.countdownAria(clock)}>
          <span className={cn('text-base font-bold tabular-nums', due ? 'text-info' : 'text-ink')}>{due ? `+${clock}` : clock}</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="cap text-[11px] text-mute">{t.title}</p>
          <p className={cn('text-sm font-semibold', due ? 'text-info' : 'text-ink')}>{due ? t.timeToMove : t.nextBreak}</p>
          {due && <p className="text-xs text-mute">{t.overdueBy(clock)}</p>}
          <p className="mt-1 text-xs text-mute">{t.workingFor(t.duration(Math.floor(minutes / 60), minutes % 60))}</p>
          <p className="text-xs text-mute">{t.sessionBreaks(n(session.breaks))}</p>
        </div>
      </div>

      {eyeLeft > 0 && (
        <div className="mt-3 flex animate-fade-in items-center gap-2 rounded-xl bg-info/10 px-3 py-2 text-xs text-info">
          <Eye className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 font-semibold">{t.eyeNow}</span>
          <span className="tabular-nums">{t.eyeLeft(n(Math.ceil(eyeLeft / 1000)))}</span>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={showBreak}>
          <Footprints className="size-4" aria-hidden />
          {t.takeBreak}
        </Button>
        {due && (
          <Button variant="secondary" onClick={() => snoozeBreak(SNOOZE_MIN)} aria-label={t.snoozeAria(n(SNOOZE_MIN))}>
            {t.snooze(n(SNOOZE_MIN))}
          </Button>
        )}
        <Button variant="ghost" onClick={endWork} aria-label={t.end} title={t.end}>
          <Square className="size-4" aria-hidden />
        </Button>
      </div>
    </Card>
  )
}
