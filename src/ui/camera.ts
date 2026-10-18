// src/ui/camera.ts
import { signal, type Signal } from '@preact/signals'
import type { Camera, CameraTarget, Rect } from '../domain/types'
import { WORLD, bandRect, regionById } from '../domain/regions'
import { ENTITIES, entityById } from '../domain/entities'
import { intersects, type ScreenRect } from './labelLayout'
import { withCam } from '../domain/route'
import { phone } from './layout'

/** a screen or world position */
export interface Point { x: number; y: number }
export interface Viewport { w: number; h: number }

export const MIN_ZOOM = 0.2
export const MAX_ZOOM = 4
const ENTITY_MARGIN = 140
const DURATION = 500

/**
 * One camera with its viewport; journey and atlas share MAIN_RIG, each compare lane owns one.
 * sheet: the share of the viewport height a bottom sheet keeps covered at peek (the tablet journey), 0 for none.
 */
export interface CameraRig { camera: Signal<Camera>; viewport: Signal<Viewport>; frame: number; sheet: Signal<number> }

/** what a view frames: the step's target or the whole system */
export type Framing = 'follow' | 'whole'
/** a framing, or a camera the user left (a URL cam) held until they step or pick a framing */
export type View = Framing | 'manual'

export function createRig(): CameraRig {
  return { camera: signal<Camera>({ x: WORLD.w / 2, y: WORLD.h / 2, zoom: 0.5 }), viewport: signal<Viewport>({ w: 1200, h: 800 }), frame: 0, sheet: signal(0) }
}

export const MAIN_RIG = createRig()
export const viewport = MAIN_RIG.viewport
export const camera = MAIN_RIG.camera

/** screen-px margins of the viewport that a fit keeps clear */
export interface Inset { left: number; bottom: number }
const NO_INSET: Inset = { left: 0, bottom: 0 }

/** fits the rect into the viewport minus the inset, centered in what is left */
export function fitRect(rect: Rect, vp: Viewport, pad = 0.12, inset: Inset = NO_INSET): Camera {
  const fit = Math.min((vp.w - inset.left) / (rect.w * (1 + pad)), (vp.h - inset.bottom) / (rect.h * (1 + pad)))
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fit))
  return { x: rect.x + rect.w / 2 - inset.left / 2 / zoom, y: rect.y + rect.h / 2 + inset.bottom / 2 / zoom, zoom }
}

/** the minimap's place on the stage (bottom-left); it is drawn on every MAIN_RIG view and hidden on phones */
export const MINIMAP = { left: 12, bottom: 12, w: 132, h: 82 }
const MINIMAP_GAP = 8

export function minimapRect(vp: Viewport): ScreenRect | undefined {
  if (phone.value) return undefined
  return { x: 0, y: vp.h - MINIMAP.bottom - MINIMAP.h - MINIMAP_GAP, w: MINIMAP.left + MINIMAP.w + MINIMAP_GAP, h: MINIMAP.bottom + MINIMAP.h + MINIMAP_GAP }
}

/** the legend's toggle on the stage (top-right); it is drawn on every MAIN_RIG view, phones included */
export const LEGEND = { top: 12, right: 12, w: 84, h: 32 }

function legendRect(vp: Viewport): ScreenRect {
  return { x: vp.w - LEGEND.right - LEGEND.w - MINIMAP_GAP, y: 0, w: LEGEND.right + LEGEND.w + MINIMAP_GAP, h: LEGEND.top + LEGEND.h + MINIMAP_GAP }
}

/** screen zones a rig's labels and framing keep clear: the legend's toggle, and the sheet's peek when there is one (the minimap sits in it), else the minimap */
export function reservedFor(rig: CameraRig): ScreenRect[] {
  const vp = rig.viewport.value, sheet = rig.sheet.value
  const legend = rig === MAIN_RIG ? [legendRect(vp)] : []
  if (sheet) return [{ x: 0, y: vp.h * (1 - sheet), w: vp.w, h: vp.h * sheet }, ...legend]
  const r = rig === MAIN_RIG ? minimapRect(vp) : undefined
  return r ? [r, ...legend] : legend
}

