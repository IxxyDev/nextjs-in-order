import { useEffect, useRef, useState } from 'preact/hooks'
import type { RefObject } from 'preact'
import { clampIndex } from '../domain/route'
import { phone } from './layout'

const AUTOPLAY_MS = 6000
/** focus here owns every key */
const TEXT = 'input, textarea, select, [role=option], [role=listbox]'
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
      if (isTyping(t)) return
      const { step, onStep, onEscape, last } = latest.current
      if (e.key === 'ArrowRight') { setPlaying(false); onStep(step + 1) }
      else if (e.key === 'ArrowLeft') { setPlaying(false); onStep(step - 1) }
      else if (e.key === ' ' && !t.closest?.(CONTROL)) { e.preventDefault(); setPlaying((p) => !p) }
      else if (e.key === 'Home') { setPlaying(false); onStep(0) }
      else if (e.key === 'End') { setPlaying(false); onStep(last) }
      else if (e.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const stepTo = (n: number) => { setPlaying(false); onStep(clampIndex(n, count)) }
  return { playing, setPlaying, stepTo }
}

/** a key pressed in a text field, a list box or editable content belongs to it, not to the page's shortcuts */
export function isTyping(target: HTMLElement): boolean {
  return target.isContentEditable || !!target.closest?.(TEXT)
}

/** horizontal travel that makes a swipe, in px; it must also be more than twice the vertical travel */
const SWIPE = 50

/**
 * Phones: a one-finger horizontal swipe that starts on the step panel steps (left = next, right = previous).
 * The rule is panel only: on the canvas a one-finger drag already pans the camera (useCameraGestures), so a
 * flick there could not be told from a short pan. The panel keeps vertical scrolling (touch-action: pan-y).
 */
export function useSwipeSteps(root: RefObject<HTMLElement>, onSwipe: (dir: 1 | -1) => void) {
  const latest = useRef(onSwipe)
  latest.current = onSwipe
  useEffect(() => {
    const el = root.current!
    let start: { x: number; y: number } | undefined
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      start = e.touches.length === 1 && phone.value && (e.target as Element).closest('.panel') ? { x: t.clientX, y: t.clientY } : undefined
    }
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0], s = start
      start = undefined
      if (!s || !t || e.touches.length) return
      const dx = t.clientX - s.x, dy = t.clientY - s.y
      if (Math.abs(dx) >= SWIPE && Math.abs(dx) > 2 * Math.abs(dy)) latest.current(dx < 0 ? 1 : -1)
    }
    const onCancel = () => { start = undefined }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onCancel)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onCancel)
    }
  }, [])
}
