// src/domain/journeys/journeys.test.ts
import { describe, it, expect } from 'vitest'
import { JOURNEYS, journeyBySlug } from './index'

const EXPECTED: { slug: string; id: string; steps: number; predictAt?: number; checkAt: number }[] = [
  { slug: 'whole-lifecycle', id: 'j0', steps: 10, checkAt: 10 },
  { slug: 'app-initial', id: 'j5', steps: 22, predictAt: 7, checkAt: 22 },
  { slug: 'app-navigation', id: 'j6', steps: 18, predictAt: 7, checkAt: 18 },
  { slug: 'server-actions', id: 'j7', steps: 17, predictAt: 11, checkAt: 17 }
]

describe('journeys', () => {
  it('registers every authored journey in spec order', () => {
    expect(JOURNEYS.map((j) => j.id)).toEqual(EXPECTED.map((e) => e.id))
  })
  for (const e of EXPECTED) {
    it(`${e.slug}: step count, predict → reveal placement and closing check follow the spec`, () => {
      const j = journeyBySlug(e.slug)!
      expect(j, e.slug).toBeDefined()
      expect(j.steps.length).toBe(e.steps)
      if (e.predictAt) {
        expect(j.steps[e.predictAt - 1].kind).toBe('predict')
        expect(j.steps[e.predictAt].kind).toBe('reveal')
        expect(j.steps.filter((s) => s.kind === 'predict')).toHaveLength(1)
      }
      expect(j.steps[e.checkAt - 1].kind).toBe('check')
      expect(j.steps[e.checkAt - 1].checks!.length).toBeGreaterThanOrEqual(2)
      for (const s of j.steps) expect(s.id.startsWith(`${e.id}-`), s.id).toBe(true)
    })
  }
})
