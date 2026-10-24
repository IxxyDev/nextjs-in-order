import type { StorageLike } from './storage'

/** spec fakes for StorageLike: an in-memory store whose map the spec can read, and one that throws on every call */
export function fakeStorage(init: Record<string, string> = {}): StorageLike & { map: Map<string, string> } {
  const map = new Map(Object.entries(init))
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v) } }
}

export const throwingStorage: StorageLike = { getItem: () => { throw new Error('no') }, setItem: () => { throw new Error('no') } }
