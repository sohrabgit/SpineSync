import { ChartLine, Dumbbell, Monitor, Sun, type LucideIcon } from 'lucide-react'

export type TabId = 'today' | 'exercises' | 'ergonomics' | 'progress'

/** `knob` is the solid fill of the tab's menu knob when it is selected. Labels live in i18n (`m.tabs`). */
export const TABS: { id: TabId; icon: LucideIcon; knob: string }[] = [
  { id: 'today', icon: Sun, knob: 'bg-warning' },
  { id: 'exercises', icon: Dumbbell, knob: 'bg-success' },
  { id: 'ergonomics', icon: Monitor, knob: 'bg-info' },
  { id: 'progress', icon: ChartLine, knob: 'bg-best' },
]
