// src/ui/useReducedMotion.ts
import { signal } from '@preact/signals'

const query = typeof window !== 'undefined' && 'matchMedia' in window
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null

export const reducedMotion = signal<boolean>(query?.matches ?? false)
query?.addEventListener('change', (e) => { reducedMotion.value = e.matches })
