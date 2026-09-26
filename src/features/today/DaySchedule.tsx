import { useState } from 'react'
import { BedDouble, ChevronRight, Dumbbell, Monitor, Sunrise, Sunset, Utensils, type LucideIcon } from 'lucide-react'
import { DAILY_SCHEDULE, type ScheduleBlockId } from '@/data/schedule'
import { Sheet } from '@/components/ui/Sheet'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'

const BLOCK_ICONS: Record<ScheduleBlockId, LucideIcon> = {
  morning: Sunrise,
  work1: Monitor,
  lunch: Utensils,
  work2: Monitor,
  exercise: Dumbbell,
  evening: Sunset,
  sleep: BedDouble,
}

function currentBlockIndex(now: Date): number {
  const minutes = now.getHours() * 60 + now.getMinutes()
  let idx = -1
  DAILY_SCHEDULE.forEach((b, i) => {
    const [h, m] = b.time.split(':').map(Number)
    if (minutes >= (h ?? 0) * 60 + (m ?? 0)) idx = i
  })
  return idx
}

/** One row for what the routine says right now; the full day opens in a sheet. */
export function DaySchedule() {
  const [open, setOpen] = useState(false)
  const { m, n } = useI18n()
  const current = currentBlockIndex(new Date())
  const block = DAILY_SCHEDULE[Math.max(0, current)]!
  const Icon = BLOCK_ICONS[block.id]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-line/60 bg-panel p-3 text-start hover:border-line-strong"
        aria-label={`${m.routine.title}: ${m.schedule[block.id].title}`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/12 text-brand">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-mute tabular-nums">
            {current >= 0 ? m.routine.now : n(block.time)}
          </span>
          <span className="block truncate text-sm font-semibold text-ink">{m.schedule[block.id].title}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-dim rtl:-scale-x-100" aria-hidden />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={m.routine.title}>
        <ol className="relative pb-2">
          {DAILY_SCHEDULE.map((b, i) => {
            const isNow = i === current
            const copy = m.schedule[b.id]
            const BlockIcon = BLOCK_ICONS[b.id]
            return (
              <li key={b.id} className="relative flex gap-3 pb-3 last:pb-0">
                <span className={cn('w-11 shrink-0 pt-2.5 text-end text-xs font-semibold tabular-nums', isNow ? 'text-brand' : 'text-dim')}>{n(b.time)}</span>
                <div className="relative flex flex-col items-center">
                  <span className={cn('mt-1.5 grid size-8 place-items-center rounded-full', isNow ? 'bg-brand text-bg' : 'bg-panel-2 text-mute')}>
                    <BlockIcon className="size-4" aria-hidden />
                  </span>
                  <span className="mt-1 w-px flex-1 bg-line" />
                </div>
                <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2', isNow && 'bg-brand/10')}>
                  <p className="text-sm font-semibold text-ink">{copy.title}</p>
                  <ul className="mt-0.5 space-y-0.5 text-xs text-mute">
                    {copy.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>
      </Sheet>
    </>
  )
}
