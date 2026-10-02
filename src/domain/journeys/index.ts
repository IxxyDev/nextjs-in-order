import type { Journey } from '../types'
import { WHOLE_LIFECYCLE } from './whole-lifecycle'
import { createLazyCatalog } from '../lazyCatalog'

export interface JourneyEntry { id: string; slug: string; title: string; load: () => Promise<Journey> }

export const JOURNEY_CATALOG: JourneyEntry[] = [
  { id: 'j0', slug: 'whole-lifecycle', title: 'The whole lifecycle', load: async () => WHOLE_LIFECYCLE },
  { id: 'j5', slug: 'app-initial', title: 'App Router: the initial request', load: () => import('./app-initial').then((m) => m.APP_INITIAL) },
  { id: 'j6', slug: 'app-navigation', title: 'App Router: prefetch and navigation', load: () => import('./app-navigation').then((m) => m.APP_NAVIGATION) },
  { id: 'j7', slug: 'server-actions', title: 'Server Actions', load: () => import('./server-actions').then((m) => m.SERVER_ACTIONS) }
]

const catalog = createLazyCatalog(JOURNEY_CATALOG, [[WHOLE_LIFECYCLE.slug, WHOLE_LIFECYCLE]])

export function entryBySlug(slug: string): JourneyEntry | undefined {
  return JOURNEY_CATALOG.find((e) => e.slug === slug)
}

export const peekJourney = catalog.peek
export const loadJourney = catalog.load
export const loadAllJourneys = catalog.loadAll
