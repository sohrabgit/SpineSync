import { BREAK_GOAL } from '@/data/ergonomics'
import { msUntilBreak } from '@/lib/workMode'
import { useNow } from '@/hooks/useNow'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { WorkModeSection } from './WorkModeSection'

/** One home for movement breaks: today's count against the goal, plus Work mode, which logs breaks for you. */
export function MovementCard() {
  const count = useRecoveryStore((s) => s.daily_log.ergonomics_checklist.hourly_breaks_count)
  const setBreaks = useRecoveryStore((s) => s.setBreaks)
  const session = useRecoveryStore((s) => s.work_session)
  const now = useNow(session !== null)
  const due = session !== null && msUntilBreak(session, now) <= 0
  const met = count >= BREAK_GOAL
  const { m } = useI18n()
  const t = m.ergoUi
  const slots = Math.max(8, count)

  return (
    <Card className={cn('transition-colors', due && 'border-info/60')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{t.breaksTitle}</h2>
          <p className="text-xs text-mute">
            {t.breaksGoal(BREAK_GOAL)} {met && <span className="font-semibold text-success">{t.goalMet}</span>}
          </p>
        </div>
        <Stepper value={count} onChange={setBreaks} label={t.breaksLabel} />
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors duration-300',
              i < count ? (i < BREAK_GOAL ? 'bg-brand' : 'bg-success') : i < BREAK_GOAL ? 'bg-brand/20' : 'bg-panel-2',
            )}
          />
        ))}
      </div>
      <div className="mt-4 border-t border-line/70 pt-4">
        <WorkModeSection />
      </div>
    </Card>
  )
}
