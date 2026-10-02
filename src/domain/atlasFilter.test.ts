import { describe, it, expect } from 'vitest'
import { ENVS, isFiltering, matchesFilter, type AtlasFilter } from './atlasFilter'
import { ENTITIES } from './entities'

const count = (f: AtlasFilter) => ENTITIES.filter((e) => matchesFilter(e, f)).length

describe('atlas filter', () => {
  it('matches everything when empty', () => {
    expect(isFiltering({})).toBe(false)
    expect(count({})).toBe(ENTITIES.length)
  })
  it('lists every environment entities use', () => {
    for (const e of ENTITIES) for (const v of e.env) expect(ENVS).toContain(v)
  })
  it('filters by environment and region', () => {
    expect(isFiltering({ env: 'browser' })).toBe(true)
    const browser = count({ env: 'browser' })
    expect(browser).toBeGreaterThan(0)
    expect(browser).toBeLessThan(ENTITIES.length)
    expect(ENTITIES.filter((e) => matchesFilter(e, { region: 'client-router' })).every((e) => e.region === 'client-router')).toBe(true)
  })
  it('takes nested regions in with their parent', () => {
    const rsc = count({ region: 'rsc-runtime' })
    expect(rsc).toBeGreaterThan(0)
    expect(count({ region: 'render-server' })).toBeGreaterThanOrEqual(rsc + count({ region: 'ssr-runtime' }))
  })
  it('combines fields with AND', () => {
    const f: AtlasFilter = { env: 'node', region: 'render-server', phase: 'request' }
    const both = ENTITIES.filter((e) => matchesFilter(e, f))
    expect(both.length).toBeLessThanOrEqual(Math.min(count({ env: 'node' }), count({ region: 'render-server' }), count({ phase: 'request' })))
    expect(both.every((e) => e.env.includes('node') && e.phase.includes('request'))).toBe(true)
    expect(count({ env: 'rust', region: 'browser' })).toBe(0)
  })
})
