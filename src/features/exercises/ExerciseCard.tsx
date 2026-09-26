import { Check, Lock } from 'lucide-react'
import type { ExerciseId, ExerciseProgress } from '@/types/recovery'
import { formatDose } from '@/data/exercises'
import { progressFraction } from '@/lib/exerciseProgress'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { EXERCISE_ICONS } from './exerciseIcons'

const STATUS_TONE: Record<ExerciseProgress['status'], 'neutral' | 'info' | 'positive' | 'warning'> = {
  pending: 'neutral',
  in_progress: 'info',
  completed: 'positive',
  skipped: 'warning',
}

interface Props {
  progress: ExerciseProgress
  onOpen: () => void
  onToggleComplete: () => void
}

export function ExerciseCard({ progress, onOpen, onToggleComplete }: Props) {
  const { m } = useI18n()
  const t = m.exercisesUi
  const name = m.exercises[progress.exercise_id].name
  const { icon: Icon, color } = EXERCISE_ICONS[progress.exercise_id]
  const done = progress.status === 'completed'

  return (
    <li className={cn('flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300', done ? 'border-success/30 bg-success/[0.06]' : 'border-line/60 bg-panel')}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-start">
        <ProgressRing value={progressFraction(progress)} size={48} stroke={4} color={done ? '#72d39c' : color}>
          <span className={cn('knob grid size-9 place-items-center text-bg transition-opacity', done && 'opacity-60')} style={{ backgroundColor: color }}>
            <Icon className="size-4" strokeWidth={2.2} aria-hidden />
          </span>
        </ProgressRing>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm font-semibold', done ? 'text-mute line-through decoration-success/60' : 'text-ink')}>{name}</span>
          <span className="block truncate text-xs text-mute">
            {formatDose(progress, m)}
            {progress.effort_note ? ` · ${m.effort[progress.effort_note]}` : ''}
          </span>
          {/* "To do" is implied by the empty check circle; only call out states worth noticing. */}
          {(progress.status === 'in_progress' || progress.status === 'skipped') && (
            <span className="mt-1 flex items-center gap-2">
              <Badge tone={STATUS_TONE[progress.status]}>{t.status[progress.status]}</Badge>
              {progress.status === 'in_progress' && (
                <span className="text-[11px] text-mute tabular-nums">
                  {t.setOf(Math.min(progress.sets_done + 1, progress.target_sets), progress.target_sets)}
                </span>
              )}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={t.markToggle(name, done)}
        onClick={onToggleComplete}
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 active:scale-90',
          done ? 'knob border-success bg-success text-bg' : 'border-line-strong text-transparent hover:border-brand',
        )}
      >
        <Check className={cn('size-5 transition-transform duration-200', done ? 'scale-100' : 'scale-50')} strokeWidth={3} />
      </button>
    </li>
  )
}

export function SuppressedExerciseCard({ id, reason }: { id: ExerciseId; reason: string }) {
  const { m } = useI18n()
  const { icon: Icon } = EXERCISE_ICONS[id]
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-dashed border-line bg-well p-3 text-dim">
      <span className="grid size-12 place-items-center rounded-full bg-panel-2">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{m.exercises[id].name}</span>
        <span className="block text-xs">{reason}</span>
      </span>
      <Lock className="size-4" aria-label={m.exercisesUi.paused} />
    </li>
  )
}
