import { describe, expect, it } from 'vitest'
import { dayFromStart, dueNdiCheckpoint, phaseForDay } from './program'
import { addDays, daysBetween } from './date'

describe('program', () => {
  it('maps days to phases', () => {
    expect([1, 7, 8, 15, 16, 22, 23, 30].map(phaseForDay)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
  })
  it('computes day number across month and DST boundaries', () => {
    expect(dayFromStart('2026-10-20', '2026-11-02')).toBe(14)
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
  it('surfaces the latest outstanding NDI checkpoint', () => {
    expect(dueNdiCheckpoint(1, [])).toBe(1)
    expect(dueNdiCheckpoint(16, [])).toBe(15)
    expect(dueNdiCheckpoint(16, [{ checkpoint: 15, day: 15, date: '', answers: [], score_pct: 10 }])).toBeNull()
  })
})
