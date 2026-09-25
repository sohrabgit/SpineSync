import type { RedFlagId } from '@/types/recovery'

/** Medical exclusion criteria — playbook §2. Any flagged item pauses exercises. */
export const RED_FLAGS: { id: RedFlagId; label: string }[] = [
  { id: 'bilateral_numbness', label: 'Severe, sudden or worsening numbness in both arms or hands' },
  { id: 'gait_instability', label: 'Unsteady walking, loss of balance or leg weakness' },
  { id: 'bowel_bladder', label: 'Loss of bowel or bladder control' },
  { id: 'intractable_pain', label: 'Pain not eased at all by rest or usual painkillers' },
  { id: 'motor_deficit', label: 'Sudden hand weakness (e.g. frequently dropping things)' },
]
