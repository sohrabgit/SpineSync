import { CircleCheck, Flame, ShieldAlert, TrendingDown, type LucideIcon } from 'lucide-react'
import type { PlanLevel } from '@/types/recovery'
import type { Tone } from '@/lib/metrics'

/**
 * Tone surfaces on the dark theme: a faint wash of the signal colour, a
 * stronger hairline, and the signal colour itself for icons and accents.
 * `stripe` is the solid start-edge bar used by radio-style callouts.
 */
export const TONE_STYLES: Record<Tone, { bg: string; text: string; border: string; icon: string; stripe: string }> = {
  positive: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/35', icon: 'text-success', stripe: 'border-s-success' },
  info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/35', icon: 'text-info', stripe: 'border-s-info' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/35', icon: 'text-warning', stripe: 'border-s-warning' },
  critical: { bg: 'bg-danger/12', text: 'text-danger', border: 'border-danger/45', icon: 'text-danger', stripe: 'border-s-danger' },
}

/** Plan level tones; labels live in i18n (`m.levels`). */
export const LEVEL_TONE: Record<PlanLevel, Tone> = {
  standard: 'positive',
  reduced: 'warning',
  flare_up: 'critical',
  medical_pause: 'critical',
}

/** Plan level glyphs, so the level reads without its label. */
export const LEVEL_ICON: Record<PlanLevel, LucideIcon> = {
  standard: CircleCheck,
  reduced: TrendingDown,
  flare_up: Flame,
  medical_pause: ShieldAlert,
}

/** VAS colour ramp (0 = green → 10 = coral), matching the slider track. */
export function vasColor(vas: number): string {
  if (vas <= 2) return '#72d39c'
  if (vas <= 4) return '#f2c86b'
  if (vas <= 6) return '#f3a66a'
  return '#f2706b'
}

