import { Eye } from 'lucide-react'
import { BREAK_GOAL } from '@/data/ergonomics'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'

export function BreakCounter() {
  const count = useRecoveryStore((s) => s.daily_log.ergonomics_checklist.hourly_breaks_count)
  const setBreaks = useRecoveryStore((s) => s.setBreaks)
  const met = count >= BREAK_GOAL
  const { m } = useI18n()
  const t = m.ergoUi
  const slots = Math.max(8, count)

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{t.breaksTitle}</p>
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
      <div className="mt-3 flex items-start gap-2 rounded-e-[12px] rounded-s-[4px] border-s-4 border-info bg-well p-2.5 text-xs text-ink/85">
        <Eye className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
        <p>
          <strong className="text-info">{t.rule}</strong> {t.ruleBody}
        </p>
      </div>
    </Card>
  )
}
