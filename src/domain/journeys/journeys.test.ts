// src/domain/journeys/journeys.test.ts
import { describe, it, expect } from 'vitest'
import { JOURNEY_CATALOG, loadAllJourneys, loadJourney } from './index'

const EXPECTED: { slug: string; id: string; steps: number; predictAt?: number[] }[] = [
  { slug: 'whole-lifecycle', id: 'j0', steps: 10 },
  { slug: 'production-build', id: 'j1', steps: 18, predictAt: [6] },
  { slug: 'request-routing', id: 'j2', steps: 14, predictAt: [10] },
  { slug: 'pages-initial', id: 'j3', steps: 16, predictAt: [10] },
  { slug: 'pages-navigation', id: 'j4', steps: 12, predictAt: [3] },
  { slug: 'app-initial', id: 'j5', steps: 22, predictAt: [7] },
  { slug: 'app-navigation', id: 'j6', steps: 18, predictAt: [7] },
  { slug: 'server-actions', id: 'j7', steps: 17, predictAt: [11] },
  { slug: 'caching', id: 'j8', steps: 20, predictAt: [6, 16] },
  { slug: 'dev-mode', id: 'j9', steps: 20, predictAt: [10] },
  { slug: 'custom-server', id: 'j10', steps: 14, predictAt: [6] },
  { slug: 'optimizations', id: 'j11', steps: 16, predictAt: [13] }
]

describe('journeys', () => {
  it('registers every authored journey in spec order', async () => {
    expect(JOURNEY_CATALOG.map((e) => e.id)).toEqual(EXPECTED.map((e) => e.id))
    expect((await loadAllJourneys()).map((j) => j.id)).toEqual(EXPECTED.map((e) => e.id))
  })
  it('unknown slugs load nothing', async () => {
    expect(await loadJourney('nope')).toBeUndefined()
  })
  for (const e of EXPECTED) {
    it(`${e.slug}: step count, predict → reveal placement and closing check follow the spec`, async () => {
      const j = (await loadJourney(e.slug))!
      expect(j, e.slug).toBeDefined()
      expect(j.steps.length).toBe(e.steps)
      for (const at of e.predictAt ?? []) {
        expect(j.steps[at - 1].kind, `step ${at}`).toBe('predict')
        expect(j.steps[at].kind, `step ${at + 1}`).toBe('reveal')
      }
      expect(j.steps.filter((s) => s.kind === 'predict')).toHaveLength(e.predictAt?.length ?? 0)
      const last = j.steps[j.steps.length - 1]
      expect(last.kind).toBe('check')
      /** spec §8: 2–3 misconception checks per journey */
      expect(last.checks!.length).toBeGreaterThanOrEqual(2)
      expect(last.checks!.length).toBeLessThanOrEqual(3)
      for (const s of j.steps) expect(s.id.startsWith(`${e.id}-`), s.id).toBe(true)
    })
  }
})
