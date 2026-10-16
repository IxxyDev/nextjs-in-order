import { describe, it, expect } from 'vitest'
import { STEP_INTERNALS_KEY as K, createSessionFlags } from './sessionFlags'
import { fakeStorage, throwingStorage } from './fakeStorage'

describe('sessionFlags', () => {
  it('is undefined until set, so the caller picks the default', () => {
    expect(createSessionFlags(() => fakeStorage()).get(K)).toBeUndefined()
  })
  it('writes one key per flag and reads it back in a new store (a reload)', () => {
    const s = fakeStorage()
    createSessionFlags(() => s).set(K, true)
    expect(s.m.get(K)).toBe('true')
    expect(createSessionFlags(() => s).get(K)).toBe(true)
    createSessionFlags(() => s).set(K, false)
    expect(createSessionFlags(() => s).get(K)).toBe(false)
  })
  it('ignores values it did not write', () => {
    expect(createSessionFlags(() => fakeStorage({ [K]: 'yes' })).get(K)).toBeUndefined()
  })
  it('falls back to memory when storage throws or is missing', () => {
    for (const get of [() => throwingStorage, () => undefined]) {
      const f = createSessionFlags(get)
      expect(f.get(K)).toBeUndefined()
      f.set(K, true)
      expect(f.get(K)).toBe(true)
    }
  })
})