export function targetToRect(target: CameraTarget): Rect {
  if (target.kind === 'world') return WORLD
  if (target.kind === 'band') return bandRect(target.id)
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

/** the entities a target is about: its ids, or everything inside its rect */
function targetEntities(target: CameraTarget, rect: Rect): Point[] {
  if (target.kind === 'entities') return target.ids.map(entityById)
  return ENTITIES.filter((e) => e.x >= rect.x && e.x <= rect.x + rect.w && e.y >= rect.y && e.y <= rect.y + rect.h)
}

/** glyph plus a typical two-row label under it, in screen px */
function footprint(p: Point, cam: Camera, vp: Viewport): ScreenRect {
  const s = worldToScreen(p, cam, vp)
  return { x: s.x - 60, y: s.y - 28 * cam.zoom, w: 120, h: 58 * cam.zoom + 44 }
}

function rectOnScreen(r: Rect, cam: Camera, vp: Viewport): ScreenRect {
  const p = worldToScreen(r, cam, vp)
  return { x: p.x, y: p.y, w: r.w * cam.zoom, h: r.h * cam.zoom }
}

/**
 * Plain fit first. When that puts any of the target's entities under a reserved zone, try the smallest
 * pan of the same fit that clears the zone (when the target still fits on screen), then
 * refitting into the viewport minus the zone's height or width. The best uncovered try with the most
 * zoom wins, so the corner stays clear without shrinking the scene more than needed.
 */
export function fitTarget(target: CameraTarget, vp: Viewport, reserved: ScreenRect[] = [], inset: Inset = NO_INSET): Camera {
  const rect = targetToRect(target)
  const plain = clampToWorld(fitRect(rect, vp, 0.12, inset), vp)
  const points = targetEntities(target, rect)
  const covered = (cam: Camera) => reserved.some((r) => points.some((p) => intersects(footprint(p, cam, vp), r)))
  if (!covered(plain)) return plain
  const inside = (f: ScreenRect) => f.x >= 0 && f.x + f.w <= vp.w && f.y >= 0 && f.y + f.h <= vp.h
  /** a region or the world must stay whole on screen; an entity target only needs its entities */
  const inView = (cam: Camera) => points.every((p) => inside(footprint(p, cam, vp))) && (target.kind === 'entities' || inside(rectOnScreen(rect, cam, vp)))
  /** the smallest pan right or up that takes every covered footprint out of the zone */
  const pans = reserved.flatMap((r) => {
    const under = points.map((p) => footprint(p, plain, vp)).filter((f) => intersects(f, r))
    if (!under.length) return []
    const dx = Math.max(...under.map((f) => r.x + r.w - f.x)), dy = Math.max(...under.map((f) => f.y + f.h - r.y))
    return [{ x: -dx / plain.zoom, y: 0 }, { x: 0, y: dy / plain.zoom }]
  }).map((d) => clampToWorld({ ...plain, x: plain.x + d.x, y: plain.y + d.y }, vp)).filter(inView)
  const fits = reserved.flatMap((r) => [{ left: 0, bottom: r.h }, { left: r.x + r.w, bottom: 0 }])
    .map((inset) => clampToWorld(fitRect(rect, vp, 0.12, inset), vp))
  const tries = [...pans, ...fits].sort((a, b) => Number(covered(a)) - Number(covered(b)) || b.zoom - a.zoom)
  return tries[0] && !covered(tries[0]) ? tries[0] : plain
}

export function transformFor(cam: Camera, vp: Viewport): string {
  return `translate(${vp.w / 2} ${vp.h / 2}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`
}

export function worldToScreen(p: Point, cam: Camera, vp: Viewport): Point {
  return { x: vp.w / 2 + (p.x - cam.x) * cam.zoom, y: vp.h / 2 + (p.y - cam.y) * cam.zoom }
}

export function screenToWorld(p: Point, cam: Camera, vp: Viewport): Point {
  return { x: cam.x + (p.x - vp.w / 2) / cam.zoom, y: cam.y + (p.y - vp.h / 2) / cam.zoom }
}

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

/** the world point under screen point `from` lands under `to` at the new zoom (clamped), then the view is kept on the world */
function anchored(cam: Camera, vp: Viewport, from: Point, to: Point, zoom: number): Camera {
  const w = screenToWorld(from, cam, vp), z = clampZoom(zoom)
  return clampToWorld({ x: w.x - (to.x - vp.w / 2) / z, y: w.y - (to.y - vp.h / 2) / z, zoom: z }, vp)
}

/** zoom by a factor around a screen point, which stays put */
export function zoomAt(cam: Camera, vp: Viewport, p: Point, factor: number): Camera {
  return anchored(cam, vp, p, p, cam.zoom * factor)
}

/** two pointers moving from a0,b0 to a1,b1: zoom follows their spread, the midpoint carries the pan; a0=b0 is a plain drag */
export function pinchCamera(cam: Camera, vp: Viewport, a0: Point, b0: Point, a1: Point, b1: Point): Camera {
  const d0 = Math.hypot(b0.x - a0.x, b0.y - a0.y), d1 = Math.hypot(b1.x - a1.x, b1.y - a1.y)
  const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  return anchored(cam, vp, mid(a0, b0), mid(a1, b1), d0 > 0 ? cam.zoom * d1 / d0 : cam.zoom)
}

export function cancelCameraAnimation(rig = MAIN_RIG): void {
  if (rig.frame) cancelAnimationFrame(rig.frame)
  rig.frame = 0
}

export function setCamera(cam: Camera, rig = MAIN_RIG): void {
  cancelCameraAnimation(rig)
  rig.camera.value = cam
}

/** a camera from the URL, as it was left; only the zoom is kept in range */
export function restoreCamera(cam: Camera, rig = MAIN_RIG): void {
  setCamera({ ...cam, zoom: clampZoom(cam.zoom) }, rig)
}

let urlWrite = 0
/**
 * A manual camera move goes into the URL (debounced, rounded) so a reload restores it; undefined clears it.
 * replaceState adds no history entry and fires no hashchange. A route change before the write cancels it.
 */
export function writeCamToUrl(cam: Camera | undefined, delay = 300): void {
  clearTimeout(urlWrite)
  const at = location.hash
  const write = () => { if (location.hash === at) history.replaceState(history.state, '', withCam(at, cam)) }
  if (delay) urlWrite = window.setTimeout(write, delay)
  else write()
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function animateTo(cam: Camera, rig = MAIN_RIG): void {
  cancelCameraAnimation(rig)
  const from = rig.camera.value
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION)
    const k = easeOut(t)
    rig.camera.value = {
      x: from.x + (cam.x - from.x) * k,
      y: from.y + (cam.y - from.y) * k,
      zoom: Math.exp(Math.log(from.zoom) + (Math.log(cam.zoom) - Math.log(from.zoom)) * k)
    }
    rig.frame = t < 1 ? requestAnimationFrame(tick) : 0
  }
  rig.frame = requestAnimationFrame(tick)
}

