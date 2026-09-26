import { useMemo } from 'react'
import { ChartLine, Flame, Target, TrendingDown, TrendingUp } from 'lucide-react'
import type { PlanLevel } from '@/types/recovery'
import { averageAdherence, checkinStreak, flareDayCount, painDelta } from '@/lib/metrics'
import { PROGRAM_DAYS } from '@/lib/program'
import { FLARE_VAS_THRESHOLD } from '@/lib/adaptive'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Card } from '@/components/ui/Card'
import { useI18n } from '@/i18n'
import { AdherenceChart } from './AdherenceChart'
import { CHART } from './chartTheme'
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

  return (
    <div className="space-y-5">
      <p className="px-1 text-sm text-mute">{t.summary(checkins, Math.min(currentDay, maxDay))}</p>

      <Card>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-ink">{t.painTrend}</h2>
            <p className="text-xs text-mute">{t.painTrendHint}</p>
          </div>
        </div>
        {checkins === 0 ? (
          <EmptyChart text={t.painEmpty} />
        ) : (
          <>
            <PainTrendChart data={points} maxDay={maxDay} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-mute">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: CHART.series }} /> {t.dailyPain}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: CHART.critical }} /> {t.flareDot}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-px w-3" style={{ backgroundColor: CHART.critical }} /> {t.thresholdN(FLARE_VAS_THRESHOLD)}
              </span>
            </div>
          </>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label={t.painDelta}
          icon={delta && delta.delta < 0 ? TrendingUp : TrendingDown}
          iconClass={delta && delta.delta < 0 ? 'bg-warning text-bg' : 'bg-success text-bg'}
          value={delta ? `${delta.delta > 0 ? '−' : delta.delta < 0 ? '+' : ''}${n(Math.abs(delta.delta))}` : '—'}
          hint={delta ? t.painDeltaHint(delta.baseline, delta.recent, delta.window) : t.needsTwo}
        />
        <StatTile label={t.avgAdherence} icon={Target} value={avgAdherence !== null ? n(`${Math.round(avgAdherence)}%`) : '—'} hint={t.adherenceHint} />
        <StatTile label={t.streak} icon={ChartLine} value={t.streakValue(streak)} hint={t.streakHint} />
        <StatTile label={t.flareDays} icon={Flame} iconClass="bg-danger text-bg" value={n(flares)} hint={flares ? t.flareHint : t.noneYet} />
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-ink">{t.adherenceTitle}</h2>
        <p className="mb-2 text-xs text-mute">{t.adherenceFormula}</p>
        {points.every((p) => p.adherence === null) ? <EmptyChart text={t.adherenceEmpty} /> : <AdherenceChart data={points} maxDay={maxDay} />}
      </Card>

      <WorkBreaksCard logs={logs} />

      <Card>
        <h2 className="text-sm font-semibold text-ink">{t.ndiTitle}</h2>
        <p className="mb-3 text-xs text-mute">{t.ndiHint}</p>
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

function EmptyChart({ text }: { text: string }) {
  return <div className="grid h-32 place-items-center rounded-xl border border-dashed border-line bg-well px-6 text-center text-xs text-mute">{text}</div>
}
