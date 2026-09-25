import type { NdiCheckpoint } from '@/types/recovery'

/**
 * Neck Disability Index — 10 sections of six options scored 0 (no disability) → 5 (maximal),
 * paraphrased from Vernon & Mior, 1991. Section text lives in i18n (`m.ndi.sections`).
 */
export const NDI_SECTION_COUNT = 10

export const NDI_CHECKPOINTS: NdiCheckpoint[] = [1, 15, 30]
