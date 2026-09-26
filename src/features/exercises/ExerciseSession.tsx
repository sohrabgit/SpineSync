import { useCallback, useState } from 'react'
import { ArrowRight, ChevronDown, ChevronsRight, CircleCheckBig, Info, Pause, Play, Plus, RotateCcw, SkipForward, Square, TriangleAlert, Volume2, VolumeX } from 'lucide-react'
import type { ExerciseId, SideId } from '@/types/recovery'
import { formatDose, isTimedActivity, sideForSet } from '@/data/exercises'
import { completeSet, logRep, markComplete, markSkipped, nextOpenExercise, resetProgress } from '@/lib/exerciseProgress'
import { playCue, primeAudio } from '@/lib/cues'
import { useHoldTimer } from '@/hooks/useHoldTimer'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'
import { ExerciseFigure } from '@/components/illustrations/NeckFigure'
import { useI18n } from '@/i18n'
import { BreathingOrb } from './BreathingOrb'
import { EXERCISE_ICONS } from './exerciseIcons'
import { useExerciseSheet } from './exerciseSheetStore'

/** Session sheet for one exercise. Finishing or skipping moves on to the next unfinished one, so the plan plays as a guided routine. */
export function ExerciseSession() {
  const exerciseId = useExerciseSheet((s) => s.openId)
  const open = useExerciseSheet((s) => s.open)
  const onClose = useExerciseSheet((s) => s.close)
  const exercises = useRecoveryStore((s) => s.daily_log.exercises_completed)
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  const { m } = useI18n()
  const progress = exercises.find((e) => e.exercise_id === exerciseId)
  if (!exerciseId || !progress) return null

  const def = m.exercises[exerciseId]
  const t = m.session
  const done = progress.status === 'completed'
  const next = nextOpenExercise(exercises, exerciseId)
  const advance = () => (next ? open(next.exercise_id) : onClose())
  const position = exercises.findIndex((e) => e.exercise_id === exerciseId) + 1

  return (
    <Sheet
      open
      onClose={onClose}
      bodyKey={exerciseId}
      title={def.name}
      subtitle={
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-ink/80">{t.position(position, exercises.length)}</span>
          <span aria-hidden>·</span>
          {formatDose(progress, m)}
          {progress.effort_note && <Badge tone="info">{m.effort[progress.effort_note]}</Badge>}
        </span>
      }
      footer={
        done ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => updateExercise(exerciseId, resetProgress)}>
              <RotateCcw className="size-4" /> {t.redo}
            </Button>
            <Button variant={next ? 'primary' : 'success'} className="min-w-0 flex-1" onClick={advance}>
              {next ? (
                <>
                  <span className="truncate">{t.nextUp(m.exercises[next.exercise_id].name)}</span> <ArrowRight className="size-4 shrink-0 rtl:-scale-x-100" />
                </>
              ) : (
                <>
                  <CircleCheckBig className="size-4" /> {t.finishRoutine}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                updateExercise(exerciseId, markSkipped)
                advance()
              }}
            >
              <SkipForward className="size-4 rtl:-scale-x-100" /> {t.skip}
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                updateExercise(exerciseId, markComplete)
                advance()
              }}
            >
              <CircleCheckBig className="size-4" /> {t.markComplete}
            </Button>
          </div>
        )
      }
    >
      <SessionTimer key={`${exerciseId}-${progress.hold_seconds}`} exerciseId={exerciseId} />

      <HowTo exerciseId={exerciseId} side={sideForSet(exerciseId, Math.min(progress.sets_done, progress.target_sets - 1))} />
    </Sheet>
  )
}

/**
 * Reference for the move, folded into one row so the sheet opens on the timer alone:
 * the animated figure, the steps and the safety notes appear only when expanded.
 * The sheet remounts its body per exercise, so each one opens collapsed.
 */
