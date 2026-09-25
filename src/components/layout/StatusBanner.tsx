import { ShieldAlert, TriangleAlert, TrendingDown } from 'lucide-react'
import { useRecoveryStore } from '@/store/useRecoveryStore'

/** App-wide banner for non-standard plan levels (visible across all tabs). */
export function StatusBanner() {
  const level = useRecoveryStore((s) => s.daily_log.adapted_plan_level)

  if (level === 'flare_up') {
    return (
      <div role="alert" className="mx-4 mt-3 flex animate-fade-in gap-3 rounded-[4px_14px_14px_4px] border-l-4 border-danger bg-danger/10 p-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-danger">Flare-Up Emergency Mode</p>
          <p className="mt-0.5 text-ink/85">
            Isometric and strengthening exercises are paused. If severe pain lasts more than 48 hours, or arm pain, numbness or weakness gets worse,{' '}
            <strong className="text-ink">contact your doctor</strong>.
          </p>
        </div>
      </div>
    )
  }
  if (level === 'medical_pause') {
    return (
      <div role="alert" className="mx-4 mt-3 flex animate-fade-in gap-3 rounded-2xl border border-danger/50 bg-danger/15 p-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-danger">Exercises paused: red-flag symptom reported</p>
          <p className="mt-0.5 text-ink/85">Please get urgent medical advice. For sudden weakness or loss of bladder/bowel control, call emergency services.</p>
        </div>
      </div>
    )
  }
  if (level === 'reduced') {
    return (
      <div className="mx-4 mt-3 flex animate-fade-in items-center gap-3 rounded-[4px_14px_14px_4px] border-l-4 border-warning bg-well px-3 py-2.5 text-sm">
        <TrendingDown className="size-4 shrink-0 text-warning" aria-hidden />
        <p className="text-ink/85">
          <span className="font-bold text-warning">Reduced intensity:</span> pain is higher than yesterday, so today’s exercises are one level easier.
        </p>
      </div>
    )
  }
  return null
}
