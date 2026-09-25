import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  DailyLog,
  EffortId,
  ErgoCategoryId,
  ExerciseId,
  ExerciseProgress,
  NdiAnswer,
  PainCheckin,
  RecoveryData,
} from '@/types/recovery'
import { DEFAULT_ACTIVE_CATEGORIES } from '@/data/ergonomics'
import { buildPlan, decidePlanLevel, mergeProgress, previousVas } from '@/lib/adaptive'
import { appToday } from '@/lib/date'
import { dailyCompliance, ndiScore } from '@/lib/metrics'
import { dayFromStart, dueNdiCheckpoint, phaseForDay, PROGRAM_DAYS } from '@/lib/program'
import { detectLang, type Lang } from '@/i18n/format'

export const STORAGE_KEY = 'spinesync:v1'

export interface Preferences {
  sound_enabled: boolean
  /** Demo clock: shifts "today" forward to preview program progression. */
  clock_offset_days: number
  language: Lang
}

export interface RecoveryState extends RecoveryData {
  preferences: Preferences
}

interface RecoveryActions {
  completeOnboarding: (opts: { start_date: string; active_ergo_categories: ErgoCategoryId[] }) => void
  submitCheckin: (checkin: PainCheckin) => void
  updateExercise: (id: ExerciseId, update: (p: ExerciseProgress) => ExerciseProgress) => void
  toggleErgoTask: (taskId: string) => void
  setBreaks: (count: number) => void
  toggleErgoCategory: (id: ErgoCategoryId) => void
  saveNdi: (answers: NdiAnswer[]) => void
  setSoundEnabled: (on: boolean) => void
  setLanguage: (lang: Lang) => void
  /** Roll the active log over when the calendar day changes. */
  syncDay: () => void
  simulateNextDay: () => void
  resetProgram: () => void
  importData: (data: unknown) => void
}

export type RecoveryStore = RecoveryState & RecoveryActions

const today = (s: Pick<RecoveryState, 'preferences'>) => appToday(s.preferences.clock_offset_days)

export function createEmptyLog(date: string, day: number): DailyLog {
  return {
    date,
    day,
    pain_checkin: null,
    adapted_plan_level: null,
    exercises_completed: [],
    ergonomics_checklist: { monitor_height_checked: false, hourly_breaks_count: 0, sleeping_position_adhered: false },
    daily_compliance_percentage: 0,
  }
}

function initialState(language: Lang = detectLang()): RecoveryState {
  const date = appToday()
  return {
    user_id: 'usr_local',
    current_day: 1,
    phase: 1,
    daily_log: createEmptyLog(date, 1),
    history: [],
    program: { start_date: date, duration_days: PROGRAM_DAYS, onboarded: false, active_ergo_categories: DEFAULT_ACTIVE_CATEGORIES },
    ndi_assessments: [],
    preferences: { sound_enabled: true, clock_offset_days: 0, language },
  }
}

const hasActivity = (log: DailyLog) =>
  log.pain_checkin !== null ||
  log.exercises_completed.some((e) => e.status !== 'pending') ||
  Object.entries(log.ergonomics_checklist).some(([k, v]) => (k === 'hourly_breaks_count' ? Number(v) > 0 : v === true))

/** Apply an update to today's log and recompute its compliance. */
function withLog(s: RecoveryState, update: (log: DailyLog) => DailyLog): Pick<RecoveryState, 'daily_log'> {
  const next = update(s.daily_log)
  return { daily_log: { ...next, daily_compliance_percentage: dailyCompliance(next, s.program.active_ergo_categories) } }
}

function rollover(s: RecoveryState): Partial<RecoveryState> | null {
  const date = today(s)
  const day = dayFromStart(s.program.start_date, date)
  const phase = phaseForDay(day)
  if (s.daily_log.date === date) {
    return s.current_day === day && s.phase === phase ? null : { current_day: day, phase, daily_log: { ...s.daily_log, day } }
  }
  const history = hasActivity(s.daily_log) ? [...s.history.filter((l) => l.date !== s.daily_log.date), s.daily_log] : s.history
  const fresh = createEmptyLog(date, day)
  return {
    history,
    current_day: day,
    phase,
    daily_log: { ...fresh, daily_compliance_percentage: dailyCompliance(fresh, s.program.active_ergo_categories) },
  }
}

/** v1 stored effort notes as English text; v2 stores translatable ids. */
const LEGACY_EFFORT: Record<string, EffortId> = {
  'Very gentle': 'very_gentle',
  'Non-resisted': 'non_resisted',
  '50% effort': 'half',
  'Full effort': 'full',
}

