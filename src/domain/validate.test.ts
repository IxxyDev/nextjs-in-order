// src/domain/validate.test.ts
import { describe, it, expect } from 'vitest'
import { validateJourney } from './validate'
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
