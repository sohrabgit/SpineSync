import { CircleCheckBig, Play, Radio, ShieldAlert } from 'lucide-react'
import { suppressedExercises, tierFor } from '@/lib/adaptive'
import { markComplete, nextOpenExercise, resetProgress } from '@/lib/exerciseProgress'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { useI18n } from '@/i18n'
import { DailyPainCheckin } from '@/features/today/DailyPainCheckin'
import { ExerciseCard, SuppressedExerciseCard } from './ExerciseCard'
import { useExerciseSheet } from './exerciseSheetStore'

export function ExerciseTracker() {
  const log = useRecoveryStore((s) => s.daily_log)
  const phase = useRecoveryStore((s) => s.phase)
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  const openSession = useExerciseSheet((s) => s.open)
  const { m } = useI18n()
  const t = m.exercisesUi

  const level = log.adapted_plan_level
  const exercises = log.exercises_completed

  // The plan depends on today's pain, so check in right here instead of bouncing to Today.
  if (!log.pain_checkin || !level) {
    return (
      <Card className="animate-fade-in">
        <div className="mb-1 flex items-center gap-2">
          <Radio className="size-4 text-brand" aria-hidden />
          <h2 className="text-base font-bold text-ink">{t.lockedTitle}</h2>
        </div>
        <p className="mb-4 text-xs text-mute">{t.lockedBody}</p>
        <DailyPainCheckin />
      </Card>
    )
  }

  const tier = tierFor(level, phase)
  const completed = exercises.filter((e) => e.status === 'completed').length
  const suppressed = suppressedExercises(level, phase)
  const next = nextOpenExercise(exercises)
  const started = exercises.some((e) => e.status !== 'pending')

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-ink">{tier !== null ? t.levelName(tier, m.tiers[tier]) : level === 'flare_up' ? t.restProtocol : t.paused}</p>
          <span className="text-xs font-semibold text-mute tabular-nums">{t.doneCount(completed, exercises.length)}</span>
        </div>
        {/* Why today's plan looks the way it does (standard, eased, flare-up or paused). */}
        <p className="mt-0.5 text-xs text-mute">{m.levels[level].description}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel-2" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-success transition-all duration-500 rtl:bg-gradient-to-l"
            style={{ width: `${exercises.length ? (completed / exercises.length) * 100 : 0}%` }}
          />
        </div>
        {level !== 'medical_pause' &&
          (next ? (
            <Button className="mt-4 w-full" onClick={() => openSession(next.exercise_id)}>
              <Play className="size-4 rtl:-scale-x-100" aria-hidden /> {started ? t.continueRoutine : t.startRoutine}
            </Button>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-success">
              <CircleCheckBig className="size-4" aria-hidden /> {t.allDone}
            </p>
          ))}
      </Card>

      {level === 'medical_pause' && (
        <div className="flex gap-3 rounded-2xl border border-danger/45 bg-danger/12 p-3 text-sm text-ink">
          <ShieldAlert className="size-5 shrink-0 text-danger" aria-hidden />
          <p>{t.noExercises}</p>
        </div>
      )}

      <section>
        <SectionTitle title={level === 'flare_up' ? t.flareCare : t.plan} />
        <ul className="space-y-2">
          {exercises.map((e) => (
            <ExerciseCard
              key={e.exercise_id}
              progress={e}
              onOpen={() => openSession(e.exercise_id)}
              onToggleComplete={() => updateExercise(e.exercise_id, e.status === 'completed' ? resetProgress : markComplete)}
            />
          ))}
        </ul>
      </section>

      {suppressed.length > 0 && (
        <section>
          <SectionTitle title={t.pausedToday} />
          <ul className="space-y-2">
            {suppressed.map((id) => (
              <SuppressedExerciseCard key={id} id={id} reason={level === 'flare_up' ? t.pausedFlare : t.pausedMedical} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
