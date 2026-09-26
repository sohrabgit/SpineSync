import { Settings } from 'lucide-react'
import { PHASES, PROGRAM_DAYS } from '@/lib/program'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { useI18n } from '@/i18n'
import type { TabId } from './tabs'

/**
 * Page header: the tab's title, with the date on Today (the hero there already shows
 * the program day) and the program day elsewhere. Plan-level status lives in StatusBanner.
 */
export function Header({ tab, onOpenSettings }: { tab: TabId; onOpenSettings: () => void }) {
  const day = useRecoveryStore((s) => s.current_day)
  const phase = useRecoveryStore((s) => s.phase)
  const logDate = useRecoveryStore((s) => s.daily_log.date)
  const { m, date } = useI18n()
  const complete = day > PROGRAM_DAYS

  const subtitle =
    tab === 'today'
      ? date(logDate, { weekday: 'long', month: 'long', day: 'numeric' })
      : complete
        ? m.header.maintenance(day)
        : m.header.dayOf(day, PROGRAM_DAYS, m.phases[PHASES[phase].phase].name)

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="SpineSync" className="size-8 rounded-lg" />
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="text-[17px] font-bold tracking-tight text-ink">{m.tabs[tab]}</h1>
          <p className="truncate text-xs text-mute">{subtitle}</p>
        </div>
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
