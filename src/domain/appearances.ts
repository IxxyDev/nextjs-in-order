import type { Journey } from './types'

export interface Appearance { journey: Journey; step: number }

const byJourney = new WeakMap<Journey, Map<string, number[]>>()

/** entity id → the steps of one journey that list its state or put the token on it; built once per journey */
export function stepsByEntity(j: Journey): Map<string, number[]> {
  const cached = byJourney.get(j)
  if (cached) return cached
  const index = new Map<string, number[]>()
  const add = (id: string, i: number) => { const at = index.get(id) ?? []; if (at[at.length - 1] !== i) at.push(i); index.set(id, at) }
  j.steps.forEach((s, i) => {
    for (const id of Object.keys(s.states)) add(id, i)
    if (s.token) add(s.token.at, i)
  })
  byJourney.set(j, index)
  return index
}

/** where an entity appears across the given journeys, in journey then step order */
export function appearancesOf(journeys: Journey[], id: string): Appearance[] {
  return journeys.flatMap((journey) => (stepsByEntity(journey).get(id) ?? []).map((step) => ({ journey, step })))
}
