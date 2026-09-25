/** Shared chart tokens: one accent series, recessive hairline chrome, text in ink tokens. */
export const CHART = {
  series: '#7fa9f5', // info blue
  seriesWash: 'rgba(127, 169, 245, 0.12)',
  critical: '#f2706b', // danger — status only (flare days / threshold)
  grid: '#2c3140', // line
  axisText: '#9aa1b5', // mute
  surface: '#171a22', // panel
  tick: { fontSize: 11, fill: '#9aa1b5', fontFamily: 'DM Sans, sans-serif' },
} as const

export const DAY_TICKS = [1, 5, 10, 15, 20, 25, 30]

/**
 * Axis layout for the reading direction. Charts stay in an LTR box (SVG text anchoring
 * breaks under RTL), so for RTL the day axis is reversed and the value axis moves right.
 */
export function chartAxes(rtl: boolean) {
  return {
    margin: rtl ? { top: 8, right: -20, bottom: 0, left: 12 } : { top: 8, right: 12, bottom: 0, left: -20 },
    xReversed: rtl,
    yOrientation: (rtl ? 'right' : 'left') as 'left' | 'right',
  }
}
