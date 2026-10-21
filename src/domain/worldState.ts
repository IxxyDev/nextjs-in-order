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
  const partial: Omit<WorldState, 'text'> = {
    journeyId: journey.id,
    stepIndex: index,
    step,
    entityStates: sceneStates(step.states),
    activeEdges: new Set(step.edges),
    token: step.token,
    cameraTarget: step.camera
  }
  return { ...partial, text: describeState(partial, journey) }
}

/** every entity's state in a scene, the unlisted ones dimmed; none at all when the scene lists none */
export function sceneStates(states: Record<string, EntityState>): Record<string, EntityState> {
  if (Object.keys(states).length === 0) return {}
  return Object.fromEntries(ENTITIES.map((e) => [e.id, states[e.id] || 'dimmed']))
}
