import { useState } from 'react'
import type { ErgoCategoryId } from '@/types/recovery'
import { ERGO_CATEGORIES } from '@/data/ergonomics'
import { isErgoTaskDone, scheduledErgoTasks } from '@/lib/metrics'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card, SectionTitle } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { BreakCounter } from './BreakCounter'
import { ErgoCategoryCard } from './ErgoCategoryCard'

type Filter = 'mine' | 'all'

export function ErgoGuide() {
  const checklist = useRecoveryStore((s) => s.daily_log.ergonomics_checklist)
  const activeCats = useRecoveryStore((s) => s.program.active_ergo_categories)
  const [filter, setFilter] = useState<Filter>('mine')
  const [expanded, setExpanded] = useState<ErgoCategoryId | null>('desk')
  const { m, n } = useI18n()
  const t = m.ergoUi

  const isActive = (id: ErgoCategoryId) => ERGO_CATEGORIES.find((c) => c.id === id)?.core || activeCats.includes(id)
  const scheduled = scheduledErgoTasks(activeCats)
  const done = scheduled.filter((id) => isErgoTaskDone(checklist, id)).length
  const categories = filter === 'mine' ? ERGO_CATEGORIES.filter((c) => isActive(c.id)) : ERGO_CATEGORIES

  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        <ProgressRing value={scheduled.length ? done / scheduled.length : 0} size={60} stroke={6} label={t.tasksDone(done, scheduled.length)}>
          <span className="text-sm font-bold text-ink tabular-nums">
            {n(done)}/{n(scheduled.length)}
          </span>
        </ProgressRing>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-ink">{t.title}</h1>
          <p className="text-xs text-mute">{t.intro}</p>
        </div>
      </Card>

      <BreakCounter />

      <section>
        <SectionTitle
          title={t.activities}
          action={
            <div className="flex overflow-hidden rounded-xl border border-line text-[11px] font-bold tracking-[0.06em] uppercase" role="tablist" aria-label={t.filter}>
              {(['mine', 'all'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn('min-h-8 px-3 transition', filter === f ? 'bg-ink text-bg' : 'text-mute hover:text-ink')}
                >
                  {f === 'mine' ? t.mine : t.all(ERGO_CATEGORIES.length)}
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
            {t.browse} <span className="inline-block rtl:-scale-x-100">→</span>
          </button>
        )}
      </section>
    </div>
  )
}
