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
    <li className={cn('overflow-hidden rounded-2xl border bg-white transition-colors', allDone ? 'border-emerald-200' : 'border-slate-200/80', !active && 'bg-white/70')}>
      <button type="button" onClick={onExpand} aria-expanded={expanded} className="flex w-full items-center gap-3 p-3 text-left">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', active ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400')}>
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">{category.name}</span>
            {category.core && <Badge tone="neutral">Core</Badge>}
          </span>
          <span className="block truncate text-xs text-slate-500">{category.blurb}</span>
        </span>
        {active ? (
          <span className={cn('text-xs font-semibold tabular-nums', allDone ? 'text-emerald-600' : 'text-slate-500')}>
            {done}/{category.tasks.length}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">Tips</span>
        )}
        <ChevronDown className={cn('size-4 text-slate-400 transition-transform duration-200', expanded && 'rotate-180')} aria-hidden />
      </button>

      {expanded && (
        <div className="animate-fade-in border-t border-slate-100 px-3 pt-2 pb-3">
          {!category.core && (
            <label className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Part of my day</span> · adds these to your daily adherence
              </span>
              <Toggle checked={active} onChange={() => toggleCategory(category.id)} label={`Include ${category.name} in daily plan`} />
            </label>
          )}
          <ul className="space-y-1">
            {category.tasks.map((t) => {
              const checked = checklist[t.id] === true
              if (!active) {
                return (
                  <li key={t.id} className="flex gap-3 px-2 py-2 text-sm text-slate-600">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" aria-hidden />
                    <span>
                      {t.label}
                      {t.detail && <span className="block text-xs text-slate-400">{t.detail}</span>}
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
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-md border-2 transition-all duration-200',
                        checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300 text-transparent',
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm">
                      <span className={cn('transition-colors', checked ? 'text-slate-400 line-through' : 'text-slate-800')}>{t.label}</span>
                      {t.detail && <span className="block text-xs text-slate-400">{t.detail}</span>}
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
