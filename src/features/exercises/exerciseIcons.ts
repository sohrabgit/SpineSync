import { Activity, BedDouble, Dumbbell, Flame, Footprints, RefreshCw, Snowflake, Waves, type LucideIcon } from 'lucide-react'
import type { ExerciseId } from '@/types/recovery'

/**
 * Each exercise gets a colour: used for its stripe, icon tint and tile wash.
 * `color` is a hex for inline styles (stripes, rings); `bg`/`fg` are the matching utilities.
 */
export const EXERCISE_ICONS: Record<ExerciseId, { icon: LucideIcon; color: string; bg: string; fg: string }> = {
  chin_tuck: { icon: RefreshCw, color: '#5cc8b0', bg: 'bg-brand/12', fg: 'text-brand' },
  isometric_4way: { icon: Activity, color: '#b8a2f2', bg: 'bg-best/12', fg: 'text-best' },
  upper_trap_stretch: { icon: Waves, color: '#7fa9f5', bg: 'bg-info/12', fg: 'text-info' },
  scapular_retraction: { icon: Dumbbell, color: '#f2c86b', bg: 'bg-warning/12', fg: 'text-warning' },
  shoulder_rolls: { icon: RefreshCw, color: '#72d39c', bg: 'bg-success/12', fg: 'text-success' },
  brisk_walk: { icon: Footprints, color: '#72d39c', bg: 'bg-success/12', fg: 'text-success' },
  heat_therapy: { icon: Flame, color: '#f3a66a', bg: 'bg-heat/12', fg: 'text-heat' },
  cold_therapy: { icon: Snowflake, color: '#82d2e6', bg: 'bg-cold/12', fg: 'text-cold' },
  supported_rest: { icon: BedDouble, color: '#9aa1b5', bg: 'bg-panel-2', fg: 'text-mute' },
}
