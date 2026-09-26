let hidden = false

/**
 * Fades out the launch splash from index.html. The splash stays up for at least
 * `minMs` after navigation start (page load time counts), so it reads as a
 * deliberate beat rather than a flicker. Safe to call more than once.
 */
export function hideSplash(minMs = 4400): void {
  if (hidden) return
  hidden = true
  const el = document.getElementById('splash')
  if (!el) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const wait = Math.max(0, (reduced ? 300 : minMs) - performance.now())

  window.setTimeout(() => {
    const remove = () => el.remove()
    el.addEventListener('transitionend', remove, { once: true })
    window.setTimeout(remove, 500)
    el.classList.add('splash-out')
  }, wait)
}
