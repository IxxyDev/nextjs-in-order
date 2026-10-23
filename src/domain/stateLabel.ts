import type { ChipState } from './types'

/** the one word per entity state, on canvas chips, in the step panel and in Read as text */
export const STATE_LABEL: Record<ChipState, string> = {
  current: 'Now', active: 'Running', new: 'New', replaced: 'Replaced', kept: 'Kept', invalid: 'Invalid',
  stale: 'Stale', fresh: 'Fresh', na: 'n/a'
}
