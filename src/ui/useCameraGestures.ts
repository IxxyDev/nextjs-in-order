import { useEffect, useRef } from 'preact/hooks'
import type { RefObject } from 'preact'
import type { Camera } from '../domain/types'
import { REGIONS } from '../domain/regions'
import { animateTo, cancelCameraAnimation, frameFor, pinchCamera, screenToWorld, setCamera, zoomAt, type CameraRig } from './camera'
import { reducedMotion } from './useReducedMotion'
import { TEXT } from './useStepControls'

/** a press that moves this far or less is a click */
const SLOP = 4
/** overlays on the stage that keep their own pointer and wheel behavior */
const OWN = '.inspector, .minimap'
const KEY_ZOOM = 1.25

type Point = { x: number; y: number }

/** per group of sibling stages (compare lanes), the one the pointer or focus last touched; keys go there only */
const active = new WeakMap<Element, Element>()

/**
 * Drag to pan, wheel or trackpad pinch (ctrl+wheel) to zoom at the cursor, two-finger pinch, double-click a
 * region to fit it, +/- to zoom at the center. Every move goes through onManual, so the view can let go of framing.
 */
export function useCameraGestures(rig: CameraRig, stageRef: RefObject<HTMLElement>, onManual?: (cam: Camera) => void) {
  const manual = useRef(onManual)
  manual.current = onManual
  useEffect(() => {
    const stage = stageRef.current!
    const canvas = () => stage.querySelector('.canvas-wrap')!.getBoundingClientRect()
    const local = (e: { clientX: number; clientY: number }): Point => { const r = canvas(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
    const move = (cam: Camera) => { setCamera(cam, rig); manual.current?.(cam) }
    const pointers = new Map<number, Point>()
    let start: Point | undefined, dragging = false, swallowClick = false

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest(OWN)) return
      swallowClick = false
      pointers.set(e.pointerId, local(e))
      start = pointers.size === 1 ? local(e) : start
      if (pointers.size === 2) begin()
    }
    const begin = () => {
      dragging = true
      cancelCameraAnimation(rig)
      for (const id of pointers.keys()) if (!stage.hasPointerCapture(id)) stage.setPointerCapture(id)
    }
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const p = local(e)
      if (!dragging) {
        if (Math.hypot(p.x - start!.x, p.y - start!.y) <= SLOP) return
        begin()
      }
      const [other] = [...pointers].filter(([id]) => id !== e.pointerId).map(([, q]) => q)
      pointers.set(e.pointerId, p)
      const cam = rig.camera.value, vp = rig.viewport.value
      move(other ? pinchCamera(cam, vp, prev, other, p, other) : pinchCamera(cam, vp, prev, prev, p, p))
    }
    const onUp = (e: PointerEvent) => {
      if (!pointers.delete(e.pointerId)) return
      if (pointers.size || !dragging) return
      dragging = false
      swallowClick = true
      setTimeout(() => { swallowClick = false })
    }
    /** the click that ends a drag must not select or pick what it ended on */
    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return
      swallowClick = false
      e.stopPropagation()
      e.preventDefault()
    }
    const onWheel = (e: WheelEvent) => {
      if ((e.target as Element).closest(OWN)) return
      e.preventDefault()
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rig.viewport.value.h : 1)
      /** trackpad pinch arrives as ctrl+wheel with small deltas */
      move(zoomAt(rig.camera.value, rig.viewport.value, local(e), Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015))))
    }
    const onDblClick = (e: MouseEvent) => {
      if ((e.target as Element).closest(OWN)) return
      const vp = rig.viewport.value
      const w = screenToWorld(local(e), rig.camera.value, vp)
      const hit = REGIONS.filter((r) => w.x >= r.x && w.x <= r.x + r.w && w.y >= r.y && w.y <= r.y + r.h).sort((a, b) => a.w * a.h - b.w * b.h)[0]
      if (!hit) return
      const cam = frameFor({ kind: 'region', id: hit.id }, rig)
      if (reducedMotion.value) setCamera(cam, rig)
      else animateTo(cam, rig)
      manual.current?.(cam)
    }
    const onKey = (e: KeyboardEvent) => {
      const group = stage.closest('.compare-stage')
      if (group && (active.get(group) ?? group.querySelector('.lane')) !== stage) return
      const t = e.target as HTMLElement
      if (e.ctrlKey || e.metaKey || e.altKey || t.isContentEditable || t.closest?.(TEXT)) return
      const factor = e.key === '+' || e.key === '=' ? KEY_ZOOM : e.key === '-' ? 1 / KEY_ZOOM : 0
      if (!factor) return
      const vp = rig.viewport.value
      move(zoomAt(rig.camera.value, vp, { x: vp.w / 2, y: vp.h / 2 }, factor))
    }

    const activate = () => { const g = stage.closest('.compare-stage'); if (g) active.set(g, stage) }
    stage.addEventListener('pointerenter', activate)
    stage.addEventListener('pointerdown', activate, true)
    stage.addEventListener('focusin', activate)
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('click', onClick, true)
    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('dblclick', onDblClick)
    window.addEventListener('keydown', onKey)
    return () => {
      stage.removeEventListener('pointerenter', activate)
      stage.removeEventListener('pointerdown', activate, true)
      stage.removeEventListener('focusin', activate)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('click', onClick, true)
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('dblclick', onDblClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [rig])
}
