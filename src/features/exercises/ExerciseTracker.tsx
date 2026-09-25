import { useState } from 'react'
import { ArrowRight, Dumbbell, ShieldAlert } from 'lucide-react'
import type { ExerciseId } from '@/types/recovery'
import { suppressedExercises, tierFor } from '@/lib/adaptive'
import { markComplete, resetProgress } from '@/lib/exerciseProgress'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import type { TabId } from '@/components/layout/tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { LEVEL_TONE } from '@/components/ui/tone'
import { useI18n } from '@/i18n'
import { ExerciseCard, SuppressedExerciseCard } from './ExerciseCard'
import { ExerciseSession } from './ExerciseSession'

export function ExerciseTracker({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const log = useRecoveryStore((s) => s.daily_log)
  const phase = useRecoveryStore((s) => s.phase)
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  const [openId, setOpenId] = useState<ExerciseId | null>(null)
  const { m } = useI18n()
  const t = m.exercisesUi

  const level = log.adapted_plan_level
  const exercises = log.exercises_completed

  if (!log.pain_checkin || !level) {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <div className="knob grid size-14 place-items-center bg-success text-bg">
          <Dumbbell className="size-7" strokeWidth={2.2} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-ink">{t.lockedTitle}</h1>
        <p className="mt-1 max-w-xs text-sm text-mute">{t.lockedBody}</p>
        <Button className="mt-5" onClick={() => onNavigate('today')}>
          {t.goToCheckin} <ArrowRight className="size-4 rtl:-scale-x-100" />
        </Button>
      </Card>
    )
  }

  const tier = tierFor(level, phase)
  const completed = exercises.filter((e) => e.status === 'completed').length
  const suppressed = suppressedExercises(level, phase)

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink">{t.title}</h1>
            <p className="text-xs text-mute">{tier !== null ? t.levelName(tier, m.tiers[tier]) : level === 'flare_up' ? t.restProtocol : t.paused}</p>
          </div>
          <Badge tone={LEVEL_TONE[level]} pulse={level === 'flare_up'}>
            {m.levels[level].short}
          </Badge>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel-2" aria-hidden>
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-success rtl:bg-gradient-to-l transition-all duration-500" style={{ width: `${exercises.length ? (completed / exercises.length) * 100 : 0}%` }} />
          </div>
          <span className="text-xs font-semibold text-mute tabular-nums">
            {t.doneCount(completed, exercises.length)}
          </span>
        </div>
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
              onOpen={() => setOpenId(e.exercise_id)}
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

      <ExerciseSession exerciseId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
