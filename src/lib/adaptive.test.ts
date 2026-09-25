import { describe, expect, it } from 'vitest'
import { buildPlan, decidePlanLevel, mergeProgress, previousVas, suppressedExercises, tierFor, toProgress } from './adaptive'
import { checkin, makeLog } from './testUtils'

describe('decidePlanLevel', () => {
  it('uses standard plan when there is no prior check-in', () => {
    expect(decidePlanLevel(checkin(4), null)).toBe('standard')
  })
  it('triggers flare-up at the VAS 7 boundary', () => {
    expect(decidePlanLevel(checkin(6), 6)).toBe('standard')
    expect(decidePlanLevel(checkin(7), 7)).toBe('flare_up')
    expect(decidePlanLevel(checkin(10), 2)).toBe('flare_up')
  })
  it('triggers flare-up on radiating arm pain regardless of VAS', () => {
    expect(decidePlanLevel(checkin(2, { radiating_pain: true }), 5)).toBe('flare_up')
  })
  it('steps down when pain increased vs yesterday', () => {
    expect(decidePlanLevel(checkin(5), 4)).toBe('reduced')
  })
  it('continues standard plan when pain is stable or decreased', () => {
    expect(decidePlanLevel(checkin(4), 4)).toBe('standard')
    expect(decidePlanLevel(checkin(3), 5)).toBe('standard')
  })
  it('does not escalate on numbness alone', () => {
    expect(decidePlanLevel(checkin(3, { numbness_present: true }), 3)).toBe('standard')
  })
  it('pauses for red flags ahead of every other rule', () => {
    expect(decidePlanLevel(checkin(9, { radiating_pain: true, red_flags: ['bowel_bladder'] }), 1)).toBe('medical_pause')
  })
})

describe('tiers and plans', () => {
  it('steps down exactly one tier, with a Gentle floor at phase 1', () => {
    expect(tierFor('standard', 3)).toBe(3)
    expect(tierFor('reduced', 3)).toBe(2)
    expect(tierFor('reduced', 1)).toBe(0)
    expect(tierFor('flare_up', 2)).toBeNull()
  })
  it('flare-up plan excludes isometrics and strengthening', () => {
    const ids = buildPlan('flare_up', 4).map((p) => p.exercise_id)
    expect(ids).not.toContain('isometric_4way')
    expect(ids).not.toContain('scapular_retraction')
    expect(ids).toEqual(expect.arrayContaining(['cold_therapy', 'heat_therapy', 'supported_rest']))
  })
  it('lists suppressed exercises for flare-up days', () => {
    expect(suppressedExercises('flare_up', 3)).toEqual(['isometric_4way', 'scapular_retraction'])
    expect(suppressedExercises('standard', 3)).toEqual([])
  })
  it('multiplies sets by sides/directions', () => {
    const iso = buildPlan('standard', 2).find((p) => p.exercise_id === 'isometric_4way')!
    expect(toProgress(iso).target_sets).toBe(8)
  })
})

describe('mergeProgress', () => {
  it('keeps completed work when re-checking in and caps to the new targets', () => {
    const standard = buildPlan('standard', 2).map(toProgress)
    const chin = standard.find((e) => e.exercise_id === 'chin_tuck')!
    chin.sets_done = 3
    chin.status = 'completed'
    const merged = mergeProgress(buildPlan('reduced', 2), standard)
    const mergedChin = merged.find((e) => e.exercise_id === 'chin_tuck')!
    expect(mergedChin.status).toBe('completed')
    expect(merged.some((e) => e.exercise_id === 'isometric_4way')).toBe(false)
  })
})

describe('previousVas', () => {
  it('returns the most recent earlier check-in', () => {
    const logs = [makeLog(1, 6), makeLog(2, null), makeLog(3, 4), makeLog(4, 2)]
    expect(previousVas(logs, '2026-09-04')).toBe(4)
    expect(previousVas(logs, '2026-09-01')).toBeNull()
  })
})
