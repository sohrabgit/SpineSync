import { useEffect } from 'react'
import { useRecoveryStore } from '@/store/useRecoveryStore'

/** Keeps the active daily log in sync with the calendar (on focus, visibility, and every minute). */
export function useDayRollover(): void {
  const syncDay = useRecoveryStore((s) => s.syncDay)
  useEffect(() => {
    syncDay()
    const onVisible = () => document.visibilityState === 'visible' && syncDay()
    const interval = window.setInterval(syncDay, 60_000)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', syncDay)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', syncDay)
    }
  }, [syncDay])
}
