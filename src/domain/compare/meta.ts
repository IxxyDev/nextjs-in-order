/**
 * id, slug and title of every compare pair, written once: the menu reads them before a pair's chunk loads,
 * and each pair file spreads its own
 */
export const COMPARE_META = {
  initialLoad: { id: 'c1', slug: 'initial-load', title: 'Initial load: Pages vs App' },
  clientNavigation: { id: 'c2', slug: 'client-navigation', title: 'Client navigation: Pages vs App' },
  runtimes: { id: 'c3', slug: 'runtimes', title: 'RSC runtime vs SSR runtime' },
  responses: { id: 'c4', slug: 'responses', title: 'Initial response vs navigation response' },
  hydration: { id: 'c5', slug: 'hydration', title: 'Hydration: full tree vs islands' },
  bundlers: { id: 'c6', slug: 'bundlers', title: 'Bundlers: Webpack vs Turbopack' },
  prodVsDev: { id: 'c7', slug: 'prod-vs-dev', title: 'next start vs next dev' },
  renderingStrategies: { id: 'c8', slug: 'rendering-strategies', title: 'Static, ISR and PPR' },
  caches: { id: 'c9', slug: 'caches', title: 'Server cache vs browser Segment Cache' }
}
