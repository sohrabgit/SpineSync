import type { DailyLog, ExerciseId, ExerciseProgress, PainCheckin, Phase, PlanLevel, Prescription, Tier } from '@/types/recovery'
import { FLARE_PROTOCOL, MEDICAL_PAUSE_PROTOCOL, TIER_PROTOCOLS } from '@/data/protocols'
import { effectiveSets, FLARE_SUPPRESSED } from '@/data/exercises'

/** VAS at or above this value triggers Flare-Up Emergency Mode. */
export const FLARE_VAS_THRESHOLD = 7

/**
 * Adaptive exercise decision tree (playbook §8.2):
 *  red flags                       → medical_pause
 *  VAS ≥ 7 OR radiating arm pain   → flare_up
 *  VAS < 7 AND pain ↑ vs yesterday → reduced (step down one tier)
 *  otherwise                       → standard
 */
export function decidePlanLevel(checkin: PainCheckin, previousVas: number | null): PlanLevel {
  if (checkin.red_flags.length > 0) return 'medical_pause'
  if (checkin.vas_score >= FLARE_VAS_THRESHOLD || checkin.radiating_pain) return 'flare_up'
  if (previousVas !== null && checkin.vas_score > previousVas) return 'reduced'
  return 'standard'
}

/** Difficulty tier for a plan level, or null when the level uses a fixed protocol. */
export function tierFor(level: PlanLevel, phase: Phase): Tier | null {
  switch (level) {
    case 'standard':
      return phase
    case 'reduced':
      return (phase - 1) as Tier
    default:
      return null
  }
}

export function buildPlan(level: PlanLevel, phase: Phase): Prescription[] {
  if (level === 'flare_up') return FLARE_PROTOCOL
  if (level === 'medical_pause') return MEDICAL_PAUSE_PROTOCOL
  return TIER_PROTOCOLS[tierFor(level, phase) ?? phase]
}

/** Exercises from the phase's standard plan that are withheld today (shown greyed-out in the UI). */
export function suppressedExercises(level: PlanLevel | null, phase: Phase): ExerciseId[] {
  if (level !== 'flare_up' && level !== 'medical_pause') return []
  const standard = TIER_PROTOCOLS[phase].map((p) => p.exercise_id)
  return level === 'medical_pause' ? standard : standard.filter((id) => FLARE_SUPPRESSED.has(id))
}

export function toProgress(p: Prescription): ExerciseProgress {
  return {
    exercise_id: p.exercise_id,
    sets_done: 0,
    reps_done: 0,
    status: 'pending',
    target_sets: effectiveSets(p.exercise_id, p.sets),
    target_reps: p.reps,
    hold_seconds: p.hold_seconds,
    ...(p.effort_note ? { effort_note: p.effort_note } : {}),
  }
}

/**
 * Build today's exercise entries for a (possibly re-submitted) check-in,
 * carrying over progress for exercises that remain in the plan.
 */
export function mergeProgress(plan: Prescription[], existing: ExerciseProgress[]): ExerciseProgress[] {
  return plan.map((p) => {
    const fresh = toProgress(p)
    const prev = existing.find((e) => e.exercise_id === p.exercise_id)
    if (!prev || prev.status === 'pending') return fresh
    const sets_done = Math.min(prev.sets_done, fresh.target_sets)
    const done = prev.status === 'completed' || sets_done >= fresh.target_sets
    return {
      ...fresh,
      sets_done: done ? fresh.target_sets : sets_done,
      reps_done: done ? fresh.target_reps : Math.min(prev.reps_done, fresh.target_reps),
      status: done ? 'completed' : prev.status,
    }
  })
}

/** VAS from the most recent logged day before `beforeDate`. */
export function previousVas(logs: DailyLog[], beforeDate: string): number | null {
  const prior = logs
    .filter((l) => l.date < beforeDate && l.pain_checkin)
    .sort((a, b) => a.date.localeCompare(b.date))
  return prior[prior.length - 1]?.pain_checkin?.vas_score ?? null
}
