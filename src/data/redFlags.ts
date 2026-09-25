import type { RedFlagId } from '@/types/recovery'

/** Medical exclusion criteria — playbook §2. Any flagged item pauses exercises. Labels live in i18n. */
export const RED_FLAGS: RedFlagId[] = ['bilateral_numbness', 'gait_instability', 'bowel_bladder', 'intractable_pain', 'motor_deficit']
