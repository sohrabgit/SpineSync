import type { ExerciseProgress } from '@/types/recovery'

/** Pure state transitions for a single exercise's progress. */

export function completeSet(p: ExerciseProgress): ExerciseProgress {
  if (p.status === 'completed') return p
  const sets_done = p.sets_done + 1
  if (sets_done >= p.target_sets) {
    return { ...p, sets_done: p.target_sets, reps_done: p.target_reps, status: 'completed' }
  }
  return { ...p, sets_done, reps_done: 0, status: 'in_progress' }
}

export function logRep(p: ExerciseProgress): ExerciseProgress {
  if (p.status === 'completed') return p
  const reps_done = p.reps_done + 1
  if (reps_done >= p.target_reps) return completeSet(p)
  return { ...p, reps_done, status: 'in_progress' }
}

export function markComplete(p: ExerciseProgress): ExerciseProgress {
  return { ...p, sets_done: p.target_sets, reps_done: p.target_reps, status: 'completed' }
}

export function markSkipped(p: ExerciseProgress): ExerciseProgress {
  return { ...p, status: 'skipped' }
}

export function resetProgress(p: ExerciseProgress): ExerciseProgress {
  return { ...p, sets_done: 0, reps_done: 0, status: 'pending' }
}

/** 0–1 completion fraction across all reps. */
export function progressFraction(p: ExerciseProgress): number {
  if (p.status === 'completed') return 1
  const total = p.target_sets * p.target_reps
  return total === 0 ? 0 : (p.sets_done * p.target_reps + p.reps_done) / total
}

const isOpen = (p: ExerciseProgress) => p.status === 'pending' || p.status === 'in_progress'

/**
 * The exercise a guided routine should open next: the first unfinished one after
 * `afterId` in plan order, wrapping around to earlier ones. Never returns `afterId` itself.
 */
export function nextOpenExercise(list: ExerciseProgress[], afterId?: ExerciseProgress['exercise_id']): ExerciseProgress | undefined {
  const start = afterId ? list.findIndex((e) => e.exercise_id === afterId) + 1 : 0
  return [...list.slice(start), ...list.slice(0, start)].find((e) => isOpen(e) && e.exercise_id !== afterId)
}