function HowTo({ exerciseId, side }: { exerciseId: ExerciseId; side?: SideId | null }) {
  const [open, setOpen] = useState(false)
  const { m, n } = useI18n()
  const t = m.session
  const def = m.exercises[exerciseId]
  return (
    <section className="mt-3 overflow-hidden rounded-2xl border border-line/60 bg-well">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-12 w-full items-center gap-2 px-4 text-sm font-semibold text-ink">
        <Info className="size-4 text-dim" aria-hidden />
        <span className="flex-1 text-start">{t.howTo}</span>
        <ChevronDown className={cn('size-4 text-dim transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className="animate-fade-in border-t border-line/60 px-4 pb-4">
          <div className="grid place-items-center pt-3">
            <ExerciseFigure pose={exerciseId} side={side} color={EXERCISE_ICONS[exerciseId].color} size={150} />
          </div>
          <ol className="mt-2 space-y-2">
            {def.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-ink/90">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/12 text-xs font-bold text-brand">{n(i + 1)}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div aria-label={t.safety} className="mt-4 flex gap-2.5 rounded-xl bg-warning/8 p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <ul className="space-y-0.5 text-xs text-ink/80">
              {[...def.cautions, t.stopRule].map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

function SessionTimer({ exerciseId }: { exerciseId: ExerciseId }) {
  const progress = useRecoveryStore((s) => s.daily_log.exercises_completed.find((e) => e.exercise_id === exerciseId))!
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  const sound = useRecoveryStore((s) => s.preferences.sound_enabled)
  const setSound = useRecoveryStore((s) => s.setSoundEnabled)
  const { m, n } = useI18n()
  const t = m.session
  const timed = isTimedActivity(exerciseId)
  const done = progress.status === 'completed'

  const onHoldComplete = useCallback(() => {
    const store = useRecoveryStore.getState()
    const current = store.daily_log.exercises_completed.find((e) => e.exercise_id === exerciseId)
    if (!current) return false
    const next = logRep(current)
    store.updateExercise(exerciseId, () => next)
    const setFinished = next.status === 'completed' || next.sets_done > current.sets_done
    playCue(setFinished ? 'set-done' : 'hold-end', store.preferences.sound_enabled)
    return !setFinished
  }, [exerciseId])

  const onHoldStart = useCallback(() => playCue('hold-start', useRecoveryStore.getState().preferences.sound_enabled), [])

  const timer = useHoldTimer({
    holdSeconds: progress.hold_seconds,
    restSeconds: timed ? 0 : progress.hold_seconds >= 20 ? 5 : 3,
    onHoldComplete,
    onHoldStart,
  })
  useWakeLock(timer.running)

  const setIndex = Math.min(progress.sets_done, progress.target_sets - 1)
  const side = sideForSet(exerciseId, setIndex)
  const started = progress.sets_done > 0 || progress.reps_done > 0
  const startLabel = timed ? (started ? t.restart : t.start) : started ? t.startNextSet : t.startSet

  return (
    <div className="flex flex-col items-center rounded-3xl border border-line/60 bg-well px-4 pt-5 pb-4">
      <div className="relative">
        <BreathingOrb phase={timer.phase} remainingMs={timer.remainingMs} durationMs={timer.durationMs} running={timer.running} />
        <button
          type="button"
          onClick={() => setSound(!sound)}
          className="absolute -top-1 -end-10 grid size-10 place-items-center rounded-full text-dim hover:bg-panel-2 hover:text-ink"
          aria-label={sound ? t.mute : t.unmute}
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
      </div>

      {!timed && (
        <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-panel-2 p-2">
            <p className="cap text-[10px] text-mute">{t.set}</p>
            <p className="text-lg font-bold text-ink tabular-nums">
              {n(done ? progress.target_sets : setIndex + 1)}
              <span className="text-sm font-medium text-dim">/{n(progress.target_sets)}</span>
            </p>
            {side && <p className="truncate text-[11px] font-semibold text-brand">{m.sides[side]}</p>}
          </div>
          <div className="rounded-xl bg-panel-2 p-2">
            <p className="cap text-[10px] text-mute">{t.rep}</p>
            <p className="text-lg font-bold text-ink tabular-nums">
              {n(progress.reps_done)}
              <span className="text-sm font-medium text-dim">/{n(progress.target_reps)}</span>
            </p>
          </div>
        </div>
      )}

      {done ? (
        <p className="mt-4 animate-pop text-sm font-semibold text-success">{t.allDone}</p>
      ) : (
        <div className="mt-4 flex w-full items-center justify-center gap-2">
          {!timer.running && timer.phase === 'idle' && (
            <Button
              className="min-w-40 flex-1"
              onClick={() => {
                primeAudio()
                timer.start()
              }}
            >
              <Play className="size-4 rtl:-scale-x-100" /> {startLabel}
            </Button>
          )}
          {timer.running && (
            <Button variant="secondary" className="flex-1" onClick={timer.pause}>
              <Pause className="size-4" /> {t.pause}
            </Button>
          )}
          {!timer.running && timer.phase !== 'idle' && (
            <>
              <Button className="flex-1" onClick={timer.resume}>
                <Play className="size-4 rtl:-scale-x-100" /> {t.resume}
              </Button>
              <Button variant="secondary" onClick={timer.stop} aria-label={t.stop}>
                <Square className="size-4" />
              </Button>
            </>
          )}
          {!timed && (
            <>
              <Button variant="secondary" onClick={() => updateExercise(exerciseId, logRep)} aria-label={t.logRep} title={t.logRep}>
                <Plus className="size-4" /> {t.rep}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  timer.stop()
                  updateExercise(exerciseId, completeSet)
                }}
                aria-label={t.finishSet}
                title={t.finishSet}
              >
                <ChevronsRight className="size-4 rtl:-scale-x-100" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
