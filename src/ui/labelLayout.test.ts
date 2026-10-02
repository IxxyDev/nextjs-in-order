import { describe, it, expect } from 'vitest'
import { placeLabels, labelWidth } from './labelLayout'

describe('placeLabels', () => {
  it('keeps the higher-priority label when two overlap', () => {
    const shown = placeLabels([
      { id: 'a', x: 100, y: 50, text: 'AccountSummary.tsx', chips: [], isToken: false, isSelected: false, state: 'dimmed' },
      { id: 'b', x: 140, y: 50, text: 'DashboardNav.tsx', chips: ['running'], isToken: false, isSelected: false, state: 'active' }
    ], new Map())
    expect([...shown.keys()]).toEqual(['b'])
  })
  it('drops a secondary label that would cover another glyph', () => {
    const w = labelWidth('DashboardNav.tsx', ['running'])
    const shown = placeLabels(
      [{ id: 'b', x: 100, y: 50, text: 'DashboardNav.tsx', chips: [], isToken: false, isSelected: false }],
      new Map([['c', { x: 100 + w / 2 - 5, y: 40, w: 40, h: 40 }]])
    )
    expect(shown.size).toBe(0)
  })
  it('always places the token label first', () => {
    const shown = placeLabels([
      { id: 'a', x: 100, y: 50, text: 'Flight rows', chips: ['now'], isToken: true, isSelected: false, state: 'current' },
      { id: 'b', x: 110, y: 50, text: 'RSC runtime', chips: ['running'], isToken: false, isSelected: false, state: 'active' }
    ], new Map())
    expect(shown.has('a')).toBe(true)
    expect(shown.has('b')).toBe(false)
  })
  it('moves a label above its glyph when the spot below is taken', () => {
    const glyphs = new Map([['a', { x: 80, y: 0, w: 40, h: 40 }], ['c', { x: 90, y: 50, w: 20, h: 20 }]])
    const shown = placeLabels([{ id: 'a', x: 100, y: 45, text: 'Server cache', chips: ['new'], isToken: false, isSelected: false, state: 'new' }], glyphs, { bounds: { w: 400, h: 400 } })
    const at = shown.get('a')!
    expect(at.box.y + at.box.h).toBeLessThanOrEqual(50)
  })
  it('keeps labels clear of reserved zones', () => {
    const shown = placeLabels([
      { id: 'a', x: 60, y: 300, text: 'Early exits', chips: ['kept'], isToken: false, isSelected: false, state: 'kept' }
    ], new Map([['a', { x: 40, y: 260, w: 40, h: 40 }]]), { reserved: [{ x: 0, y: 290, w: 150, h: 110 }], bounds: { w: 600, h: 400 } })
    const at = shown.get('a')!
    expect(at.box.x >= 150 || at.box.y + at.box.h <= 290).toBe(true)
  })
  it('never drops the token label and keeps it inside the canvas', () => {
    const glyphs = new Map([['t', { x: 0, y: 80, w: 30, h: 30 }], ['n', { x: 0, y: 112, w: 200, h: 40 }], ['m', { x: 0, y: 30, w: 200, h: 48 }], ['r', { x: 32, y: 60, w: 300, h: 80 }]])
    const shown = placeLabels([{ id: 't', x: 15, y: 112, text: 'posts/7 · stale → regenerate behind', chips: ['stale'], isToken: true, isSelected: false, state: 'current' }], glyphs, { bounds: { w: 500, h: 300 } })
    const at = shown.get('t')!
    expect(at.box.x).toBeGreaterThanOrEqual(0)
  })
  it('slides an edge label off a label placed before it', () => {
    const shown = placeLabels([
      { id: 'flight', x: 100, y: 50, text: 'Flight · new output', chips: ['new'], isToken: true, isSelected: false, state: 'current' },
      { id: 'edge:e', x: 100, y: 60, text: 'serialize', chips: [], isToken: false, isSelected: false, isEdge: true }
    ], new Map(), { bounds: { w: 400, h: 400 } })
    const a = shown.get('flight')!.box, b = shown.get('edge:e')!.box
    expect(b.y + b.h <= a.y || b.y >= a.y + a.h).toBe(true)
  })
})
