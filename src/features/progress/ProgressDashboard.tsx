import { useMemo } from 'react'
import { ChartSpline, Flame, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import type { PlanLevel } from '@/types/recovery'
import { averageAdherence, checkinStreak, flareDayCount, painDelta } from '@/lib/metrics'
import { PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { AdherenceChart } from './AdherenceChart'
import { NdiSummary } from './NdiSummary'
import { PainTrendChart } from './PainTrendChart'
import { StatTile } from './StatTile'
import { WorkBreaksCard } from './WorkBreaksCard'

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
  const { m, n, date } = useI18n()
  const t = m.progress

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
  // Last 7 program days, oldest first: filled when a check-in was logged.
  const week = Array.from({ length: 7 }, (_, i) => currentDay - 6 + i).map((d) => ({ day: d, logged: points.some((p) => p.day === d && p.vas !== null) }))
  const improving = delta !== null && delta.delta > 0
  const worsening = delta !== null && delta.delta < 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label={t.painDelta}
          value={delta ? `${improving ? '−' : worsening ? '+' : ''}${n(Math.abs(delta.delta))}` : '—'}
          valueClass={improving ? 'text-success' : worsening ? 'text-warning' : 'text-ink'}
          visual={
            delta && (improving || worsening) ? (
              (() => {
                const Arrow = improving ? TrendingDown : TrendingUp
                return <Arrow className={cn('size-7', improving ? 'text-success' : 'text-warning')} strokeWidth={2.4} aria-hidden />
              })()
            ) : undefined
          }
        />
        <StatTile
          label={t.avgAdherence}
          value={avgAdherence !== null ? n(`${Math.round(avgAdherence)}%`) : '—'}
          visual={<ProgressRing value={(avgAdherence ?? 0) / 100} size={34} stroke={5} />}
        />
        <StatTile
          label={t.streak}
          value={n(streak)}
          visual={
            <span className="flex gap-1" role="img" aria-label={t.streakValue(streak)}>
              {week.map((d) => (
                <span key={d.day} className={cn('size-2 rounded-full', d.logged ? 'bg-brand' : 'bg-panel-2')} />
              ))}
            </span>
          }
        />
        <StatTile
          label={t.flareDays}
          value={n(flares)}
          visual={<Flame className={cn('size-6', flares ? 'text-danger' : 'text-dim/50')} aria-hidden />}
        />
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink">{t.painTrend}</h2>
        {checkins === 0 ? <EmptyChart icon={ChartSpline} text={t.painEmpty} /> : <PainTrendChart data={points} maxDay={maxDay} />}
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink">{t.adherenceTitle}</h2>
        {points.every((p) => p.adherence === null) ? <EmptyChart icon={ChartSpline} text={t.adherenceEmpty} /> : <AdherenceChart data={points} maxDay={maxDay} />}
      </Card>

      <WorkBreaksCard logs={logs} />

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink">{t.ndiTitle}</h2>
        <NdiSummary assessments={assessments} />
      </Card>

      {checkins > 0 && (
        <details className="group rounded-2xl border border-line/60 bg-panel">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-ink">
            {t.logTable}
            <span className="cap text-[11px] text-brand group-open:hidden">{t.show}</span>
            <span className="cap hidden text-[11px] text-brand group-open:inline">{t.hide}</span>
          </summary>
          <div className="overflow-x-auto px-2 pb-3">
            <table className="w-full text-start text-xs">
              <thead className="text-mute">
                <tr>
                  <th className="px-2 py-1.5 text-start font-medium">{t.colDay}</th>
                  <th className="px-2 py-1.5 text-start font-medium">{t.colDate}</th>
                  <th className="px-2 py-1.5 text-end font-medium">{t.colVas}</th>
                  <th className="px-2 py-1.5 text-start font-medium">{t.colPlan}</th>
                  <th className="px-2 py-1.5 text-end font-medium">{t.colAdherence}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70 text-ink/90 tabular-nums">
                {[...points].reverse().map((p) => (
                  <tr key={p.date}>
                    <td className="px-2 py-1.5 font-semibold">{n(p.day)}</td>
                    <td className="px-2 py-1.5">{date(p.date, { month: 'short', day: 'numeric' })}</td>
                    <td className="px-2 py-1.5 text-end">{p.vas !== null ? n(p.vas) : '—'}</td>
                    <td className="px-2 py-1.5">{p.level ? m.levels[p.level].short : '—'}</td>
                    <td className="px-2 py-1.5 text-end">{p.adherence !== null ? n(`${p.adherence}%`) : '—'}</td>
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

function EmptyChart({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-well px-6 text-center text-xs text-mute">
      <Icon className="size-6 text-dim" aria-hidden />
      {text}
    </div>
  )
}
