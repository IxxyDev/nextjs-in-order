// src/domain/validate.test.ts
import { describe, it, expect } from 'vitest'
import { validateJourney } from './validate'
import { JOURNEYS } from './journeys'

describe('validateJourney', () => {
  it('accepts every registered journey', () => {
    for (const j of JOURNEYS) expect(validateJourney(j), j.slug).toEqual([])
  })
  it('reports unknown ids and missing questions', () => {
    const j = JOURNEYS[0]
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
