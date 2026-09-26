import { useState } from 'react'
import { ChevronDown, CircleCheckBig, Info, ShieldAlert, TriangleAlert, type LucideIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { getInsights } from '@/lib/coach'
import type { Tone } from '@/lib/metrics'
import { selectData, useRecoveryStore } from '@/store/useRecoveryStore'
import { TONE_STYLES } from '@/components/ui/tone'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'

const ICONS: Record<Tone, LucideIcon> = { positive: CircleCheckBig, info: Info, warning: TriangleAlert, critical: ShieldAlert }

/** Safety tones keep their body open; the rest show a one-line title that expands on tap. */
const OPEN_BY_DEFAULT: Tone[] = ['warning', 'critical']

/**
 * `hide` drops insights the surrounding screen already covers (e.g. Today's plan asks for the check-in itself);
 * `limit` caps how many show, highest priority first.
 */
export function CoachInsights({ hide = [], limit }: { hide?: string[]; limit?: number }) {
  const data = useRecoveryStore(useShallow(selectData))
  const { m } = useI18n()
  const insights = getInsights(data, m)
    .filter((i) => !hide.includes(i.id))
    .slice(0, limit)
  if (insights.length === 0) return null

  return (
    <ul className="space-y-2" aria-label={m.coach.aria}>
      {insights.map((i) => (
        <InsightRow key={i.id} tone={i.tone} title={i.title} body={i.body} />
      ))}
    </ul>
  )
}

function InsightRow({ tone, title, body }: { tone: Tone; title: string; body: string }) {
  const [open, setOpen] = useState(OPEN_BY_DEFAULT.includes(tone))
  const s = TONE_STYLES[tone]
  const Icon = ICONS[tone]
  return (
    <li className={cn('animate-fade-in rounded-2xl border', s.bg, s.border)}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-start">
        <Icon className={cn('size-5 shrink-0', s.icon)} aria-hidden />
        <span className={cn('flex-1 text-sm font-semibold', s.text)}>{title}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-dim transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && <p className="animate-fade-in px-3 pb-3 ps-11 text-sm text-ink/80">{body}</p>}
    </li>
  )
}
