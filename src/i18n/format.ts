export type Lang = 'en' | 'fa' | 'fr'

export const LANGS: Record<Lang, { dir: 'ltr' | 'rtl'; label: string; locale: string }> = {
  en: { dir: 'ltr', label: 'English', locale: 'en' },
  fr: { dir: 'ltr', label: 'Français', locale: 'fr-FR' },
  fa: { dir: 'rtl', label: 'فارسی', locale: 'fa-IR' },
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** Render numbers with the language's own numerals, decimal separator and percent sign. */
export function localizeDigits(value: number | string, lang: Lang): string {
  const s = String(value)
  if (lang === 'fa') {
    return s.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]!).replace(/(\d|[۰-۹])\.(?=[۰-۹])/g, '$1٫').replace(/%/g, '٪')
  }
  if (lang === 'fr') {
    // Decimal comma and a narrow no-break space before the percent sign ("12,5 %").
    return s.replace(/(\d)\.(?=\d)/g, '$1,').replace(/(\d)%/g, '$1 %')
  }
  return s
}

export function detectLang(): Lang {
  try {
    const nav = navigator.language?.toLowerCase() ?? ''
    if (nav.startsWith('fa')) return 'fa'
    if (nav.startsWith('fr')) return 'fr'
    return 'en'
  } catch {
    return 'en'
  }
}
