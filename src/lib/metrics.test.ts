import { describe, expect, it } from 'vitest'
import { checkinStreak, dailyCompliance, ndiBand, ndiScore, painDelta, scheduledErgoTasks } from './metrics'
import { completeSet, logRep, markComplete } from './exerciseProgress'
import { buildPlan, toProgress } from './adaptive'
import { makeLog } from './testUtils'

describe('ndiScore', () => {
  it('computes percentage over answered sections only', () => {
    expect(ndiScore([5, 5, 5, 5, 5, 5, 5, 5, 5, 5])).toBe(100)
    expect(ndiScore([1, 2, null, 0, null, null, null, null, null, null])).toBe(20)
  })
  it('returns null when nothing answered', () => {
    expect(ndiScore(Array(10).fill(null))).toBeNull()
  })
  it('bands scores', () => {
    expect(ndiBand(8).id).toBe('none')
    expect(ndiBand(28).id).toBe('mild')
    expect(ndiBand(48).id).toBe('moderate')
  })
})

describe('dailyCompliance', () => {
  it('combines exercises and scheduled ergonomic tasks', () => {
    const ergoTotal = scheduledErgoTasks([]).length
    const exercises = buildPlan('standard', 1).map(toProgress)
    exercises[0] = markComplete(exercises[0]!)
    const log = makeLog(1, 3, {
      exercises_completed: exercises,
      ergonomics_checklist: { monitor_height_checked: true, hourly_breaks_count: 3, sleeping_position_adhered: false },
    })
    // 1 exercise + monitor + breaks goal
    const expected = Math.round((3 / (exercises.length + ergoTotal)) * 1000) / 10
    expect(dailyCompliance(log, [])).toBe(expected)
  })
  it('adds tasks from activated categories to the denominator', () => {
    expect(scheduledErgoTasks(['driving']).length).toBe(scheduledErgoTasks([]).length + 4)
  })
  it('ignores unscheduled categories so it never exceeds 100%', () => {
    const log = makeLog(1, 3, {
      ergonomics_checklist: { monitor_height_checked: true, hourly_breaks_count: 9, sleeping_position_adhered: true, headrest_contact: true },
    })
    expect(dailyCompliance(log, [])).toBeLessThanOrEqual(100)
  })
})

describe('painDelta', () => {
  it('compares first 3 and last 3 logged days', () => {
    const logs = [8, 7, 6, 5, 4, 3, 2].map((v, i) => makeLog(i + 1, v))
    expect(painDelta(logs)).toMatchObject({ baseline: 7, recent: 3, delta: 4, window: 3 })
  })
  it('shrinks the window to avoid overlap with few logs', () => {
    const logs = [6, 5, 4, 3].map((v, i) => makeLog(i + 1, v))
    expect(painDelta(logs)).toMatchObject({ window: 2, delta: 2 })
  })
  it('needs at least two check-ins', () => {
    expect(painDelta([makeLog(1, 5)])).toBeNull()
  })
})

describe('exercise progress', () => {
  it('advances reps into sets and completes on the final set', () => {
    let p = { ...toProgress({ exercise_id: 'chin_tuck', sets: 2, reps: 2, hold_seconds: 5 }) }
    p = logRep(p)
    expect(p).toMatchObject({ reps_done: 1, sets_done: 0, status: 'in_progress' })
    p = logRep(p)
    expect(p).toMatchObject({ reps_done: 0, sets_done: 1 })
    p = completeSet(p)
    expect(p).toMatchObject({ reps_done: 2, sets_done: 2, status: 'completed' })
  })
})

describe('checkinStreak', () => {
  it('counts back from today or yesterday', () => {
    const logs = [makeLog(1, 3), makeLog(2, 3), makeLog(3, 3), makeLog(5, 2)]
    expect(checkinStreak(logs, 5)).toBe(1)
    expect(checkinStreak(logs, 4)).toBe(3)
  })
})
