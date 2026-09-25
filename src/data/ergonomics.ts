import type { ErgoCategory, ErgoCategoryId } from '@/types/recovery'

/** Minimum movement breaks per day to satisfy the "breaks" checklist item (playbook §7). */
export const BREAK_GOAL = 3

/** Pseudo-task id representing the hourly-breaks goal in compliance calculations. */
export const BREAKS_TASK_ID = 'hourly_breaks_goal'

/** Lifestyle & ergonomics guide — playbook §5. Task ids double as `ergonomics_checklist` keys. */
export const ERGO_CATEGORIES: ErgoCategory[] = [
  {
    id: 'desk',
    name: 'Desk & Workstation',
    blurb: 'Screen at eye level, supported forearms, regular breaks.',
    core: true,
    tasks: [
      { id: 'monitor_height_checked', label: 'Monitor top edge at eye level', detail: 'Raise the screen with a stand or books.' },
      { id: 'monitor_distance_set', label: 'Screen 50–70 cm away', detail: 'About an arm’s length.' },
      { id: 'forearms_supported', label: 'Forearms supported at 90–100°', detail: 'Use armrests or the desk surface.' },
      { id: 'rule_20_20_20', label: 'Followed the 20-20-20 rule', detail: 'Every 20 min, look 20 ft away for 20 s.' },
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep & Pillows',
    blurb: 'Neutral spine through the night.',
    core: true,
    tasks: [
      { id: 'sleeping_position_adhered', label: 'Slept on back or side (not stomach)', detail: 'Pillow under knees (back) or between knees (side).' },
      { id: 'pillow_aligned', label: 'Contoured memory-foam pillow aligned', detail: 'Fills the gap between shoulder and neck.' },
    ],
  },
  {
    id: 'devices',
    name: 'Phone & Reading',
    blurb: 'Bring the screen up — not your head down.',
    core: true,
    tasks: [
      { id: 'device_eye_level', label: 'Phone/book held at eye level', detail: 'Prevents “text neck”.' },
    ],
  },
  {
    id: 'driving',
    name: 'Driving & Commuting',
    blurb: 'Headrest contact and no sharp neck twists.',
    core: false,
    tasks: [
      { id: 'headrest_contact', label: 'Seat set so head rests on headrest' },
      { id: 'hands_9_3', label: 'Hands at 9 and 3, elbows slightly bent' },
      { id: 'red_light_chin_tucks', label: 'Chin tucks at red lights (2–3)' },
      { id: 'mirrors_not_twist', label: 'Used mirrors / torso turn when reversing' },
    ],
  },
  {
    id: 'cooking',
    name: 'Cooking & Kitchen',
    blurb: 'Raise the work, lower the heavy stuff.',
    core: false,
    tasks: [
      { id: 'cutting_board_raised', label: 'Cutting board elevated' },
      { id: 'footstool_dishes', label: 'Footstool under one foot at the sink', detail: 'Alternate feet every 5 minutes.' },
      { id: 'heavy_pots_waist', label: 'Heavy pots stored at waist height' },
    ],
  },
  {
    id: 'bathing',
    name: 'Bathing & Grooming',
    blurb: 'No head tilt-backs; bend the knees, not the neck.',
    core: false,
    tasks: [
      { id: 'shower_lean_forward', label: 'Leaned forward in the shower (no tilting back)' },
      { id: 'squat_at_sink', label: 'Bent knees at the sink instead of the neck' },
      { id: 'mirror_eye_level', label: 'Mirror at eye level' },
    ],
  },
  {
    id: 'travel',
    name: 'Travel',
    blurb: 'Neck pillow and movement breaks on long journeys.',
    core: false,
    tasks: [
      { id: 'u_pillow_used', label: 'U-shaped memory foam pillow in transit' },
      { id: 'travel_walk_breaks', label: 'Walked 2 min every 1–1.5 h' },
      { id: 'luggage_rolled_beside', label: 'Rolled luggage beside the body' },
    ],
  },
  {
    id: 'childcare',
    name: 'Childcare & Parenting',
    blurb: 'Lift with the legs, keep little ones close.',
    core: false,
    tasks: [
      { id: 'child_held_close', label: 'Held child close to the chest' },
      { id: 'squat_to_lift_child', label: 'Squatted to lift from crib/floor' },
      { id: 'feeding_pillow_used', label: 'Used a feeding pillow at chest level' },
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping & Chores',
    blurb: 'Balance the load — max 3 kg per hand.',
    core: false,
    tasks: [
      { id: 'loads_balanced', label: 'Loads split evenly (≤3 kg per side)' },
      { id: 'backpack_used', label: 'Used an ergonomic backpack for heavier loads' },
      { id: 'chores_no_overhead', label: 'Avoided prolonged overhead reaching' },
    ],
  },
  {
    id: 'intimacy',
    name: 'Sexual Health',
    blurb: 'Neutral neck positions, no weight through the arms or neck.',
    core: false,
    tasks: [
      { id: 'neutral_intimacy_position', label: 'Chose a supported, neutral-neck position', detail: 'e.g. lying on your back with a neck pillow.' },
    ],
  },
]

export const DEFAULT_ACTIVE_CATEGORIES: ErgoCategoryId[] = ERGO_CATEGORIES.filter((c) => c.core).map((c) => c.id)

export const getCategory = (id: ErgoCategoryId): ErgoCategory | undefined => ERGO_CATEGORIES.find((c) => c.id === id)
