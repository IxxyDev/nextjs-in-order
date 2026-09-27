import type { Journey } from '../types'

export const APP_NAVIGATION: Journey = {
  id: 'j6',
  slug: 'app-navigation',
  title: 'App Router: prefetch and navigation',
  following: '<Link href="/dashboard/billing"> as a prefetch task, then the billing segment, then a Flight patch',
  whatShouldClick: 'The client and server compare route trees and only the divergent subtree is rendered and sent. Everything above it keeps its state.',
  steps: [
    {
      id: 'j6-1', kind: 'move', title: 'A link becomes a task',
      story: 'DashboardNav renders <Link href="/dashboard/billing">. When it scrolls into the viewport the prefetch scheduler creates a task for that URL: prioritized (hover beats viewport), deduplicated (ten links to one URL are one task) and cancellable (mouse leaves, task is dropped). The default prefetch prop does this; prefetch={false} disables prefetching entirely, so the segment is fetched on click.',
      camera: { kind: 'entities', ids: ['client-components', 'prefetch-scheduler'] },
      token: { at: 'prefetch-scheduler', glyph: 'request', label: 'prefetch task · /dashboard/billing' },
      states: { 'client-components': 'active', 'prefetch-scheduler': 'current' }, edges: ['e-client-scheduler'],
      internals: ['segment-cache/scheduler.ts: PrefetchPriority Intent > Default > Background', 'IntersectionObserver on <Link>; hover / touchstart raise priority', 'prefetch={null|true|false} on Link']
    },
    {
      id: 'j6-2', kind: 'explain', title: 'Two drawers in the client cache',
      story: 'The client keeps two caches. The Route Cache stores route trees per URL: the shape of /dashboard/billing without content. The Segment Cache stores content per segment: the root layout once, the dashboard layout once, each page once. Shared layouts are stored a single time, no matter how many routes use them.',
      camera: { kind: 'entities', ids: ['route-cache', 'segment-cache', 'app-router'] },
      states: { 'route-cache': 'active', 'segment-cache': 'active', 'app-router': 'kept' }, edges: []
    },
    {
      id: 'j6-3', kind: 'move', title: 'Tree prefetch',
      story: 'The task first asks for structure only: GET /dashboard/billing with RSC: 1, Next-Router-Prefetch: 1 and Next-Router-Segment-Prefetch: /_tree. The server answers with the route tree for that URL and nothing else. It lands in the Route Cache.',
      camera: { kind: 'entities', ids: ['prefetch-scheduler', 'routing-ladder', 'route-cache'] },
      token: { at: 'routing-ladder', glyph: 'request', label: 'GET /dashboard/billing · /_tree' },
      states: { 'prefetch-scheduler': 'active', 'routing-ladder': 'current', 'route-cache': 'new' }, edges: ['e-scheduler-ladder', 'e-scheduler-route-cache'],
      internals: ['RSC: 1', 'Next-Router-Prefetch: 1', 'Next-Router-Segment-Prefetch: /_tree', 'response: FlightRouterState for the target, no segment content']
    },
    {
      id: 'j6-4', kind: 'move', title: 'Only the missing segments',
      story: 'With the tree in hand the scheduler compares it with the Segment Cache. The root layout and the dashboard layout are already there from the current page, so they are marked kept. Only billing is missing: one request per missing segment, each with Next-Router-Segment-Prefetch set to that segment path. Billing is a dynamic page (InvoiceList reads cookies), so what arrives is its static shell up to the Suspense boundary; the hole stays empty until the click. Small, parallel, HTTP/2-friendly.',
      camera: { kind: 'entities', ids: ['prefetch-scheduler', 'segment-cache', 'flight'] },
      token: { at: 'segment-cache', glyph: 'segment', label: 'billing shell · fetched; "" and dashboard · kept' },
      states: { 'prefetch-scheduler': 'active', 'segment-cache': 'current', flight: 'active', 'src-root-layout': 'kept', 'src-dashboard-layout': 'kept', 'src-billing-page': 'new' },
      edges: ['e-scheduler-ladder', 'e-flight-segment-cache'],
      internals: ['Next-Router-Segment-Prefetch: /dashboard/billing', 'article-era model: one request up to the first loading.tsx; now: tree first, then per-segment']
    },
    {
      id: 'j6-5', kind: 'explain', title: 'What the server is willing to prefetch',
      story: 'The articles describe a rule: without cacheComponents only static routes get per-segment prefetch; the dynamic part of billing is hatched n/a and is fetched on click, which is why step 6 still goes to the server. Next.js 16.3 refines it: with partialPrefetching the default prefetch is one reusable App Shell per route, and prefetch={true} additionally pulls URL-dependent cached content. The mechanism did not change; the granularity did.',
      camera: { kind: 'entities', ids: ['segment-cache', 'src-billing-page', 'prefetch-scheduler'] },
      states: { 'segment-cache': 'active', 'src-billing-page': 'na', 'prefetch-scheduler': 'kept' }, edges: [],
      internals: ['article: cacheComponents: true enables per-segment prefetch for dynamic routes', '16.3: experimental.partialPrefetching → App Shell prefetch by default', 'prefetch={true}: shell + cached dynamic content'],
      sources: [{ label: 'Link prefetching', url: 'https://nextjs.org/docs/app/api-reference/components/link#prefetch' }]
    },
    {
      id: 'j6-6', kind: 'move', title: 'Click',
      story: 'The user clicks. The router sends a navigation request: GET /dashboard/billing with RSC: 1, Next-Router-State-Tree carrying the client copy of the route tree, Next-Url, and ?_rsc= in the query. The query parameter exists so that a CDN never confuses this response with the HTML document at the same URL.',
      camera: { kind: 'entities', ids: ['app-router', 'router-state-tree', 'routing-ladder'] },
      token: { at: 'app-router', glyph: 'request', label: 'GET /dashboard/billing?_rsc=1a2b3 · RSC: 1' },
      states: { 'app-router': 'current', 'router-state-tree': 'active', 'routing-ladder': 'active', 'route-cache': 'kept' }, edges: ['e-router-ladder', 'e-tree-loader', 'e-route-cache-router'],
      internals: ['RSC: 1', 'Next-Router-State-Tree: URL-encoded JSON of FlightRouterState', 'Next-Url: /dashboard/settings', '?_rsc=<hash of the headers> as the CDN cache key']
    },
    {
      id: 'j6-7', kind: 'predict', title: 'Two trees on the server',
      story: 'The server now holds its own loader tree for /dashboard/billing and the client tree that arrived in the header. The current page is /dashboard/settings.',
      camera: { kind: 'entities', ids: ['loader-tree', 'router-state-tree', 'rsc-runtime-entity'] },
      token: { at: 'loader-tree', glyph: 'segment', label: 'client tree vs loader tree' },
      states: { 'loader-tree': 'current', 'router-state-tree': 'active', 'rsc-runtime-entity': 'kept' }, edges: ['e-tree-loader'],
      question: {
        text: 'Which layouts execute again, which payload crosses the network, and which client state survives?',
        options: [
          'All three layouts execute; a full HTML page crosses; client state is reset',
          'Only BillingPage executes; one segment slice of Flight crosses; DashboardNav keeps its state',
          'DashboardLayout and BillingPage execute; Flight for the dashboard subtree crosses; DashboardNav is remounted',
          'Nothing executes; the Segment Cache already had the page'
        ],
        answer: 1,
        why: 'The trees share the prefix "" → dashboard. Rendering starts at the first divergent node, billing. Only that slice crosses, as Flight, and the LayoutRouter above it never unmounts its children.'
      }
    },
    {
      id: 'j6-8', kind: 'reveal', title: 'The shared prefix is locked',
      story: 'The server walks both trees in parallel. "" matches, dashboard matches, then settings ≠ billing. The matching prefix is locked: nothing in it renders. Rendering begins at the first divergent node, unless a segment carries an explicit refetch mark. Structure was kept separate from content precisely so this comparison is cheap.',
      camera: { kind: 'entities', ids: ['loader-tree', 'router-state-tree', 'src-root-layout', 'src-dashboard-layout'] },
      token: { at: 'loader-tree', glyph: 'segment', label: 'shared: "" → dashboard · diverges at: billing' },
      states: { 'loader-tree': 'current', 'router-state-tree': 'active', 'src-root-layout': 'kept', 'src-dashboard-layout': 'kept', 'src-settings-page': 'replaced', 'src-billing-page': 'new' }, edges: ['e-tree-loader'],
      internals: ['walkTreeWithFlightRouterState in app-render', 'per-segment marks in FlightRouterState: refetch, refresh, head-only']
    },
    {
      id: 'j6-9', kind: 'transform', title: 'Only BillingPage runs',
      story: 'The RSC runtime executes BillingPage and its Server Components. RootLayout and DashboardLayout are not called: their output already exists in the browser, and re-running them would only produce rows the client would throw away.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'src-billing-page', 'db'] },
      token: { at: 'rsc-runtime-entity', glyph: 'component-server', label: 'BillingPage (executing)' },
      states: { 'rsc-runtime-entity': 'current', 'src-billing-page': 'active', db: 'active', 'src-root-layout': 'kept', 'src-dashboard-layout': 'kept' }, edges: ['e-loader-rsc', 'e-db-rsc']
    },
    {
      id: 'j6-10', kind: 'move', title: 'A patch, not a page',
      story: 'The response is text/x-component: a Flight patch with one segment slice for billing and the tree patch that says where it goes. There is no HTML, no <html>, no scripts. If BillingPage has a Suspense boundary the slice streams in parts, like the initial request did.',
      camera: { kind: 'entities', ids: ['flight', 'segment-slices', 'app-router'] },
      token: { at: 'flight', glyph: 'flight', label: 'Flight patch · [billing, tree patch, content, head]' },
      states: { flight: 'current', 'segment-slices': 'new', 'app-router': 'active', html: 'na', 'ssr-runtime-entity': 'na' }, edges: ['e-rsc-flight', 'e-flight-slices', 'e-flight-router-patch'],
      internals: ['Content-Type: text/x-component', 'the SSR runtime is not involved; no tee']
    },
    {
      id: 'j6-11', kind: 'transform', title: 'Merge at one LayoutRouter',
      story: 'The client router applies the patch. The LayoutRouter that owns dashboard/children swaps settings → billing. Every React node above it keeps its identity: DashboardNav keeps its open state, the sidebar keeps its scroll position, an unsent form in the layout keeps its text. Only the slot content is new.',
      camera: { kind: 'entities', ids: ['app-router', 'layout-router', 'client-components', 'dom'] },
      token: { at: 'layout-router', glyph: 'segment', label: 'dashboard/children: settings → billing' },
      states: { 'app-router': 'active', 'layout-router': 'current', 'client-components': 'kept', dom: 'kept', 'src-settings-page': 'replaced', 'src-billing-page': 'new' }, edges: ['e-flight-router-patch']
    },
    {
      id: 'j6-12', kind: 'explain', title: 'History and the client tree',
      story: 'The router calls pushState with the new URL and updates its copy of FlightRouterState so it matches the server\'s tree for /dashboard/billing. Back and forward restore the tree stored in that history entry and reuse the client cache; the server is not consulted.',
      camera: { kind: 'entities', ids: ['app-router', 'router-state-tree'] },
      token: { at: 'router-state-tree', glyph: 'segment', label: 'FlightRouterState · /dashboard/billing' },
      states: { 'app-router': 'active', 'router-state-tree': 'current' }, edges: ['e-router-tree'],
      internals: ['history.pushState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE }, "", url)', 'router-reducer: navigate-reducer.ts']
    },
    {
      id: 'j6-13', kind: 'move', title: 'The cache-hit path',
      story: 'Now the user presses Back. The history entry for /dashboard/settings holds its tree, and the segments the page was built from are still in the client cache, so the navigation completes with no request and no server work: the router restores the tree and swaps the slot. A Link click to a dynamic page would refetch instead, because dynamic entries are stale immediately by default (step 15).',
      camera: { kind: 'entities', ids: ['route-cache', 'segment-cache', 'app-router', 'routing-ladder'] },
      token: { at: 'app-router', glyph: 'segment', label: 'Back → settings · from history + cache' },
      states: { 'route-cache': 'active', 'segment-cache': 'active', 'app-router': 'current', 'routing-ladder': 'na', 'rsc-runtime-entity': 'na' }, edges: ['e-route-cache-router', 'e-segment-cache-router']
    },
    {
      id: 'j6-14', kind: 'explain', title: 'Compare with the Pages Router',
      story: 'The same click in the Pages Router downloads a JSON blob of props and remounts the page component; there is no tree diff, no segment slices, no shared layout kept by the framework. The compare lanes C2 (initial request), C4 (navigation) and C9 (caches) put the two side by side.',
      camera: { kind: 'entities', ids: ['app-router', 'route-cache', 'segment-cache'] },
      states: { 'app-router': 'active', 'route-cache': 'active', 'segment-cache': 'active' }, edges: []
    },
    {
      id: 'j6-15', kind: 'explain', title: 'Staleness and router.refresh()',
      story: 'Cached entries do not live forever. Static segments stay for a longer window, dynamic ones for a short one; staleTimes in next.config tunes both. router.refresh() throws the trees away and re-requests the current route from the server without touching the browser history or React state that survives the merge.',
      camera: { kind: 'entities', ids: ['route-cache', 'segment-cache', 'app-router'] },
      states: { 'route-cache': 'stale', 'segment-cache': 'stale', 'app-router': 'active' }, edges: [],
      internals: ['experimental.staleTimes: { dynamic: 0, static: 300 } by default', 'router.refresh(): refresh-reducer.ts, sends the current tree with a refresh mark']
    },
    {
      id: 'j6-16', kind: 'explain', title: 'Internals',
      story: 'Names to look for in the source: the request headers, the /_tree response, the scheduler and its priorities. None of them are needed to predict what happens on a click; all of them are where it happens.',
      camera: { kind: 'region', id: 'client-router' },
      states: { 'app-router': 'active', 'prefetch-scheduler': 'active', 'route-cache': 'active', 'segment-cache': 'active', 'router-state-tree': 'active' }, edges: [],
      internals: ['headers: rsc, next-router-state-tree, next-url, next-router-prefetch, next-router-segment-prefetch', '/_tree response: FlightRouterState rows + head', 'next/src/client/components/segment-cache/{cache,scheduler,navigation}.ts', 'next/src/client/components/app-router.tsx'],
      sources: [
        { label: 'Linking and navigating', url: 'https://nextjs.org/docs/app/getting-started/linking-and-navigating' },
        { label: 'Client-side caching', url: 'https://nextjs.org/docs/app/guides/caching#client-side-router-cache' }
      ]
    },
    {
      id: 'j6-17', kind: 'explain', title: 'Version note',
      story: 'The articles describe the Segment Cache as an opt-in experiment behind clientSegmentCache. Since Next.js 16 it is the default client cache, and 16.3 adds App Shell prefetching on top. The picture in the articles is still right about what is cached; what changed is when and how much is prefetched.',
      camera: { kind: 'entities', ids: ['segment-cache', 'route-cache'] },
      states: { 'segment-cache': 'fresh', 'route-cache': 'fresh' }, edges: [],
      internals: ['article: experimental.clientSegmentCache: true', 'Next.js 16: Segment Cache default', '16.3: experimental.partialPrefetching']
    },
    {
      id: 'j6-18', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'world' },
      states: { 'app-router': 'active', 'router-state-tree': 'active', 'loader-tree': 'active', flight: 'active', 'layout-router': 'active' }, edges: ['e-router-ladder', 'e-tree-loader', 'e-flight-router-patch'],
      checks: [
        { statement: 'DashboardLayout re-renders on navigation to /dashboard/billing.', isTrue: false, why: 'It sits in the shared prefix of both trees. The server locks that prefix and starts rendering at the first divergent node, billing.' },
        { statement: 'The navigation response contains HTML.', isTrue: false, why: 'It is text/x-component: a Flight patch with one segment slice and a tree patch. The SSR runtime is never involved.' },
        { statement: 'Shared layouts are downloaded again for every route that uses them.', isTrue: false, why: 'The Segment Cache stores each segment once; the prefetch only asks for segments that are missing.' }
      ]
    }
  ]
}
