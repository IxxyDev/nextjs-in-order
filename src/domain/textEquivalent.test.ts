import { describe, it, expect } from 'vitest'
import { describeScene, describeState } from './textEquivalent'
import { WHOLE_LIFECYCLE } from './journeys/whole-lifecycle'

describe('describeState', () => {
  it('names the step, the token, kept and new entities and active edges, by the short names the canvas uses', () => {
    const step = WHOLE_LIFECYCLE.steps[3]
    const text = describeState({
      journeyId: 'j0', stepIndex: 3, step, token: step.token, cameraTarget: step.camera,
      entityStates: { bundler: 'active', 'browser-chunks': 'new', swc: 'kept' }, activeEdges: new Set(['e-swc-bundler'])
    }, WHOLE_LIFECYCLE)
    expect(text).toContain('Step 4 of 10')
    expect(text).toContain('The bundler sees the graph')
    expect(text).toContain('Following: app/dashboard/layout-3c4d.js')
    expect(text).toContain('New: browser chunks.')
    expect(text).toContain('Kept: SWC.')
    expect(text).toContain('SWC → Bundler')
  })
})

describe('describeScene', () => {
  it('names the states by the chip words of the visual language', () => {
    const scene = { entityStates: { 'segment-cache': 'current', 'src-dashboard-nav': 'invalid', 'src-billing-page': 'na' }, activeEdges: new Set<string>() } as const

    const text = describeScene(scene, 'The dynamic part of billing is not prefetched.')

    expect(text).toBe('The dynamic part of billing is not prefetched. Now: Segment cache. Invalid: DashboardNav.tsx. n/a: billing/page.tsx.')
  })
})
