import { Eye, Laptop } from 'lucide-react'
import { eyeNudgeLeft, formatClock, msUntilBreak } from '@/lib/workMode'
import { useNow } from '@/hooks/useNow'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { useBreakSheet } from '@/features/ergonomics/breakSheetStore'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'

/** Compact Work mode status pinned under the header, so the countdown follows the user across tabs. */
export function WorkModeBar({ hidden }: { hidden: boolean }) {
  const session = useRecoveryStore((s) => s.work_session)
  const now = useNow(session !== null && !hidden)
  const showBreak = useBreakSheet((s) => s.show)
  const { m, n } = useI18n()
  const t = m.workMode
  if (!session || hidden) return null

  const left = msUntilBreak(session, now)
  const due = left <= 0
  const eyeLeft = eyeNudgeLeft(session, now)

  return (
    <div className="sticky top-[calc(3.5rem+1px+env(safe-area-inset-top))] z-20 px-4 pt-3">
      <div
        className={cn(
          'flex min-h-11 animate-fade-in items-center gap-2.5 rounded-2xl border px-3 py-1.5 text-sm shadow-lg backdrop-blur-md transition-colors',
          due ? 'border-info/60 bg-info/15' : 'border-line bg-panel/90',
        )}
      >
        {eyeLeft > 0 ? <Eye className="size-4 shrink-0 text-info" aria-hidden /> : <Laptop className={cn('size-4 shrink-0', due ? 'text-info' : 'text-mute')} aria-hidden />}
        <p className="min-w-0 flex-1 truncate">
          {eyeLeft > 0 ? (
            <span className="font-semibold text-info">{t.eyeNow}</span>
          ) : due ? (
            <span className="font-semibold text-info">{t.timeToMove}</span>
          ) : (
            <>
              <span className="font-semibold text-ink">{t.title}</span> <span className="text-mute tabular-nums">· {t.barIn(n(formatClock(left)))}</span>
            </>
          )}
        </p>
        {eyeLeft > 0 && <span className="shrink-0 text-xs text-info tabular-nums">{t.eyeLeft(n(Math.ceil(eyeLeft / 1000)))}</span>}
        <button
          type="button"
          onClick={showBreak}
          className={cn('min-h-8 shrink-0 rounded-lg px-2.5 text-[11px] font-bold tracking-[0.06em] uppercase transition', due ? 'bg-info text-bg' : 'text-brand hover:bg-panel-2')}
        >
          {m.workMode.takeBreak}
        </button>
      </div>
    </div>
  )
}
