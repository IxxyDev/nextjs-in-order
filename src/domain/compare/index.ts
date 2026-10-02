import type { ComparePair, Journey, ResolvedPair } from '../types'
import { loadJourney } from '../journeys'
import { createLazyCatalog } from '../lazyCatalog'

export interface CompareEntry { id: string; slug: string; title: string; load: () => Promise<ComparePair> }

export const COMPARE_CATALOG: CompareEntry[] = [
  { id: 'c1', slug: 'initial-load', title: 'Initial load: Pages vs App', load: () => import('./initial-load').then((m) => m.INITIAL_LOAD) },
  { id: 'c2', slug: 'client-navigation', title: 'Client navigation: Pages vs App', load: () => import('./client-navigation').then((m) => m.CLIENT_NAVIGATION) },
  { id: 'c3', slug: 'runtimes', title: 'RSC runtime vs SSR runtime', load: () => import('./runtimes').then((m) => m.RUNTIMES) },
  { id: 'c4', slug: 'responses', title: 'Initial response vs navigation response', load: () => import('./responses').then((m) => m.RESPONSES) },
  { id: 'c5', slug: 'hydration', title: 'Hydration: full tree vs islands', load: () => import('./hydration').then((m) => m.HYDRATION) },
  { id: 'c6', slug: 'bundlers', title: 'Bundlers: Webpack vs Turbopack', load: () => import('./bundlers').then((m) => m.BUNDLERS) },
  { id: 'c7', slug: 'prod-vs-dev', title: 'next start vs next dev', load: () => import('./prod-vs-dev').then((m) => m.PROD_VS_DEV) },
  { id: 'c8', slug: 'rendering-strategies', title: 'Static, ISR and PPR', load: () => import('./rendering-strategies').then((m) => m.RENDERING_STRATEGIES) },
  { id: 'c9', slug: 'caches', title: 'Server cache vs browser Segment Cache', load: () => import('./caches').then((m) => m.CACHES) }
]

export function compareBySlug(slug: string): CompareEntry | undefined {
  return COMPARE_CATALOG.find((e) => e.slug === slug)
}

function referencedJourneys(pair: ComparePair): string[] {
  return [...new Set(pair.steps.flatMap((s) => s.lanes.flatMap((l) => 'ref' in l ? [l.ref.journey] : [])))]
}

/** replaces every reused journey step by its scene; refs are checked by validateCompare */
export function resolvePair(pair: ComparePair, journey: (slug: string) => Journey | undefined): ResolvedPair {
  return {
    ...pair,
    steps: pair.steps.map((s) => ({
      ...s,
      lanes: s.lanes.map((lane) => {
        if (!('ref' in lane)) return lane
        const j = journey(lane.ref.journey)
        const step = j?.steps[lane.ref.step - 1]
        if (!j || !step) throw new Error(`${pair.slug} ${s.id}: unresolved ${lane.ref.journey} step ${lane.ref.step}`)
        return {
          camera: step.camera, token: step.token, states: step.states, edges: step.edges,
          story: lane.story ?? step.story, rows: lane.rows,
          source: { slug: j.slug, step: lane.ref.step, label: `J${j.id.slice(1)} step ${lane.ref.step} · ${step.title}` }
        }
      })
    }))
  }
}

/** a pair resolves once the journeys it reuses have loaded */
async function loadResolved(e: CompareEntry): Promise<ResolvedPair> {
  const pair = await e.load()
  const journeys = new Map<string, Journey>()
  for (const s of referencedJourneys(pair)) {
    const j = await loadJourney(s)
    if (j) journeys.set(s, j)
  }
  return resolvePair(pair, (s) => journeys.get(s))
}

const catalog = createLazyCatalog(COMPARE_CATALOG.map((e) => ({ slug: e.slug, load: () => loadResolved(e) })))

export const peekCompare = catalog.peek
export const loadCompare = catalog.load
