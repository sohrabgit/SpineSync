import type { ReactNode } from 'react'
import type { Tone } from '@/lib/metrics'
import { TONE_STYLES } from './tone'
import { cn } from './cn'

export function Badge({ tone = 'info', children, className, pulse }: { tone?: Tone | 'neutral'; children: ReactNode; className?: string; pulse?: boolean }) {
  const styles = tone === 'neutral' ? 'bg-slate-100 text-slate-600 border-slate-200' : cn(TONE_STYLES[tone].bg, TONE_STYLES[tone].text, TONE_STYLES[tone].border)
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', styles, className)}>
      {pulse && <span className="size-1.5 animate-pulse-soft rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
