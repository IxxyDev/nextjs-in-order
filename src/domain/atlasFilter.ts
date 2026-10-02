import type { Entity, Env, Phase, Reaches, RegionId } from './types'
import { regionChain } from './regions'

export interface AtlasFilter { phase?: Phase; env?: Env; region?: RegionId; reaches?: Reaches }

export const PHASES: Phase[] = ['build', 'startup', 'request', 'browser', 'dev']
export const REACHES: Reaches[] = ['code', 'data', 'data+refs', 'no']
const ENV_SET: Record<Env, true> = { rust: true, node: true, 'node-worker': true, edge: true, browser: true, 'browser-worker': true, storage: true, network: true }
export const ENVS = Object.keys(ENV_SET) as Env[]

export const isFiltering = (f: AtlasFilter) => Object.values(f).some(Boolean)

/** every field that is set must hold (AND); a region also takes in the regions drawn inside it */
export function matchesFilter(e: Entity, f: AtlasFilter): boolean {
  return (!f.phase || e.phase.includes(f.phase)) && (!f.env || e.env.includes(f.env))
    && (!f.region || regionChain(e.region).includes(f.region)) && (!f.reaches || e.reaches === f.reaches)
}
