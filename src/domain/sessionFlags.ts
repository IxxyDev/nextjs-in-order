export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export const STEP_INTERNALS_KEY = 'nextjs-in-order:internals:step:v1'
export const INSPECTOR_INTERNALS_KEY = 'nextjs-in-order:internals:inspector:v1'
/** the code lens: unset follows each step's data; true keeps it open everywhere, false keeps it collapsed */
export const LENS_KEY = 'nextjs-in-order:lens:v1'

function defaultStorage(): StorageLike | undefined {
  try { return typeof window === 'undefined' ? undefined : window.sessionStorage } catch { return undefined }
}

/** open/closed flags for this tab's session (sessionStorage); storage failures leave an in-memory copy for the page's life */
export function createSessionFlags(getStorage: () => StorageLike | undefined = defaultStorage) {
  const memory = new Map<string, boolean>()
  return {
    get(key: string): boolean | undefined {
      if (memory.has(key)) return memory.get(key)
      try { const v = getStorage()?.getItem(key); return v === 'true' ? true : v === 'false' ? false : undefined } catch { return undefined }
    },
    set(key: string, open: boolean) {
      memory.set(key, open)
      try { getStorage()?.setItem(key, String(open)) } catch { /* in-memory only */ }
    }
  }
}

export const sessionFlags = createSessionFlags()
