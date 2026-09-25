/**
 * SpineSync domain model.
 *
 * The persisted root (`RecoveryData`) follows the product JSON schema exactly
 * (`user_id`, `current_day`, `phase`, `daily_log`) and adds history, program
 * settings and NDI assessments alongside it as purely additive fields.
 */

// ─── Program ────────────────────────────────────────────────────────────────

export type Phase = 1 | 2 | 3 | 4

/** Exercise difficulty tier. 1–4 mirror the phases; 0 is the "Gentle" floor used when stepping down from phase 1. */
export type Tier = 0 | 1 | 2 | 3 | 4

export type PlanLevel = 'standard' | 'reduced' | 'flare_up' | 'medical_pause'

// ─── Pain check-in ──────────────────────────────────────────────────────────

export type RedFlagId =
  | 'bilateral_numbness'
  | 'gait_instability'
  | 'bowel_bladder'
  | 'intractable_pain'
  | 'motor_deficit'

export interface PainCheckin {
  /** Visual Analog Scale, 0 (no pain) – 10 (unbearable). */
  vas_score: number
  radiating_pain: boolean
  numbness_present: boolean
  /** Additive: red-flag symptoms reported during check-in (empty = none). */
  red_flags: RedFlagId[]
}

// ─── Exercises ──────────────────────────────────────────────────────────────

export type ExerciseId =
  | 'chin_tuck'
  | 'isometric_4way'
  | 'upper_trap_stretch'
  | 'scapular_retraction'
  | 'shoulder_rolls'
  | 'brisk_walk'
  | 'heat_therapy'
  | 'cold_therapy'
  | 'supported_rest'

export type ExerciseCategory = 'mobility' | 'isometric' | 'stretch' | 'strength' | 'cardio' | 'modality' | 'rest'

export interface ExerciseDefinition {
  id: ExerciseId
  name: string
  category: ExerciseCategory
  target: string
  steps: string[]
  cautions: string[]
  /** Labels cycled across sets, e.g. four isometric directions or left/right sides. */
  sides?: string[]
}

/** A dose prescription for one exercise at a given tier. */
export interface Prescription {
  exercise_id: ExerciseId
  /** Sets per side (effective sets = sets × sides). */
  sets: number
  reps: number
  hold_seconds: number
  effort_note?: string
}

export type ExerciseStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface ExerciseProgress {
  exercise_id: ExerciseId
  /** Effective sets completed (across sides). */
  sets_done: number
  /** Reps completed in the current set (stays at target on the final set). */
  reps_done: number
  status: ExerciseStatus
  // Additive: the prescription snapshot, so history stays accurate.
  target_sets: number
  target_reps: number
  hold_seconds: number
  effort_note?: string
}

// ─── Ergonomics ─────────────────────────────────────────────────────────────

export type ErgoCategoryId =
  | 'desk'
  | 'driving'
  | 'cooking'
  | 'bathing'
  | 'travel'
  | 'childcare'
  | 'sleep'
  | 'shopping'
  | 'intimacy'
  | 'devices'

export interface ErgoTask {
  id: string
  label: string
  detail?: string
}

export interface ErgoCategory {
  id: ErgoCategoryId
  name: string
  blurb: string
  /** Core categories are always part of the daily plan. */
  core: boolean
  tasks: ErgoTask[]
}

export type ErgonomicsChecklist = {
  monitor_height_checked: boolean
  hourly_breaks_count: number
  sleeping_position_adhered: boolean
} & { [taskId: string]: boolean | number }

// ─── Daily log ──────────────────────────────────────────────────────────────

export interface DailyLog {
  /** Local calendar date, YYYY-MM-DD. */
  date: string
  /** Additive: program day this log belongs to. */
  day: number
  /** Null until the morning check-in is submitted. */
  pain_checkin: PainCheckin | null
  adapted_plan_level: PlanLevel | null
  exercises_completed: ExerciseProgress[]
  ergonomics_checklist: ErgonomicsChecklist
  daily_compliance_percentage: number
}

// ─── NDI ────────────────────────────────────────────────────────────────────

export type NdiCheckpoint = 1 | 15 | 30

/** 0–5 per section, null when the section was skipped. */
export type NdiAnswer = 0 | 1 | 2 | 3 | 4 | 5 | null

export interface NdiAssessment {
  checkpoint: NdiCheckpoint
  day: number
  date: string
  answers: NdiAnswer[]
  score_pct: number
}

// ─── Root ───────────────────────────────────────────────────────────────────

export interface ProgramSettings {
  start_date: string
  duration_days: number
  onboarded: boolean
  active_ergo_categories: ErgoCategoryId[]
}

export interface RecoveryData {
  user_id: string
  current_day: number
  phase: Phase
  daily_log: DailyLog
  history: DailyLog[]
  program: ProgramSettings
  ndi_assessments: NdiAssessment[]
}
