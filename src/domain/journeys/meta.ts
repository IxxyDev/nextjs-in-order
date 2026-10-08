/**
 * id, slug and title of every journey, written once: the menu reads them before a journey's chunk loads,
 * and each journey file spreads its own
 */
export const JOURNEY_META = {
  wholeLifecycle: { id: 'j0', slug: 'whole-lifecycle', title: 'The whole lifecycle' },
  productionBuild: { id: 'j1', slug: 'production-build', title: 'Production build' },
  requestRouting: { id: 'j2', slug: 'request-routing', title: 'Incoming request and server routing' },
  pagesInitial: { id: 'j3', slug: 'pages-initial', title: 'Pages Router: the initial request' },
  pagesNavigation: { id: 'j4', slug: 'pages-navigation', title: 'Pages Router: navigation' },
  appInitial: { id: 'j5', slug: 'app-initial', title: 'App Router: the initial request' },
  appNavigation: { id: 'j6', slug: 'app-navigation', title: 'App Router: prefetch and navigation' },
  serverActions: { id: 'j7', slug: 'server-actions', title: 'Server Actions' },
  caching: { id: 'j8', slug: 'caching', title: 'Caching, ISR, Cache Components and PPR' },
  devMode: { id: 'j9', slug: 'dev-mode', title: 'Development mode' },
  customServer: { id: 'j10', slug: 'custom-server', title: 'Custom server' },
  optimizations: { id: 'j11', slug: 'optimizations', title: 'Built-in optimizations' }
}
