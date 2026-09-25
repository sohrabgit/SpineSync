import { Settings } from 'lucide-react'
import { PHASES, PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Badge } from '@/components/ui/Badge'
import { LEVEL_META } from '@/components/ui/tone'

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const day = useRecoveryStore((s) => s.current_day)
  const phase = useRecoveryStore((s) => s.phase)
  const level = useRecoveryStore((s) => s.daily_log.adapted_plan_level)
  const complete = day > PROGRAM_DAYS

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-50/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-slate-900">SpineSync</p>
          <p className="truncate text-xs text-slate-500">
            {complete ? `Day ${day} · Maintenance` : `Day ${day} of ${PROGRAM_DAYS} · ${PHASES[phase].name}`}
          </p>
        </div>
        {level && level !== 'standard' && (
          <Badge tone={LEVEL_META[level].tone} pulse={level !== 'reduced'}>
            {LEVEL_META[level].short}
          </Badge>
        )}
        <button type="button" onClick={onOpenSettings} className="-mr-2 grid size-11 place-items-center rounded-full text-slate-500 hover:bg-slate-200/60" aria-label="Settings">
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  )
}
