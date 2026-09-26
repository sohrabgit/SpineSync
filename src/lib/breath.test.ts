import { describe, expect, it } from 'vitest'
import { BREATH_CYCLE_MS, breathCycle, EXHALE_MS, holdOrbScale, INHALE_MS, ORB_MIN } from './breath'

describe('holdOrbScale', () => {
  it('grows over the hold and shrinks over the rest, meeting at the boundaries', () => {
    expect(holdOrbScale('hold', 0)).toBeCloseTo(ORB_MIN)
    expect(holdOrbScale('hold', 1)).toBeCloseTo(1)
    expect(holdOrbScale('rest', 0)).toBeCloseTo(holdOrbScale('hold', 1))
    expect(holdOrbScale('rest', 1)).toBeCloseTo(holdOrbScale('hold', 0))
    expect(holdOrbScale('idle', 0.7)).toBe(ORB_MIN)
  })

  it('stays within [ORB_MIN, 1] and moves monotonically', () => {
    let prev = holdOrbScale('hold', 0)
    for (let i = 1; i <= 50; i++) {
      const s = holdOrbScale('hold', i / 50)
      expect(s).toBeGreaterThanOrEqual(prev)
      expect(s).toBeLessThanOrEqual(1)
      prev = s
    }
    expect(holdOrbScale('hold', -1)).toBeCloseTo(ORB_MIN)
    expect(holdOrbScale('rest', 2)).toBeCloseTo(ORB_MIN)
  })
})

describe('breathCycle', () => {
  it('inhales for 4 s then exhales for 6 s', () => {
    expect(breathCycle(0)).toEqual({ scale: ORB_MIN, inhaling: true })
    expect(breathCycle(INHALE_MS - 1).inhaling).toBe(true)
    expect(breathCycle(INHALE_MS).scale).toBeCloseTo(1)
    expect(breathCycle(INHALE_MS + 1).inhaling).toBe(false)
    expect(breathCycle(INHALE_MS + EXHALE_MS - 1).scale).toBeCloseTo(ORB_MIN, 2)
  })

  it('repeats every cycle', () => {
    for (const t of [0, 1234, 5000, 9999]) {
      expect(breathCycle(t + 3 * BREATH_CYCLE_MS).scale).toBeCloseTo(breathCycle(t).scale)
    }
  })
})
