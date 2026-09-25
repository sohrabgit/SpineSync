import type { NdiAssessment } from '@/types/recovery'
import { ndiBand } from '@/lib/metrics'
import { NDI_CHECKPOINTS } from '@/data/ndi'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'

/** NDI checkpoints as horizontal meters (0–100%, lower is better). */
export function NdiSummary({ assessments }: { assessments: NdiAssessment[] }) {
  const { m, n } = useI18n()
  return (
    <ul className="space-y-3">
      {NDI_CHECKPOINTS.map((cp) => {
        const a = assessments.find((x) => x.checkpoint === cp)
        const band = a ? ndiBand(a.score_pct) : null
        return (
          <li key={cp} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs font-semibold text-mute">{m.progress.dayN(cp)}</span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2">
              {a && <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${Math.max(2, a.score_pct)}%` }} />}
            </div>
            <span className={cn('shrink-0 text-end text-xs', a ? 'text-ink' : 'text-dim')}>
              {a && band ? (
                <span className="inline-flex items-center gap-1.5">
                  <strong className="font-semibold">{n(`${a.score_pct}%`)}</strong>
                  <Badge tone={band.tone}>{m.ndiBands[band.id]}</Badge>
                </span>
              ) : (
                m.progress.notYet
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
