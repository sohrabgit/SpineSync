import type { PlanLevel } from '@/types/recovery'
import type { Tone } from '@/lib/metrics'

/**
 * Tone surfaces on the dark theme: a faint wash of the signal colour, a
 * stronger hairline, and the signal colour itself for icons and accents.
 * `stripe` is the solid left-edge bar used by radio-style callouts.
 */
export const TONE_STYLES: Record<Tone, { bg: string; text: string; border: string; icon: string; stripe: string }> = {
  positive: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/35', icon: 'text-success', stripe: 'border-l-success' },
  info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/35', icon: 'text-info', stripe: 'border-l-info' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/35', icon: 'text-warning', stripe: 'border-l-warning' },
  critical: { bg: 'bg-danger/12', text: 'text-danger', border: 'border-danger/45', icon: 'text-danger', stripe: 'border-l-danger' },
}

export const LEVEL_META: Record<PlanLevel, { label: string; short: string; tone: Tone; description: string }> = {
  standard: { label: 'Standard plan', short: 'Standard', tone: 'positive', description: 'Pain is stable or improving, so today follows your phase protocol.' },
  reduced: { label: 'Reduced intensity', short: 'Reduced', tone: 'warning', description: 'Pain is up from yesterday, so today’s exercises drop one difficulty level.' },
  flare_up: { label: 'Flare-up mode', short: 'Flare-up', tone: 'critical', description: 'Isometrics are paused. Focus on rest plus cold and heat therapy.' },
  medical_pause: { label: 'Medical pause', short: 'Paused', tone: 'critical', description: 'You reported a red-flag symptom, so exercises are paused until a clinician reviews it.' },
}

/** VAS colour ramp (0 = green → 10 = coral), matching the slider track. */
export function vasColor(vas: number): string {
  if (vas <= 2) return '#72d39c'
  if (vas <= 4) return '#f2c86b'
  if (vas <= 6) return '#f3a66a'
  return '#f2706b'
}

export function vasLabel(vas: number): string {
  if (vas === 0) return 'No pain'
  if (vas <= 2) return 'Mild'
  if (vas <= 4) return 'Moderate'
  if (vas <= 6) return 'Distressing'
  if (vas <= 8) return 'Severe'
  return 'Unbearable'
}
