import { useEffect } from 'react'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { en, type Messages } from './en'
import { fa } from './fa'
import { LANGS, localizeDigits, type Lang } from './format'

export { LANGS, type Lang, type Messages }

export const MESSAGES: Record<Lang, Messages> = { en, fa }

export interface I18n {
  lang: Lang
  rtl: boolean
  m: Messages
  /** Format a number (or numeric string) in the active language's digits. */
  n: (value: number | string) => string
  /** Locale-aware date for a `YYYY-MM-DD` string (Persian uses the Solar Hijri calendar). */
  date: (iso: string, opts?: Intl.DateTimeFormatOptions) => string
}

export function i18nFor(lang: Lang): I18n {
  return {
    lang,
    rtl: LANGS[lang].dir === 'rtl',
    m: MESSAGES[lang],
    n: (value) => localizeDigits(value, lang),
    date: (iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) => {
      const [y, mo, d] = iso.split('-').map(Number)
      return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1).toLocaleDateString(LANGS[lang].locale, opts)
    },
  }
}

export function useI18n(): I18n {
  const lang = useRecoveryStore((s) => s.preferences.language)
  return i18nFor(lang)
}

/** Keeps `<html lang dir>` in sync with the chosen language. */
export function useDocumentLang(): void {
  const lang = useRecoveryStore((s) => s.preferences.language)
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = LANGS[lang].dir
  }, [lang])
}
