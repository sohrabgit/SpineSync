import { useEffect, useState } from 'react'

/** Current epoch ms, refreshed every `tickMs` (and on returning to the tab) while `active`. */
export function useNow(active: boolean, tickMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const tick = () => setNow(Date.now())
    tick()
    const interval = window.setInterval(tick, tickMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [active, tickMs])
  return now
}
