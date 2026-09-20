// src/domain/textEquivalent.test.ts
import { describe, it, expect } from 'vitest'
import { describeState } from './textEquivalent'
import { WHOLE_LIFECYCLE } from './journeys/whole-lifecycle'

describe('describeState', () => {
  it('names the step, the token, kept and new entities and active edges', () => {
    const step = WHOLE_LIFECYCLE.steps[3]
    const text = describeState({
      journeyId: 'j0', stepIndex: 3, step, token: step.token, cameraTarget: step.camera,
      entityStates: { bundler: 'active', 'browser-chunks': 'new', swc: 'kept' }, activeEdges: new Set(['e-swc-bundler'])
    }, WHOLE_LIFECYCLE)
    expect(text).toContain('Step 4 of 10')
    expect(text).toContain('The bundler sees the graph')
    expect(text).toContain('Following: app/dashboard/layout-3c4d.js')
    expect(text).toContain('New: browser chunks')
    expect(text).toContain('Kept: SWC compiler')
    expect(text).toContain('SWC compiler → Bundler')
  })
})
