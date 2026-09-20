import type { EntityState } from '../domain/types'

export interface LabelCandidate {
  id: string
  /** screen position of the label's top-center */
  x: number
  y: number
  text: string
  chips: string[]
  state?: EntityState
  isToken: boolean
  isSelected: boolean
}

export interface ScreenRect { x: number; y: number; w: number; h: number }

const CHAR_W = 6.7
const CHIP_CHAR_W = 6.4
const PAD = 14
const GAP = 4
export const LABEL_H = 20

/** name on the first row, chips on a second row */
export function labelWidth(text: string, chips: string[]): number {
  const name = text.length * CHAR_W + PAD
  const chipW = chips.reduce((sum, c) => sum + c.length * CHIP_CHAR_W + PAD + GAP, 0)
  return Math.max(name, chipW)
}

export function labelHeight(chips: string[]): number {
  return chips.length ? LABEL_H * 2 + 2 : LABEL_H
}

function intersects(a: ScreenRect, b: ScreenRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function priority(c: LabelCandidate): number {
  if (c.isToken) return 0
  if (c.state === 'current') return 1
  if (c.isSelected) return 2
  if (c.state && c.state !== 'dimmed') return 3
  if (!c.state) return 4
  return 5
}

/**
 * Greedy placement: higher-priority labels are placed first; a label is dropped when its box would
 * overlap an already placed label or any glyph box other than its own. Deterministic for equal input.
 */
export function placeLabels(candidates: LabelCandidate[], glyphBoxes: Map<string, ScreenRect>): Set<string> {
  const ordered = [...candidates].sort((a, b) => priority(a) - priority(b) || a.id.localeCompare(b.id))
  const placed: ScreenRect[] = []
  const shown = new Set<string>()
  for (const c of ordered) {
    const w = labelWidth(c.text, c.chips)
    const box: ScreenRect = { x: c.x - w / 2, y: c.y, w, h: labelHeight(c.chips) }
    let ok = true
    for (const r of placed) if (intersects(box, r)) { ok = false; break }
    if (ok) for (const [id, g] of glyphBoxes) if (id !== c.id && intersects(box, g)) { ok = false; break }
    if (ok) { placed.push(box); shown.add(c.id) }
  }
  return shown
}
