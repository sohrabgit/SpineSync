import type { WorkSession } from '@/types/recovery'

/** Work mode timing. Everything is derived from wall-clock timestamps, so throttled background tabs stay accurate. */

export const MINUTE_MS = 60_000
/** 20-20-20 rule: every 20 minutes… */
export const EYE_INTERVAL_MS = 20 * MINUTE_MS
/** …look away for 20 seconds. */
export const EYE_NUDGE_MS = 20_000
/** Skip an eye nudge that would land this close to a movement break. */
const EYE_BREAK_GAP_MS = 2 * MINUTE_MS
/** How late an alert may fire and still be announced (e.g. after the tab was asleep). */
export const ALERT_GRACE_MS = MINUTE_MS
/** The coach calls out sitting once a break is this overdue. */
export const OVERDUE_NUDGE_MS = 15 * MINUTE_MS
export const SNOOZE_MIN = 15

export function nextBreakAt(s: WorkSession): number {
  return Math.max(s.last_break_at + s.interval_min * MINUTE_MS, s.snoozed_until ?? 0)
}

/** Milliseconds until the next break; negative once it is overdue. */
export function msUntilBreak(s: WorkSession, now: number): number {
  return nextBreakAt(s) - now
}

export function isBreakDue(s: WorkSession, now: number): boolean {
  return now >= nextBreakAt(s)
}

export function sessionMinutes(s: WorkSession, now: number): number {
  return Math.max(0, Math.round((now - s.started_at) / MINUTE_MS))
}

/** When the next eye nudge starts, or null when eye nudges are off or a movement break comes first. */
export function nextEyeNudgeAt(s: WorkSession): number | null {
  if (!s.eye_nudges) return null
  const at = Math.max(s.last_break_at, s.last_eye_at ?? 0) + EYE_INTERVAL_MS
  return at >= nextBreakAt(s) - EYE_BREAK_GAP_MS ? null : at
}

/** Milliseconds left in the current eye nudge, or 0 when none is running. */
export function eyeNudgeLeft(s: WorkSession, now: number): number {
  if (!s.eye_nudges || s.last_eye_at === null) return 0
  return Math.max(0, s.last_eye_at + EYE_NUDGE_MS - now)
}

/** `m:ss`, or `h:mm:ss` from an hour up. Uses the absolute value, so it also formats overdue time. */
export function formatClock(ms: number): string {
  const total = Math.ceil(Math.abs(ms) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}
