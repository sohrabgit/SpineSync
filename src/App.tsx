import { lazy, Suspense, useState } from 'react'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { useDayRollover } from '@/hooks/useDayRollover'
import { useDocumentLang, useI18n } from '@/i18n'
import { AppShell } from '@/components/layout/AppShell'
import type { TabId } from '@/components/layout/tabs'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { TodayView } from '@/features/today/TodayView'
import { ExerciseTracker } from '@/features/exercises/ExerciseTracker'
import { ErgoGuide } from '@/features/ergonomics/ErgoGuide'

// Recharts is only needed on the Progress tab — load it on demand.
const ProgressDashboard = lazy(() => import('@/features/progress/ProgressDashboard').then((m) => ({ default: m.ProgressDashboard })))

export default function App() {
  useDayRollover()
  useDocumentLang()
  const { m } = useI18n()
  const onboarded = useRecoveryStore((s) => s.program.onboarded)
  const [tab, setTab] = useState<TabId>('today')

  if (!onboarded) return <Onboarding />

  return (
    <AppShell tab={tab} onTabChange={setTab}>
      {tab === 'today' && <TodayView onNavigate={setTab} />}
      {tab === 'exercises' && <ExerciseTracker onNavigate={setTab} />}
      {tab === 'ergonomics' && <ErgoGuide />}
      {tab === 'progress' && (
        <Suspense fallback={<div className="grid h-64 place-items-center text-sm text-dim">{m.progress.loading}</div>}>
          <ProgressDashboard />
        </Suspense>
      )}
    </AppShell>
  )
}
