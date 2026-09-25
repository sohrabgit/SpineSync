export type Lang = 'en' | 'fa'

export const LANGS: Record<Lang, { dir: 'ltr' | 'rtl'; label: string; locale: string }> = {
  en: { dir: 'ltr', label: 'English', locale: 'en' },
  fa: { dir: 'rtl', label: 'فارسی', locale: 'fa-IR' },
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** Render Latin digits (and the decimal point) in the language's own numerals. */
export function localizeDigits(value: number | string, lang: Lang): string {
  const s = String(value)
  if (lang !== 'fa') return s
  return s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]!).replace(/(\d|[۰-۹])\.(?=[۰-۹])/g, '$1٫').replace(/%/g, '٪')
}

export function detectLang(): Lang {
  try {
    return navigator.language?.toLowerCase().startsWith('fa') ? 'fa' : 'en'
  } catch {
    return 'en'
  }
}
