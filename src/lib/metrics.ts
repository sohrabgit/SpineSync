import type { DailyLog, ErgoCategoryId, ErgonomicsChecklist, NdiAnswer, PostureIssue } from '@/types/recovery'
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

export type NdiBandId = 'none' | 'mild' | 'moderate' | 'severe' | 'complete'

export function ndiBand(score: number): { id: NdiBandId; tone: Tone } {
  if (score < 10) return { id: 'none', tone: 'positive' }
  if (score < 30) return { id: 'mild', tone: 'info' }
  if (score < 50) return { id: 'moderate', tone: 'warning' }
  if (score < 70) return { id: 'severe', tone: 'critical' }
  return { id: 'complete', tone: 'critical' }
}

export type VasBandId = 'none' | 'mild' | 'moderate' | 'distressing' | 'severe' | 'unbearable'

export function vasBand(vas: number): VasBandId {
  if (vas === 0) return 'none'
  if (vas <= 2) return 'mild'
  if (vas <= 4) return 'moderate'
  if (vas <= 6) return 'distressing'
  if (vas <= 8) return 'severe'
  return 'unbearable'
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

// ─── Work mode & breaks ─────────────────────────────────────────────────────

const byDate = (logs: DailyLog[]) => [...logs].sort((a, b) => a.date.localeCompare(b.date))

export interface WorkBreakStats {
  hours: number
  breaks: number
  /** Movement breaks per hour of Work mode time. */
  perHour: number
}

/** Work time and break rate over the last `days` logs that include Work mode time. Null without any. */
export function workBreakStats(logs: DailyLog[], days = 7): WorkBreakStats | null {
  const worked = byDate(logs)
    .slice(-days)
    .filter((l) => (l.work_minutes ?? 0) > 0)
  const minutes = worked.reduce((sum, l) => sum + (l.work_minutes ?? 0), 0)
  if (minutes === 0) return null
  const breaks = worked.reduce((sum, l) => sum + l.ergonomics_checklist.hourly_breaks_count, 0)
  const hours = minutes / 60
  return { hours: round1(hours), breaks, perHour: round1(breaks / hours) }
}

export interface PostureSlip {
  issue: PostureIssue
  count: number
  total: number
}

/** The posture issue flagged most often in the last `days` logs. Null when nothing was flagged. */
export function postureSlip(logs: DailyLog[], days = 7): PostureSlip | null {
  const recent = byDate(logs).slice(-days)
  const total = recent.reduce((sum, l) => sum + (l.posture_checks?.total ?? 0), 0)
  const counts: Record<PostureIssue, number> = { chin: 0, shoulders: 0, screen: 0 }
  for (const l of recent) for (const k of Object.keys(counts) as PostureIssue[]) counts[k] += l.posture_checks?.issues[k] ?? 0
  const [issue, count] = (Object.entries(counts) as [PostureIssue, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))
  return count > 0 ? { issue, count, total } : null
}

export interface BreakPainLink {
  /** Mean next-morning VAS after days that met the break goal. */
  withGoal: number
  /** Mean next-morning VAS after days that did not. */
  withoutGoal: number
}

/** Minimum days in each group before the comparison is shown. */
const MIN_GROUP_DAYS = 3

/**
 * Compares next-morning pain after days that met the break goal vs days that didn't.
 * Uses the following day's check-in, since the check-in happens before that day's breaks.
 */
export function breakPainLink(logs: DailyLog[]): BreakPainLink | null {
  const vasByDay = new Map(checkedInLogs(logs).map((l) => [l.day, l.pain_checkin!.vas_score]))
  const met: number[] = []
  const missed: number[] = []
  for (const l of logs) {
    const next = vasByDay.get(l.day + 1)
    if (next === undefined) continue
    ;(l.ergonomics_checklist.hourly_breaks_count >= BREAK_GOAL ? met : missed).push(next)
  }
  if (met.length < MIN_GROUP_DAYS || missed.length < MIN_GROUP_DAYS) return null
  return { withGoal: round1(mean(met)), withoutGoal: round1(mean(missed)) }
}
