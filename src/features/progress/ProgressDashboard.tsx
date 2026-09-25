import { useMemo } from 'react'
import { ChartLine, Flame, Target, TrendingDown, TrendingUp } from 'lucide-react'
import type { PlanLevel } from '@/types/recovery'
import { formatDate } from '@/lib/date'
import { averageAdherence, checkinStreak, flareDayCount, painDelta } from '@/lib/metrics'
import { PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { LEVEL_META } from '@/components/ui/tone'
import { AdherenceChart } from './AdherenceChart'
import { CHART } from './chartTheme'
import { NdiSummary } from './NdiSummary'
import { PainTrendChart } from './PainTrendChart'
import { StatTile } from './StatTile'

export interface DayPoint {
  day: number
  date: string
  vas: number | null
  level: PlanLevel | null
  adherence: number | null
}

export function ProgressDashboard() {
  const history = useRecoveryStore((s) => s.history)
  const today = useRecoveryStore((s) => s.daily_log)
  const currentDay = useRecoveryStore((s) => s.current_day)
  const assessments = useRecoveryStore((s) => s.ndi_assessments)

  const logs = useMemo(() => [...history, today], [history, today])
  const points: DayPoint[] = useMemo(
    () =>
      logs
        .map((l) => ({
          day: l.day,
          date: l.date,
          vas: l.pain_checkin?.vas_score ?? null,
          level: l.adapted_plan_level,
          adherence: l.pain_checkin || l.daily_compliance_percentage > 0 ? l.daily_compliance_percentage : null,
        }))
        .sort((a, b) => a.day - b.day),
    [logs],
  )

  const delta = painDelta(logs)
  const avgAdherence = averageAdherence(logs)
  const streak = checkinStreak(logs, currentDay)
  const flares = flareDayCount(logs)
  const maxDay = Math.max(PROGRAM_DAYS, currentDay)
  const checkins = points.filter((p) => p.vas !== null).length

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Your progress</h1>
        <p className="text-sm text-slate-500">
          {checkins} check-in{checkins === 1 ? '' : 's'} logged over {Math.min(currentDay, maxDay)} day{currentDay === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Pain delta"
          icon={delta && delta.delta < 0 ? TrendingUp : TrendingDown}
          iconClass={delta && delta.delta < 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}
          value={delta ? `${delta.delta > 0 ? '−' : delta.delta < 0 ? '+' : ''}${Math.abs(delta.delta)}` : '—'}
          hint={delta ? `${delta.baseline} → ${delta.recent} (first vs last ${delta.window}d)` : 'Needs 2+ check-ins'}
        />
        <StatTile label="Avg adherence" icon={Target} value={avgAdherence !== null ? `${Math.round(avgAdherence)}%` : '—'} hint="Exercises + ergonomics" />
        <StatTile label="Check-in streak" icon={ChartLine} value={`${streak} day${streak === 1 ? '' : 's'}`} hint="Consecutive days logged" />
        <StatTile label="Flare-up days" icon={Flame} iconClass="bg-rose-50 text-rose-600" value={String(flares)} hint={flares ? 'Rest-protocol days' : 'None so far'} />
      </div>

      <Card>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pain trend (VAS)</h2>
            <p className="text-xs text-slate-500">0 = no pain, 10 = unbearable. Lower is better.</p>
          </div>
        </div>
        {checkins === 0 ? (
          <EmptyChart text="Your pain trend will appear after your first check-in." />
        ) : (
          <>
            <PainTrendChart data={points} maxDay={maxDay} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: CHART.series }} /> Daily pain
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: CHART.critical }} /> Flare-up / paused day
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-px w-3" style={{ backgroundColor: CHART.critical }} /> Flare threshold (7)
              </span>
            </div>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900">Daily adherence</h2>
        <p className="mb-2 text-xs text-slate-500">(Completed exercises + ergonomic tasks) ÷ scheduled tasks</p>
        {points.every((p) => p.adherence === null) ? <EmptyChart text="Complete an exercise or checklist item to start tracking." /> : <AdherenceChart data={points} maxDay={maxDay} />}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900">Neck Disability Index</h2>
        <p className="mb-3 text-xs text-slate-500">Taken on days 1, 15 and 30. Lower is better.</p>
        <NdiSummary assessments={assessments} />
      </Card>

      {checkins > 0 && (
        <details className="group rounded-2xl border border-slate-200/80 bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-slate-900">
            Daily log table
            <span className="text-xs font-medium text-teal-700 group-open:hidden">Show</span>
            <span className="hidden text-xs font-medium text-teal-700 group-open:inline">Hide</span>
          </summary>
          <div className="overflow-x-auto px-2 pb-3">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Day</th>
                  <th className="px-2 py-1.5 font-medium">Date</th>
                  <th className="px-2 py-1.5 text-right font-medium">VAS</th>
                  <th className="px-2 py-1.5 font-medium">Plan</th>
                  <th className="px-2 py-1.5 text-right font-medium">Adherence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 tabular-nums">
                {[...points].reverse().map((p) => (
                  <tr key={p.date}>
                    <td className="px-2 py-1.5 font-semibold">{p.day}</td>
                    <td className="px-2 py-1.5">{formatDate(p.date, { month: 'short', day: 'numeric' })}</td>
                    <td className="px-2 py-1.5 text-right">{p.vas ?? '—'}</td>
                    <td className="px-2 py-1.5">{p.level ? LEVEL_META[p.level].short : '—'}</td>
                    <td className="px-2 py-1.5 text-right">{p.adherence !== null ? `${p.adherence}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  )
}

function EmptyChart({ text }: { text: string }) {
  return <div className="grid h-32 place-items-center rounded-xl bg-slate-50 px-6 text-center text-xs text-slate-500">{text}</div>
}
