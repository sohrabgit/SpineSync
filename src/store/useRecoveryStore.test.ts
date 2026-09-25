import { beforeEach, describe, expect, it } from 'vitest'
import { migratePersisted, useRecoveryStore } from './useRecoveryStore'

const store = () => useRecoveryStore.getState()

describe('Work mode', () => {
  beforeEach(() => store().resetProgram())

  it('takeBreak logs a break and restarts the session timer', () => {
    store().startWork(45, true)
    const started = store().work_session!
    store().takeBreak()
    const s = store()
    expect(s.daily_log.ergonomics_checklist.hourly_breaks_count).toBe(1)
    expect(s.work_session!.breaks).toBe(1)
    expect(s.work_session!.last_break_at).toBeGreaterThanOrEqual(started.last_break_at)
    expect(s.preferences).toMatchObject({ break_interval_min: 45, eye_nudges: true })
  })

  it('takeBreak works without a session', () => {
    store().takeBreak()
    expect(store().daily_log.ergonomics_checklist.hourly_breaks_count).toBe(1)
    expect(store().work_session).toBeNull()
  })

  it('endWork credits the session minutes to today', () => {
    store().startWork(30, false)
    useRecoveryStore.setState((s) => ({ work_session: { ...s.work_session!, started_at: Date.now() - 90 * 60_000 } }))
    store().endWork()
    expect(store().work_session).toBeNull()
    expect(store().daily_log.work_minutes).toBe(90)
  })

  it('a new day ends the session and archives its minutes', () => {
    store().startWork(30, false)
    useRecoveryStore.setState((s) => ({ work_session: { ...s.work_session!, started_at: Date.now() - 60 * 60_000 } }))
    const yesterday = store().daily_log.date
    store().simulateNextDay()
    expect(store().work_session).toBeNull()
    expect(store().history.find((l) => l.date === yesterday)?.work_minutes).toBe(60)
  })

  it('logPostureCheck tallies flagged issues', () => {
    store().logPostureCheck(['screen'])
    store().logPostureCheck(['screen', 'chin'])
    expect(store().daily_log.posture_checks).toEqual({ total: 2, issues: { chin: 1, shoulders: 0, screen: 2 } })
  })
})

describe('migratePersisted', () => {
  it('adds Work mode defaults to v2 data', () => {
    const v2 = { ...store(), preferences: { sound_enabled: false, clock_offset_days: 0, language: 'fa' } } as unknown
    const migrated = migratePersisted(v2, 2)
    expect(migrated.work_session).toBeNull()
    expect(migrated.preferences).toEqual({ sound_enabled: false, clock_offset_days: 0, language: 'fa', break_interval_min: 45, eye_nudges: false })
  })
})
