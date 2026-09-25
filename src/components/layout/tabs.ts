import { ChartLine, Dumbbell, Monitor, Sun, type LucideIcon } from 'lucide-react'

export type TabId = 'today' | 'exercises' | 'ergonomics' | 'progress'

export const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell },
  { id: 'ergonomics', label: 'Ergonomics', icon: Monitor },
  { id: 'progress', label: 'Progress', icon: ChartLine },
]
