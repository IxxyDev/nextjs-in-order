// src/domain/route.test.ts
import { describe, it, expect } from 'vitest'
import { clampIndex, parseRoute, formatRoute, roundCam, withCam } from './route'

describe('routes', () => {
  it('clamps indexes to whole numbers in range', () => {
    expect(clampIndex(-3, 22)).toBe(0)
    expect(clampIndex(99, 22)).toBe(21)
    expect(clampIndex(NaN, 22)).toBe(0)
    expect(clampIndex(4.7, 22)).toBe(4)
  })
  it('defaults to journey 0 step 0', () => {
    expect(parseRoute('')).toEqual({ mode: 'journey', slug: 'whole-lifecycle', step: 0 })
    expect(parseRoute('#/')).toEqual({ mode: 'journey', slug: 'whole-lifecycle', step: 0 })
  })
  it('parses journey steps as 1-based in the URL and 0-based in the route', () => {
    expect(parseRoute('#/journey/whole-lifecycle/4')).toEqual({ mode: 'journey', slug: 'whole-lifecycle', step: 3 })
  })
  it('parses atlas with entity and camera', () => {
    expect(parseRoute('#/atlas?entity=flight&cam=1200,600,2.5')).toEqual({ mode: 'atlas', entity: 'flight', cam: { x: 1200, y: 600, zoom: 2.5 } })
  })
  it('parses compare pairs and steps', () => {
    expect(parseRoute('#/compare/initial-load/7')).toEqual({ mode: 'compare', slug: 'initial-load', step: 6 })
    expect(parseRoute('#/compare')).toEqual({ mode: 'compare', slug: 'initial-load', step: 0 })
    expect(parseRoute('#/compare/caches/0')).toEqual({ mode: 'compare', slug: 'caches', step: 0 })
    expect(formatRoute({ mode: 'compare', slug: 'bundlers', step: 2 })).toBe('#/compare/bundlers/3')
  })
  it('parses predict questions as 1-based in the URL and clamps below 1', () => {
    expect(parseRoute('#/predict/3')).toEqual({ mode: 'predict', n: 2 })
    expect(parseRoute('#/predict')).toEqual({ mode: 'predict', n: 0 })
    expect(parseRoute('#/predict/0')).toEqual({ mode: 'predict', n: 0 })
    expect(parseRoute('#/predict/-4')).toEqual({ mode: 'predict', n: 0 })
    expect(parseRoute('#/predict/abc')).toEqual({ mode: 'predict', n: 0 })
    expect(parseRoute('#/predict/99')).toEqual({ mode: 'predict', n: 98 })
    expect(formatRoute({ mode: 'predict', n: 2 })).toBe('#/predict/3')
  })
  it('round-trips', () => {
    for (const r of [
      { mode: 'journey', slug: 'whole-lifecycle', step: 6 },
      { mode: 'atlas' },
      { mode: 'compare', slug: 'caches', step: 4 },
      { mode: 'atlas', entity: 'swc', cam: { x: 1, y: 2, zoom: 3 } },
      { mode: 'predict', n: 11 },
      { mode: 'predict', n: 0, cam: { x: 7, y: 8, zoom: 0.5 } }
    ] as const) expect(parseRoute(formatRoute(r))).toEqual(r)
  })
  it('ignores cam on compare routes, which have one camera per lane', () => {
    expect(parseRoute('#/compare/runtimes/1?cam=5,6,1')).toEqual({ mode: 'compare', slug: 'runtimes', step: 0 })
    expect(withCam('#/compare/runtimes/1', { x: 5, y: 6, zoom: 1 })).toBe('#/compare/runtimes/1')
  })
  it('rounds the camera for the URL', () => {
    expect(roundCam({ x: 1200.4, y: 599.6, zoom: 1.23456 })).toEqual({ x: 1200, y: 600, zoom: 1.23 })
  })
  it('sets or clears the camera of a hash and keeps the rest of the route', () => {
    expect(withCam('#/journey/app-initial/12', { x: 10.2, y: 20.7, zoom: 0.555 })).toBe('#/journey/app-initial/12?cam=10,21,0.56')
    expect(withCam('#/atlas?entity=swc&cam=1,2,3', { x: 4, y: 5, zoom: 2 })).toBe('#/atlas?entity=swc&cam=4,5,2')
    expect(withCam('#/atlas?entity=swc&cam=1,2,3')).toBe('#/atlas?entity=swc')
    expect(withCam('#/predict/3?cam=1,2,3')).toBe('#/predict/3')
  })
})
