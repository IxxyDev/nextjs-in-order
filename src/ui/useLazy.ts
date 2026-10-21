import { useEffect, useRef, useState } from 'preact/hooks'
import type { Lazy } from '../domain/lazyCatalog'

/**
 * A lazy value (createLazy): peeked at once when it has loaded, otherwise loaded when the lazy changes; retry loads it
 * again after a failure (a lazy retries a failed load on the next call). A failure belongs to the visit it happened
 * on: a load that settles for a lazy no longer shown, or after unmount, changes nothing, and coming back to a lazy
 * that failed starts from loading. No lazy, no value.
 */
export function useLazy<T>(lazy: Lazy<T> | undefined) {
  const [, setLoads] = useState(0)
  const [failed, setFailed] = useState<Lazy<T>>()
  const shown = useRef(lazy)
  shown.current = lazy
  useEffect(() => () => { shown.current = undefined }, [])
  const value = lazy?.peek()
  const retry = () => {
    if (!lazy) return
    setFailed(undefined)
    lazy.load().then(() => { if (shown.current === lazy) setLoads((n) => n + 1) }, () => { if (shown.current === lazy) setFailed(lazy) })
  }
  useEffect(() => { setFailed(undefined); if (value === undefined) retry() }, [lazy])
  return { value, isFailed: lazy !== undefined && failed === lazy, retry }
}
