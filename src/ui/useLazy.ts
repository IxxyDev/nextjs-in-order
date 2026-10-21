import { useEffect, useRef, useState } from 'preact/hooks'

/**
 * A value from a lazy catalog (createLazyCatalog): peeked at once when it has loaded, otherwise loaded when the key
 * changes; retry loads it again after a failure (the catalog retries a failed load on the next call). A failure
 * belongs to the visit it happened on: a load that settles for a key no longer shown, or after unmount, changes
 * nothing, and coming back to a key that failed starts from loading. No key, no value.
 */
export function useLazy<T>(key: string | undefined, peek: (key: string) => T | undefined, load: (key: string) => Promise<T | undefined>) {
  const [, setLoads] = useState(0)
  const [failedKey, setFailedKey] = useState<string>()
  const shownKey = useRef(key)
  shownKey.current = key
  useEffect(() => () => { shownKey.current = undefined }, [])
  const value = key === undefined ? undefined : peek(key)
  const retry = () => {
    if (key === undefined) return
    setFailedKey(undefined)
    load(key).then(() => { if (shownKey.current === key) setLoads((n) => n + 1) }, () => { if (shownKey.current === key) setFailedKey(key) })
  }
  useEffect(() => { setFailedKey(undefined); if (value === undefined) retry() }, [key])
  return { value, isFailed: key !== undefined && failedKey === key, retry }
}
