import { useState } from 'react'
import type { ErgoCategoryId } from '@/types/recovery'
import { ERGO_CATEGORIES } from '@/data/ergonomics'
import { isErgoTaskDone, scheduledErgoTasks } from '@/lib/metrics'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card, SectionTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/components/ui/cn'
import { BreakCounter } from './BreakCounter'
import { ErgoCategoryCard } from './ErgoCategoryCard'

type Filter = 'mine' | 'all'

export function ErgoGuide() {
  const checklist = useRecoveryStore((s) => s.daily_log.ergonomics_checklist)
  const activeCats = useRecoveryStore((s) => s.program.active_ergo_categories)
  const [filter, setFilter] = useState<Filter>('mine')
  const [expanded, setExpanded] = useState<ErgoCategoryId | null>('desk')

  const isActive = (id: ErgoCategoryId) => ERGO_CATEGORIES.find((c) => c.id === id)?.core || activeCats.includes(id)
  const scheduled = scheduledErgoTasks(activeCats)
  const done = scheduled.filter((id) => isErgoTaskDone(checklist, id)).length
  const categories = filter === 'mine' ? ERGO_CATEGORIES.filter((c) => isActive(c.id)) : ERGO_CATEGORIES

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        <ProgressRing value={scheduled.length ? done / scheduled.length : 0} size={60} stroke={6} label={`${done} of ${scheduled.length} ergonomic tasks done`}>
          <span className="text-sm font-bold text-ink tabular-nums">
            {done}/{scheduled.length}
          </span>
        </ProgressRing>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-ink">Lifestyle & ergonomics</h1>
          <p className="text-xs text-mute">Small posture habits throughout the day protect your disc more than any single exercise.</p>
        </div>
      </Card>

      <BreakCounter />

      <section>
        <SectionTitle
          title="Daily activities"
          action={
            <div className="flex overflow-hidden rounded-xl border border-line text-[11px] font-bold tracking-[0.06em] uppercase" role="tablist" aria-label="Filter categories">
              {(['mine', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn('min-h-8 px-3 transition', filter === f ? 'bg-ink text-bg' : 'text-mute hover:text-ink')}
                >
                  {f === 'mine' ? 'My day' : 'All 10'}
                </button>
              ))}
            </div>
          }
        />
        <ul className="space-y-2">
          {categories.map((c) => (
            <ErgoCategoryCard
              key={c.id}
              category={c}
              active={!!isActive(c.id)}
              expanded={expanded === c.id}
              onExpand={() => setExpanded((e) => (e === c.id ? null : c.id))}
            />
          ))}
        </ul>
        {filter === 'mine' && (
          <button type="button" onClick={() => setFilter('all')} className="mt-3 w-full rounded-xl border border-dashed border-line-strong py-3 text-xs font-semibold text-brand hover:bg-panel">
            Browse driving, cooking, travel, childcare and more →
          </button>
        )}
      </section>
    </div>
  )
}
