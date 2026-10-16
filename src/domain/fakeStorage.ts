import type { StorageLike } from './storage'

/** spec fakes for StorageLike: an in-memory store whose map the spec can read, and one that throws on every call */
export function fakeStorage(init: Record<string, string> = {}): StorageLike & { m: Map<string, string> } {
  const m = new Map(Object.entries(init))
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v) } }
}

export const throwingStorage: StorageLike = { getItem: () => { throw new Error('no') }, setItem: () => { throw new Error('no') } }
