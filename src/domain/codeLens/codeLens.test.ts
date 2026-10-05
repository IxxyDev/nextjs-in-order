import { describe, it, expect } from 'vitest'
import { FATES, SPECIMEN } from './specimen'
import { STEPS } from './whole-lifecycle'
import { hasLens, loadLens, peekLens } from './index'
import { JOURNEY_CATALOG } from '../journeys'

const lines = SPECIMEN.flatMap((f) => f.lines)
const count = (pick: (l: (typeof lines)[number]) => unknown) => {
  const out: Record<string, number> = {}
  for (const l of lines) { const k = pick(l); if (k) out[String(k)] = (out[String(k)] ?? 0) + 1 }
  return out
}

describe('specimen', () => {
  it('matches the count in docs/code-lens.md §4', () => {
    expect(SPECIMEN).toHaveLength(31)
    expect(SPECIMEN.filter((f) => f.variant)).toHaveLength(12)
    expect(lines).toHaveLength(213)
    expect(lines.filter((l) => l.frame)).toHaveLength(60)
    expect(count((l) => l.fate)).toEqual({ 'server-only': 95, 'client-boundary': 7, split: 45, 'action-id': 6 })
    expect(count((l) => l.mark)).toEqual({ 'static-shell': 13, suspended: 14, cached: 7, 'shared-layout': 9 })
  })
  it('tags every line outside the J0 files with the journeys that show it', () => {
    const j0 = new Set(SPECIMEN.slice(0, 10).flatMap((f) => f.lines.map((l) => l.id)))
    for (const l of lines) if (!j0.has(l.id) && !l.frame) expect(l.journeys?.length, l.id).toBeGreaterThan(0)
  })
  it('defines each fate once, four per channel', () => {
    expect(new Set(FATES.map((f) => f.id)).size).toBe(FATES.length)
    expect(FATES.filter((f) => f.channel === 'hue')).toHaveLength(4)
    expect(FATES.filter((f) => f.channel === 'mark')).toHaveLength(4)
  })
})

describe('J0 lens', () => {
  it('opens exactly where the artifact form changes (rule 7)', () => {
    expect(STEPS.filter((s) => s.mode === 'open').map((s) => s.step)).toEqual(['j0-3', 'j0-4', 'j0-7', 'j0-8', 'j0-9', 'j0-10'])
    expect(STEPS.filter((s) => s.split).map((s) => s.step)).toEqual(['j0-4'])
  })
  it('loads lazily by journey slug', async () => {
    expect(peekLens('whole-lifecycle')).toBeUndefined()
    const b = await loadLens('whole-lifecycle')
    expect(b?.lens).toEqual({ journey: 'j0', steps: STEPS })
    expect(b?.lens.steps).toBe(STEPS)
    expect(b?.specimen).toBe(SPECIMEN)
    expect(peekLens('whole-lifecycle')).toBe(b)
    expect(await loadLens('nope')).toBeUndefined()
  })
})

describe('lens registry', () => {
  it('registers every journey by slug, each loading its own steps under its journey id', async () => {
    for (const j of JOURNEY_CATALOG) {
      expect(hasLens(j.slug), j.slug).toBe(true)
      const b = await loadLens(j.slug)
      expect(b?.lens.journey, j.slug).toBe(j.id)
      expect(b?.lens.steps.every((s) => s.step.startsWith(`${j.id}-`)), j.slug).toBe(true)
      expect(b?.specimen).toBe(SPECIMEN)
      /** JourneyView widens the panel from hasLens alone, before the chunk loads: every lens must open somewhere */
      expect(b?.lens.steps.some((s) => s.mode === 'open'), j.slug).toBe(true)
    }
    expect(hasLens('nope')).toBe(false)
  })
})
