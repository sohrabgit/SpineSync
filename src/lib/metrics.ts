import type { DailyLog, ErgoCategoryId, ErgonomicsChecklist, NdiAnswer } from '@/types/recovery'
import { BREAK_GOAL, BREAKS_TASK_ID, ERGO_CATEGORIES } from '@/data/ergonomics'

const round1 = (n: number) => Math.round(n * 10) / 10
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

// ─── NDI ────────────────────────────────────────────────────────────────────

/** NDI % = (sum of answered scores / (answered sections × 5)) × 100. Null when nothing answered. */
export function ndiScore(answers: NdiAnswer[]): number | null {
  const answered = answers.filter((a): a is Exclude<NdiAnswer, null> => a !== null)
  if (answered.length === 0) return null
  return round1((answered.reduce<number>((s, a) => s + a, 0) / (answered.length * 5)) * 100)
}

export type Tone = 'positive' | 'info' | 'warning' | 'critical'

export function ndiBand(score: number): { label: string; tone: Tone } {
  if (score < 10) return { label: 'No disability', tone: 'positive' }
  if (score < 30) return { label: 'Mild', tone: 'info' }
  if (score < 50) return { label: 'Moderate', tone: 'warning' }
  if (score < 70) return { label: 'Severe', tone: 'critical' }
  return { label: 'Complete', tone: 'critical' }
}

// ─── Compliance ─────────────────────────────────────────────────────────────

/** Ergonomic task ids scheduled today: every task in core + user-activated categories, plus the breaks goal. */
export function scheduledErgoTasks(activeCategories: ErgoCategoryId[]): string[] {
  const ids = ERGO_CATEGORIES.filter((c) => c.core || activeCategories.includes(c.id)).flatMap((c) => c.tasks.map((t) => t.id))
  return [...ids, BREAKS_TASK_ID]
}

export function isErgoTaskDone(checklist: ErgonomicsChecklist, taskId: string): boolean {
  if (taskId === BREAKS_TASK_ID) return checklist.hourly_breaks_count >= BREAK_GOAL
  return checklist[taskId] === true
}

/** ((completed exercises + checked ergonomic tasks) / total scheduled tasks) × 100, one decimal. */
export function dailyCompliance(log: DailyLog, activeCategories: ErgoCategoryId[]): number {
  const ergo = scheduledErgoTasks(activeCategories)
  const total = log.exercises_completed.length + ergo.length
  if (total === 0) return 0
  const done =
    log.exercises_completed.filter((e) => e.status === 'completed').length +
    ergo.filter((id) => isErgoTaskDone(log.ergonomics_checklist, id)).length
  return round1((done / total) * 100)
}

// ─── Pain & adherence trends ────────────────────────────────────────────────

export const checkedInLogs = (logs: DailyLog[]): DailyLog[] =>
  logs.filter((l) => l.pain_checkin !== null).sort((a, b) => a.day - b.day || a.date.localeCompare(b.date))

export interface PainDelta {
  baseline: number
  recent: number
  /** baseline − recent: positive = improvement. */
  delta: number
  window: number
}

/**
 * Pain Delta = mean(VAS of first 3 logged days) − mean(VAS of last 3 logged days).
 * With fewer than 6 logged days the window shrinks so baseline and recent never overlap.
 */
export function painDelta(logs: DailyLog[]): PainDelta | null {
  const vas = checkedInLogs(logs).map((l) => l.pain_checkin!.vas_score)
  if (vas.length < 2) return null
  const window = Math.min(3, Math.floor(vas.length / 2))
  const baseline = mean(vas.slice(0, window))
  const recent = mean(vas.slice(-window))
  return { baseline: round1(baseline), recent: round1(recent), delta: round1(baseline - recent), window }
}

export function averageAdherence(logs: DailyLog[]): number | null {
  const active = logs.filter((l) => l.pain_checkin !== null || l.daily_compliance_percentage > 0)
  return active.length ? round1(mean(active.map((l) => l.daily_compliance_percentage))) : null
}

/** Consecutive checked-in days ending today (or yesterday, if today isn't logged yet). */
export function checkinStreak(logs: DailyLog[], todayDay: number): number {
  const days = new Set(checkedInLogs(logs).map((l) => l.day))
  let d = days.has(todayDay) ? todayDay : todayDay - 1
  let streak = 0
  while (days.has(d)) {
    streak++
    d--
  }
  return streak
}

export function flareDayCount(logs: DailyLog[]): number {
  return logs.filter((l) => l.adapted_plan_level === 'flare_up' || l.adapted_plan_level === 'medical_pause').length
}
