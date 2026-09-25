import { Baby, BedDouble, Bike, Car, CookingPot, Monitor, Plane, ShoppingBag, ShowerHead, Smartphone, type LucideIcon } from 'lucide-react'
import type { ErgoCategoryId } from '@/types/recovery'

export const CATEGORY_ICONS: Record<ErgoCategoryId, LucideIcon> = {
  desk: Monitor,
  sleep: BedDouble,
  devices: Smartphone,
  driving: Car,
  cooking: CookingPot,
  bathing: ShowerHead,
  travel: Plane,
  childcare: Baby,
  shopping: ShoppingBag,
  cycling: Bike,
}
