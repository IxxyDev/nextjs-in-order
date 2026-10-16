import type { Entity, Env, Phase, Reaches, RegionId } from './types'
import { regionChain } from './regions'

export interface AtlasFilter { phase?: Phase; env?: Env; region?: RegionId; reaches?: Reaches }

/** each list is written as a Record so the compiler flags a value the filter would miss */
export const PHASES = keysOf<Phase>({ build: true, startup: true, request: true, browser: true, dev: true })
export const ENVS = keysOf<Env>({ rust: true, node: true, 'node-worker': true, edge: true, browser: true, 'browser-worker': true, storage: true, network: true })
export const REACHES = keysOf<Reaches>({ code: true, data: true, 'data+refs': true, no: true })

export const isFiltering = (f: AtlasFilter) => Object.values(f).some(Boolean)

/** every field that is set must hold (AND); a region also takes in the regions drawn inside it */
export function matchesFilter(e: Entity, f: AtlasFilter): boolean {
  return (!f.phase || e.phase.includes(f.phase)) && (!f.env || e.env.includes(f.env))
    && (!f.region || regionChain(e.region).includes(f.region)) && (!f.reaches || e.reaches === f.reaches)
}

function keysOf<T extends string>(all: Record<T, true>): T[] {
  return Object.keys(all) as T[]
}
