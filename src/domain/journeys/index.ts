import type { Journey } from '../types'
import { WHOLE_LIFECYCLE } from './whole-lifecycle'
import { createLazyCatalog } from '../lazyCatalog'
import { JOURNEY_META } from './meta'

export interface JourneyEntry { id: string; slug: string; title: string; load: () => Promise<Journey> }

export const JOURNEY_CATALOG: JourneyEntry[] = [
  { ...JOURNEY_META.wholeLifecycle, load: async () => WHOLE_LIFECYCLE },
  { ...JOURNEY_META.productionBuild, load: () => import('./production-build').then((m) => m.PRODUCTION_BUILD) },
  { ...JOURNEY_META.requestRouting, load: () => import('./request-routing').then((m) => m.REQUEST_ROUTING) },
  { ...JOURNEY_META.pagesInitial, load: () => import('./pages-initial').then((m) => m.PAGES_INITIAL) },
  { ...JOURNEY_META.pagesNavigation, load: () => import('./pages-navigation').then((m) => m.PAGES_NAVIGATION) },
  { ...JOURNEY_META.appInitial, load: () => import('./app-initial').then((m) => m.APP_INITIAL) },
  { ...JOURNEY_META.appNavigation, load: () => import('./app-navigation').then((m) => m.APP_NAVIGATION) },
  { ...JOURNEY_META.serverActions, load: () => import('./server-actions').then((m) => m.SERVER_ACTIONS) },
  { ...JOURNEY_META.caching, load: () => import('./caching').then((m) => m.CACHING) },
  { ...JOURNEY_META.devMode, load: () => import('./dev-mode').then((m) => m.DEV_MODE) },
  { ...JOURNEY_META.customServer, load: () => import('./custom-server').then((m) => m.CUSTOM_SERVER) },
  { ...JOURNEY_META.optimizations, load: () => import('./optimizations').then((m) => m.OPTIMIZATIONS) }
]

const catalog = createLazyCatalog(JOURNEY_CATALOG, [[WHOLE_LIFECYCLE.slug, WHOLE_LIFECYCLE]])

export function entryBySlug(slug: string): JourneyEntry | undefined {
  return JOURNEY_CATALOG.find((e) => e.slug === slug)
}

export const peekJourney = catalog.peek
export const loadJourney = catalog.load
export const loadAllJourneys = catalog.loadAll
