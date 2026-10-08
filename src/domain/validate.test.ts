// src/domain/validate.test.ts
import { describe, it, expect } from 'vitest'
import { validateCodeLens, validateEntities, validateJourney, validateSpecimen } from './validate'
import { ENTITIES, entityById } from './entities'
import { loadAllJourneys } from './journeys'
import { WHOLE_LIFECYCLE } from './journeys/whole-lifecycle'
import { STEPS } from './codeLens/whole-lifecycle'
import { FATES, SPECIMEN } from './codeLens/specimen'
import { loadLens } from './codeLens'
import type { CodeLens, FateId, HueFate, LensStep, MarkFate } from './types'

const WHOLE_LIFECYCLE_LENS: CodeLens = { journey: 'j0', steps: STEPS }

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

describe('validateSpecimen', () => {
  it('accepts the specimen', () => {
    expect(validateSpecimen(SPECIMEN, FATES)).toEqual([])
  })
  it('reports duplicate ids, missing and undefined fates, unknown journeys and unknown entities', () => {
    const specimen = [{ ...SPECIMEN[0], entity: 'missing', lines: [...SPECIMEN[0].lines, { id: 'RL1', text: 'dup' }, { id: 'RL9', text: 'x', mark: 'ghost' as MarkFate, journeys: ['j12'] }] }]

    expect(validateSpecimen([...specimen, ...SPECIMEN.slice(1)], FATES)).toEqual([
      'specimen RL1: duplicate line id',
      'specimen RL1: no fate on a non-frame line',
      'specimen RL9: no fate on a non-frame line',
      'specimen RL9: undefined fate ghost',
      'specimen RL9: j12 is not a journey after J0',
      'specimen app/layout.tsx: unknown entity missing'
    ])
  })
  it('reports j0 in a line\'s journeys, which lists only the journeys after J0', () => {
    const specimen = [{ ...SPECIMEN[0], lines: [...SPECIMEN[0].lines, { id: 'RL9', text: '<html lang="en">', fate: 'server-only' as HueFate, journeys: ['j0'] }] }]

    expect(validateSpecimen([...specimen, ...SPECIMEN.slice(1)], FATES)).toEqual(['specimen RL9: j0 is not a journey after J0'])
  })
})

describe('validateCodeLens', () => {
  const at = (id: string) => WHOLE_LIFECYCLE_LENS.steps.find((s) => s.step === id)!

  it('accepts the J0 lens', () => {
    expect(validateCodeLens(WHOLE_LIFECYCLE_LENS, WHOLE_LIFECYCLE, SPECIMEN, FATES)).toEqual([])
  })
  it('accepts every journey\'s lens', async () => {
    for (const j of await loadAllJourneys()) {
      const b = await loadLens(j.slug)
      expect(b, j.slug).toBeDefined()
      expect(validateCodeLens(b!.lens, j, b!.specimen, b!.fates), j.slug).toEqual([])
    }
  })
  it('keeps a predict step off and a check step off unless its form changes', () => {
    const journey = { ...WHOLE_LIFECYCLE, steps: [{ ...WHOLE_LIFECYCLE.steps[1], kind: 'predict' as const }, WHOLE_LIFECYCLE.steps[9]] }
    const lens: CodeLens = { journey: 'j0', steps: [at('j0-2'), { ...at('j0-10'), mode: 'peek', summary: ['patch'] }] }

    expect(validateCodeLens(lens, journey, SPECIMEN, FATES)).toEqual([
      'lens j0-2: predict step with a lens',
      'lens j0-10: check step peeks, off unless its form changes'
    ])
  })
  it('reports every broken rule with its own message', () => {
    const ghost = 'ghost' as FateId
    const pane = at('j0-7').panes[0]
    const steps: LensStep[] = [
      { ...at('j0-1'), links: [{ fate: 'server-only', entities: ['html'] }] },
      { ...at('j0-2'), summary: undefined },
      { ...at('j0-3'), form: undefined, mode: 'peek', summary: ['s'] },
      { ...at('j0-4'), panes: [at('j0-4').panes[1], at('j0-4').panes[0]] },
      { ...at('j0-5'), panes: [{ ...at('j0-4').panes[0], entity: 'nowhere' }], links: [{ fate: ghost, entities: ['nope'] }] },
      { ...at('j0-7'), panes: [{ ...pane, rows: [...pane.rows, { text: 'x', from: ['ZZ9'], fate: ghost as HueFate }, { text: 'y' }] }], links: [{ fate: 'server-only', entities: ['dom'], from: ['ZZ8'] }] },
      { ...at('j0-8'), form: 'flight' },
      { ...at('j0-9'), panes: [{ ...at('j0-9').panes[0], rows: [{ fold: 5, label: 'all' }] }] },
      { ...at('j0-9') },
      { step: 'j0-99', mode: 'off', panes: [], links: [], motion: [] }
    ]
    const lens: CodeLens = { journey: 'j0', steps }
    const errors = validateCodeLens(lens, WHOLE_LIFECYCLE, SPECIMEN, FATES)
    expect(errors).toEqual([
      'lens j0-1: off but has panes or links',
      'lens j0-2: peek without a summary',
      'lens j0-3: peek without a form',
      'lens j0-4: split needs a server pane then a browser pane',
      'lens j0-5 pane 1: server side on a step that is not split',
      'lens j0-5 pane 1: unknown entity nowhere',
      'lens j0-5: undefined fate ghost',
      'lens j0-5: unknown entity nope',
      'lens j0-7 pane 1: unknown specimen line ZZ9',
      'lens j0-7 pane 1: undefined fate ghost',
      'lens j0-7 pane 1: 9 lines shown, at most 8',
      'lens j0-7: unknown specimen line ZZ8',
      'lens j0-7: server-only link from ZZ8 matches no row',
      "lens j0-7: server-only links dom, which is not in the step's states or camera",
      'lens j0-8: open but the form did not change',
      'lens j0-9: open with no lines',
      'lens j0-9: duplicate step',
      'lens j0-9: open but the form did not change',
      'lens j0-99: no such step in whole-lifecycle',
      'lens j0-6: missing',
      'lens j0-10: missing'
    ])
  })
})
