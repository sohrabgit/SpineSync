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
