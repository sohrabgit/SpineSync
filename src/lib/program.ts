import type { NdiAssessment, NdiCheckpoint, Phase } from '@/types/recovery'
import { NDI_CHECKPOINTS } from '@/data/ndi'
import { daysBetween } from './date'

export const PROGRAM_DAYS = 30

export interface PhaseInfo {
  phase: Phase
  name: string
  startDay: number
  endDay: number
  focus: string
}

/** 4-week progression — playbook §3. */
export const PHASES: Record<Phase, PhaseInfo> = {
  1: { phase: 1, name: 'Pain Control', startDay: 1, endDay: 7, focus: 'Calm inflammation, ease spasm, avoid neck flexion.' },
  2: { phase: 2, name: 'Stabilization', startDay: 8, endDay: 15, focus: 'Activate deep neck flexors and restore pain-free range.' },
  3: { phase: 3, name: 'Strengthening', startDay: 16, endDay: 22, focus: 'Build periscapular strength and correct forward head posture.' },
  4: { phase: 4, name: 'Functional', startDay: 23, endDay: 30, focus: 'Integrate healthy mechanics into daily life and build endurance.' },
}

export function phaseForDay(day: number): Phase {
  if (day <= 7) return 1
  if (day <= 15) return 2
  if (day <= 22) return 3
  return 4
}

/** 1-based program day. Not capped: values above the duration mean the program is complete. */
export function dayFromStart(startISO: string, todayISO: string): number {
  return Math.max(1, daysBetween(startISO, todayISO) + 1)
}

/** Latest NDI checkpoint reached that has not yet been completed, if any. */
export function dueNdiCheckpoint(day: number, assessments: NdiAssessment[]): NdiCheckpoint | null {
  const reached = NDI_CHECKPOINTS.filter((c) => c <= day)
  const latest = reached[reached.length - 1]
  if (latest === undefined) return null
  return assessments.some((a) => a.checkpoint === latest) ? null : latest
}
