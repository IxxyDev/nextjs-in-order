// src/ui/camera.test.ts
import { describe, it, expect } from 'vitest'
import { fitRect, targetToRect, transformFor, worldToScreen, clampToWorld, frame, OVERSCROLL } from './camera'
import { WORLD } from '../domain/regions'

describe('camera math', () => {
  it('fits the whole world into a 1200x800 viewport', () => {
    const cam = fitRect(WORLD, { w: 1200, h: 800 }, 0)
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
    const cam = fitRect({ x: 0, y: 0, w: 400, h: 400 }, vp, 0, { left: 0, bottom: 100 })
    expect(cam.zoom).toBeCloseTo(500 / 400)
    expect(worldToScreen({ x: 200, y: 200 }, cam, vp)).toEqual({ x: 500, y: 250 })
  })
  it('refits so a reserved corner does not cover the target', () => {
    const vp = { w: 900, h: 600 }
    const corner = { x: 0, y: 500, w: 150, h: 100 }
    const target = { kind: 'region', id: 'browser' } as const
    const plain = frame(target, vp), kept = frame(target, vp, [corner])
    const clear = (cam: typeof plain) => {
      const p = worldToScreen({ x: 200, y: 1990 }, cam, vp)
      return p.x - 60 >= corner.x + corner.w || p.y + 30 * cam.zoom + 44 <= corner.y
    }
    expect(clear(plain)).toBe(false)
    expect(clear(kept)).toBe(true)
    expect(kept.zoom).toBeGreaterThan(plain.zoom * 0.7)
  })
})
