import type { EntityState, Journey, WorldState } from './types'
import { ENTITIES } from './entities'
import { describeState } from './textEquivalent'
import { clampIndex } from './route'

export function deriveWorldState(journey: Journey, stepIndex: number): WorldState {
  const index = clampIndex(stepIndex, journey.steps.length)
  const step = journey.steps[index]
  const listed = Object.keys(step.states)
  const entityStates: Record<string, EntityState> = {}
  if (listed.length > 0) {
    for (const e of ENTITIES) entityStates[e.id] = step.states[e.id] ?? 'dimmed'
  }
  const partial: Omit<WorldState, 'text'> = {
    journeyId: journey.id,
    stepIndex: index,
    step,
    entityStates,
    activeEdges: new Set(step.edges),
    token: step.token,
    cameraTarget: step.camera
  }
  return { ...partial, text: describeState(partial, journey) }
}
