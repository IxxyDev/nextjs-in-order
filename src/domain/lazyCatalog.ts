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

/** one lazy per slug (createLazy); all is every entry's value, in catalog order, peeked once each has loaded */
export function createLazyCatalog<T>(entries: { slug: string; load: () => Promise<T> }[], preloaded: [string, T][] = []) {
  const preloadedBySlug = new Map(preloaded)
  const lazyBySlug = new Map(entries.map((e) => [e.slug, createLazy(e.load, preloadedBySlug.get(e.slug))]))
  const lazies = [...lazyBySlug.values()]
  const all: Lazy<T[]> = {
    peek: () => {
      const values = lazies.map((l) => l.peek()).filter((v): v is T => v !== undefined)
      return values.length === lazies.length ? values : undefined
    },
    load: () => Promise.all(lazies.map((l) => l.load()))
  }
  return {
    lazy: (slug: string) => lazyBySlug.get(slug),
    peek: (slug: string) => lazyBySlug.get(slug)?.peek(),
    load: (slug: string): Promise<T | undefined> => lazyBySlug.get(slug)?.load() ?? Promise.resolve(undefined),
    all
  }
}
