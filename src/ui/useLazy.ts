import { useEffect, useRef, useState } from 'preact/hooks'

/**
 * A value from a lazy catalog (createLazyCatalog): peeked at once when it has loaded, otherwise loaded when the key
 * changes; retry loads it again after a failure (the catalog retries a failed load on the next call). A load that
 * settles after unmount changes nothing. No key, no value.
 */
export function useLazy<T>(key: string | undefined, peek: (key: string) => T | undefined, load: (key: string) => Promise<T | undefined>) {
  const [, setLoads] = useState(0)
  const [failedKey, setFailedKey] = useState<string>()
  const isMounted = useRef(true)
  useEffect(() => () => { isMounted.current = false }, [])
  const value = key === undefined ? undefined : peek(key)
  const retry = () => {
    if (key === undefined) return
    setFailedKey(undefined)
    load(key).then(() => { if (isMounted.current) setLoads((n) => n + 1) }, () => { if (isMounted.current) setFailedKey(key) })
  }
  useEffect(() => { if (value === undefined) retry() }, [key])
  return { value, isFailed: key !== undefined && failedKey === key, retry }
}
