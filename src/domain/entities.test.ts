// src/domain/entities.test.ts
import { describe, it, expect } from 'vitest'
import { ENTITIES, entityById } from './entities'
import { regionById } from './regions'

describe('entities', () => {
  it('has unique ids', () => {
    const ids = ENTITIES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('places every entity inside its region', () => {
    for (const e of ENTITIES) {
      const r = regionById(e.region)
      expect(e.x, e.id).toBeGreaterThanOrEqual(r.x)
      expect(e.x, e.id).toBeLessThanOrEqual(r.x + r.w)
      expect(e.y, e.id).toBeGreaterThanOrEqual(r.y)
      expect(e.y, e.id).toBeLessThanOrEqual(r.y + r.h)
    }
  })
  it('only lets code cross the network for client modules, Pages Router page code and browser chunks', () => {
    const code = ENTITIES.filter((e) => e.reaches === 'code').map((e) => e.id).sort()
    expect(code).toEqual([
      'browser-chunks', 'client-components', 'gip', 'layout-router', 'pages-app', 'pages-post-page', 'pages-product-page',
      'src-dashboard-nav', 'src-profile-form'
    ])
  })
  it('resolves connects to existing ids', () => {
    for (const e of ENTITIES) for (const c of e.connects) expect(() => entityById(c), `${e.id} -> ${c}`).not.toThrow()
  })
})
