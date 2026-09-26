import { Settings } from 'lucide-react'
import { useI18n } from '@/i18n'
import type { TabId } from './tabs'

/** Page header: logo, the tab's title and settings. Program position lives in Today's hero. */
export function Header({ tab, onOpenSettings }: { tab: TabId; onOpenSettings: () => void }) {
  const { m } = useI18n()

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="SpineSync" className="size-8 rounded-lg" />
        <h1 className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight text-ink">{m.tabs[tab]}</h1>
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
