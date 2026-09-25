import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type TimerPhase = 'idle' | 'hold' | 'rest'

interface HoldTimerOptions {
  holdSeconds: number
  restSeconds: number
  /** Called when a hold finishes. Return true to continue (rest → next hold), false to stop. */
  onHoldComplete: () => boolean
  onHoldStart?: () => void
}

export interface HoldTimer {
  phase: TimerPhase
  running: boolean
  remainingMs: number
  durationMs: number
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
}

const TICK_MS = 100

/**
 * Hold/rest cycle timer driven by wall-clock timestamps (accurate even when
 * intervals are throttled in background tabs).
 */
export function useHoldTimer({ holdSeconds, restSeconds, onHoldComplete, onHoldStart }: HoldTimerOptions): HoldTimer {
  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [running, setRunning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(holdSeconds * 1000)

  const endAt = useRef(0)
  const phaseRef = useRef<TimerPhase>('idle')
  const callbacks = useRef({ onHoldComplete, onHoldStart })
  useLayoutEffect(() => {
    callbacks.current = { onHoldComplete, onHoldStart }
  })

  const holdMs = holdSeconds * 1000
  const restMs = restSeconds * 1000

  const enter = useCallback((next: TimerPhase, ms: number) => {
    phaseRef.current = next
    setPhase(next)
    endAt.current = Date.now() + ms
    setRemainingMs(ms)
    if (next === 'hold') callbacks.current.onHoldStart?.()
  }, [])

  // Reset display when the prescription changes while idle.
  useEffect(() => {
    if (phaseRef.current === 'idle') setRemainingMs(holdMs)
  }, [holdMs])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const left = endAt.current - Date.now()
      if (left > 0) {
        setRemainingMs(left)
        return
      }
      if (phaseRef.current === 'hold') {
        const cont = callbacks.current.onHoldComplete()
        if (!cont) {
          phaseRef.current = 'idle'
          setPhase('idle')
          setRunning(false)
          setRemainingMs(holdMs)
        } else if (restMs > 0) enter('rest', restMs)
        else enter('hold', holdMs)
      } else if (phaseRef.current === 'rest') {
        enter('hold', holdMs)
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [running, holdMs, restMs, enter])

  const start = useCallback(() => {
    enter('hold', holdMs)
    setRunning(true)
  }, [enter, holdMs])

  const pause = useCallback(() => {
    setRunning(false)
    setRemainingMs(Math.max(0, endAt.current - Date.now()))
  }, [])

  const resume = useCallback(() => {
    endAt.current = Date.now() + remainingMs
    setRunning(true)
  }, [remainingMs])

  const stop = useCallback(() => {
    setRunning(false)
    phaseRef.current = 'idle'
    setPhase('idle')
    setRemainingMs(holdMs)
  }, [holdMs])

  const durationMs = phase === 'rest' ? restMs : holdMs
  return { phase, running, remainingMs, durationMs, start, pause, resume, stop }
}
