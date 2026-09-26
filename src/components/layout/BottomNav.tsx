import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'
import { TABS, type TabId } from './tabs'

/** Primary menu in Hello Again's knob style: round tactile buttons with a label beneath. */
export function BottomNav({ active, onChange, badges }: { active: TabId; onChange: (t: TabId) => void; badges?: Partial<Record<TabId, number>> }) {
  const { m, n } = useI18n()
  return (
    <nav aria-label={m.tabs.primary} className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="grid grid-cols-4">
        {TABS.map(({ id, icon: Icon, knob }) => {
          const selected = id === active
          const badge = badges?.[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? 'page' : undefined}
                className="group flex h-[76px] w-full flex-col items-center justify-center gap-1.5"
              >
                <span
                  className={cn(
                    'knob relative grid size-10 place-items-center transition-all duration-200 group-active:scale-[0.93]',
                    selected ? cn(knob, 'text-bg') : 'bg-panel-2 text-mute group-hover:text-ink',
                  )}
                >
                  <Icon className="size-[19px]" strokeWidth={2.2} aria-hidden />
                  {!!badge && (
                    <span className="absolute -top-1 -end-1.5 grid min-w-[18px] place-items-center rounded-full border-2 border-panel bg-brand px-1 text-[10px] leading-[14px] font-bold text-bg">
                      {n(badge)}
                    </span>
                  )}
                </span>
                <span className={cn('text-[11px] font-medium transition-colors', selected ? 'text-ink' : 'text-dim')}>{m.tabs[id]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
