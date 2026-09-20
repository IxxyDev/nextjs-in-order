// src/domain/route.test.ts
import { describe, it, expect } from 'vitest'
import { parseRoute, formatRoute } from './route'

describe('routes', () => {
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
  it('round-trips', () => {
    for (const r of [
      { mode: 'journey', slug: 'whole-lifecycle', step: 6 },
      { mode: 'atlas' },
      { mode: 'atlas', entity: 'swc', cam: { x: 1, y: 2, zoom: 3 } }
    ] as const) expect(parseRoute(formatRoute(r))).toEqual(r)
  })
})
