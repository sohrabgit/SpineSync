import { ChartLine, Dumbbell, Monitor, Sun, type LucideIcon } from 'lucide-react'

export type TabId = 'today' | 'exercises' | 'ergonomics' | 'progress'

/** `knob` is the solid fill of the tab's menu knob when it is selected. */
export const TABS: { id: TabId; label: string; icon: LucideIcon; knob: string }[] = [
  { id: 'today', label: 'Today', icon: Sun, knob: 'bg-warning' },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell, knob: 'bg-success' },
  { id: 'ergonomics', label: 'Ergonomics', icon: Monitor, knob: 'bg-info' },
  { id: 'progress', label: 'Progress', icon: ChartLine, knob: 'bg-best' },
]
