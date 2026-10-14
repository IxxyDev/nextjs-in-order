import { useState } from 'preact/hooks'
import { sessionFlags } from '../domain/sessionFlags'

/** a flag that holds for this tab's session: undefined until set, so the caller picks the default */
export function useSessionFlag(key: string): [boolean | undefined, (value: boolean) => void] {
  const [value, setValue] = useState(() => sessionFlags.get(key))
  const set = (next: boolean) => { setValue(next); sessionFlags.set(key, next) }
  return [value, set]
}
