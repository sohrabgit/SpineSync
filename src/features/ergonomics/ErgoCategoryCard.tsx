import { Check, ChevronDown } from 'lucide-react'
import type { ErgoCategory } from '@/types/recovery'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/components/ui/cn'
import { CATEGORY_ICONS } from './categoryIcons'

interface Props {
  category: ErgoCategory
  active: boolean
  expanded: boolean
  onExpand: () => void
}

export function ErgoCategoryCard({ category, active, expanded, onExpand }: Props) {
  const checklist = useRecoveryStore((s) => s.daily_log.ergonomics_checklist)
  const toggleTask = useRecoveryStore((s) => s.toggleErgoTask)
  const toggleCategory = useRecoveryStore((s) => s.toggleErgoCategory)
  const Icon = CATEGORY_ICONS[category.id]
  const done = category.tasks.filter((t) => checklist[t.id] === true).length
  const allDone = active && done === category.tasks.length

  return (
    <li className={cn('overflow-hidden rounded-2xl border transition-colors', allDone ? 'border-success/40' : 'border-line/60', active ? 'bg-panel' : 'bg-well')}>
      <button type="button" onClick={onExpand} aria-expanded={expanded} className="flex w-full items-center gap-3 p-3 text-left">
        <span className={cn('knob grid size-11 shrink-0 place-items-center transition-colors', !active ? 'bg-panel-2 text-dim' : allDone ? 'bg-success text-bg' : 'bg-brand text-bg')}>
          <Icon className="size-5" strokeWidth={2.2} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">{category.name}</span>
            {category.core && <Badge tone="neutral">Core</Badge>}
          </span>
          <span className="block truncate text-xs text-mute">{category.blurb}</span>
        </span>
        {active ? (
          <span className={cn('text-xs font-semibold tabular-nums', allDone ? 'text-success' : 'text-mute')}>
            {done}/{category.tasks.length}
          </span>
        ) : (
          <span className="cap text-[10px] text-dim">Tips</span>
        )}
        <ChevronDown className={cn('size-4 text-dim transition-transform duration-200', expanded && 'rotate-180')} aria-hidden />
      </button>

      {expanded && (
        <div className="animate-fade-in border-t border-line/70 px-3 pt-2 pb-3">
          {!category.core && (
            <label className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-panel-2 px-3 py-2">
              <span className="text-xs text-mute">
                <span className="font-semibold text-ink">Part of my day</span> · adds these to your daily adherence
              </span>
              <Toggle checked={active} onChange={() => toggleCategory(category.id)} label={`Include ${category.name} in daily plan`} />
            </label>
          )}
          <ul className="space-y-1">
            {category.tasks.map((t) => {
              const checked = checklist[t.id] === true
              if (!active) {
                return (
                  <li key={t.id} className="flex gap-3 px-2 py-2 text-sm text-mute">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-dim" aria-hidden />
                    <span>
                      {t.label}
                      {t.detail && <span className="block text-xs text-dim">{t.detail}</span>}
                    </span>
                  </li>
                )
              }
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleTask(t.id)}
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-panel-2 active:bg-panel-2"
                  >
                    <span
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-md border-2 transition-all duration-200',
                        checked ? 'border-brand bg-brand text-bg' : 'border-line-strong text-transparent',
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm">
                      <span className={cn('transition-colors', checked ? 'text-dim line-through' : 'text-ink')}>{t.label}</span>
                      {t.detail && <span className="block text-xs text-dim">{t.detail}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </li>
  )
}
