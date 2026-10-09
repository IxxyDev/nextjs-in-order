import { describe, it, expect, vi } from 'vitest'
import { createLazyCatalog } from './lazyCatalog'

describe('lazy catalog', () => {
  it('dedupes concurrent loads and caches the value for peek', async () => {
    const load = vi.fn(async () => 'A')
    const c = createLazyCatalog([{ slug: 'a', load }])
    expect(c.peek('a')).toBeUndefined()
    const [x, y] = await Promise.all([c.load('a'), c.load('a')])
    expect([x, y]).toEqual(['A', 'A'])
    expect(load).toHaveBeenCalledTimes(1)
    expect(c.peek('a')).toBe('A')
  })
  it('retries after a failed load', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('A')
    const c = createLazyCatalog([{ slug: 'a', load }])
    await expect(c.load('a')).rejects.toThrow('offline')
    expect(await c.load('a')).toBe('A')
    expect(load).toHaveBeenCalledTimes(2)
  })
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
