import type { PlanLevel } from '@/types/recovery'
import type { Tone } from '@/lib/metrics'

export const TONE_STYLES: Record<Tone, { bg: string; text: string; border: string; icon: string }> = {
  positive: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: 'text-emerald-600' },
  info: { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', icon: 'text-teal-600' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', icon: 'text-amber-600' },
  critical: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', icon: 'text-rose-600' },
}

export const LEVEL_META: Record<PlanLevel, { label: string; short: string; tone: Tone; description: string }> = {
  standard: { label: 'Standard plan', short: 'Standard', tone: 'positive', description: 'Pain is stable or improving, so today follows your phase protocol.' },
  reduced: { label: 'Reduced intensity', short: 'Reduced', tone: 'warning', description: 'Pain is up from yesterday, so today’s exercises drop one difficulty level.' },
  flare_up: { label: 'Flare-up mode', short: 'Flare-up', tone: 'critical', description: 'Isometrics are paused. Focus on rest plus cold and heat therapy.' },
  medical_pause: { label: 'Medical pause', short: 'Paused', tone: 'critical', description: 'You reported a red-flag symptom, so exercises are paused until a clinician reviews it.' },
}

/** VAS colour ramp (0 = emerald → 10 = rose). */
export function vasColor(vas: number): string {
  if (vas <= 2) return '#10b981'
  if (vas <= 4) return '#65a30d'
  if (vas <= 6) return '#d97706'
  return '#e11d48'
}

export function vasLabel(vas: number): string {
  if (vas === 0) return 'No pain'
  if (vas <= 2) return 'Mild'
  if (vas <= 4) return 'Moderate'
  if (vas <= 6) return 'Distressing'
  if (vas <= 8) return 'Severe'
  return 'Unbearable'
}
