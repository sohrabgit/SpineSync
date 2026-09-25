import { useEffect } from 'react'

/** Keeps the screen awake while `active` (no-op where the Wake Lock API is unsupported). */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = () => {
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (cancelled) void l.release()
          else lock = l
        })
        .catch(() => undefined)
    }
    const onVisible = () => document.visibilityState === 'visible' && acquire()
    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => undefined)
    }
  }, [active])
}
