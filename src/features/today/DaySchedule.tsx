import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { DAILY_SCHEDULE } from '@/data/schedule'
import { Card } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'

function currentBlockIndex(now: Date): number {
  const minutes = now.getHours() * 60 + now.getMinutes()
  let idx = -1
  DAILY_SCHEDULE.forEach((b, i) => {
    const [h, m] = b.time.split(':').map(Number)
    if (minutes >= (h ?? 0) * 60 + (m ?? 0)) idx = i
  })
  return idx
}

export function DaySchedule() {
  const [open, setOpen] = useState(false)
  const current = currentBlockIndex(new Date())
  const blocks = open ? DAILY_SCHEDULE : DAILY_SCHEDULE.filter((_, i) => i >= Math.max(0, current) && i <= Math.max(0, current) + 1)

  return (
    <Card className="p-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-4 pt-4 pb-2 text-left">
        <span className="text-sm font-semibold text-slate-900">Daily routine</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
          {open ? 'Show less' : 'Full day'}
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      <ol className="relative px-4 pb-4">
        {blocks.map((b) => {
          const i = DAILY_SCHEDULE.indexOf(b)
          const isNow = i === current
          return (
            <li key={b.time} className="relative flex gap-3 pb-3 last:pb-0">
              <div className="flex w-12 shrink-0 flex-col items-end">
                <span className={cn('text-xs font-semibold tabular-nums', isNow ? 'text-teal-700' : 'text-slate-400')}>{b.time}</span>
              </div>
              <div className="relative flex flex-col items-center">
                <span className={cn('mt-1 size-2.5 rounded-full ring-4', isNow ? 'bg-teal-600 ring-teal-100' : 'bg-slate-300 ring-transparent')} />
                <span className="mt-1 w-px flex-1 bg-slate-200" />
              </div>
              <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2', isNow && 'bg-teal-50')}>
                <p className={cn('text-sm font-semibold', isNow ? 'text-teal-900' : 'text-slate-800')}>
                  {b.title}
                  {isNow && <span className="ml-2 text-[10px] font-bold tracking-wide text-teal-600 uppercase">Now</span>}
                </p>
                <ul className="mt-0.5 space-y-0.5 text-xs text-slate-500">
                  {b.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
