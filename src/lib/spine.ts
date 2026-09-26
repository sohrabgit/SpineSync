/*
 * Brand mark geometry: the cervical spine in side view, facing right. The neck
 * has seven vertebrae; the mark stylises it as five larger ones so it stays calm.
 * `pose` bends the chain from the forward-head, painful shape (progress 0) to a
 * healthy lordotic curve (progress 1). Each joint has its own progress so the
 * correction can travel up the neck as a wave.
 *
 * The launch splash in index.html runs before the bundle loads, so it carries a
 * plain-JS copy of this file. Keep the two in sync; public/favicon.svg is the
 * healthy pose (progress 1) drawn from the same numbers.
 */

export type Point = [number, number]
export interface SpinePose {
  /** Vertebral body centres, top (index 0) to bottom. */
  p: Point[]
  /** Tilt of each vertebra in degrees, clockwise. */
  th: number[]
}

/** Body widths, top to bottom; lower vertebrae are larger. */
export const WIDTHS = [7.2, 7.8, 8.4, 9, 9.6]
export const VERTEBRA_COUNT = WIDTHS.length
const LAST = VERTEBRA_COUNT - 1
/** Index of the upper vertebra of the painful disc (a low one, like C5–C6). */
export const PAIN_DISC = 2

const PITCH = 8.6
const BODY_H = 5.6
const BASE: Point = [33.8, 48.9]
/** [base tilt, bend per joint] in degrees. */
const BAD: Point = [24, 4.8]
const GOOD: Point = [20, -9.9]
/** The painful pose leans forward; shift it back so each pose sits centred. */
const BAD_SHIFT: Point = [-7.7, -2.6]
const RAD = Math.PI / 180

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const r2 = (n: number) => Math.round(n * 100) / 100

function rotate(p: Point, deg: number, x: number, y: number): Point {
  const c = Math.cos(deg * RAD)
  const s = Math.sin(deg * RAD)
  return [p[0] + x * c - y * s, p[1] + x * s + y * c]
}

/** `ts[j]` is the progress of vertebra j; the bottom one is anchored at the base. */
export function pose(ts: number[]): SpinePose {
  let tilt = lerp(BAD[0], GOOD[0], ts[LAST] ?? 1)
  let at = BASE
  const p: Point[] = [at]
  const th: number[] = [tilt]
  for (let j = LAST - 1; j >= 0; j--) {
    const next = tilt + lerp(BAD[1], GOOD[1], ts[j] ?? 1)
    const mid = (tilt + next) / 2
    at = [at[0] + PITCH * Math.sin(mid * RAD), at[1] - PITCH * Math.cos(mid * RAD)]
    tilt = next
    p.unshift(at)
    th.unshift(tilt)
  }
  const bad = 1 - ts.reduce((sum, t) => sum + t, 0) / VERTEBRA_COUNT
  const dx = BAD_SHIFT[0] * bad
  const dy = BAD_SHIFT[1] * bad
  return { p: p.map(([x, y]) => [x + dx, y + dy]), th }
}

/** Rounded vertebral body, centred on the origin. */
export function bodyPath(w: number): string {
  const x = -w / 2
  const h = BODY_H / 2
  const c = 1.7
  return (
    `M${r2(x + c)} ${-h}H${r2(-x - c)}Q${r2(-x)} ${-h} ${r2(-x)} ${r2(-h + c)}V${r2(h - c)}` +
    `Q${r2(-x)} ${h} ${r2(-x - c)} ${h}H${r2(x + c)}Q${r2(x)} ${h} ${r2(x)} ${r2(h - c)}V${r2(-h + c)}Q${r2(x)} ${-h} ${r2(x + c)} ${-h}Z`
  )
}

/** Spinous process pointing back and down from the body. */
export function processPath(w: number): string {
  const x = -w / 2
  const k = BODY_H / 4.6
  const n = (v: number) => r2(v * k)
  return `M${r2(x + 0.8)} ${n(-1.5)}L${r2(x - n(4))} ${n(1)}Q${r2(x - n(5.2))} ${n(1.9)} ${r2(x - n(4.1))} ${n(2.7)}L${r2(x + 0.8)} ${n(1.5)}Z`
}

/**
 * Disc wedge between vertebra j and j + 1. `bulge` (0–1) pushes the back wall
 * out, the way a herniated disc presses on the nerve. `tip` is the bulge's apex.
 */
export function discPath(ps: SpinePose, j: number, bulge: number): { d: string; tip: Point } {
  const a = ps.p[j]!
  const b = ps.p[j + 1]!
  const ta = ps.th[j]!
  const tb = ps.th[j + 1]!
  const wa = WIDTHS[j]! / 2 - 0.5
  const wb = WIDTHS[j + 1]! / 2 - 0.5
  const ap = rotate(a, ta, -wa, BODY_H / 2 - 0.2)
  const aa = rotate(a, ta, wa, BODY_H / 2 - 0.2)
  const bp = rotate(b, tb, -wb, -BODY_H / 2 + 0.2)
  const ba = rotate(b, tb, wb, -BODY_H / 2 + 0.2)
  const out = rotate([0, 0], (ta + tb) / 2, -1, 0)
  const back: Point = [(ap[0] + bp[0]) / 2, (ap[1] + bp[1]) / 2]
  const front: Point = [(aa[0] + ba[0]) / 2, (aa[1] + ba[1]) / 2]
  const push = 0.6 + bulge * 4.4
  const cp: Point = [back[0] + out[0] * push, back[1] + out[1] * push]
  const cf: Point = [front[0] - out[0] * 0.6, front[1] - out[1] * 0.6]
  return {
    d:
      `M${r2(bp[0])} ${r2(bp[1])}Q${r2(cp[0])} ${r2(cp[1])} ${r2(ap[0])} ${r2(ap[1])}` +
      `L${r2(aa[0])} ${r2(aa[1])}Q${r2(cf[0])} ${r2(cf[1])} ${r2(ba[0])} ${r2(ba[1])}Z`,
    tip: [r2(back[0] + out[0] * (0.6 + bulge * 3)), r2(back[1] + out[1] * (0.6 + bulge * 3))],
  }
}

/** Colour at progress t: heat orange (or red for the painful disc) turning to brand mint, via HSL. */
export function spineColor(t: number, pain = false): string {
  const [h, s, l] = pain ? [2, 84, 68] : [26, 85, 68]
  return `hsl(${r2(lerp(h, 167, t))} ${r2(lerp(s, 50, t))}% ${r2(lerp(l, 57, t))}%)`
}

/** Per-vertebra progress for a correction wave that starts at the base and climbs up. */
export function waveProgress(elapsed: number, duration: number, stagger: number): number[] {
  return Array.from({ length: VERTEBRA_COUNT }, (_, j) => {
    const x = Math.min(1, Math.max(0, (elapsed - (LAST - j) * stagger) / duration))
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
  })
}
