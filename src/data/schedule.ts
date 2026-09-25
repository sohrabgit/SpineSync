/** Daily schedule & routine — playbook §6. */
export interface ScheduleBlock {
  time: string
  title: string
  items: string[]
}

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  { time: '07:30', title: 'Morning Check', items: ['Log daily pain (VAS)', 'Gentle shoulder rolls ×5', 'In-bed chin tucks ×3'] },
  { time: '08:30', title: 'Work Block 1', items: ['Workstation / driving ergonomics', '20-20-20 rule', 'Mid-morning standing chin tucks ×10'] },
  { time: '13:00', title: 'Lunch & Recovery', items: ['15-min posture-focused walk on flat ground'] },
  { time: '14:00', title: 'Work Block 2', items: ['Hourly position change + light shoulder stretches'] },
  { time: '18:00', title: 'Main Exercise Session', items: ['Warm-up: moist heat 5 min', 'Today’s exercise plan'] },
  { time: '21:30', title: 'Evening Wind-down', items: ['10–15 min neck hot pack', 'Gentle night stretches'] },
  { time: '22:30', title: 'Sleep Preparation', items: ['Align orthopedic pillow & posture'] },
]
