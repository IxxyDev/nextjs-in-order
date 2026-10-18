// src/ui/camera.test.ts
import { describe, it, expect } from 'vitest'
import { fitRect, targetToRect, transformFor, worldToScreen, screenToWorld, clampToWorld, fitTarget, zoomAt, pinchCamera, OVERSCROLL, MIN_ZOOM, MAX_ZOOM } from './camera'
import { WORLD } from '../domain/regions'

describe('camera math', () => {
  it('fits the whole world into a 1200x800 viewport', () => {
    const cam = fitRect(WORLD, { w: 1200, h: 800 }, { left: 0, bottom: 0 }, 0)
    expect(cam.x).toBe(1200)
    expect(cam.y).toBe(1040)
    expect(cam.zoom).toBeCloseTo(800 / 2080)
  })
  it('turns a region target into its rect', () => {
    expect(targetToRect({ kind: 'region', id: 'source' })).toEqual({ x: 20, y: 30, w: 450, h: 630 })
  })
  it('unions entity boxes with a margin', () => {
    const r = targetToRect({ kind: 'entities', ids: ['swc', 'bundler'] })
    expect(r.x).toBeLessThan(600)
    expect(r.x + r.w).toBeGreaterThan(900)
  })
  it('maps world center to screen center', () => {
    const cam = { x: 1200, y: 1040, zoom: 0.5 }
    expect(worldToScreen({ x: 1200, y: 1040 }, cam, { w: 1200, h: 800 })).toEqual({ x: 600, y: 400 })
    expect(transformFor(cam, { w: 1200, h: 800 })).toBe('translate(600 400) scale(0.5) translate(-1200 -1040)')
  })

  it('clamps the view to the world plus a small overscroll', () => {
    const vp = { w: 1000, h: 500 }
    expect(clampToWorld({ x: 100, y: 100, zoom: 1 }, vp)).toEqual({ x: 500 - 1000 * OVERSCROLL, y: 250 - 500 * OVERSCROLL, zoom: 1 })
    expect(clampToWorld({ x: 3000, y: 1040, zoom: 1 }, vp)).toEqual({ x: 2400 + 1000 * OVERSCROLL - 500, y: 1040, zoom: 1 })
    expect(clampToWorld({ x: 1200, y: 1040, zoom: 0.1 }, vp)).toEqual({ x: 1200, y: 1040, zoom: 0.1 })
  })
  it('keeps a world smaller than the view fully visible without re-centering it', () => {
    const cam = clampToWorld({ x: 1300, y: 1100, zoom: 0.1 }, { w: 1000, h: 500 })
    expect(cam).toEqual({ x: 1300, y: 1100, zoom: 0.1 })
  })
  it('fits into the viewport minus an inset, centered in what is left', () => {
    const vp = { w: 1000, h: 600 }
    const cam = fitRect({ x: 0, y: 0, w: 400, h: 400 }, vp, { left: 0, bottom: 100 }, 0)
    expect(cam.zoom).toBeCloseTo(500 / 400)
    expect(worldToScreen({ x: 200, y: 200 }, cam, vp)).toEqual({ x: 500, y: 250 })
  })
  it('refits so a reserved corner does not cover the target', () => {
    const vp = { w: 900, h: 600 }
    const corner = { x: 0, y: 500, w: 150, h: 100 }
    const target = { kind: 'region', id: 'browser' } as const
    const plain = fitTarget(target, vp), kept = fitTarget(target, vp, [corner])
    const clear = (cam: typeof plain) => {
      const p = worldToScreen({ x: 200, y: 1990 }, cam, vp)
      return p.x - 60 >= corner.x + corner.w || p.y + 30 * cam.zoom + 44 <= corner.y
    }
    expect(clear(plain)).toBe(false)
    expect(clear(kept)).toBe(true)
    expect(kept.zoom).toBeGreaterThan(plain.zoom * 0.7)
  })
})

describe('camera gestures', () => {
  const vp = { w: 1000, h: 600 }
  const cam = { x: 1200, y: 1040, zoom: 1 }
  it('zooms at a point without moving the world under it', () => {
    const p = { x: 300, y: 200 }
    const before = screenToWorld(p, cam, vp)
    const next = zoomAt(cam, vp, p, 1.5)
    expect(next.zoom).toBeCloseTo(1.5)
    const after = worldToScreen(before, next, vp)
    expect(after.x).toBeCloseTo(p.x)
    expect(after.y).toBeCloseTo(p.y)
  })
  it('pans with one pointer: the world follows it', () => {
    const next = pinchCamera(cam, vp, { x: 500, y: 300 }, { x: 500, y: 300 }, { x: 540, y: 280 }, { x: 540, y: 280 })
    expect(next).toEqual({ x: 1160, y: 1060, zoom: 1 })
  })
  it('pinches: zoom follows the spread, the world point under the old midpoint lands under the new one', () => {
    const a0 = { x: 400, y: 300 }, b0 = { x: 600, y: 300 }, a1 = { x: 320, y: 340 }, b1 = { x: 720, y: 340 }
    const anchor = screenToWorld({ x: 500, y: 300 }, cam, vp)
    const next = pinchCamera(cam, vp, a0, b0, a1, b1)
    expect(next.zoom).toBeCloseTo(2)
    const at = worldToScreen(anchor, next, vp)
    expect(at.x).toBeCloseTo(520)
    expect(at.y).toBeCloseTo(340)
  })
  it('clamps zoom to its range and the view to the world', () => {
    expect(zoomAt(cam, vp, { x: 500, y: 300 }, 100).zoom).toBe(MAX_ZOOM)
    expect(zoomAt(cam, vp, { x: 500, y: 300 }, 0.001).zoom).toBe(MIN_ZOOM)
    const far = pinchCamera(cam, vp, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 99999, y: 99999 }, { x: 99999, y: 99999 })
    expect(far).toEqual(clampToWorld(far, vp))
    expect(far.x).toBe(500 - 1000 * OVERSCROLL)
    expect(far.y).toBe(300 - 600 * OVERSCROLL)
  })
})
