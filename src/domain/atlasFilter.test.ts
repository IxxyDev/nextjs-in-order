import { describe, it, expect } from 'vitest'
import { ENVS, isFiltering, matchesFilter, type AtlasFilter } from './atlasFilter'
import { ENTITIES } from './entities'

const count = (f: AtlasFilter) => ENTITIES.filter((e) => matchesFilter(e, f)).length
const ids = (f: AtlasFilter) => ENTITIES.filter((e) => matchesFilter(e, f)).map((e) => e.id)

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
    expect(ids({ region: 'render-server' })).toEqual([
      'loader-tree', 'rsc-runtime-entity', 'flight', 'flight-tee', 'ssr-runtime-entity', 'html', 'action-handler', 'route-handler', 'layout-router',
      'segment-slices', 'ppr-shell', 'pages-renderer', 'isr-regeneration', 'gssp', 'gip', 'pages-data-endpoint', 'pages-document'
    ])
  })
  it('combines fields with AND', () => {
    expect(ids({ env: 'node', region: 'rsc-runtime', phase: 'build' })).toEqual(['rsc-runtime-entity'])
  })
})
