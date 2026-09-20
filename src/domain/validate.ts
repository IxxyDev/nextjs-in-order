// src/domain/validate.ts
import type { Journey } from './types'
import { ENTITIES } from './entities'
import { EDGES } from './edges'
import { REGIONS } from './regions'

const entityIds = new Set(ENTITIES.map((e) => e.id))
const edgeIds = new Set(EDGES.map((e) => e.id))
const regionIds = new Set(REGIONS.map((r) => r.id))

export function validateJourney(journey: Journey): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  journey.steps.forEach((step, i) => {
    const where = `${journey.slug} step ${i + 1} (${step.id})`
    if (seen.has(step.id)) errors.push(`${where}: duplicate step id`)
    seen.add(step.id)
    for (const id of Object.keys(step.states)) if (!entityIds.has(id)) errors.push(`${where}: unknown entity ${id}`)
    for (const id of step.edges) if (!edgeIds.has(id)) errors.push(`${where}: unknown edge ${id}`)
    if (step.token && !entityIds.has(step.token.at)) errors.push(`${where}: token at unknown entity ${step.token.at}`)
    if (step.camera.kind === 'region' && !regionIds.has(step.camera.id)) errors.push(`${where}: unknown region ${step.camera.id}`)
    if (step.camera.kind === 'entities') for (const id of step.camera.ids) if (!entityIds.has(id)) errors.push(`${where}: camera on unknown entity ${id}`)
    if (step.kind === 'predict' && !step.question) errors.push(`${where}: predict step without a question`)
    if (step.kind === 'check' && !(step.checks && step.checks.length)) errors.push(`${where}: check step without checks`)
    if (step.story.trim().length === 0) errors.push(`${where}: empty story`)
  })
  return errors
}
