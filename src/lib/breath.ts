/** Size math for the breathing-orb exercise timer. Scales are fractions of the orb's full size. */

/** Resting size: the orb shrinks back to this between holds. */
export const ORB_MIN = 0.45

/** Relaxed breathing loop for long timed activities: 4 s in, 6 s out. */
export const INHALE_MS = 4000
export const EXHALE_MS = 6000
export const BREATH_CYCLE_MS = INHALE_MS + EXHALE_MS

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2

const lerp = (from: number, to: number, t: number) => from + (to - from) * t

/**
 * Orb size during a hold/rest cycle, given how far through the current phase we are (0–1).
 * The hold grows from ORB_MIN to full and the rest shrinks back, so phase changes never jump.
 */
export function holdOrbScale(phase: 'idle' | 'hold' | 'rest', elapsedFrac: number): number {
  if (phase === 'hold') return lerp(ORB_MIN, 1, easeInOutSine(elapsedFrac))
  if (phase === 'rest') return lerp(1, ORB_MIN, easeInOutSine(elapsedFrac))
  return ORB_MIN
}

/** Orb size and direction within the breathing loop, from elapsed timer time (so it freezes on pause). */
export function breathCycle(elapsedMs: number): { scale: number; inhaling: boolean } {
  const t = ((elapsedMs % BREATH_CYCLE_MS) + BREATH_CYCLE_MS) % BREATH_CYCLE_MS
  if (t < INHALE_MS) return { scale: lerp(ORB_MIN, 1, easeInOutSine(t / INHALE_MS)), inhaling: true }
  return { scale: lerp(1, ORB_MIN, easeInOutSine((t - INHALE_MS) / EXHALE_MS)), inhaling: false }
}
