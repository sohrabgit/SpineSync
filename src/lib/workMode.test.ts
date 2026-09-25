import { describe, expect, it } from 'vitest'
import type { WorkSession } from '@/types/recovery'
import { eyeNudgeLeft, formatClock, isBreakDue, MINUTE_MS, msUntilBreak, nextBreakAt, nextEyeNudgeAt, sessionMinutes } from './workMode'

const T0 = 1_800_000_000_000
const session = (overrides: Partial<WorkSession> = {}): WorkSession => ({
  started_at: T0,
  interval_min: 45,
  eye_nudges: false,
  last_break_at: T0,
  snoozed_until: null,
  breaks: 0,
  last_eye_at: null,
  ...overrides,
})

describe('break timing', () => {
  it('is due one interval after the last break', () => {
    const s = session()
    expect(nextBreakAt(s)).toBe(T0 + 45 * MINUTE_MS)
    expect(isBreakDue(s, T0 + 44 * MINUTE_MS)).toBe(false)
    expect(isBreakDue(s, T0 + 45 * MINUTE_MS)).toBe(true)
    expect(msUntilBreak(s, T0 + 50 * MINUTE_MS)).toBe(-5 * MINUTE_MS)
  })

  it('restarts from the latest break', () => {
    expect(nextBreakAt(session({ last_break_at: T0 + 50 * MINUTE_MS }))).toBe(T0 + 95 * MINUTE_MS)
  })

  it('snoozing pushes the break back, but never pulls it forward', () => {
    expect(nextBreakAt(session({ snoozed_until: T0 + 60 * MINUTE_MS }))).toBe(T0 + 60 * MINUTE_MS)
    expect(nextBreakAt(session({ snoozed_until: T0 + 10 * MINUTE_MS }))).toBe(T0 + 45 * MINUTE_MS)
  })

  it('counts session minutes from the start', () => {
    expect(sessionMinutes(session(), T0 + 95 * MINUTE_MS)).toBe(95)
  })
})

describe('eye nudges', () => {
  it('are off unless enabled', () => {
    expect(nextEyeNudgeAt(session())).toBeNull()
  })

  it('come every 20 minutes after the last break or nudge', () => {
    expect(nextEyeNudgeAt(session({ eye_nudges: true }))).toBe(T0 + 20 * MINUTE_MS)
    expect(nextEyeNudgeAt(session({ eye_nudges: true, last_eye_at: T0 + 20 * MINUTE_MS }))).toBe(T0 + 40 * MINUTE_MS)
  })

  it('are skipped when a movement break is about to be due', () => {
    // 60 min interval: nudges at 20 and 40, but not at 60 where the break lands.
    expect(nextEyeNudgeAt(session({ eye_nudges: true, interval_min: 60, last_eye_at: T0 + 40 * MINUTE_MS }))).toBeNull()
    // 30 min interval: a nudge at 20 is fine, 40 would be after the break.
    expect(nextEyeNudgeAt(session({ eye_nudges: true, interval_min: 30, last_eye_at: T0 + 20 * MINUTE_MS }))).toBeNull()
  })

  it('run for 20 seconds', () => {
    const s = session({ eye_nudges: true, last_eye_at: T0 })
    expect(eyeNudgeLeft(s, T0 + 5000)).toBe(15_000)
    expect(eyeNudgeLeft(s, T0 + 25_000)).toBe(0)
  })
})

describe('formatClock', () => {
  it('formats minutes, hours and overdue time', () => {
    expect(formatClock(45 * MINUTE_MS)).toBe('45:00')
    expect(formatClock(61_500)).toBe('1:02')
    expect(formatClock(75 * MINUTE_MS)).toBe('1:15:00')
    expect(formatClock(-90_000)).toBe('1:30')
  })
})
