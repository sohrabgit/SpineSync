/** Audio + haptic cues for the hold timer and Work mode reminders. Uses the Web Audio API — no assets required. */

let ctx: AudioContext | null = null

/** Must be called from a user gesture (e.g. the Start button) to unlock audio on iOS. */
export function primeAudio(): void {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    ctx = null
  }
}

export type Cue = 'hold-start' | 'hold-end' | 'set-done' | 'break-due' | 'eye-nudge'

const TONES: Record<Cue, { freq: number; ms: number; vibrate: number | number[] }> = {
  'hold-start': { freq: 660, ms: 90, vibrate: 40 },
  'hold-end': { freq: 880, ms: 140, vibrate: 90 },
  'set-done': { freq: 1046, ms: 260, vibrate: [80, 60, 80] },
  'break-due': { freq: 784, ms: 420, vibrate: [200, 100, 200, 100, 200] },
  'eye-nudge': { freq: 523, ms: 160, vibrate: 60 },
}

export function playCue(cue: Cue, sound: boolean): void {
  const t = TONES[cue]
  try {
    navigator.vibrate?.(t.vibrate)
  } catch {
    /* unsupported */
  }
  if (!sound || !ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = t.freq
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + t.ms / 1000)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + t.ms / 1000 + 0.02)
}
