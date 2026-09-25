import { Eye } from 'lucide-react'
import { BREAK_GOAL } from '@/data/ergonomics'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/components/ui/cn'

export function BreakCounter() {
  const count = useRecoveryStore((s) => s.daily_log.ergonomics_checklist.hourly_breaks_count)
  const setBreaks = useRecoveryStore((s) => s.setBreaks)
  const met = count >= BREAK_GOAL
  const slots = Math.max(8, count)

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Movement breaks</p>
          <p className="text-xs text-mute">
            Goal: {BREAK_GOAL}+ today (ideally every hour) {met && <span className="font-semibold text-success">· Goal met</span>}
          </p>
        </div>
        <Stepper value={count} onChange={setBreaks} label="movement breaks" />
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
      <div className="mt-3 flex items-start gap-2 rounded-[4px_12px_12px_4px] border-l-4 border-info bg-well p-2.5 text-xs text-ink/85">
        <Eye className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
        <p>
          <strong className="text-info">20-20-20:</strong> every 20 minutes, look at something 20 ft (6 m) away for 20 seconds. Add a few chin tucks each time.
        </p>
      </div>
    </Card>
  )
}
