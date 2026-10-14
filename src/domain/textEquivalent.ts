import type { EntityState, Journey, WorldState } from './types'
import { shortNameById } from './entities'
import { edgeById } from './edges'

const ORDER: EntityState[] = ['current', 'active', 'new', 'replaced', 'kept', 'invalid', 'stale', 'fresh', 'na']
const LABEL: Record<EntityState, string> = {
  current: 'Current', active: 'Running', new: 'New', replaced: 'Replaced', kept: 'Kept', invalid: 'Invalidated',
  stale: 'Stale', fresh: 'Fresh', na: 'Not available here', dimmed: ''
}

export function describeState(world: Omit<WorldState, 'text'>, journey: Journey): string {
  return [`Step ${world.stepIndex + 1} of ${journey.steps.length}: ${world.step.title}.`, describeScene(world, world.step.story)].join(' ')
}

/** token, story, entity states and active flows of one scene, as sentences */
export function describeScene(world: Pick<WorldState, 'token' | 'entityStates' | 'activeEdges'>, story: string): string {
  const parts: string[] = []
  if (world.token) parts.push(`Following: ${world.token.label}, at ${shortNameById(world.token.at)}.`)
  parts.push(story)
  for (const state of ORDER) {
    const ids = Object.entries(world.entityStates).filter(([, s]) => s === state).map(([id]) => shortNameById(id))
    if (ids.length) parts.push(`${LABEL[state]}: ${ids.join(', ')}.`)
  }
  const edges = [...world.activeEdges].map((id) => {
    const e = edgeById(id)
    return `${shortNameById(e.from)} → ${shortNameById(e.to)}${e.label ? ` (${e.label})` : ''}${e.crossing ? ` [crosses the network: ${e.crossing}]` : ''}`
  })
  if (edges.length) parts.push(`Active flows: ${edges.join('; ')}.`)
  return parts.join(' ')
}
