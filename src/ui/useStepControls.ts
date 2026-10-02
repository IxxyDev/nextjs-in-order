import { useEffect, useRef, useState } from 'preact/hooks'
import { clampIndex } from '../domain/route'

const AUTOPLAY_MS = 6000
/** focus here owns every key */
export const TEXT = 'input, textarea, select, [role=option], [role=listbox]'
/** focus here owns Space; stepping and Escape still work */
const CONTROL = 'button, a, summary'

/** autoplay plus the ←/→/Space/Home/End/Esc shortcuts, bound once and reading the latest props so a fast second press never sees a stale step */
export function useStepControls({ count, step, onStep, onEscape }: { count: number; step: number; onStep: (n: number) => void; onEscape: () => void }) {
  const [playing, setPlaying] = useState(false)

  const latest = useRef({ step, onStep, onEscape, last: count - 1 })
  latest.current = { step, onStep, onEscape, last: count - 1 }
  useEffect(() => {
    if (!playing) return
    if (step >= count - 1) { setPlaying(false); return }
    const t = setTimeout(() => latest.current.onStep(step + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [playing, step, count])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.isContentEditable || t.closest?.(TEXT)) return
      const { step, onStep, onEscape, last } = latest.current
      if (e.key === 'ArrowRight') { setPlaying(false); onStep(step + 1) }
      else if (e.key === 'ArrowLeft') { setPlaying(false); onStep(step - 1) }
      else if (e.key === ' ' && !t.closest?.(CONTROL)) { e.preventDefault(); setPlaying((p) => !p) }
      else if (e.key === 'Home') onStep(0)
      else if (e.key === 'End') onStep(last)
      else if (e.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const stepTo = (n: number) => { setPlaying(false); onStep(clampIndex(n, count)) }
  return { playing, setPlaying, stepTo }
}
