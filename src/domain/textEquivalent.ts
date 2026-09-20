// src/domain/textEquivalent.ts
import type { EntityState, Journey, WorldState } from './types'
import { entityById } from './entities'
import { edgeById } from './edges'

const ORDER: EntityState[] = ['current', 'active', 'new', 'replaced', 'kept', 'invalid', 'stale', 'fresh', 'na']
const LABEL: Record<EntityState, string> = {
  current: 'Current', active: 'Running', new: 'New', replaced: 'Replaced', kept: 'Kept', invalid: 'Invalidated',
  stale: 'Stale', fresh: 'Fresh', na: 'Not available here', dimmed: ''
}

function shortName(id: string): string {
  return entityById(id).name.split(' · ')[0]
}

export function describeState(world: Omit<WorldState, 'text'>, journey: Journey): string {
  const parts: string[] = []
  parts.push(`Step ${world.stepIndex + 1} of ${journey.steps.length}: ${world.step.title}.`)
  if (world.token) parts.push(`Following: ${world.token.label}, at ${shortName(world.token.at)}.`)
  parts.push(world.step.story)
  for (const state of ORDER) {
    const ids = Object.entries(world.entityStates).filter(([, s]) => s === state).map(([id]) => shortName(id))
    if (ids.length) parts.push(`${LABEL[state]}: ${ids.join(', ')}.`)
  }
  const edges = [...world.activeEdges].map((id) => {
    const e = edgeById(id)
    return `${shortName(e.from)} → ${shortName(e.to)}${e.label ? ` (${e.label})` : ''}${e.crossing ? ` [crosses the network: ${e.crossing}]` : ''}`
  })
  if (edges.length) parts.push(`Active flows: ${edges.join('; ')}.`)
  return parts.join(' ')
}
