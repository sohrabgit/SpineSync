import { CircleCheckBig, Info, ShieldAlert, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { getInsights } from '@/lib/coach'
import type { Tone } from '@/lib/metrics'
import { selectData, useRecoveryStore } from '@/store/useRecoveryStore'
import { TONE_STYLES } from '@/components/ui/tone'
import { SectionTitle } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'
import { useI18n } from '@/i18n'

const ICONS: Record<Tone, LucideIcon> = { positive: CircleCheckBig, info: Info, warning: TriangleAlert, critical: ShieldAlert }

export function CoachInsights() {
  const data = useRecoveryStore(useShallow(selectData))
  const { m } = useI18n()
  const insights = getInsights(data, m)
  if (insights.length === 0) return null

  return (
    <section aria-label={m.coach.aria}>
      <SectionTitle
        title={m.coach.title}
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-dim">
            <Sparkles className="size-3" /> {m.coach.onDevice}
          </span>
        }
      />
      <ul className="space-y-2">
        {insights.map((i) => {
          const s = TONE_STYLES[i.tone]
          const Icon = ICONS[i.tone]
          return (
            <li key={i.id} className={cn('flex animate-fade-in gap-3 rounded-2xl border p-3', s.bg, s.border)}>
              <Icon className={cn('mt-0.5 size-5 shrink-0', s.icon)} aria-hidden />
              <div className="text-sm">
                <p className={cn('font-semibold', s.text)}>{i.title}</p>
                <p className="mt-0.5 text-ink/80">{i.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
