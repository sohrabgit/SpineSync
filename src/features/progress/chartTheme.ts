/** Shared chart tokens: one accent series, recessive hairline chrome, text in ink tokens. */
export const CHART = {
  series: '#0f766e', // teal-700
  seriesWash: 'rgba(15, 118, 110, 0.10)',
  critical: '#e11d48', // rose-600 — status only (flare days / threshold)
  grid: '#e2e8f0', // slate-200
  axisText: '#64748b', // slate-500
  surface: '#ffffff',
  tick: { fontSize: 11, fill: '#64748b' },
} as const

export const DAY_TICKS = [1, 5, 10, 15, 20, 25, 30]