function migrateEffortNotes<T extends RecoveryData>(data: T): T {
  const fixLog = (log: DailyLog): DailyLog => ({
    ...log,
    exercises_completed: log.exercises_completed.map((e) => {
      const id = e.effort_note && LEGACY_EFFORT[e.effort_note]
      return id ? { ...e, effort_note: id } : e
    }),
  })
  return { ...data, daily_log: fixLog(data.daily_log), history: data.history.map(fixLog) }
}

function isRecoveryData(x: unknown): x is RecoveryData {
  if (!x || typeof x !== 'object') return false
  const d = x as Partial<RecoveryData>
  return (
    typeof d.user_id === 'string' &&
    typeof d.current_day === 'number' &&
    typeof d.daily_log === 'object' &&
    Array.isArray(d.history) &&
    typeof d.program?.start_date === 'string' &&
    Array.isArray(d.ndi_assessments)
  )
}

export const useRecoveryStore = create<RecoveryStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      completeOnboarding: ({ start_date, active_ergo_categories }) => {
        set((s) => ({ program: { ...s.program, start_date, active_ergo_categories, onboarded: true } }))
        get().syncDay()
      },

      submitCheckin: (checkin) =>
        set((s) => {
          const level = decidePlanLevel(checkin, previousVas(s.history, s.daily_log.date))
          const plan = buildPlan(level, s.phase)
          return withLog(s, (l) => ({
            ...l,
            pain_checkin: checkin,
            adapted_plan_level: level,
            exercises_completed: mergeProgress(plan, l.exercises_completed),
          }))
        }),

      updateExercise: (id, update) =>
        set((s) =>
          withLog(s, (l) => ({
            ...l,
            exercises_completed: l.exercises_completed.map((e) => (e.exercise_id === id ? update(e) : e)),
          })),
        ),

      toggleErgoTask: (taskId) =>
        set((s) =>
          withLog(s, (l) => ({
            ...l,
            ergonomics_checklist: { ...l.ergonomics_checklist, [taskId]: l.ergonomics_checklist[taskId] !== true },
          })),
        ),

      setBreaks: (count) =>
        set((s) =>
          withLog(s, (l) => ({
            ...l,
            ergonomics_checklist: { ...l.ergonomics_checklist, hourly_breaks_count: Math.max(0, Math.min(24, count)) },
          })),
        ),

      toggleErgoCategory: (id) =>
        set((s) => {
          const active = s.program.active_ergo_categories
          const program = {
            ...s.program,
            active_ergo_categories: active.includes(id) ? active.filter((c) => c !== id) : [...active, id],
          }
          const next = { ...s, program }
          return { program, ...withLog(next, (l) => l) }
        }),

      saveNdi: (answers) =>
        set((s) => {
          const checkpoint = dueNdiCheckpoint(s.current_day, s.ndi_assessments)
          const score = ndiScore(answers)
          if (checkpoint === null || score === null) return {}
          return {
            ndi_assessments: [
              ...s.ndi_assessments.filter((a) => a.checkpoint !== checkpoint),
              { checkpoint, day: s.current_day, date: s.daily_log.date, answers, score_pct: score },
            ],
          }
        }),

      setSoundEnabled: (on) => set((s) => ({ preferences: { ...s.preferences, sound_enabled: on } })),

      setLanguage: (language) => set((s) => ({ preferences: { ...s.preferences, language } })),

      syncDay: () => {
        const patch = rollover(get())
        if (patch) set(patch)
      },

      simulateNextDay: () => {
        set((s) => ({ preferences: { ...s.preferences, clock_offset_days: s.preferences.clock_offset_days + 1 } }))
        get().syncDay()
      },

      resetProgram: () => set((s) => initialState(s.preferences.language)),

      importData: (data) => {
        if (!isRecoveryData(data)) throw new Error('This file is not a valid SpineSync export.')
        const prefs = (data as Partial<RecoveryState>).preferences
        set((s) => ({
          ...migrateEffortNotes(data),
          preferences: {
            sound_enabled: prefs?.sound_enabled ?? true,
            clock_offset_days: prefs?.clock_offset_days ?? 0,
            language: s.preferences.language,
          },
        }))
        get().syncDay()
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted, version) => {
        const s = persisted as RecoveryState
        if (version < 2) {
          return { ...migrateEffortNotes(s), preferences: { ...s.preferences, language: detectLang() } }
        }
        return s
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s): RecoveryState => ({
        user_id: s.user_id,
        current_day: s.current_day,
        phase: s.phase,
        daily_log: s.daily_log,
        history: s.history,
        program: s.program,
        ndi_assessments: s.ndi_assessments,
        preferences: s.preferences,
      }),
    },
  ),
)

/** Snapshot of persisted data only (for export and the coach). */
export function selectData(s: RecoveryStore): RecoveryState {
  const { user_id, current_day, phase, daily_log, history, program, ndi_assessments, preferences } = s
  return { user_id, current_day, phase, daily_log, history, program, ndi_assessments, preferences }
}
