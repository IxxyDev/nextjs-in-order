import type { EntityState } from './types'

/** the one word per entity state, on canvas chips, in the step panel and in Read as text; dimmed is the backdrop and has none */
export const STATE_LABEL: Record<EntityState, string> = {
  current: 'Current', active: 'Running', new: 'New', replaced: 'Replaced', kept: 'Kept', invalid: 'Invalidated',
  stale: 'Stale', fresh: 'Fresh', na: 'Unavailable', dimmed: ''
}
