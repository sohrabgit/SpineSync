import { Settings } from 'lucide-react'
import { PHASES, PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { Badge } from '@/components/ui/Badge'
import { LEVEL_TONE } from '@/components/ui/tone'
import { useI18n } from '@/i18n'

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const day = useRecoveryStore((s) => s.current_day)
  const phase = useRecoveryStore((s) => s.phase)
  const level = useRecoveryStore((s) => s.daily_log.adapted_plan_level)
  const complete = day > PROGRAM_DAYS
  const { m } = useI18n()

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-ink">SpineSync</p>
          <p className="truncate text-xs text-mute">
            {complete ? m.header.maintenance(day) : m.header.dayOf(day, PROGRAM_DAYS, m.phases[PHASES[phase].phase].name)}
          </p>
        </div>
        {level && level !== 'standard' && (
          <Badge tone={LEVEL_TONE[level]} pulse={level !== 'reduced'}>
            {m.levels[level].short}
          </Badge>
        )}
        <button
          type="button"
          onClick={onOpenSettings}
          className="grid size-10 place-items-center rounded-full border border-line bg-panel text-mute hover:border-line-strong hover:text-ink"
          aria-label={m.common.settings}
        >
          <Settings className="size-[18px]" />
        </button>
      </div>
    </header>
  )
}
