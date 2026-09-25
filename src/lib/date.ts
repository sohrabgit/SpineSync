/** Local-calendar date helpers. All dates are `YYYY-MM-DD` strings in the user's timezone. */

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Parse as a UTC midnight timestamp so day arithmetic is immune to DST shifts. */
function toUtcMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

const DAY_MS = 86_400_000

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((toUtcMs(toISO) - toUtcMs(fromISO)) / DAY_MS)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(toUtcMs(iso) + days * DAY_MS)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** "Today" for the app, optionally shifted by a demo clock offset. */
export function appToday(offsetDays = 0, now: Date = new Date()): string {
  return addDays(toISODate(now), offsetDays)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, opts)
}
