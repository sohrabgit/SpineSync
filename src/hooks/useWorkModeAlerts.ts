import { useEffect, useRef } from 'react'
import { ALERT_GRACE_MS, EYE_NUDGE_MS, nextBreakAt, nextEyeNudgeAt } from '@/lib/workMode'
import { playCue, primeAudio } from '@/lib/cues'
import { useRecoveryStore } from '@/store/useRecoveryStore'
import { useI18n } from '@/i18n'
import { useNow } from './useNow'

/** Ask for notification permission. Must be called from a user gesture. */
export function requestNotifications(): void {
  try {
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission().catch(() => {})
  } catch {
    /* unsupported */
  }
}

/** System notification, only while the app is in the background (in the foreground the in-app bar is enough). */
function notify(title: string, body: string): void {
  if (document.visibilityState === 'visible') return
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, tag: 'spinesync-break', icon: `${import.meta.env.BASE_URL}favicon.svg` })
    }
  } catch {
    /* Some mobile browsers only allow notifications from a service worker. */
  }
}

/**
 * Fires Work mode reminders: a cue + notification when a movement break is due, and
 * 20-20-20 eye nudges. Mount once (in the app shell) so reminders work on every tab.
 * Alerts more than a minute late (e.g. the device slept) are skipped rather than replayed.
 */
export function useWorkModeAlerts(): void {
  const session = useRecoveryStore((s) => s.work_session)
  const sound = useRecoveryStore((s) => s.preferences.sound_enabled)
  const markEyeNudge = useRecoveryStore((s) => s.markEyeNudge)
  const active = session !== null
  const now = useNow(active)
  const { m } = useI18n()
  const t = m.workMode
  const alertedBreakAt = useRef<number | null>(null)

  // Audio can only start after a user gesture, so unlock it on the first tap after a reload.
  useEffect(() => {
    if (!active) return
    window.addEventListener('pointerdown', primeAudio, { once: true })
    return () => window.removeEventListener('pointerdown', primeAudio)
  }, [active])

  const breakAt = session ? nextBreakAt(session) : null
  useEffect(() => {
    if (breakAt === null || now < breakAt || alertedBreakAt.current === breakAt) return
    alertedBreakAt.current = breakAt
    if (now - breakAt > ALERT_GRACE_MS) return
    playCue('break-due', sound)
    notify(t.notifyTitle, t.notifyBody)
  }, [breakAt, now, sound, t])

  const eyeAt = session ? nextEyeNudgeAt(session) : null
  useEffect(() => {
    if (eyeAt === null || now < eyeAt) return
    const stale = now - eyeAt > ALERT_GRACE_MS
    // A missed nudge is recorded as already finished, so the next one is 20 min from now.
    markEyeNudge(stale ? now - EYE_NUDGE_MS : eyeAt)
    if (!stale) playCue('eye-nudge', sound)
  }, [eyeAt, now, sound, markEyeNudge])

  const due = breakAt !== null && now >= breakAt
  useEffect(() => {
    if (!due) return
    const prev = document.title
    document.title = `⏰ ${t.timeToMove}`
    return () => {
      document.title = prev
    }
  }, [due, t])
}
