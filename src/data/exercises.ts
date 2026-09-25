import type { ExerciseDefinition, ExerciseId, SideId } from '@/types/recovery'
import type { Messages } from '@/i18n/en'

/** Exercise library — derived from playbook §3–§4. Copy lives in i18n (`m.exercises`). */
export const EXERCISES: Record<ExerciseId, ExerciseDefinition> = {
  chin_tuck: { id: 'chin_tuck', category: 'mobility' },
  isometric_4way: { id: 'isometric_4way', category: 'isometric', sides: ['forward', 'backward', 'right', 'left'] },
  upper_trap_stretch: { id: 'upper_trap_stretch', category: 'stretch', sides: ['right', 'left'] },
  scapular_retraction: { id: 'scapular_retraction', category: 'strength' },
  shoulder_rolls: { id: 'shoulder_rolls', category: 'mobility' },
  brisk_walk: { id: 'brisk_walk', category: 'cardio' },
  heat_therapy: { id: 'heat_therapy', category: 'modality' },
  cold_therapy: { id: 'cold_therapy', category: 'modality' },
  supported_rest: { id: 'supported_rest', category: 'rest' },
}

export const getExercise = (id: ExerciseId): ExerciseDefinition => EXERCISES[id]

/** Effective set count once per-side/direction repetition is applied. */
export function effectiveSets(id: ExerciseId, sets: number): number {
  return sets * (EXERCISES[id].sides?.length ?? 1)
}

/** Side/direction for a zero-based effective set index. */
export function sideForSet(id: ExerciseId, setIndex: number): SideId | undefined {
  const sides = EXERCISES[id].sides
  return sides ? sides[setIndex % sides.length] : undefined
}

/** Timed modalities/cardio are tracked as a single countdown rather than reps. */
export function isTimedActivity(id: ExerciseId): boolean {
  const c = EXERCISES[id].category
  return c === 'modality' || c === 'cardio' || c === 'rest'
}

/** Categories suppressed during a flare-up. */
export const FLARE_SUPPRESSED: ReadonlySet<ExerciseId> = new Set(['isometric_4way', 'scapular_retraction', 'brisk_walk'])

/** Human-readable dose, e.g. "2 × 10 each direction · 5 s hold" or "15 min". */
export function formatDose(
  p: { exercise_id: ExerciseId; target_sets: number; target_reps: number; hold_seconds: number },
  m: Messages,
): string {
  if (isTimedActivity(p.exercise_id)) return m.dose.minutes(Math.round(p.hold_seconds / 60))
  const sides = EXERCISES[p.exercise_id].sides
  const perSide = sides ? p.target_sets / sides.length : p.target_sets
  const per = sides ? (sides.length > 2 ? 'direction' : 'side') : null
  return m.dose.reps(perSide, p.target_reps, p.hold_seconds, per)
}
