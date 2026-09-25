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
          <p className="text-sm font-semibold text-slate-900">Movement breaks</p>
          <p className="text-xs text-slate-500">
            Goal: {BREAK_GOAL}+ today (ideally every hour) {met && <span className="font-semibold text-emerald-600">· Goal met</span>}
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
              i < count ? (i < BREAK_GOAL ? 'bg-teal-500' : 'bg-emerald-400') : i < BREAK_GOAL ? 'bg-teal-100' : 'bg-slate-100',
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-sky-50 p-2.5 text-xs text-sky-900">
        <Eye className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p>
          <strong>20-20-20:</strong> every 20 minutes, look at something 20 ft (6 m) away for 20 seconds. Add a few chin tucks each time.
        </p>
      </div>
    </Card>
  )
}
