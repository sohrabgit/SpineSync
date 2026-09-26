import { describe, expect, it } from 'vitest'
import { breakPainLink, checkinStreak, dailyCompliance, ndiBand, ndiScore, painDelta, postureSlip, scheduledErgoTasks, workBreakStats } from './metrics'
import { completeSet, logRep, markComplete, nextOpenExercise } from './exerciseProgress'
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

const withBreaks = (day: number, vas: number | null, breaks: number, extra = {}) =>
  makeLog(day, vas, { ergonomics_checklist: { monitor_height_checked: false, hourly_breaks_count: breaks, sleeping_position_adhered: false }, ...extra })

describe('workBreakStats', () => {
  it('is null without Work mode time', () => {
    expect(workBreakStats([withBreaks(1, 3, 4)])).toBeNull()
  })
  it('computes breaks per work hour on days with Work mode time', () => {
    const logs = [withBreaks(1, 3, 4, { work_minutes: 240 }), withBreaks(2, 3, 2, { work_minutes: 120 }), withBreaks(3, 3, 5)]
    expect(workBreakStats(logs)).toEqual({ hours: 6, breaks: 6, perHour: 1 })
  })
})

describe('postureSlip', () => {
  it('returns the most flagged issue', () => {
    const logs = [
      makeLog(1, null, { posture_checks: { total: 3, issues: { chin: 1, shoulders: 0, screen: 2 } } }),
      makeLog(2, null, { posture_checks: { total: 2, issues: { chin: 1, shoulders: 0, screen: 1 } } }),
    ]
    expect(postureSlip(logs)).toEqual({ issue: 'screen', count: 3, total: 5 })
  })
  it('is null when nothing was flagged', () => {
    expect(postureSlip([makeLog(1, null, { posture_checks: { total: 2, issues: { chin: 0, shoulders: 0, screen: 0 } } })])).toBeNull()
  })
})

describe('breakPainLink', () => {
  it('compares next-morning pain after days that met the break goal vs not', () => {
    // Days 1–3 meet the goal (next mornings: 2, 2, 2); days 4–6 miss it (next mornings: 5, 5, 5).
    const logs = [
      withBreaks(1, 4, 3),
      withBreaks(2, 2, 4),
      withBreaks(3, 2, 5),
      withBreaks(4, 2, 0),
      withBreaks(5, 5, 1),
      withBreaks(6, 5, 2),
      withBreaks(7, 5, 0),
    ]
    expect(breakPainLink(logs)).toEqual({ withGoal: 2, withoutGoal: 5 })
  })
  it('needs at least 3 days in each group', () => {
    expect(breakPainLink([withBreaks(1, 4, 3), withBreaks(2, 2, 0), withBreaks(3, 5, 0)])).toBeNull()
  })
})

describe('nextOpenExercise', () => {
  const plan = () => buildPlan('standard', 1).map(toProgress)
  it('starts at the first unfinished exercise', () => {
    const list = plan()
    list[0] = markComplete(list[0]!)
    expect(nextOpenExercise(list)?.exercise_id).toBe(list[1]!.exercise_id)
  })
  it('moves forward and wraps to skipped-over earlier ones', () => {
    const list = plan()
    expect(nextOpenExercise(list, list[1]!.exercise_id)?.exercise_id).toBe(list[2]!.exercise_id)
    const last = list.at(-1)!.exercise_id
    expect(nextOpenExercise(list, last)?.exercise_id).toBe(list[0]!.exercise_id)
  })
  it('returns undefined when everything else is done or skipped', () => {
    const list = plan().map(markComplete)
    list[1] = { ...list[1]!, status: 'pending' }
    expect(nextOpenExercise(list, list[1]!.exercise_id)).toBeUndefined()
    expect(nextOpenExercise(list)?.exercise_id).toBe(list[1]!.exercise_id)
  })
})
