import { useState } from 'react'
import type { ErgoCategoryId } from '@/types/recovery'
import { BREAKS_TASK_ID, ERGO_CATEGORIES } from '@/data/ergonomics'
import { isErgoTaskDone, scheduledErgoTasks } from '@/lib/metrics'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { SectionTitle } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { ErgoCategoryCard } from './ErgoCategoryCard'
import { MovementCard } from './MovementCard'

type Filter = 'mine' | 'all'

export function ErgoGuide() {
  const checklist = useRecoveryStore((s) => s.daily_log.ergonomics_checklist)
  const activeCats = useRecoveryStore((s) => s.program.active_ergo_categories)
  const [filter, setFilter] = useState<Filter>('mine')
  const [expanded, setExpanded] = useState<ErgoCategoryId | null>('desk')
  const { m } = useI18n()
  const t = m.ergoUi

  const isActive = (id: ErgoCategoryId) => ERGO_CATEGORIES.find((c) => c.id === id)?.core || activeCats.includes(id)
  // Breaks have their own card above, so the habit count leaves them out.
  const habits = scheduledErgoTasks(activeCats).filter((id) => id !== BREAKS_TASK_ID)
  const done = habits.filter((id) => isErgoTaskDone(checklist, id)).length
  const categories = filter === 'mine' ? ERGO_CATEGORIES.filter((c) => isActive(c.id)) : ERGO_CATEGORIES

  return (
    <div className="space-y-5">
      <p className="px-1 text-sm text-mute">{t.intro}</p>

      <MovementCard />

      <section>
        <SectionTitle
          title={t.habitsTitle(done, habits.length)}
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
