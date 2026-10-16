export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

/** the window's storage of that kind; undefined with no window or when reaching it throws (blocked site data) */
export function browserStorage(kind: 'localStorage' | 'sessionStorage'): StorageLike | undefined {
  try { return typeof window === 'undefined' ? undefined : window[kind] } catch { return undefined }
}
