import { describe, it, expect } from 'vitest'
import { breadcrumbFor, regionLevel } from './breadcrumb'
import { ENTITIES } from './entities'

const labels = (c: ReturnType<typeof breadcrumbFor>) => c.map((x) => x.label)
const inRegion = (id: string) => ENTITIES.find((e) => e.region === id && !e.id.endsWith('-runtime-entity'))!

describe('breadcrumbFor', () => {
  it('is World alone for the world', () => {
    expect(breadcrumbFor({ target: { kind: 'world' } })).toEqual([{ label: 'World', target: { kind: 'world' } }])
  })
  it('walks band and regions down to a nested region', () => {
    const c = breadcrumbFor({ target: { kind: 'region', id: 'rsc-runtime' } })
    expect(labels(c)).toEqual(['World', 'Server', 'render-server', 'RSC runtime'])
    expect(c.map((x) => x.target)).toEqual([{ kind: 'world' }, { kind: 'band', id: 'server' }, { kind: 'region', id: 'render-server' }, { kind: 'region', id: 'rsc-runtime' }])
  })
  it('ends on the entity, which wins over the target', () => {
    const e = inRegion('rsc-runtime')
    const c = breadcrumbFor({ target: { kind: 'region', id: 'browser' }, entity: e.id })
    expect(labels(c).slice(0, 4)).toEqual(['World', 'Server', 'render-server', 'RSC runtime'])
    expect(c.at(-1)!.target).toEqual({ kind: 'entities', ids: [e.id] })
  })
  it('adds no crumb for an entity named like its region', () => {
    expect(labels(breadcrumbFor({ target: { kind: 'world' }, entity: 'rsc-runtime-entity' }))).toEqual(['World', 'Server', 'render-server', 'RSC runtime'])
  })
  it('keeps only what several entities share', () => {
    const a = inRegion('rsc-runtime'), b = inRegion('ssr-runtime'), d = inRegion('source')
    expect(labels(breadcrumbFor({ target: { kind: 'entities', ids: [a.id, b.id] } }))).toEqual(['World', 'Server', 'render-server'])
    expect(labels(breadcrumbFor({ target: { kind: 'entities', ids: [a.id, d.id] } }))).toEqual(['World'])
    expect(labels(breadcrumbFor({ target: { kind: 'entities', ids: [d.id, inRegion('build').id] } }))).toEqual(['World', 'Build'])
  })
  it('shows a band target as its band', () => {
    expect(labels(breadcrumbFor({ target: { kind: 'band', id: 'browser' } }))).toEqual(['World', 'Browser'])
  })
})

describe('regionLevel', () => {
  it('lifts entities to the innermost shared region, else leaves the target', () => {
    const a = inRegion('rsc-runtime'), b = inRegion('ssr-runtime'), d = inRegion('source')
    expect(regionLevel({ kind: 'entities', ids: [a.id] })).toEqual({ kind: 'region', id: 'rsc-runtime' })
    expect(regionLevel({ kind: 'entities', ids: [a.id, b.id] })).toEqual({ kind: 'region', id: 'render-server' })
    expect(regionLevel({ kind: 'entities', ids: [d.id, inRegion('build').id] })).toEqual({ kind: 'entities', ids: [d.id, inRegion('build').id] })
    expect(regionLevel({ kind: 'entities', ids: [a.id, d.id] })).toEqual({ kind: 'entities', ids: [a.id, d.id] })
    expect(regionLevel({ kind: 'world' })).toEqual({ kind: 'world' })
  })
  it('leaves the target in a region that spans half the world', () => {
    const dev = inRegion('dev')
    expect(regionLevel({ kind: 'entities', ids: [dev.id] })).toEqual({ kind: 'entities', ids: [dev.id] })
  })
})
