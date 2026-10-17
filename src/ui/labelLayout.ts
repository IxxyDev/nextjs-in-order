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
  /** edge labels sit centered on their edge and slide along it; entity labels hang under their glyph */
  isEdge?: boolean
  /** chips on the name's row instead of a second row: half the height, for crowded zoomed-out scenes */
  inline?: boolean
}

export interface ScreenRect { x: number; y: number; w: number; h: number }
export interface Placed { x: number; y: number; box: ScreenRect }

export interface LayoutOptions {
  /** screen zones no label may cover (the minimap) */
  reserved?: ScreenRect[]
  /** the overlay size; labels of on-screen glyphs are kept inside it */
  bounds?: { w: number; h: number }
  /** glyphs an emphasized label may cover when nothing else fits (dimmed or unstated entities) */
  soft?: ReadonlySet<string>
}

/** IBM Plex Mono advances 0.6em: 12px names with 0.01em tracking, 10px chips with 0.1em; padding + border */
const CHAR_W = 7.3
const CHIP_CHAR_W = 7
const PAD = 16
const GAP = 4
const EDGE_CHAR_W = 7.5
const EDGE_PAD = 18
const EDGE_H = 20
const INSET = 4
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

export function inlineLabelWidth(text: string, chips: string[]): number {
  return text.length * CHAR_W + PAD + chips.reduce((sum, c) => sum + c.length * CHIP_CHAR_W + PAD + GAP, 0)
}

/** uppercase edge chip, optional crossing chip inline */
export function edgeLabelWidth(text: string, chips: string[]): number {
  return text.length * EDGE_CHAR_W + EDGE_PAD + chips.reduce((sum, c) => sum + c.length * 7 + 26, 0)
}

export function intersects(a: ScreenRect, b: ScreenRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function priority(c: LabelCandidate): number {
  if (c.isToken) return 0
  if (c.state === 'current') return 1
  if (c.isEdge) return 1.5
  if (c.isSelected) return 2
  if (c.state && c.state !== 'dimmed') return 3
  if (!c.state) return 4
  return 5
}

/** top-center anchors to try, best first: under the glyph, above it, right of it, left of it, then under it nudged sideways */
function anchors(c: LabelCandidate, w: number, h: number, g?: ScreenRect): { x: number; y: number }[] {
  if (c.isEdge) return [0, -1, 1, -2, 2].map((k) => ({ x: c.x, y: c.y + k * (h + 6) }))
  if (!g) return [{ x: c.x, y: c.y }]
  const midY = g.y + g.h / 2 - LABEL_H / 2
  const nudge = w / 2 - g.w / 2
  return [{ x: c.x, y: c.y }, { x: c.x, y: g.y - h - 2 }, { x: g.x + g.w + 4 + w / 2, y: midY }, { x: g.x - 4 - w / 2, y: midY }, { x: c.x + nudge, y: c.y }, { x: c.x - nudge, y: c.y }]
}

/**
 * Greedy placement. Higher-priority labels are placed first; each tries its anchors in order and takes
 * the first one that covers no placed label, no reserved zone and no other glyph. Emphasized labels may
 * then cover soft glyphs, then any glyph; the token and the current entity are never dropped. With bounds,
 * only on-screen glyphs are labeled, and their labels are pushed inside, so a glyph at the canvas edge
 * keeps a readable label.
 * Deterministic for equal input.
 */
export function placeLabels(candidates: LabelCandidate[], glyphBoxes: Map<string, ScreenRect>, opts: LayoutOptions = {}): Map<string, Placed> {
  const { reserved = [], bounds, soft } = opts
  const ordered = [...candidates].sort((a, b) => priority(a) - priority(b) || a.id.localeCompare(b.id))
  const placed: ScreenRect[] = []
  const shown = new Map<string, Placed>()
  const clear = (box: ScreenRect, id: string, glyphs: 'all' | 'hard' | 'none') => {
    for (const r of placed) if (intersects(box, r)) return false
    for (const r of reserved) if (intersects(box, r)) return false
    if (glyphs !== 'none') for (const [gid, g] of glyphBoxes) {
      if (gid === id || (glyphs === 'hard' && soft?.has(gid))) continue
      if (intersects(box, g)) return false
    }
    return true
  }
  for (const c of ordered) {
    const natural = c.isEdge ? edgeLabelWidth(c.text, c.chips) : c.inline ? inlineLabelWidth(c.text, c.chips) : labelWidth(c.text, c.chips)
    /** a label wider than the overlay is cut to it; its text ellipsizes (.label-name, .edge-label-text in styles.css) */
    const w = bounds ? Math.min(natural, bounds.w - 2 * INSET) : natural
    const h = c.isEdge ? EDGE_H : c.inline ? LABEL_H : labelHeight(c.chips)
    const g = glyphBoxes.get(c.id)
    const ax = g ? g.x + g.w / 2 : c.x, ay = g ? g.y + g.h / 2 : c.y
    const onScreen = bounds && ax >= 0 && ax <= bounds.w && ay >= 0 && ay <= bounds.h
    /** a glyph or edge midpoint off the canvas gets no label: it would only show as a clipped stub */
    if (bounds && !onScreen) continue
    const boxes = anchors(c, w, h, g).map(({ x, y }) => {
      if (onScreen) {
        x = Math.min(bounds.w - INSET - w / 2, Math.max(INSET + w / 2, x))
        y = Math.min(bounds.h - INSET - h, Math.max(INSET, y))
      }
      return { x: x - w / 2, y, w, h }
    })
    const p = priority(c)
    /** emphasized labels may cover soft glyphs, then any glyph, but never another label */
    const passes: ('all' | 'hard' | 'none')[] = c.isEdge || p <= 3 ? ['all', 'hard', 'none'] : ['all']
    let box: ScreenRect | undefined
    for (const pass of passes) if ((box = boxes.find((b) => clear(b, c.id, pass)))) break
    /** the token and the current entity always keep a label: the first spot clear of reserved zones */
    if (!box && p <= 1) box = boxes.find((b) => !reserved.some((r) => intersects(b, r))) ?? boxes[0]
    if (box) { placed.push(box); shown.set(c.id, { x: box.x + w / 2, y: box.y, box }) }
  }
  return shown
}
