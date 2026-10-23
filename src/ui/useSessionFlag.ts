import { useState } from 'preact/hooks'
import { sessionFlags } from '../domain/sessionFlags'

/** a flag that holds for this tab's session: the default until set; with no default, undefined until set */
export function useSessionFlag(key: string, defaultValue: boolean): [boolean, (value: boolean) => void]
export function useSessionFlag(key: string): [boolean | undefined, (value: boolean) => void]
export function useSessionFlag(key: string, defaultValue?: boolean): [boolean | undefined, (value: boolean) => void] {
  const [value, setValue] = useState(() => sessionFlags.get(key) ?? defaultValue)
  const set = (next: boolean) => { setValue(next); sessionFlags.set(key, next) }
  return [value, set]
}
