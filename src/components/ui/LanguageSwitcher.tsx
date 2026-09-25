import { Languages } from 'lucide-react'
import { LANGS, useI18n, type Lang } from '@/i18n'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { cn } from './cn'

/** Segmented language picker; each option is labelled in its own language. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, m } = useI18n()
  const setLanguage = useRecoveryStore((s) => s.setLanguage)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Languages className="size-4 shrink-0 text-mute" aria-hidden />
      <div role="radiogroup" aria-label={m.common.language} className="flex overflow-hidden rounded-xl border border-line text-xs font-bold">
        {(Object.keys(LANGS) as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={lang === l}
            lang={l}
            onClick={() => setLanguage(l)}
            className={cn('min-h-9 px-3 transition', lang === l ? 'bg-ink text-bg' : 'text-mute hover:text-ink')}
          >
            {LANGS[l].label}
          </button>
        ))}
      </div>
    </div>
  )
}
