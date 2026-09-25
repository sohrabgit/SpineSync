import { useEffect, useState, type ReactNode } from 'react'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { SettingsSheet } from '@/features/settings/SettingsSheet'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { StatusBanner } from './StatusBanner'
import type { TabId } from './tabs'

export function AppShell({ tab, onTabChange, children }: { tab: TabId; onTabChange: (t: TabId) => void; children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const remaining = useRecoveryStore((s) => s.daily_log.exercises_completed.filter((e) => e.status === 'pending' || e.status === 'in_progress').length)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  return (
    <div className="relative mx-auto min-h-dvh max-w-md bg-slate-50 shadow-xl shadow-slate-900/5">
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <StatusBanner />
      <main key={tab} className="animate-fade-in px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav active={tab} onChange={onTabChange} badges={{ exercises: remaining }} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
