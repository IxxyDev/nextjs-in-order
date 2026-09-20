// src/domain/worldState.test.ts
import { describe, it, expect } from 'vitest'
import { deriveWorldState, clampStep } from './worldState'
import { WHOLE_LIFECYCLE } from './journeys/whole-lifecycle'
import { ENTITIES } from './entities'

describe('deriveWorldState', () => {
  it('is deterministic', () => {
    const a = deriveWorldState(WHOLE_LIFECYCLE, 3)
    const b = deriveWorldState(WHOLE_LIFECYCLE, 3)
    expect(a).toEqual(b)
  })
  it('dims every unlisted entity when a step lists states', () => {
    const w = deriveWorldState(WHOLE_LIFECYCLE, 1)
    expect(w.entityStates['src-dashboard-nav']).toBe('current')
    expect(w.entityStates['db']).toBe('dimmed')
    expect(Object.keys(w.entityStates).length).toBe(ENTITIES.length)
  })
  it('leaves every entity neutral when a step lists nothing', () => {
    const w = deriveWorldState(WHOLE_LIFECYCLE, 0)
    expect(Object.keys(w.entityStates).length).toBe(0)
  })
  it('exposes the token and camera of the step', () => {
    const w = deriveWorldState(WHOLE_LIFECYCLE, 1)
    expect(w.token?.at).toBe('src-dashboard-nav')
    expect(w.cameraTarget).toEqual({ kind: 'region', id: 'source' })
  })
  it('clamps step indexes', () => {
    expect(clampStep(WHOLE_LIFECYCLE, -1)).toBe(0)
    expect(clampStep(WHOLE_LIFECYCLE, 99)).toBe(WHOLE_LIFECYCLE.steps.length - 1)
  })
})
