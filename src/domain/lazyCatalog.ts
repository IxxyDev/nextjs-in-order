/** loads each slug once: concurrent loads share one promise, a failed load is retried on the next call */
export function createLazyCatalog<T>(entries: { slug: string; load: () => Promise<T> }[], preloaded: [string, T][] = []) {
  const loaded = new Map(preloaded)
  const pending = new Map<string, Promise<T>>()
  const load = (slug: string): Promise<T | undefined> => {
    const e = entries.find((e) => e.slug === slug)
    if (!e) return Promise.resolve(undefined)
    let p = pending.get(slug)
    if (!p) {
      p = e.load().then((v) => { loaded.set(slug, v); return v })
      p.catch(() => pending.delete(slug))
      pending.set(slug, p)
    }
    return p
  }
  return {
    peek: (slug: string) => loaded.get(slug),
    load,
    loadAll: () => Promise.all(entries.map((e) => load(e.slug) as Promise<T>))
  }
}
