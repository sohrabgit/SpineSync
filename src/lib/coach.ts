import type { RecoveryData } from '@/types/recovery'
import { BREAK_GOAL } from '@/data/ergonomics'
import { PHASES, PROGRAM_DAYS } from './program'
import { averageAdherence, checkedInLogs, ndiBand, painDelta, type Tone } from './metrics'

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
export function getInsights(data: RecoveryData, now: Date = new Date(), limit = 4): Insight[] {
  const out: Insight[] = []
  const today = data.daily_log
  const checkin = today.pain_checkin
  const logs = [...data.history, today]
  const logged = checkedInLogs(logs)

  // Safety
  if (today.adapted_plan_level === 'medical_pause') {
    out.push({ id: 'red-flag', tone: 'critical', title: 'Seek medical review today', body: 'You reported a red-flag symptom. Exercises are paused. Contact your doctor or emergency services if symptoms are severe or getting worse.' })
  } else if (today.adapted_plan_level === 'flare_up') {
    const prev = logged.filter((l) => l.date < today.date).at(-1)
    const consecutive = prev?.adapted_plan_level === 'flare_up'
    out.push(
      consecutive
        ? { id: 'flare-streak', tone: 'critical', title: 'Second flare-up day in a row', body: 'Pain has stayed high or arm pain continues. Book a clinical review if this lasts beyond 48 hours.' }
        : { id: 'flare', tone: 'warning', title: 'Flare-up protocol active', body: 'Today is about calming things down: cold therapy first, supported rest, then gentle heat. Skip anything that loads the neck.' },
    )
  }
  if (checkin?.numbness_present && today.adapted_plan_level !== 'medical_pause') {
    out.push({ id: 'numbness', tone: 'warning', title: 'Keep an eye on the numbness', body: 'Note where you feel it. Numbness in both arms, or numbness that spreads or gets worse, is a red flag. Re-check in if that happens.' })
  }

  if (!checkin) {
    out.push({ id: 'checkin', tone: 'info', title: 'Start with your morning check-in', body: 'Your pain score sets today’s plan, so log it before you exercise.' })
  }

  // Phase milestone
  const phaseInfo = PHASES[data.phase]
  if (data.current_day === phaseInfo.startDay && data.current_day > 1) {
    out.push({ id: 'phase', tone: 'positive', title: `Phase ${data.phase}: ${phaseInfo.name}`, body: phaseInfo.focus })
  }
  if (data.current_day > PROGRAM_DAYS) {
    out.push({ id: 'complete', tone: 'positive', title: 'Program complete', body: 'Keep the habits going: daily chin tucks, workstation checks and movement breaks.' })
  }

  // Short-term trend: last 3 vs previous 3 check-ins
  const vas = logged.map((l) => l.pain_checkin!.vas_score)
  if (vas.length >= 4) {
    const k = Math.min(3, Math.floor(vas.length / 2))
    const recent = vas.slice(-k).reduce((a, b) => a + b, 0) / k
    const before = vas.slice(-2 * k, -k).reduce((a, b) => a + b, 0) / k
    const diff = before - recent
    if (diff >= 1) out.push({ id: 'trend-up', tone: 'positive', title: 'Pain is easing', body: `Your average VAS fell by ${diff.toFixed(1)} points over your last ${k} check-ins. Keep up the routine.` })
    else if (diff <= -1) out.push({ id: 'trend-down', tone: 'warning', title: 'Pain is creeping up', body: `Your average VAS rose by ${Math.abs(diff).toFixed(1)} points. Check your sleep setup and screen height, and avoid long stretches looking down.` })
  }

  const delta = painDelta(logs)
  if (delta && delta.window === 3 && delta.delta >= 2) {
    out.push({ id: 'delta', tone: 'positive', title: `Down ${delta.delta} points since you started`, body: `Your first 3 days averaged ${delta.baseline}/10 and your latest 3 average ${delta.recent}/10.` })
  }

  // Adherence
  const recentAdherence = averageAdherence(logs.slice(-4, -1))
  if (recentAdherence !== null && data.history.length >= 2) {
    if (recentAdherence >= 80) out.push({ id: 'adherence-high', tone: 'positive', title: 'Strong consistency', body: `You’ve averaged ${recentAdherence}% of your plan recently. Showing up consistently is what drives recovery.` })
    else if (recentAdherence < 50) out.push({ id: 'adherence-low', tone: 'info', title: 'Small steps count', body: 'Recent adherence is under 50%. Try tying chin tucks to things you already do, like coffee, red lights or meetings.' })
  }

  // Breaks nudge in the afternoon
  if (checkin && now.getHours() >= 15 && today.ergonomics_checklist.hourly_breaks_count < BREAK_GOAL) {
    out.push({ id: 'breaks', tone: 'info', title: 'Time for a movement break', body: `You’ve logged ${today.ergonomics_checklist.hourly_breaks_count}/${BREAK_GOAL} breaks today. Stand up, roll your shoulders and do 5 chin tucks.` })
  }

  // NDI change
  const ndi = [...data.ndi_assessments].sort((a, b) => a.checkpoint - b.checkpoint)
  const first = ndi[0]
  const last = ndi[ndi.length - 1]
  if (first && last && ndi.length >= 2) {
    const change = first.score_pct - last.score_pct
    if (change >= NDI_MEANINGFUL_CHANGE) {
      out.push({ id: 'ndi', tone: 'positive', title: 'Meaningful NDI improvement', body: `Your disability score improved from ${first.score_pct}% to ${last.score_pct}% (${ndiBand(last.score_pct).label.toLowerCase()}).` })
    } else if (change <= -NDI_MEANINGFUL_CHANGE) {
      out.push({ id: 'ndi-worse', tone: 'warning', title: 'NDI score has increased', body: `Your disability score went from ${first.score_pct}% to ${last.score_pct}%. Consider discussing this with your clinician.` })
    }
  }

  return out.slice(0, limit)
}
