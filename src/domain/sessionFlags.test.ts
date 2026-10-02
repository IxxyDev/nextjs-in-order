import { describe, it, expect } from 'vitest'
import { STEP_INTERNALS_KEY as K, createSessionFlags, type StorageLike } from './sessionFlags'

const fake = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init))
  const s: StorageLike & { m: Map<string, string> } = { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v) } }
  return s
}
const throwing: StorageLike = { getItem: () => { throw new Error('no') }, setItem: () => { throw new Error('no') } }

describe('sessionFlags', () => {
  it('is undefined until set, so the caller picks the default', () => {
    expect(createSessionFlags(() => fake()).get(K)).toBeUndefined()
  })
  it('writes one key per flag and reads it back in a new store (a reload)', () => {
    const s = fake()
    createSessionFlags(() => s).set(K, true)
    expect(s.m.get(K)).toBe('true')
    expect(createSessionFlags(() => s).get(K)).toBe(true)
    createSessionFlags(() => s).set(K, false)
    expect(createSessionFlags(() => s).get(K)).toBe(false)
  })
  it('ignores values it did not write', () => {
    expect(createSessionFlags(() => fake({ [K]: 'yes' })).get(K)).toBeUndefined()
  })
  it('falls back to memory when storage throws or is missing', () => {
    for (const get of [() => throwing, () => undefined]) {
      const f = createSessionFlags(get)
      expect(f.get(K)).toBeUndefined()
      f.set(K, true)
      expect(f.get(K)).toBe(true)
    }
  })
})
