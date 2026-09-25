import { useCallback } from 'react'
import { CircleCheckBig, Pause, Play, Plus, RotateCcw, SkipForward, Square, TriangleAlert, Volume2, VolumeX } from 'lucide-react'
import type { ExerciseId } from '@/types/recovery'
import { formatDose, getExercise, isTimedActivity, sideForSet } from '@/data/exercises'
import { completeSet, logRep, markComplete, markSkipped, resetProgress } from '@/lib/exerciseProgress'
import { playCue, primeAudio } from '@/lib/cues'
import { useHoldTimer } from '@/hooks/useHoldTimer'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { HoldTimerRing } from './HoldTimerRing'

export function ExerciseSession({ exerciseId, onClose }: { exerciseId: ExerciseId | null; onClose: () => void }) {
  const progress = useRecoveryStore((s) => s.daily_log.exercises_completed.find((e) => e.exercise_id === exerciseId))
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  if (!exerciseId || !progress) return null

  const def = getExercise(exerciseId)
  const done = progress.status === 'completed'

  return (
    <Sheet
      open
      onClose={onClose}
      title={def.name}
      subtitle={
        <span className="flex flex-wrap items-center gap-1.5">
          {formatDose(progress)}
          {progress.effort_note && <Badge tone="info">{progress.effort_note}</Badge>}
        </span>
      }
      footer={
        done ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => updateExercise(exerciseId, resetProgress)}>
              <RotateCcw className="size-4" /> Redo
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={onClose}>
              <CircleCheckBig className="size-4" /> Completed
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                updateExercise(exerciseId, markSkipped)
                onClose()
              }}
            >
              <SkipForward className="size-4" /> Skip
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                updateExercise(exerciseId, markComplete)
                onClose()
              }}
            >
              <CircleCheckBig className="size-4" /> Mark complete
            </Button>
          </div>
        )
      }
    >
      <SessionTimer key={`${exerciseId}-${progress.hold_seconds}`} exerciseId={exerciseId} />

      <section className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">How to do it</h3>
        <p className="mt-0.5 text-xs text-slate-500">{def.target}</p>
        <ol className="mt-3 space-y-2">
          {def.steps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-slate-700">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-4 rounded-xl bg-amber-50 p-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <TriangleAlert className="size-3.5" /> Safety
        </h3>
        <ul className="mt-1 space-y-0.5 text-xs text-amber-900/90">
          {def.cautions.map((c) => (
            <li key={c}>• {c}</li>
          ))}
          <li>• Stop straight away if pain spreads into your arm or gets sharply worse.</li>
        </ul>
      </section>
    </Sheet>
  )
}

function SessionTimer({ exerciseId }: { exerciseId: ExerciseId }) {
  const progress = useRecoveryStore((s) => s.daily_log.exercises_completed.find((e) => e.exercise_id === exerciseId))!
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  const sound = useRecoveryStore((s) => s.preferences.sound_enabled)
  const setSound = useRecoveryStore((s) => s.setSoundEnabled)
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

  return (
    <div className="flex flex-col items-center rounded-3xl bg-slate-50 px-4 pt-5 pb-4">
      <div className="relative">
        <HoldTimerRing phase={timer.phase} remainingMs={timer.remainingMs} durationMs={timer.durationMs} running={timer.running} />
        <button
          type="button"
          onClick={() => setSound(!sound)}
          className="absolute -top-1 -right-10 grid size-10 place-items-center rounded-full text-slate-400 hover:bg-slate-200/60"
          aria-label={sound ? 'Mute sounds' : 'Unmute sounds'}
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
      </div>

      {!timed && (
        <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-white p-2">
            <p className="text-[11px] text-slate-500">Set</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {done ? progress.target_sets : setIndex + 1}
              <span className="text-sm font-medium text-slate-400">/{progress.target_sets}</span>
            </p>
            {side && <p className="truncate text-[11px] font-semibold text-teal-700">{side}</p>}
          </div>
          <div className="rounded-xl bg-white p-2">
            <p className="text-[11px] text-slate-500">Rep</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {progress.reps_done}
              <span className="text-sm font-medium text-slate-400">/{progress.target_reps}</span>
            </p>
          </div>
        </div>
      )}

      {done ? (
        <p className="mt-4 animate-pop text-sm font-semibold text-emerald-700">Nice work, all done for today.</p>
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
              <Play className="size-4" /> {progress.sets_done > 0 || progress.reps_done > 0 ? (timed ? 'Restart' : 'Start next') : 'Start'}
              {!timed && ' set'}
            </Button>
          )}
          {timer.running && (
            <Button variant="secondary" className="flex-1" onClick={timer.pause}>
              <Pause className="size-4" /> Pause
            </Button>
          )}
          {!timer.running && timer.phase !== 'idle' && (
            <>
              <Button className="flex-1" onClick={timer.resume}>
                <Play className="size-4" /> Resume
              </Button>
              <Button variant="secondary" onClick={timer.stop} aria-label="Stop timer">
                <Square className="size-4" />
              </Button>
            </>
          )}
          {!timed && (
            <Button variant="secondary" onClick={() => updateExercise(exerciseId, logRep)} aria-label="Log one rep manually">
              <Plus className="size-4" /> Rep
            </Button>
          )}
        </div>
      )}
      {!timed && !done && (
        <button
          type="button"
          onClick={() => {
            timer.stop()
            updateExercise(exerciseId, completeSet)
          }}
          className="mt-2 min-h-10 text-xs font-semibold text-teal-700"
        >
          Finish this set now
        </button>
      )}
    </div>
  )
}
