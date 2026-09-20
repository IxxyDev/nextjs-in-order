// src/ui/camera.ts
import { signal } from '@preact/signals'
import type { Camera, CameraTarget, Rect } from '../domain/types'
import { WORLD, regionById } from '../domain/regions'
import { entityById } from '../domain/entities'

export interface Viewport { w: number; h: number }

export const MIN_ZOOM = 0.2
export const MAX_ZOOM = 4
const ENTITY_MARGIN = 140
const DURATION = 500

export const viewport = signal<Viewport>({ w: 1200, h: 800 })
export const camera = signal<Camera>({ x: WORLD.w / 2, y: WORLD.h / 2, zoom: 0.5 })

export function fitRect(rect: Rect, vp: Viewport, pad = 0.12): Camera {
  const zoom = Math.min(vp.w / (rect.w * (1 + pad)), vp.h / (rect.h * (1 + pad)))
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) }
}

export function targetToRect(target: CameraTarget): Rect {
  if (target.kind === 'world') return WORLD
  if (target.kind === 'region') {
    const r = regionById(target.id)
    return { x: r.x, y: r.y, w: r.w, h: r.h }
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const id of target.ids) {
    const e = entityById(id)
    x0 = Math.min(x0, e.x - ENTITY_MARGIN); y0 = Math.min(y0, e.y - ENTITY_MARGIN)
    x1 = Math.max(x1, e.x + ENTITY_MARGIN); y1 = Math.max(y1, e.y + ENTITY_MARGIN)
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

export function transformFor(cam: Camera, vp: Viewport): string {
  return `translate(${vp.w / 2} ${vp.h / 2}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`
}

export function worldToScreen(p: { x: number; y: number }, cam: Camera, vp: Viewport): { x: number; y: number } {
  return { x: vp.w / 2 + (p.x - cam.x) * cam.zoom, y: vp.h / 2 + (p.y - cam.y) * cam.zoom }
}

let frame = 0
export function cancelCameraAnimation(): void {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

export function setCamera(cam: Camera): void {
  cancelCameraAnimation()
  camera.value = cam
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function animateTo(cam: Camera): void {
  cancelCameraAnimation()
  const from = camera.value
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION)
    const k = easeOut(t)
    camera.value = {
      x: from.x + (cam.x - from.x) * k,
      y: from.y + (cam.y - from.y) * k,
      zoom: Math.exp(Math.log(from.zoom) + (Math.log(cam.zoom) - Math.log(from.zoom)) * k)
    }
    frame = t < 1 ? requestAnimationFrame(tick) : 0
  }
  frame = requestAnimationFrame(tick)
}

/** keep the visible rectangle inside the world when the world is larger than the viewport */
export function clampToWorld(cam: Camera, vp: Viewport): Camera {
  const halfW = vp.w / cam.zoom / 2, halfH = vp.h / cam.zoom / 2
  const clampAxis = (c: number, half: number, min: number, max: number) =>
    max - min <= half * 2 ? (min + max) / 2 : Math.min(max - half, Math.max(min + half, c))
  return { ...cam, x: clampAxis(cam.x, halfW, WORLD.x, WORLD.x + WORLD.w), y: clampAxis(cam.y, halfH, WORLD.y, WORLD.y + WORLD.h) }
}

export function goTo(target: CameraTarget, instant: boolean): void {
  const cam = clampToWorld(fitRect(targetToRect(target), viewport.value), viewport.value)
  if (instant) setCamera(cam)
  else animateTo(cam)
}
