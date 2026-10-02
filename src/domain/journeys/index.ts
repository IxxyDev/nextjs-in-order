import type { Journey } from '../types'
import { WHOLE_LIFECYCLE } from './whole-lifecycle'
import { createLazyCatalog } from '../lazyCatalog'

export interface JourneyEntry { id: string; slug: string; title: string; load: () => Promise<Journey> }

export const JOURNEY_CATALOG: JourneyEntry[] = [
  { id: 'j0', slug: 'whole-lifecycle', title: 'The whole lifecycle', load: async () => WHOLE_LIFECYCLE },
  { id: 'j1', slug: 'production-build', title: 'Production build', load: () => import('./production-build').then((m) => m.PRODUCTION_BUILD) },
  { id: 'j2', slug: 'request-routing', title: 'Incoming request and server routing', load: () => import('./request-routing').then((m) => m.REQUEST_ROUTING) },
  { id: 'j3', slug: 'pages-initial', title: 'Pages Router: the initial request', load: () => import('./pages-initial').then((m) => m.PAGES_INITIAL) },
  { id: 'j4', slug: 'pages-navigation', title: 'Pages Router: navigation', load: () => import('./pages-navigation').then((m) => m.PAGES_NAVIGATION) },
  { id: 'j5', slug: 'app-initial', title: 'App Router: the initial request', load: () => import('./app-initial').then((m) => m.APP_INITIAL) },
  { id: 'j6', slug: 'app-navigation', title: 'App Router: prefetch and navigation', load: () => import('./app-navigation').then((m) => m.APP_NAVIGATION) },
  { id: 'j7', slug: 'server-actions', title: 'Server Actions', load: () => import('./server-actions').then((m) => m.SERVER_ACTIONS) },
  { id: 'j8', slug: 'caching', title: 'Caching, ISR, Cache Components and PPR', load: () => import('./caching').then((m) => m.CACHING) },
  { id: 'j9', slug: 'dev-mode', title: 'Development mode', load: () => import('./dev-mode').then((m) => m.DEV_MODE) }
]

const catalog = createLazyCatalog(JOURNEY_CATALOG, [[WHOLE_LIFECYCLE.slug, WHOLE_LIFECYCLE]])

export function entryBySlug(slug: string): JourneyEntry | undefined {
  return JOURNEY_CATALOG.find((e) => e.slug === slug)
}

export const peekJourney = catalog.peek
export const loadJourney = catalog.load
export const loadAllJourneys = catalog.loadAll
