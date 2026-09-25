import { cn } from '@/components/ui/cn'
import { TABS, type TabId } from './tabs'

export function BottomNav({ active, onChange, badges }: { active: TabId; onChange: (t: TabId) => void; badges?: Partial<Record<TabId, number>> }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active
          const badge = badges?.[id]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  selected ? 'text-teal-700' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <span
                  className={cn(
                    'relative grid h-8 w-14 place-items-center rounded-full transition-all duration-300',
                    selected ? 'bg-teal-50 scale-100' : 'scale-90',
                  )}
                >
                  <Icon className="size-5" strokeWidth={selected ? 2.4 : 2} aria-hidden />
                  {!!badge && (
                    <span className="absolute -top-0.5 right-2 grid min-w-4 place-items-center rounded-full bg-teal-600 px-1 text-[10px] leading-4 font-bold text-white">
                      {badge}
                    </span>
                  )}
                </span>
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
