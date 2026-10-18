import type { EntityState, Journey, WorldState } from './types'
import { ENTITIES } from './entities'
import { describeState } from './textEquivalent'
import { clampIndex } from './route'

/** an entity takes part in the scene: it has a state that is neither the dimmed backdrop nor unavailable in this mode */
export const isLit = (state?: EntityState) => state !== undefined && state !== 'dimmed' && state !== 'na'

/** the custom-server ring is drawn solid while its entity takes part in the scene (J10), faint otherwise */
export const isRingOn = (entityStates: Record<string, EntityState>) => isLit(entityStates['custom-server'])

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
