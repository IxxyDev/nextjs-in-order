// src/domain/validate.test.ts
import { describe, it, expect } from 'vitest'
import { validateEntities, validateJourney } from './validate'
import { ENTITIES, entityById } from './entities'
import { loadAllJourneys } from './journeys'
import { WHOLE_LIFECYCLE } from './journeys/whole-lifecycle'

describe('validateJourney', () => {
  it('accepts every registered journey', async () => {
    for (const j of await loadAllJourneys()) expect(validateJourney(j), j.slug).toEqual([])
  })
  it('reports unknown ids and missing questions', () => {
    const j = WHOLE_LIFECYCLE
    const broken = {
      ...j,
      steps: [
        { ...j.steps[1], id: 'x1', states: { nope: 'current' as const }, edges: ['e-missing'], token: { at: 'ghost', glyph: 'flight' as const, label: 'g' } },
        { ...j.steps[0], id: 'x1', kind: 'predict' as const }
      ]
    }
    const errors = validateJourney(broken)
    expect(errors.some((e) => e.includes('nope'))).toBe(true)
    expect(errors.some((e) => e.includes('e-missing'))).toBe(true)
    expect(errors.some((e) => e.includes('ghost'))).toBe(true)
    expect(errors.some((e) => e.includes('duplicate step id'))).toBe(true)
    expect(errors.some((e) => e.includes('question'))).toBe(true)
  })
})

describe('validateEntities', () => {
  it('accepts every entity history', () => {
    expect(validateEntities(ENTITIES)).toEqual([])
    expect(entityById('next-build').history?.length).toBeGreaterThan(0)
    expect(entityById('bundler').history?.length).toBeGreaterThan(0)
  })
  it('reports empty, unnumbered and out-of-order histories', () => {
    const e = entityById('bundler')
    const errors = validateEntities([
      { ...e, id: 'empty', history: [] },
      { ...e, id: 'blank', history: [{ version: 'today', text: ' ' }] },
      { ...e, id: 'order', history: [{ version: '12', text: 'a' }, { version: '9.3', text: 'b' }, { version: '9.3', text: 'c' }] }
    ])
    expect(errors).toEqual([
      'empty: empty history',
      'blank history 1: empty text',
      'blank history 1: no release number in "today"',
      'order history 2: 9.3 does not come after 12',
      'order history 3: 9.3 does not come after 9.3'
    ])
  })
})
