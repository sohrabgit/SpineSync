import type { DailyLog } from '@/types/recovery'
import { BREAK_GOAL } from '@/data/ergonomics'
import { breakPainLink, postureSlip, workBreakStats } from '@/lib/metrics'
import { Card } from '@/components/ui/Card'
import { useI18n } from '@/i18n'

/** Work mode insights: work time, break rate, the most common posture slip and the break–pain pattern. */
export function WorkBreaksCard({ logs }: { logs: DailyLog[] }) {
  const { m, n } = useI18n()
  const t = m.workMode.insights
  const stats = workBreakStats(logs)
  const slip = postureSlip(logs)
  const link = breakPainLink(logs)

  return (
    <Card>
      <h2 className="text-sm font-semibold text-ink">{t.title}</h2>
      <p className="mb-3 text-xs text-mute">{t.hint}</p>
      {!stats && !slip && !link ? (
        <p className="rounded-xl border border-dashed border-line bg-well px-4 py-5 text-center text-xs text-mute">{t.empty}</p>
      ) : (
        <div className="space-y-3">
          {stats && (
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-well p-3">
                <dt className="cap text-[11px] text-mute">{t.workTime}</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-ink">{t.hours(n(stats.hours))}</dd>
                <dd className="text-[11px] text-mute">{t.workTimeHint(n(stats.breaks))}</dd>
              </div>
              <div className="rounded-xl bg-well p-3">
                <dt className="cap text-[11px] text-mute">{t.perHour}</dt>
                <dd className={`mt-1 text-xl font-bold tabular-nums ${stats.perHour >= 0.8 ? 'text-success' : 'text-warning'}`}>{n(stats.perHour)}</dd>
                <dd className="text-[11px] text-mute">{t.perHourHint}</dd>
              </div>
            </dl>
          )}
          {slip && <p className="text-xs text-ink/85">{t.slip(t.slipLabels[slip.issue], n(slip.count), n(slip.total))}</p>}
          {link && (
            <div className="rounded-e-[12px] rounded-s-[4px] border-s-4 border-info bg-well p-2.5 text-xs">
              <p className="text-ink/85">{t.painLink(n(BREAK_GOAL), n(link.withGoal), n(link.withoutGoal))}</p>
              <p className="mt-1 text-[11px] text-mute">{t.painLinkNote}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
