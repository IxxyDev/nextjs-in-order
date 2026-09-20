// src/ui/camera.test.ts
import { describe, it, expect } from 'vitest'
import { fitRect, targetToRect, transformFor, worldToScreen, clampToWorld } from './camera'
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

  it('clamps the visible rectangle inside the world', () => {
    const vp = { w: 1000, h: 500 }
    expect(clampToWorld({ x: 100, y: 100, zoom: 1 }, vp)).toEqual({ x: 500, y: 250, zoom: 1 })
    expect(clampToWorld({ x: 1200, y: 1040, zoom: 0.1 }, vp)).toEqual({ x: 1200, y: 1040, zoom: 0.1 })
  })
})