/** how far past the world's edge the view may reach, as a share of the visible span */
export const OVERSCROLL = 0.25

/**
 * Keep the view on the world. Each edge may overshoot by OVERSCROLL of the visible span, so a target at
 * the world's edge (the dev column) can still be framed near the middle; a world smaller than the view
 * may sit anywhere inside it, so a fit that leaves room for the minimap is not re-centered.
 */
export function clampToWorld(cam: Camera, vp: Viewport): Camera {
  const halfW = vp.w / cam.zoom / 2, halfH = vp.h / cam.zoom / 2
  const clampAxis = (c: number, half: number, min: number, max: number) => {
    const over = half * 2 * OVERSCROLL
    const lo = min - over + half, hi = max + over - half
    return lo <= hi ? Math.min(hi, Math.max(lo, c)) : Math.min(min + half, Math.max(max - half, c))
  }
  return { ...cam, x: clampAxis(cam.x, halfW, WORLD.x, WORLD.x + WORLD.w), y: clampAxis(cam.y, halfH, WORLD.y, WORLD.y + WORLD.h) }
}

/** the rig's framing of a target: reserved zones kept clear, and the fit inset by a sheet's peek */
export function fitTargetFor(target: CameraTarget, rig = MAIN_RIG): Camera {
  const vp = rig.viewport.value
  return fitTarget(target, vp, reservedFor(rig), { left: 0, bottom: vp.h * rig.sheet.value })
}

/** moves the rig's camera to the target and returns where it lands */
export function goTo(target: CameraTarget, instant: boolean, rig = MAIN_RIG): Camera {
  const cam = fitTargetFor(target, rig)
  if (instant) setCamera(cam, rig)
  else animateTo(cam, rig)
  return cam
}
