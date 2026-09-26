import { Check, ChevronDown } from 'lucide-react'
import type { ErgoCategory } from '@/types/recovery'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { CATEGORY_ICONS, TASK_ICONS } from './categoryIcons'

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
  const { m, n } = useI18n()
  const ui = m.ergoUi
  const copy = m.ergoCategories[category.id]
  const done = category.tasks.filter((t) => checklist[t.id] === true).length
  const allDone = active && done === category.tasks.length

  return (
    <li className={cn('overflow-hidden rounded-2xl border transition-colors', allDone ? 'border-success/40' : 'border-line/60', active ? 'bg-panel' : 'bg-well')}>
      <button type="button" onClick={onExpand} aria-expanded={expanded} className="flex w-full items-center gap-3 p-3 text-start">
        <span className={cn('knob grid size-11 shrink-0 place-items-center transition-colors', !active ? 'bg-panel-2 text-dim' : allDone ? 'bg-success text-bg' : 'bg-brand text-bg')}>
          <Icon className="size-5" strokeWidth={2.2} aria-hidden />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{copy.name}</span>
        {active ? (
          <span className={cn('text-xs font-semibold tabular-nums', allDone ? 'text-success' : 'text-mute')}>
            {n(done)}/{n(category.tasks.length)}
          </span>
        ) : (
          <span className="cap text-[10px] text-dim">{ui.tips}</span>
        )}
        <ChevronDown className={cn('size-4 text-dim transition-transform duration-200', expanded && 'rotate-180')} aria-hidden />
      </button>

      {expanded && (
        <div className="animate-fade-in border-t border-line/70 px-3 pt-2 pb-3">
          {!category.core && (
            <label className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-panel-2 px-3 py-2">
              <span className="text-xs font-semibold text-ink">{ui.partOfDay}</span>
              <Toggle checked={active} onChange={() => toggleCategory(category.id)} label={ui.include(copy.name)} />
            </label>
          )}
          <ul className="space-y-1">
            {category.tasks.map((t) => {
              const checked = checklist[t.id] === true
              const task = m.ergoTasks[t.id]
              const TaskIcon = TASK_ICONS[t.id] ?? Icon
              if (!active) {
                return (
                  <li key={t.id} className="flex gap-3 px-2 py-2 text-sm text-mute">
                    <TaskIcon className="mt-0.5 size-4 shrink-0 text-dim" aria-hidden />
                    <span>
                      {task?.label}
                      {task?.detail && <span className="block text-xs text-dim">{task.detail}</span>}
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
                    className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-start transition hover:bg-panel-2 active:bg-panel-2"
                  >
                    {/* The habit's glyph doubles as its checkbox: it turns into a check when done. */}
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-200',
                        checked ? 'bg-brand text-bg' : 'border border-line-strong bg-panel-2 text-mute',
                      )}
                    >
                      {checked ? <Check className="size-4 animate-pop" strokeWidth={3} /> : <TaskIcon className="size-4" />}
                    </span>
                    <span className={cn('text-sm transition-colors', checked ? 'text-dim line-through' : 'text-ink')}>{task?.label}</span>
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
