import type { Journey } from '../types'

const CACHING_DOCS = { label: 'Caching', url: 'https://nextjs.org/docs/app/getting-started/caching' }
const CACHE_COMPONENTS = { label: 'cacheComponents', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents' }
const ISR = { label: 'ISR', url: 'https://nextjs.org/docs/app/guides/incremental-static-regeneration' }

export const CACHING: Journey = {
  id: 'j8',
  slug: 'caching',
  title: 'Caching, ISR, Cache Components and PPR',
  following: 'the cache map, then GET /posts/7 through the ISR branches, then GET /dashboard/billing as a static shell with a dynamic hole',
  whatShouldClick: 'Every cache has a location, a key and an invalidator; ISR decides when a whole route regenerates, PPR decides which part of a route is dynamic.',
  steps: [
    {
      id: 'j8-1', kind: 'explain', title: 'A map of caches',
      story: 'There is no single Next.js cache. There are several, each in a different place: one that lives for a single request, two server stores for data and for whole routes, an image store and a build store on disk, and two caches inside each browser tab. Each has its own key and its own way of being emptied.',
      camera: { kind: 'world' },
      states: {
        'request-memo': 'fresh', 'data-cache': 'fresh', 'server-cache': 'fresh', 'image-cache': 'fresh', 'next-cache-dir': 'fresh',
        'route-cache': 'fresh', 'segment-cache': 'fresh'
      },
      edges: [],
      internals: [
        'request memoization · Node, one request · key: function + args',
        '"use cache" entries · Node memory per instance by default · key: cache scope + serialized args + captured values',
        'server cache · Node + persistent store · key: route path + params',
        'image cache · .next/cache/images · key: url + width + quality + format',
        'build cache · .next/cache · key: module / task inputs',
        'Route Cache + Segment Cache · browser tab memory · key: URL / segment path'
      ],
      sources: [CACHING_DOCS]
    },
    {
      id: 'j8-2', kind: 'explain', title: 'Request memoization',
      story: 'While /dashboard/settings renders, the page and AccountSummary both ask for the profile. Identical calls inside one request run once and share the result; when the request ends the memo is thrown away, so the next visitor starts empty.',
      camera: { kind: 'entities', ids: ['request-memo', 'rsc-runtime-entity', 'src-settings-page', 'src-account-summary', 'db'] },
      token: { at: 'request-memo', glyph: 'cache', label: 'getProfile() ×2 → one run' },
      states: { 'request-memo': 'current', 'rsc-runtime-entity': 'active', 'src-settings-page': 'active', 'src-account-summary': 'active', db: 'active' },
      edges: ['e-memo-rsc', 'e-db-rsc'],
      internals: ['fetch GET with the same URL and options is memoized automatically', 'other calls: React cache(fn)', 'different arguments → a second execution'],
      sources: [CACHING_DOCS]
    },
    {
      id: 'j8-3', kind: 'explain', title: '"use cache" is opt-in',
      story: 'getProfile is marked "use cache", tagged profile and given the hours lifetime, so its result is stored and reused across requests until it ages out or the tag is invalidated. getInvoices has no directive, and with Cache Components that means it is not cached at all: it runs on every request.',
      camera: { kind: 'entities', ids: ['data-cache', 'db', 'rsc-runtime-entity', 'request-memo'] },
      token: { at: 'data-cache', glyph: 'cache', label: 'getProfile() · tag profile · cacheLife("hours")' },
      states: { 'data-cache': 'fresh', db: 'active', 'rsc-runtime-entity': 'active', 'request-memo': 'kept' },
      edges: ['e-db-data-cache', 'e-data-cache-rsc'],
      internals: [
        'era 1 (≤ 14): fetch was cached implicitly',
        'era 2 (15, and 16 without Cache Components): fetch is not cached by default; cache: "force-cache" opts in',
        'era 3 (cacheComponents: true): nothing is cached without "use cache" + cacheLife + cacheTag',
        'key: cache scope + serialized arguments + captured values (+ build ID); value: the result as an RSC payload',
        'default cacheLife: stale 5 min (client), revalidate 15 min (server), never expires',
        '"use cache: remote" → a shared cache handler; "use cache: private" → browser only',
        'unstable_cache still exists; the docs describe it as replaced by "use cache"'
      ],
      sources: [CACHE_COMPONENTS, { label: '"use cache"', url: 'https://nextjs.org/docs/app/api-reference/directives/use-cache' }, { label: 'Caching without Cache Components', url: 'https://nextjs.org/docs/app/guides/caching-without-cache-components' }]
    },
    {
      id: 'j8-4', kind: 'explain', title: 'Whole routes in the server cache',
      story: 'Rendered routes are cached one level up. The server cache is keyed by the route path, here /dashboard/settings, and holds the HTML, the RSC payload and a small record of when the entry goes stale and which tags it carries. The build seeded it, and every visitor shares it.',
      camera: { kind: 'entities', ids: ['server-cache', 'prerendered-outputs', 'prerender-manifest', 'next-cache-dir'] },
      token: { at: 'server-cache', glyph: 'cache', label: '/dashboard/settings → HTML · RSC · meta' },
      states: { 'server-cache': 'fresh', 'prerendered-outputs': 'kept', 'prerender-manifest': 'active', 'next-cache-dir': 'kept' },
      edges: ['e-outputs-server-cache', 'e-prerender-manifest-cache', 'e-server-cache-dir'],
      internals: [
        'article: "incremental cache"; older docs: "Full Route Cache"; docs now: Next.js server cache',
        'seeded from .next/server/app/dashboard/settings.html · settings.rsc · settings.meta',
        'meta: revalidate, tags (profile), PPR shell when there is one',
        'three branches before any render: miss → render and store; fresh → serve; stale → serve and regenerate',
        'self-hosting: cacheHandler and cacheMaxMemorySize choose where it lives'
      ],
      sources: [CACHING_DOCS, { label: 'Self-hosting', url: 'https://nextjs.org/docs/app/guides/self-hosting' }]
    },
    {
      id: 'j8-5', kind: 'move', title: 'A fresh hit renders nothing',
      story: 'GET /posts/7 is handed to render-server, which looks the path up before rendering anything. The entry is younger than its 60 seconds, so the stored HTML goes out as it is: getStaticProps does not run and no React renders.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'pages-renderer', 'server-cache', 'dom'] },
      token: { at: 'server-cache', glyph: 'html', label: '/posts/7 · fresh (12 s old)' },
      states: { 'routing-ladder': 'active', 'pages-renderer': 'kept', 'server-cache': 'fresh', html: 'active', dom: 'new', 'rsc-runtime-entity': 'dimmed', 'ssr-runtime-entity': 'dimmed' },
      edges: ['e-ladder-pages', 'e-pages-server-cache', 'e-server-cache-html', 'e-html-dom'],
      internals: ['prerender-manifest: /posts/7 initialRevalidateSeconds 60', '.next/server/pages/posts/7.html + posts/7.json', 'a plain static route is the same branch with an entry that never goes stale (revalidate: false)'],
      sources: [ISR]
    },
    {
      id: 'j8-6', kind: 'predict', title: 'A stale entry',
      story: 'The same entry is now 75 seconds old, past its 60-second revalidate window. A new visitor asks for /posts/7.',
      camera: { kind: 'entities', ids: ['pages-renderer', 'server-cache', 'isr-regeneration', 'dom'] },
      token: { at: 'server-cache', glyph: 'html', label: '/posts/7 · stale (75 s old)' },
      states: { 'server-cache': 'stale', 'pages-renderer': 'kept', 'isr-regeneration': 'dimmed', dom: 'dimmed' },
      edges: ['e-pages-server-cache'],
      question: {
        text: 'The ISR entry for /posts/7 is stale. Does this visitor wait for a new render?',
        options: [
          'Yes: a stale entry counts as a miss, so the page renders before the response',
          'No: the stale entry is served now and a regeneration starts in the background',
          'No: the stale entry is served and nothing changes until the next build',
          'It depends on whether the browser still has the page in its client cache'
        ],
        answer: 1,
        why: 'Stale is not missing. The stored HTML is still sent at once, as fast as a fresh hit, and the stale hit is what starts a regeneration. That visitor sees the old page; the next one gets the new one.'
      }
    },
    {
      id: 'j8-7', kind: 'reveal', title: 'Served stale, regenerated behind',
      story: 'The stale HTML leaves at once. Only after that does a second render start in the background: getStaticProps runs again and, if it succeeds, the new page replaces the entry. The visitor after this one gets the new version.',
      camera: { kind: 'entities', ids: ['server-cache', 'dom', 'isr-regeneration', 'pages-renderer'] },
      token: { at: 'isr-regeneration', glyph: 'process', label: 'regenerating' },
      states: { 'server-cache': 'stale', html: 'active', dom: 'new', 'isr-regeneration': 'current', 'pages-renderer': 'active' },
      edges: ['e-server-cache-html', 'e-html-dom', 'e-pages-regen'],
      internals: ['stale-while-revalidate: the response never waits for the regeneration', 'a failed regeneration keeps the old entry and retries on a later stale hit', 'App Router: revalidateTag(tag, "max") puts tagged entries into the same stale state'],
      sources: [ISR, { label: 'getStaticProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-static-props' }]
    },
    {
      id: 'j8-8', kind: 'transform', title: 'A miss renders and stores',
      story: 'When there is no entry at all, for example because the build did not prerender this post and getStaticPaths says fallback: \'blocking\', the first visitor waits while getStaticProps runs and the page renders. The result is sent and stored with its 60-second revalidate, and from then on the fresh and stale branches apply.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'pages-renderer', 'server-cache', 'db', 'html'] },
      token: { at: 'pages-renderer', glyph: 'html', label: 'miss → render' },
      states: { 'routing-ladder': 'kept', 'pages-renderer': 'current', db: 'active', html: 'new', dom: 'new', 'server-cache': 'new' },
      edges: ['e-ladder-pages', 'e-db-pages', 'e-pages-html', 'e-pages-store', 'e-html-dom'],
      internals: ['getStaticPaths → { paths, fallback: "blocking" }', 'getStaticProps → { props, revalidate: 60 }', 'stored entry: HTML + props JSON + revalidate'],
      sources: [ISR, { label: 'getStaticPaths', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-static-paths' }]
    },
    {
      id: 'j8-9', kind: 'explain', title: 'One store, several names',
      story: 'The same caches have been named differently over time. The article says incremental cache, older docs called that store the Full Route Cache, and current docs call it the Next.js server cache; the Router Cache of older docs is what the docs now call the client cache in the browser.',
      camera: { kind: 'entities', ids: ['request-memo', 'data-cache', 'server-cache', 'route-cache', 'segment-cache'] },
      states: { 'request-memo': 'fresh', 'data-cache': 'fresh', 'server-cache': 'current', 'route-cache': 'fresh', 'segment-cache': 'fresh' },
      edges: [],
      internals: [
        'Request memoization: same name in every era',
        'Data Cache: implicit fetch cache (≤ 14) → opt-in fetch cache (15/16 without Cache Components) → "use cache" entries (Cache Components)',
        'HTML + RSC per route: "incremental cache" (article) · "Full Route Cache" (older docs, retired) · "Next.js server cache" (docs now)',
        'browser: Route Cache + Segment Cache (article) · "Router Cache" (older docs, retired) · "Client Cache" (docs now)'
      ],
      sources: [CACHING_DOCS, { label: 'Linking and navigating', url: 'https://nextjs.org/docs/app/getting-started/linking-and-navigating' }]
    },
    {
      id: 'j8-10', kind: 'explain', title: 'Caches in the tab',
      story: 'On the other side of the network line each tab keeps its own caches, filled by the prefetches and navigations of the previous journeys: route trees per URL and segment content per segment, with the shared dashboard layout stored once. Nothing here is shared with other visitors or with the server.',
      camera: { kind: 'region', id: 'client-router' },
      token: { at: 'segment-cache', glyph: 'segment', label: '/dashboard · /dashboard/billing' },
      states: { 'route-cache': 'fresh', 'segment-cache': 'fresh', 'app-router': 'active', 'prefetch-scheduler': 'active' },
      edges: ['e-scheduler-route-cache', 'e-scheduler-segment-cache', 'e-route-cache-router', 'e-segment-cache-router'],
      internals: ['docs name: "Client Cache"; lifetime from staleTimes or cacheLife.stale', 'emptied by router.refresh(), an action response with f, updateTag / revalidatePath / revalidateTag, cookie writes, expiry', '16.3: small prefetch payloads are inlined into one response'],
      sources: [{ label: 'Linking and navigating', url: 'https://nextjs.org/docs/app/getting-started/linking-and-navigating' }, { label: 'Next.js 16.3', url: 'https://nextjs.org/blog/next-16-3' }]
    },
    {
      id: 'j8-11', kind: 'explain', title: 'Images have their own store',
      story: 'Optimized images are cached on disk, apart from pages. A request for /hero.jpg at width 640 and quality 75 from a browser that accepts WebP is stored under a key made of the URL, the width, the quality and the format, so each variant is computed once and survives restarts.',
      camera: { kind: 'entities', ids: ['image-optimizer', 'image-cache', 'next-cache-dir', 'public-dir'] },
      token: { at: 'image-cache', glyph: 'cache', label: '/hero.jpg|640|75|webp' },
      states: { 'image-cache': 'fresh', 'image-optimizer': 'active', 'next-cache-dir': 'kept', 'public-dir': 'active' },
      edges: ['e-image-cache', 'e-image-cache-dir'],
      internals: ['GET /_next/image?url=/hero.jpg&w=640&q=75 with Accept: image/avif,image/webp,…', 'stored in .next/cache/images', '16.0 defaults: minimumCacheTTL 4 h, qualities [75]', 'the default loader does not optimize SVG, which is why the example image is a JPEG'],
      sources: [{ label: 'Image component', url: 'https://nextjs.org/docs/app/api-reference/components/image' }, { label: 'Upgrading to 16', url: 'https://nextjs.org/docs/app/guides/upgrading/version-16' }]
    },
    {
      id: 'j8-12', kind: 'explain', title: 'The build remembers',
      story: 'The build has a cache too, and it outlives every single build. The bundler writes the results of its work to disk, so the next build recomputes only what changed; Turbopack keeps this cache on by default for both development and production builds.',
      camera: { kind: 'entities', ids: ['next-build', 'bundler', 'next-cache-dir'] },
      token: { at: 'next-cache-dir', glyph: 'cache', label: 'persistent cache · across builds' },
      states: { 'next-cache-dir': 'fresh', bundler: 'active', 'next-build': 'active' },
      edges: ['e-bundler-cache-dir'],
      internals: ['key: module and task inputs; value: transformed modules and turbo-tasks results', '16.3: persistent filesystem cache on by default for next dev and next build', 'Webpack path (--webpack): its own filesystem cache in the same directory', 'lost with --no-cache or a CI job that does not keep .next/cache'],
      sources: [{ label: 'turbopackFileSystemCache', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache' }, { label: 'Next.js 16.3', url: 'https://nextjs.org/blog/next-16-3' }]
    },
    {
      id: 'j8-13', kind: 'transform', title: 'The build stops at a boundary',
      story: 'At build time /dashboard/billing is rendered from the root down until it reaches the Suspense boundary around InvoiceList, which reads cookies. Everything outside the boundary becomes a static shell with the skeleton in place, and the point where rendering stopped is saved so it can continue later.',
      camera: { kind: 'entities', ids: ['prerender', 'ppr-shell', 'server-cache', 'rsc-runtime-entity'] },
      token: { at: 'ppr-shell', glyph: 'html', label: 'billing shell ⏸' },
      states: { 'src-billing-page': 'active', prerender: 'current', 'ppr-shell': 'new', 'server-cache': 'new', 'rsc-runtime-entity': 'active', 'ssr-runtime-entity': 'active' },
      edges: ['e-prerender-ppr', 'e-ppr-server-cache'],
      internals: ['cacheComponents: true implements PPR; experimental.ppr was removed in 16.0', 'saved resume point = "postponed state" (implementation term; the docs no longer name it)', 'build summary: ◐ /dashboard/billing'],
      sources: [CACHE_COMPONENTS, { label: 'Upgrading to 16', url: 'https://nextjs.org/docs/app/guides/upgrading/version-16' }]
    },
    {
      id: 'j8-14', kind: 'move', title: 'The shell leaves first',
      story: 'A request for /dashboard/billing does not wait for anything dynamic. The shell comes straight out of the server cache and starts streaming, so the browser paints the layouts and the invoice skeleton immediately.',
      camera: { kind: 'entities', ids: ['ppr-shell', 'server-cache', 'dom', 'suspense-hole'] },
      token: { at: 'dom', glyph: 'html', label: 'shell: layouts + <InvoicesSkeleton/>' },
      states: { 'ppr-shell': 'kept', 'server-cache': 'fresh', html: 'active', dom: 'current', 'suspense-hole': 'active' },
      edges: ['e-ppr-server-cache', 'e-server-cache-html', 'e-html-dom'],
      internals: ['response header x-nextjs-postponed marks a response that will be resumed', 'the shell is a cache hit: no cookies have been read yet'],
      sources: [CACHE_COMPONENTS]
    },
    {
      id: 'j8-15', kind: 'transform', title: 'The render resumes',
      story: 'In the same response, rendering picks up where the build stopped, now with this visitor\'s real cookies. InvoiceList runs, its rows stream into the open response and replace the skeleton; nothing outside the boundary renders again.',
      camera: { kind: 'entities', ids: ['ppr-shell', 'rsc-runtime-entity', 'db', 'html', 'suspense-hole'] },
      token: { at: 'suspense-hole', glyph: 'flight', label: 'InvoiceList rows' },
      states: { 'ppr-shell': 'active', 'rsc-runtime-entity': 'current', db: 'active', flight: 'new', html: 'active', 'suspense-hole': 'current', dom: 'active' },
      edges: ['e-ppr-resume', 'e-db-rsc', 'e-html-suspense'],
      internals: ['resume input: the saved resume point + the real request (cookies)', 'getInvoices() is uncached and runs on every request', 'one response: shell bytes first, dynamic rows later in the same stream'],
      sources: [CACHE_COMPONENTS]
    },
    {
      id: 'j8-16', kind: 'predict', title: 'Move one call up',
      story: 'Now cookies() moves out of InvoiceList and into BillingPage, above the Suspense boundary. Nothing else in the code changes.',
      camera: { kind: 'region', id: 'source' },
      token: { at: 'src-billing-page', glyph: 'source-module', label: 'cookies() in BillingPage' },
      states: { 'src-billing-page': 'current', 'src-dashboard-layout': 'kept', 'ppr-shell': 'kept', 'suspense-hole': 'active' },
      edges: [],
      question: {
        text: 'Move cookies() from InvoiceList up into BillingPage. What becomes dynamic?',
        options: [
          'Only InvoiceList, as before: the Suspense boundary still decides',
          'The whole page: the shell shrinks to the root and dashboard layouts',
          'Nothing: cookies are read at build time and baked into the shell',
          'Only the cookie value; the rest of the page stays in the shell'
        ],
        answer: 1,
        why: 'A boundary only protects what is inside it. BillingPage now reads request data before its Suspense boundary is reached, so the build render has to stop at the page itself: the page becomes the hole and the shell keeps only what sits above it.'
      }
    },
    {
      id: 'j8-17', kind: 'reveal', title: 'The hole swallowed the page',
      story: 'The boundary jumped up to the page root. The shell now holds only the root and dashboard layouts, and all of BillingPage, including parts that never needed cookies, renders on every request. Reading request data as deep in the tree as possible is what keeps the shell large.',
      camera: { kind: 'region', id: 'source' },
      token: { at: 'src-dashboard-layout', glyph: 'html', label: 'shell ends here' },
      states: { 'src-root-layout': 'kept', 'src-dashboard-layout': 'kept', 'src-billing-page': 'replaced', 'ppr-shell': 'replaced', 'suspense-hole': 'current' },
      edges: ['e-prerender-ppr'],
      internals: ['the same holds for headers(), searchParams and any uncached async read outside <Suspense>', 'Cache Components: the dev overlay reports such a route as blocking', 'the docs recommend reading runtime data, and awaiting params, inside a boundary'],
      sources: [CACHING_DOCS, CACHE_COMPONENTS]
    },
    {
      id: 'j8-18', kind: 'explain', title: 'Invalidate, then rerender',
      story: 'Invalidating a cache and rendering again are separate operations. updateTag and revalidatePath expire entries now, and the action\'s own response carries the re-rendered page; revalidateTag with a profile only marks entries stale, so the next visit is served stale while it regenerates; refresh() re-renders without touching any cache.',
      camera: { kind: 'entities', ids: ['action-handler', 'data-cache', 'server-cache', 'rsc-runtime-entity', 'app-router'] },
      token: { at: 'action-handler', glyph: 'action', label: 'updateTag · revalidateTag(tag, "max") · refresh()' },
      states: { 'action-handler': 'current', 'data-cache': 'invalid', 'server-cache': 'stale', 'rsc-runtime-entity': 'active', flight: 'new', 'app-router': 'active', 'segment-cache': 'replaced' },
      edges: ['e-action-server-cache', 'e-action-flight', 'e-flight-router-patch'],
      internals: [
        'updateTag("profile"): Server Actions only; expire now, read-your-writes, response carries f',
        'revalidatePath("/dashboard/settings"): revalidation by a path-derived tag; response carries f',
        'revalidateTag("profile", "max"): stale-while-revalidate; no f in the response',
        'revalidateTag(tag) with one argument is deprecated in 16 and behaves like { expire: 0 }',
        'refresh(): refetches uncached data and re-renders; no cache entry changes'
      ],
      sources: [{ label: 'updateTag', url: 'https://nextjs.org/docs/app/api-reference/functions/updateTag' }, { label: 'revalidateTag', url: 'https://nextjs.org/docs/app/api-reference/functions/revalidateTag' }, { label: 'Server Actions', url: 'https://nextjs.org/docs/app/guides/server-actions' }]
    },
    {
      id: 'j8-19', kind: 'explain', title: 'Ways around the caches',
      story: 'Some reads skip caching on purpose. Cookies, headers and search params make that part of the render run per request; a fetch with no-store is never stored; draft mode renders every request so editors see unpublished content; and a link with prefetch={false} never fills the client cache before a click.',
      camera: { kind: 'entities', ids: ['server-cache', 'data-cache', 'rsc-runtime-entity', 'db', 'segment-cache'] },
      states: { 'server-cache': 'na', 'data-cache': 'na', 'segment-cache': 'na', 'rsc-runtime-entity': 'current', db: 'active' },
      edges: ['e-db-rsc'],
      internals: [
        'with Cache Components nothing is cached without "use cache", so no-store matters mainly in the model without it',
        'draft mode: a cookie that bypasses the server cache for that browser',
        'prefetch={false}: no prefetch at all, not even on hover; the cache fills on navigation',
        'next dev: prefetching is off, so the client cache fills only on navigation'
      ],
      sources: [CACHING_DOCS, { label: 'Draft mode', url: 'https://nextjs.org/docs/app/guides/draft-mode' }, { label: 'Link prefetch', url: 'https://nextjs.org/docs/app/api-reference/components/link#prefetch' }]
    },
    {
      id: 'j8-20', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'world' },
      states: { 'server-cache': 'fresh', 'isr-regeneration': 'active', 'ppr-shell': 'kept', 'suspense-hole': 'active', 'route-cache': 'fresh', 'segment-cache': 'fresh' },
      edges: ['e-regen-server-cache', 'e-ppr-server-cache'],
      checks: [
        { statement: 'ISR blocks the request until regeneration finishes.', isTrue: false, why: 'A stale entry is served at once; regeneration runs after the response has left. Only a miss, with no entry at all, makes the visitor wait.' },
        { statement: 'PPR is ISR with a smaller cache.', isTrue: false, why: 'ISR decides when a whole cached route is regenerated. PPR splits one route into a static shell and a dynamic part that is rendered on every request.' },
        { statement: 'The browser Segment Cache and the server incremental cache store the same thing.', isTrue: false, why: 'The server cache holds rendered HTML and RSC per route, shared by every visitor. The Segment Cache holds segment content per tab, filled by prefetches and navigations, on the other side of the network.' }
      ]
    }
  ]
}
