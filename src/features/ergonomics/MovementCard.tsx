import { Check, Footprints } from 'lucide-react'
import { BREAK_GOAL } from '@/data/ergonomics'
import { msUntilBreak } from '@/lib/workMode'
import { useNow } from '@/hooks/useNow'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { WorkModeSection } from './WorkModeSection'

/** One home for movement breaks: footprints fill in toward the daily goal, plus Work mode, which logs breaks for you. */
export function MovementCard() {
  const count = useRecoveryStore((s) => s.daily_log.ergonomics_checklist.hourly_breaks_count)
  const setBreaks = useRecoveryStore((s) => s.setBreaks)
  const session = useRecoveryStore((s) => s.work_session)
  const now = useNow(session !== null)
  const due = session !== null && msUntilBreak(session, now) <= 0
  const met = count >= BREAK_GOAL
  const { m, n } = useI18n()
  const t = m.ergoUi
  const pips = Math.max(BREAK_GOAL, count)

  return (
    <Card className={cn('transition-colors', due && 'border-info/60')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            {t.breaksTitle}
            {met && <Check className="size-4 text-success" strokeWidth={3} aria-label={t.goalMet} />}
          </h2>
          {/* Goal pips: one footprint per break, the first BREAK_GOAL outlined until filled. */}
          <div className="mt-2 flex flex-wrap gap-1.5" role="img" aria-label={`${n(count)}/${n(BREAK_GOAL)}`}>
            {Array.from({ length: pips }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'grid size-7 place-items-center rounded-full transition-colors duration-300',
                  i < count ? (i < BREAK_GOAL ? 'bg-brand text-bg' : 'bg-success text-bg') : 'border border-dashed border-line-strong text-dim',
                )}
              >
                <Footprints className="size-3.5" aria-hidden />
              </span>
            ))}
          </div>
        </div>
        <Stepper value={count} onChange={setBreaks} label={t.breaksLabel} />
      </div>
      <div className="mt-4 border-t border-line/70 pt-4">
        <WorkModeSection />
      </div>
    </Card>
  )
}
