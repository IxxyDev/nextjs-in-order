import type { Band, CameraTarget, RegionId } from './types'
import { BAND_TITLES, WORLD, regionById, regionChain, shortTitleById } from './regions'
import { entityById, shortNameById } from './entities'

export interface Crumb { label: string; target: CameraTarget }

const prefix = (a: RegionId[], b: RegionId[]) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i) }

/** what a camera target is about: its band, the regions all of it sits in (outermost first) and its one entity, if it has one */
function focusOf(target: CameraTarget, entity?: string): { band?: Band; regions: RegionId[]; entity?: string } {
  const ids = entity ? [entity] : target.kind === 'entities' ? target.ids : []
  const chains = ids.length ? ids.map((id) => regionChain(entityById(id).region)) : target.kind === 'region' ? [regionChain(target.id)] : []
  const bands = new Set(chains.map((c) => regionById(c[0]).band))
  return {
    band: !chains.length && target.kind === 'band' ? target.id : bands.size === 1 ? [...bands][0] : undefined,
    regions: chains.length ? chains.reduce(prefix) : [],
    entity: ids.length === 1 ? ids[0] : undefined
  }
}

/** World › band › regions › entity for the camera's focus; the entity, when given, wins over the target */
export function breadcrumbFor({ target, entity }: { target: CameraTarget; entity?: string }): Crumb[] {
  const f = focusOf(target, entity)
  const e = f.entity ? entityById(f.entity) : undefined
  const crumbs: Crumb[] = [{ label: 'World', target: { kind: 'world' } }]
  if (f.band) crumbs.push({ label: BAND_TITLES[f.band], target: { kind: 'band', id: f.band } })
  for (const id of f.regions) crumbs.push({ label: shortTitleById(id), target: { kind: 'region', id } })
  const label = e && shortNameById(e.id)
  /** an entity that stands for its region (the RSC runtime in "RSC runtime") adds no crumb of its own */
  if (e && label !== crumbs[crumbs.length - 1].label) crumbs.push({ label: label!, target: { kind: 'entities', ids: [e.id] } })
  return crumbs
}

/** a region this share of the world's width or height or more (the build pipeline, the shelf, the strips, the dev column) frames like the whole system */
const WORLD_SPAN = 0.5

/** Region level (tablets): the innermost region the whole target sits in, unless it spans the world; else the target as it is */
export function regionLevel(target: CameraTarget): CameraTarget {
  const id = focusOf(target).regions.at(-1)
  const r = id && regionById(id)
  return r && r.w < WORLD.w * WORLD_SPAN && r.h < WORLD.h * WORLD_SPAN ? { kind: 'region', id: r.id } : target
}
