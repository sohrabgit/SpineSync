import type { DailyLog, PainCheckin } from '@/types/recovery'

export const checkin = (vas: number, extra: Partial<PainCheckin> = {}): PainCheckin => ({
  vas_score: vas,
  radiating_pain: false,
  numbness_present: false,
  red_flags: [],
  ...extra,
})

export const makeLog = (day: number, vas: number | null, overrides: Partial<DailyLog> = {}): DailyLog => ({
  date: `2026-09-${String(day).padStart(2, '0')}`,
  day,
  pain_checkin: vas === null ? null : checkin(vas),
  adapted_plan_level: vas === null ? null : 'standard',
  exercises_completed: [],
  ergonomics_checklist: { monitor_height_checked: false, hourly_breaks_count: 0, sleeping_position_adhered: false },
  daily_compliance_percentage: 0,
  ...overrides,
})
