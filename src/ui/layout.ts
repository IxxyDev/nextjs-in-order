// src/ui/layout.ts
import { signal } from '@preact/signals'

function media(q: string) {
  const m = typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(q) : null
  const s = signal<boolean>(m?.matches ?? false)
  m?.addEventListener('change', (e) => { s.value = e.matches })
  return s
}

/** the §9 viewport bands that change behavior, not only CSS */
export const phone = media('(max-width: 767px)')
export const tablet = media('(min-width: 768px) and (max-width: 1023px)')

/** prefers-reduced-motion: camera moves land at once and the token jumps instead of travelling */
export const reducedMotion = media('(prefers-reduced-motion: reduce)')
