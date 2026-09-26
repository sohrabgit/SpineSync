import { Anchor, Dumbbell, Footprints, Snowflake, type LucideIcon } from 'lucide-react'

/** One glyph per program phase: calm → stabilise → strengthen → everyday function. */
export const PHASE_ICONS: Record<1 | 2 | 3 | 4, LucideIcon> = { 1: Snowflake, 2: Anchor, 3: Dumbbell, 4: Footprints }
