// src/ui/lensLink.ts
import { signal } from '@preact/signals'
import type { HueFate } from '../domain/types'

/** code → map: the entities a hovered or focused lens line points at, drawn in that line's hue (World, Labels) */
export const lensLit = signal<{ ids: ReadonlySet<string>; hue?: HueFate }>({ ids: new Set() })
/** map → code: the entity under the pointer or focus on the map; the lens lights the lines that link to it */
export const mapHover = signal<string | undefined>(undefined)

export const clearLensLit = () => { if (lensLit.peek().ids.size) lensLit.value = { ids: new Set() } }
/** the lens is showing its panes (not a strip): phones then offer the panel more room (JourneyView) */
export const lensOpen = signal(false)
