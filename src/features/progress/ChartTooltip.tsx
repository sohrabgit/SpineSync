import type { ReactNode } from 'react'
import { LANGS, useI18n } from '@/i18n'

export function ChartTooltipBox({ title, children }: { title: string; children: ReactNode }) {
  const { lang } = useI18n()
  // Charts render inside a dir="ltr" wrapper, so restore the text direction here.
  return (
    <div dir={LANGS[lang].dir} className="rounded-xl border border-line bg-panel-2 px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold text-ink">{title}</p>
      <div className="mt-0.5 space-y-0.5 text-mute">{children}</div>
    </div>
  )
}
