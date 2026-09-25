import type { ErgoCategory, ErgoCategoryId } from '@/types/recovery'

/** Minimum movement breaks per day to satisfy the "breaks" checklist item (playbook §7). */
export const BREAK_GOAL = 3

/** Pseudo-task id representing the hourly-breaks goal in compliance calculations. */
export const BREAKS_TASK_ID = 'hourly_breaks_goal'

/** Lifestyle & ergonomics guide — playbook §5. Task ids double as `ergonomics_checklist` keys; copy lives in i18n. */
export const ERGO_CATEGORIES: ErgoCategory[] = [
  { id: 'desk', core: true, tasks: [{ id: 'monitor_height_checked' }, { id: 'monitor_distance_set' }, { id: 'forearms_supported' }, { id: 'rule_20_20_20' }] },
  { id: 'sleep', core: true, tasks: [{ id: 'sleeping_position_adhered' }, { id: 'pillow_aligned' }] },
  { id: 'devices', core: true, tasks: [{ id: 'device_eye_level' }] },
  { id: 'driving', core: false, tasks: [{ id: 'headrest_contact' }, { id: 'hands_9_3' }, { id: 'red_light_chin_tucks' }, { id: 'mirrors_not_twist' }] },
  { id: 'cooking', core: false, tasks: [{ id: 'cutting_board_raised' }, { id: 'footstool_dishes' }, { id: 'heavy_pots_waist' }] },
  { id: 'bathing', core: false, tasks: [{ id: 'shower_lean_forward' }, { id: 'squat_at_sink' }, { id: 'mirror_eye_level' }] },
  { id: 'travel', core: false, tasks: [{ id: 'u_pillow_used' }, { id: 'travel_walk_breaks' }, { id: 'luggage_rolled_beside' }] },
  { id: 'childcare', core: false, tasks: [{ id: 'child_held_close' }, { id: 'squat_to_lift_child' }, { id: 'feeding_pillow_used' }] },
  { id: 'shopping', core: false, tasks: [{ id: 'loads_balanced' }, { id: 'backpack_used' }, { id: 'chores_no_overhead' }] },
  { id: 'cycling', core: false, tasks: [{ id: 'handlebars_raised' }, { id: 'chin_tuck_at_stops' }, { id: 'smooth_short_rides' }] },
]

export const DEFAULT_ACTIVE_CATEGORIES: ErgoCategoryId[] = ERGO_CATEGORIES.filter((c) => c.core).map((c) => c.id)

export const getCategory = (id: ErgoCategoryId): ErgoCategory | undefined => ERGO_CATEGORIES.find((c) => c.id === id)
