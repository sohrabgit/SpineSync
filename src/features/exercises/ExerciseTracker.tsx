import { useState } from 'react'
import { ArrowRight, Dumbbell, ShieldAlert } from 'lucide-react'
import type { ExerciseId } from '@/types/recovery'
import { TIER_NAMES } from '@/data/protocols'
import { suppressedExercises, tierFor } from '@/lib/adaptive'
import { markComplete, resetProgress } from '@/lib/exerciseProgress'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import type { TabId } from '@/components/layout/tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { LEVEL_META } from '@/components/ui/tone'
import { ExerciseCard, SuppressedExerciseCard } from './ExerciseCard'
import { ExerciseSession } from './ExerciseSession'

export function ExerciseTracker({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const log = useRecoveryStore((s) => s.daily_log)
  const phase = useRecoveryStore((s) => s.phase)
  const updateExercise = useRecoveryStore((s) => s.updateExercise)
  const [openId, setOpenId] = useState<ExerciseId | null>(null)

  const level = log.adapted_plan_level
  const exercises = log.exercises_completed

  if (!log.pain_checkin || !level) {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Dumbbell className="size-7" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-900">Check in to unlock today’s plan</h1>
        <p className="mt-1 max-w-xs text-sm text-slate-500">Your pain score decides whether today is a standard, reduced or flare-up day.</p>
        <Button className="mt-5" onClick={() => onNavigate('today')}>
          Go to check-in <ArrowRight className="size-4" />
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
            <h1 className="text-lg font-bold text-slate-900">Today’s exercises</h1>
            <p className="text-xs text-slate-500">{tier !== null ? `Level ${tier} · ${TIER_NAMES[tier]}` : level === 'flare_up' ? 'Rest & modalities protocol' : 'Paused'}</p>
          </div>
          <Badge tone={LEVEL_META[level].tone} pulse={level === 'flare_up'}>
            {LEVEL_META[level].short}
          </Badge>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${exercises.length ? (completed / exercises.length) * 100 : 0}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-600 tabular-nums">
            {completed}/{exercises.length} done
          </span>
        </div>
      </Card>

      {level === 'medical_pause' && (
        <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <ShieldAlert className="size-5 shrink-0 text-rose-600" aria-hidden />
          <p>No exercises until a clinician has reviewed your symptoms. Rest with your neck supported.</p>
        </div>
      )}

      <section>
        <SectionTitle title={level === 'flare_up' ? 'Flare-up care' : 'Plan'} />
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
          <SectionTitle title="Paused today" />
          <ul className="space-y-2">
            {suppressed.map((id) => (
              <SuppressedExerciseCard key={id} id={id} reason={level === 'flare_up' ? 'Paused during flare-up' : 'Paused pending medical review'} />
            ))}
          </ul>
        </section>
      )}

      <ExerciseSession exerciseId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
