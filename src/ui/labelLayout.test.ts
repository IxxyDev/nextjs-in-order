import { describe, it, expect } from 'vitest'
import { placeLabels, labelWidth } from './labelLayout'

describe('placeLabels', () => {
  it('keeps the higher-priority label when two overlap', () => {
    const shown = placeLabels([
      { id: 'a', x: 100, y: 50, text: 'AccountSummary.tsx', chips: [], isToken: false, isSelected: false, state: 'dimmed' },
      { id: 'b', x: 140, y: 50, text: 'DashboardNav.tsx', chips: ['running'], isToken: false, isSelected: false, state: 'active' }
    ], new Map())
    expect([...shown]).toEqual(['b'])
  })
  it('drops a label that would cover another glyph', () => {
    const w = labelWidth('DashboardNav.tsx', ['running'])
    const shown = placeLabels(
      [{ id: 'b', x: 100, y: 50, text: 'DashboardNav.tsx', chips: ['running'], isToken: false, isSelected: false, state: 'active' }],
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
})
