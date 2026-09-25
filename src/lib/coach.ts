import type { RecoveryData, WorkSession } from '@/types/recovery'
import type { Messages } from '@/i18n/en'
import { BREAK_GOAL } from '@/data/ergonomics'
import { PHASES, PROGRAM_DAYS } from './program'
import { averageAdherence, checkedInLogs, ndiBand, painDelta, type Tone } from './metrics'
import { MINUTE_MS, msUntilBreak, OVERDUE_NUDGE_MS } from './workMode'

export interface Insight {
  id: string
  tone: Tone
  title: string
  body: string
}

/** NDI change (percentage points) generally considered clinically meaningful. */
const NDI_MEANINGFUL_CHANGE = 7.5

/**
 * Local, rule-based recovery coach. Deterministic and offline — no API calls, no cost.
 * Returns insights ordered by priority: safety → today → trends → adherence → milestones.
 */
export function getInsights(data: RecoveryData & { work_session?: WorkSession | null }, m: Messages, now: Date = new Date(), limit = 4): Insight[] {
  const c = m.coach
  const out: Insight[] = []
  const today = data.daily_log
  const checkin = today.pain_checkin
  const logs = [...data.history, today]
  const logged = checkedInLogs(logs)

  // Safety
  if (today.adapted_plan_level === 'medical_pause') {
    out.push({ id: 'red-flag', tone: 'critical', ...c.redFlag })
  } else if (today.adapted_plan_level === 'flare_up') {
    const prev = logged.filter((l) => l.date < today.date).at(-1)
    const consecutive = prev?.adapted_plan_level === 'flare_up'
    out.push(
      consecutive
        ? { id: 'flare-streak', tone: 'critical', ...c.flareStreak }
        : { id: 'flare', tone: 'warning', ...c.flare },
    )
  }
  if (checkin?.numbness_present && today.adapted_plan_level !== 'medical_pause') {
    out.push({ id: 'numbness', tone: 'warning', ...c.numbness })
  }

  if (!checkin) {
    out.push({ id: 'checkin', tone: 'info', ...c.checkin })
  }

  // Phase milestone
  const phaseInfo = PHASES[data.phase]
  if (data.current_day === phaseInfo.startDay && data.current_day > 1) {
    out.push({ id: 'phase', tone: 'positive', title: c.phase(data.phase, m.phases[data.phase].name), body: m.phases[data.phase].focus })
  }
  if (data.current_day > PROGRAM_DAYS) {
    out.push({ id: 'complete', tone: 'positive', ...c.complete })
  }

  // Short-term trend: last 3 vs previous 3 check-ins
  const vas = logged.map((l) => l.pain_checkin!.vas_score)
  if (vas.length >= 4) {
    const k = Math.min(3, Math.floor(vas.length / 2))
    const recent = vas.slice(-k).reduce((a, b) => a + b, 0) / k
    const before = vas.slice(-2 * k, -k).reduce((a, b) => a + b, 0) / k
    const diff = before - recent
    if (diff >= 1) out.push({ id: 'trend-up', tone: 'positive', title: c.trendUp.title, body: c.trendUp.body(diff.toFixed(1), k) })
    else if (diff <= -1) out.push({ id: 'trend-down', tone: 'warning', title: c.trendDown.title, body: c.trendDown.body(Math.abs(diff).toFixed(1)) })
  }

  const delta = painDelta(logs)
  if (delta && delta.window === 3 && delta.delta >= 2) {
    out.push({ id: 'delta', tone: 'positive', title: c.delta.title(delta.delta), body: c.delta.body(delta.baseline, delta.recent) })
  }

  // Adherence
  const recentAdherence = averageAdherence(logs.slice(-4, -1))
  if (recentAdherence !== null && data.history.length >= 2) {
    if (recentAdherence >= 80) out.push({ id: 'adherence-high', tone: 'positive', title: c.adherenceHigh.title, body: c.adherenceHigh.body(recentAdherence) })
    else if (recentAdherence < 50) out.push({ id: 'adherence-low', tone: 'info', ...c.adherenceLow })
  }

  // Breaks: an overdue Work mode break, otherwise a nudge in the afternoon
  const session = data.work_session
  if (session) {
    if (-msUntilBreak(session, now.getTime()) >= OVERDUE_NUDGE_MS) {
      const sitting = Math.floor((now.getTime() - session.last_break_at) / MINUTE_MS)
      out.push({ id: 'sitting', tone: 'info', title: c.sitting.title(sitting), body: c.sitting.body })
    }
  } else if (checkin && now.getHours() >= 15 && today.ergonomics_checklist.hourly_breaks_count < BREAK_GOAL) {
    out.push({ id: 'breaks', tone: 'info', title: c.breaks.title, body: c.breaks.body(today.ergonomics_checklist.hourly_breaks_count, BREAK_GOAL) })
  }

  // NDI change
  const ndi = [...data.ndi_assessments].sort((a, b) => a.checkpoint - b.checkpoint)
  const first = ndi[0]
  const last = ndi[ndi.length - 1]
  if (first && last && ndi.length >= 2) {
    const change = first.score_pct - last.score_pct
    if (change >= NDI_MEANINGFUL_CHANGE) {
      out.push({ id: 'ndi', tone: 'positive', title: c.ndiBetter.title, body: c.ndiBetter.body(first.score_pct, last.score_pct, m.ndiBands[ndiBand(last.score_pct).id]) })
    } else if (change <= -NDI_MEANINGFUL_CHANGE) {
      out.push({ id: 'ndi-worse', tone: 'warning', title: c.ndiWorse.title, body: c.ndiWorse.body(first.score_pct, last.score_pct) })
    }
  }

  return out.slice(0, limit)
}
