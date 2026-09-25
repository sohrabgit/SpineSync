import { Activity, BedDouble, Dumbbell, Flame, Footprints, RefreshCw, Snowflake, Waves, type LucideIcon } from 'lucide-react'
import type { ExerciseId } from '@/types/recovery'

export const EXERCISE_ICONS: Record<ExerciseId, { icon: LucideIcon; bg: string; fg: string }> = {
  chin_tuck: { icon: RefreshCw, bg: 'bg-teal-50', fg: 'text-teal-700' },
  isometric_4way: { icon: Activity, bg: 'bg-indigo-50', fg: 'text-indigo-700' },
  upper_trap_stretch: { icon: Waves, bg: 'bg-sky-50', fg: 'text-sky-700' },
  scapular_retraction: { icon: Dumbbell, bg: 'bg-violet-50', fg: 'text-violet-700' },
  shoulder_rolls: { icon: RefreshCw, bg: 'bg-emerald-50', fg: 'text-emerald-700' },
  brisk_walk: { icon: Footprints, bg: 'bg-lime-50', fg: 'text-lime-700' },
  heat_therapy: { icon: Flame, bg: 'bg-orange-50', fg: 'text-orange-600' },
  cold_therapy: { icon: Snowflake, bg: 'bg-cyan-50', fg: 'text-cyan-700' },
  supported_rest: { icon: BedDouble, bg: 'bg-slate-100', fg: 'text-slate-600' },
}
