import { Check, Lock } from 'lucide-react'
import type { ExerciseId, ExerciseProgress } from '@/types/recovery'
import { formatDose, getExercise } from '@/data/exercises'
import { progressFraction } from '@/lib/exerciseProgress'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/components/ui/cn'
import { EXERCISE_ICONS } from './exerciseIcons'

const STATUS: Record<ExerciseProgress['status'], { label: string; tone: 'neutral' | 'info' | 'positive' | 'warning' }> = {
  pending: { label: 'To do', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'info' },
  completed: { label: 'Done', tone: 'positive' },
  skipped: { label: 'Skipped', tone: 'warning' },
}

interface Props {
  progress: ExerciseProgress
  onOpen: () => void
  onToggleComplete: () => void
}

export function ExerciseCard({ progress, onOpen, onToggleComplete }: Props) {
  const def = getExercise(progress.exercise_id)
  const { icon: Icon, bg, fg } = EXERCISE_ICONS[progress.exercise_id]
  const done = progress.status === 'completed'
  const status = STATUS[progress.status]

  return (
    <li className={cn('flex items-center gap-3 rounded-2xl border bg-white p-3 transition-all duration-300', done ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200/80 shadow-sm')}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <ProgressRing value={progressFraction(progress)} size={48} stroke={4} color={done ? '#059669' : '#0f766e'}>
          <span className={cn('grid size-9 place-items-center rounded-full', bg)}>
            <Icon className={cn('size-4', fg)} aria-hidden />
          </span>
        </ProgressRing>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm font-semibold', done ? 'text-slate-500 line-through decoration-emerald-400/70' : 'text-slate-900')}>{def.name}</span>
          <span className="block truncate text-xs text-slate-500">
            {formatDose(progress)}
            {progress.effort_note ? ` · ${progress.effort_note}` : ''}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            {progress.status === 'in_progress' && (
              <span className="text-[11px] text-slate-500 tabular-nums">
                Set {Math.min(progress.sets_done + 1, progress.target_sets)}/{progress.target_sets}
              </span>
            )}
          </span>
        </span>
      </button>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Mark ${def.name} ${done ? 'not done' : 'done'}`}
        onClick={onToggleComplete}
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 active:scale-90',
          done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-teal-500',
        )}
      >
        <Check className={cn('size-5 transition-transform duration-200', done ? 'scale-100' : 'scale-50')} strokeWidth={3} />
      </button>
    </li>
  )
}

export function SuppressedExerciseCard({ id, reason }: { id: ExerciseId; reason: string }) {
  const def = getExercise(id)
  const { icon: Icon } = EXERCISE_ICONS[id]
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-slate-400">
      <span className="grid size-12 place-items-center rounded-full bg-slate-100">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{def.name}</span>
        <span className="block text-xs">{reason}</span>
      </span>
      <Lock className="size-4" aria-label="Paused" />
    </li>
  )
}
