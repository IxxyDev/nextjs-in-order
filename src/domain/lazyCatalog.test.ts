import { describe, it, expect, vi } from 'vitest'
import { createLazy, createLazyCatalog } from './lazyCatalog'

describe('createLazy', () => {
  it('peeks nothing before the load', () => {
    const lazy = createLazy(async () => 'A')

    expect(lazy.peek()).toBeUndefined()
  })
  it('shares one load between concurrent calls', async () => {
    const load = vi.fn(async () => 'A')
    const lazy = createLazy(load)

    await Promise.all([lazy.load(), lazy.load()])

    expect(load).toHaveBeenCalledTimes(1)
  })
  it('peeks the value once it has loaded', async () => {
    const lazy = createLazy(async () => 'A')

    await lazy.load()

    expect(lazy.peek()).toBe('A')
  })
  it('loads again after a failed load', async () => {
    const lazy = createLazy(vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('A'))
    await lazy.load().catch(() => undefined)

    expect(await lazy.load()).toBe('A')
  })
  it('peeks the preloaded value before any load', () => {
    const lazy = createLazy(async () => 'A', 'A0')

    expect(lazy.peek()).toBe('A0')
  })
})

describe('lazy catalog', () => {
  it('loads nothing for an unknown slug', async () => {
    const c = createLazyCatalog([{ slug: 'a', load: async () => 'A' }])
    expect(await c.load('nope')).toBeUndefined()
  })
  it('serves a preloaded value from peek before any load', () => {
    const c = createLazyCatalog([{ slug: 'a', load: async () => 'A' }], [['a', 'A0']])
    expect(c.peek('a')).toBe('A0')
  })
  it('loads every entry in catalog order with loadAll', async () => {
    const c = createLazyCatalog([{ slug: 'a', load: async () => 'A' }, { slug: 'b', load: async () => 'B' }])
    expect(await c.loadAll()).toEqual(['A', 'B'])
  })
})
