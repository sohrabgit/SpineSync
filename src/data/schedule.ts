/** Daily schedule & routine — playbook §6. Titles and items live in i18n. */
export type ScheduleBlockId = 'morning' | 'work1' | 'lunch' | 'work2' | 'exercise' | 'evening' | 'sleep'

export interface ScheduleBlock {
  id: ScheduleBlockId
  time: string
}

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  { id: 'morning', time: '07:30' },
  { id: 'work1', time: '08:30' },
  { id: 'lunch', time: '13:00' },
  { id: 'work2', time: '14:00' },
  { id: 'exercise', time: '18:00' },
  { id: 'evening', time: '21:30' },
  { id: 'sleep', time: '22:30' },
]
