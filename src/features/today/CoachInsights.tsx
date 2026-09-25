import { CircleCheckBig, Info, ShieldAlert, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { getInsights } from '@/lib/coach'
import type { Tone } from '@/lib/metrics'
import { selectData, useRecoveryStore } from '@/store/useRecoveryStore'
import { TONE_STYLES } from '@/components/ui/tone'
import { SectionTitle } from '@/components/ui/Card'
import { cn } from '@/components/ui/cn'

const ICONS: Record<Tone, LucideIcon> = { positive: CircleCheckBig, info: Info, warning: TriangleAlert, critical: ShieldAlert }

export function CoachInsights() {
  const data = useRecoveryStore(useShallow(selectData))
  const insights = getInsights(data)
  if (insights.length === 0) return null

  return (
    <section aria-label="Coach insights">
      <SectionTitle
        title="Coach"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="size-3" /> On-device insights
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
              <div className={cn('text-sm', s.text)}>
                <p className="font-semibold">{i.title}</p>
                <p className="mt-0.5 opacity-90">{i.body}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
