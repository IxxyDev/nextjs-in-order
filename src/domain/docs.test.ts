import { describe, it, expect } from 'vitest'
import MATRIX from '../../docs/coverage-matrix.md?raw'
import { loadAllJourneys } from './journeys'
import { COMPARE_CATALOG } from './compare'

describe('coverage-matrix.md', () => {
  it('names only journey steps and compare pairs that exist', async () => {
    const stepCounts = new Map((await loadAllJourneys()).map((j) => [j.id, j.steps.length]))
    const pairStepCounts = new Map(await Promise.all(COMPARE_CATALOG.map(async (e) => [e.id, (await e.load()).steps.length] as const)))

    expect(unresolvedRefs(MATRIX, stepCounts, pairStepCounts)).toEqual([])
  })

  /** `J5 step 3`, `J6 steps 1, 3–4`, `j0-10`, `C4`, `c4-3`: every journey or pair and every step it names */
  function unresolvedRefs(text: string, stepCounts: Map<string, number>, pairStepCounts: Map<string, number>): string[] {
    const refs = [
      ...[...text.matchAll(/\bJ(\d+) steps? (\d+(?:\s*[–,]\s*\d+)*)/g)].flatMap(([ref, n, steps]) => stepNumbers(steps).map((s) => ({ ref, id: `j${n}`, step: s, counts: stepCounts }))),
      ...[...text.matchAll(/\bJ(\d+)\b/g)].map(([ref, n]) => ({ ref, id: `j${n}`, step: 1, counts: stepCounts })),
      ...[...text.matchAll(/\b([jc]\d+)-(\d+)\b/g)].map(([ref, id, s]) => ({ ref, id, step: Number(s), counts: id.startsWith('j') ? stepCounts : pairStepCounts })),
      ...[...text.matchAll(/\bC(\d+)\b/g)].map(([ref, n]) => ({ ref, id: `c${n}`, step: 1, counts: pairStepCounts }))
    ]
    return refs.filter((r) => !(r.step <= (r.counts.get(r.id) ?? 0))).map((r) => r.ref)
  }

  /** `1, 3–4` → [1, 3, 4] */
  function stepNumbers(list: string): number[] {
    return list.split(',').flatMap((part) => {
      const [from, to = from] = part.split('–').map(Number)
      return Array.from({ length: to - from + 1 }, (_, i) => from + i)
    })
  }
})
