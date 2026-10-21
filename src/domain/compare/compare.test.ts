import { describe, it, expect } from 'vitest'
import { COMPARE_CATALOG, loadCompare, resolvePair } from './index'
import { validateCompare } from '../validate'
import { deriveCompareState } from '../compareState'
import { lazyAllJourneys, peekJourney } from '../journeys'
import type { ComparePair } from '../types'

const LANES: Record<string, number> = { c1: 2, c2: 2, c3: 2, c4: 2, c5: 2, c6: 2, c7: 2, c8: 3, c9: 2 }

describe('compare pairs', () => {
  it('registers C1–C9 in spec order', () => {
    expect(COMPARE_CATALOG.map((e) => e.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'])
    expect(COMPARE_CATALOG[0].slug).toBe('initial-load')
  })
  it('unknown slugs load nothing', async () => {
    expect(await loadCompare('nope')).toBeUndefined()
  })
  for (const e of COMPARE_CATALOG) {
    it(`${e.slug}: 5–9 steps, lane count and valid references`, async () => {
      await lazyAllJourneys.load()
      const pair = await e.load()
      expect(pair.steps.length).toBeGreaterThanOrEqual(5)
      expect(pair.steps.length).toBeLessThanOrEqual(9)
      expect(pair.lanes).toHaveLength(LANES[e.id])
      expect(validateCompare(pair, peekJourney)).toEqual([])
    })
    it(`${e.slug}: resolves and derives one world per lane`, async () => {
      const r = (await loadCompare(e.slug))!
      for (let i = 0; i < r.steps.length; i++) {
        const w = deriveCompareState(r, i)
        expect(w.lanes).toHaveLength(r.lanes.length)
        expect(w.ruler).toHaveLength(r.lanes.length)
        for (const lane of w.lanes) expect(lane.lane.story.length).toBeGreaterThan(0)
        expect(w.text).toContain(r.steps[i].title)
      }
    })
  }
  it('marks entities lit in one lane only as differs', async () => {
    const r = (await loadCompare('bundlers'))!
    const w = deriveCompareState(r, 3)
    expect(w.lanes[0].differs.has('flight-client-entry-plugin')).toBe(true)
    expect(w.lanes[1].differs.has('flight-client-entry-plugin')).toBe(false)
    expect(w.lanes[0].differs.has('client-reference-manifest')).toBe(false)
  })
  it('resolves a reused step into its journey scene and source', async () => {
    const r = (await loadCompare('initial-load'))!
    const lane = r.steps[0].lanes[1]
    expect(lane.source).toEqual({ slug: 'app-initial', step: 3, label: 'J5 step 3 · The loader tree' })
    expect(lane.token?.at).toBe('loader-tree')
  })
  it('clamps step indexes', async () => {
    const r = (await loadCompare('caches'))!
    expect(deriveCompareState(r, -3).stepIndex).toBe(0)
    expect(deriveCompareState(r, 99).stepIndex).toBe(r.steps.length - 1)
  })
  it('reports broken references, ids and rulers', async () => {
    await lazyAllJourneys.load()
    const pair: ComparePair = {
      id: 'cx', slug: 'broken', title: 'Broken', synchronized: '', lanes: [{ title: 'A', short: 'A' }, { title: 'B', short: 'B' }],
      steps: [
        { id: 'cx-1', title: 't', story: 's', ruler: [0.5], lanes: [{ ref: { journey: 'app-initial', step: 99 } }, { ref: { journey: 'ghost', step: 1 } }] },
        { id: 'cx-1', title: 't', story: 's', lanes: [{ story: 'x', camera: { kind: 'entities', ids: ['nobody'] }, states: { nope: 'current' }, edges: ['e-missing'] }] }
      ]
    }
    const errors = validateCompare(pair, peekJourney)
    expect(errors).toEqual([
      'broken step 1 (cx-1): ruler needs one value in [0, 1] per lane',
      'broken step 1 (cx-1) lane 1: app-initial has no step 99',
      'broken step 1 (cx-1) lane 2: unknown journey ghost',
      'broken step 2 (cx-1): duplicate step id',
      'broken step 2 (cx-1): 1 lanes, pair has 2',
      'broken step 2 (cx-1) lane 1: unknown entity nope',
      'broken step 2 (cx-1) lane 1: unknown edge e-missing',
      'broken step 2 (cx-1) lane 1: camera on unknown entity nobody'
    ])
    expect(() => resolvePair(pair, peekJourney)).toThrow()
  })
})
