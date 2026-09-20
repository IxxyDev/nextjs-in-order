// src/domain/regions.test.ts
import { describe, it, expect } from 'vitest'
import { REGIONS, WORLD, regionById } from './regions'

describe('regions', () => {
  it('has the 13 regions from the visual language', () => {
    expect(REGIONS.map((r) => r.id).sort()).toEqual([
      'artifacts', 'browser', 'build', 'client-router', 'data-caches', 'dev', 'http-entry',
      'network', 'render-server', 'router-server', 'rsc-runtime', 'source', 'ssr-runtime'
    ])
  })
  it('keeps every region inside the world', () => {
    for (const r of REGIONS) {
      expect(r.x).toBeGreaterThanOrEqual(0)
      expect(r.y).toBeGreaterThanOrEqual(0)
      expect(r.x + r.w).toBeLessThanOrEqual(WORLD.w)
      expect(r.y + r.h).toBeLessThanOrEqual(WORLD.h)
    }
  })
  it('nests the two runtimes inside render-server', () => {
    const rs = regionById('render-server')
    for (const id of ['rsc-runtime', 'ssr-runtime'] as const) {
      const r = regionById(id)
      expect(r.x).toBeGreaterThanOrEqual(rs.x)
      expect(r.x + r.w).toBeLessThanOrEqual(rs.x + rs.w)
      expect(r.y).toBeGreaterThanOrEqual(rs.y)
      expect(r.y + r.h).toBeLessThanOrEqual(rs.y + rs.h)
    }
  })
})
