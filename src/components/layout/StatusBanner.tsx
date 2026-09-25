import { ShieldAlert, TriangleAlert, TrendingDown } from 'lucide-react'
import { useRecoveryStore } from '@/store/useRecoveryStore'

/** App-wide banner for non-standard plan levels (visible across all tabs). */
export function StatusBanner() {
  const level = useRecoveryStore((s) => s.daily_log.adapted_plan_level)

  if (level === 'flare_up') {
    return (
      <div role="alert" className="mx-4 mt-3 flex animate-fade-in gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-900">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">Flare-Up Emergency Mode</p>
          <p className="mt-0.5 text-rose-800/90">
            Isometric and strengthening exercises are paused. If severe pain lasts more than 48 hours, or arm pain, numbness or weakness gets worse,{' '}
            <strong>contact your doctor</strong>.
          </p>
        </div>
      </div>
    )
  }
  if (level === 'medical_pause') {
    return (
      <div role="alert" className="mx-4 mt-3 flex animate-fade-in gap-3 rounded-2xl bg-rose-600 p-3 text-white shadow-lg shadow-rose-900/20">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">Exercises paused: red-flag symptom reported</p>
          <p className="mt-0.5 text-rose-50">Please get urgent medical advice. For sudden weakness or loss of bladder/bowel control, call emergency services.</p>
        </div>
      </div>
    )
  }
  if (level === 'reduced') {
    return (
      <div className="mx-4 mt-3 flex animate-fade-in items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
        <TrendingDown className="size-4 shrink-0 text-amber-600" aria-hidden />
        <p>
          <span className="font-semibold">Reduced intensity:</span> pain is higher than yesterday, so today’s exercises are one level easier.
        </p>
      </div>
    )
  }
  return null
}
