/** a value loaded on first need: peek gives it once it has loaded, load loads it */
export interface Lazy<T> { peek: () => T | undefined; load: () => Promise<T> }

/** loads once: concurrent loads share one promise, a failed load is retried on the next call */
export function createLazy<T>(load: () => Promise<T>, preloaded?: T): Lazy<T> {
  let value = preloaded
  let pending: Promise<T> | undefined
  return {
    peek: () => value,
    load: () => {
      if (!pending) {
        pending = load().then((v) => { value = v; return v })
        pending.catch(() => { pending = undefined })
      }
      return pending
    }
  }
}

/** one lazy per slug (createLazy) */
export function createLazyCatalog<T>(entries: { slug: string; load: () => Promise<T> }[], preloaded: [string, T][] = []) {
  const preloadedBySlug = new Map(preloaded)
  const lazyBySlug = new Map(entries.map((e) => [e.slug, createLazy(e.load, preloadedBySlug.get(e.slug))]))
  const lazies = [...lazyBySlug.values()]
  return {
    peek: (slug: string) => lazyBySlug.get(slug)?.peek(),
    load: (slug: string): Promise<T | undefined> => lazyBySlug.get(slug)?.load() ?? Promise.resolve(undefined),
    loadAll: () => Promise.all(lazies.map((l) => l.load()))
  }
}
