import { ShieldAlert, TriangleAlert } from 'lucide-react'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { useI18n } from '@/i18n'

/**
 * App-wide safety banner for flare-up and medical-pause days (visible across all tabs).
 * `onToday` skips the medical-pause banner there, since Today shows the full pause screen.
 * Reduced days need no banner: Today's check-in badge and the Exercises card say it.
 */
export function StatusBanner({ onToday = false }: { onToday?: boolean }) {
  const level = useRecoveryStore((s) => s.daily_log.adapted_plan_level)
  const { m } = useI18n()
  const b = m.banner

  if (level === 'flare_up') {
    return (
      <div role="alert" className="mx-4 mt-3 flex animate-fade-in gap-3 rounded-e-[14px] rounded-s-[4px] border-s-4 border-danger bg-danger/10 p-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-danger">{b.flareTitle}</p>
          <p className="mt-0.5 text-ink/85">
            {b.flareBody} <strong className="text-ink">{b.flareCta}</strong>.
          </p>
        </div>
      </div>
    )
  }
  if (level === 'medical_pause' && !onToday) {
    return (
      <div role="alert" className="mx-4 mt-3 flex animate-fade-in gap-3 rounded-2xl border border-danger/50 bg-danger/15 p-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-danger">{b.pauseTitle}</p>
          <p className="mt-0.5 text-ink/85">{b.pauseBody}</p>
        </div>
      </div>
    )
  }
  return null
}
