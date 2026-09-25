import type { Prescription, Tier } from '@/types/recovery'

const MIN = 60

/**
 * Daily exercise protocol per difficulty tier (playbook §3).
 * Sets are per side/direction; timed activities use a single "set" whose hold is the duration.
 */
export const TIER_PROTOCOLS: Record<Tier, Prescription[]> = {
  0: [
    { exercise_id: 'shoulder_rolls', sets: 1, reps: 5, hold_seconds: 3 },
    { exercise_id: 'chin_tuck', sets: 2, reps: 5, hold_seconds: 5, effort_note: 'very_gentle' },
    { exercise_id: 'upper_trap_stretch', sets: 1, reps: 2, hold_seconds: 20 },
    { exercise_id: 'heat_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
  ],
  1: [
    { exercise_id: 'shoulder_rolls', sets: 1, reps: 5, hold_seconds: 3 },
    { exercise_id: 'chin_tuck', sets: 3, reps: 10, hold_seconds: 5, effort_note: 'non_resisted' },
    { exercise_id: 'upper_trap_stretch', sets: 1, reps: 3, hold_seconds: 20 },
    { exercise_id: 'heat_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
  ],
  2: [
    { exercise_id: 'chin_tuck', sets: 3, reps: 10, hold_seconds: 5 },
    { exercise_id: 'isometric_4way', sets: 2, reps: 10, hold_seconds: 5, effort_note: 'half' },
    { exercise_id: 'upper_trap_stretch', sets: 1, reps: 3, hold_seconds: 30 },
    { exercise_id: 'heat_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
  ],
  3: [
    { exercise_id: 'chin_tuck', sets: 3, reps: 10, hold_seconds: 5 },
    { exercise_id: 'isometric_4way', sets: 2, reps: 10, hold_seconds: 5, effort_note: 'full' },
    { exercise_id: 'scapular_retraction', sets: 3, reps: 10, hold_seconds: 5 },
    { exercise_id: 'upper_trap_stretch', sets: 1, reps: 3, hold_seconds: 30 },
    { exercise_id: 'heat_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
  ],
  4: [
    { exercise_id: 'chin_tuck', sets: 3, reps: 10, hold_seconds: 10 },
    { exercise_id: 'isometric_4way', sets: 2, reps: 10, hold_seconds: 10, effort_note: 'full' },
    { exercise_id: 'scapular_retraction', sets: 3, reps: 10, hold_seconds: 8 },
    { exercise_id: 'upper_trap_stretch', sets: 1, reps: 3, hold_seconds: 30 },
    { exercise_id: 'brisk_walk', sets: 1, reps: 1, hold_seconds: 15 * MIN },
    { exercise_id: 'heat_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
  ],
}

/** Flare-up: isometrics/strength suppressed; rest + cold/heat modalities only. */
export const FLARE_PROTOCOL: Prescription[] = [
  { exercise_id: 'cold_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
  { exercise_id: 'supported_rest', sets: 1, reps: 1, hold_seconds: 20 * MIN },
  { exercise_id: 'heat_therapy', sets: 1, reps: 1, hold_seconds: 15 * MIN },
]

/** Medical pause (red flags): exercises halted pending clinical review. */
export const MEDICAL_PAUSE_PROTOCOL: Prescription[] = [
  { exercise_id: 'supported_rest', sets: 1, reps: 1, hold_seconds: 20 * MIN },
]
