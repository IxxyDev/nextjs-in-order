import type { QuizQuestion } from './types'

/**
 * Predict the machine: the brief's ten reviewer questions (r1–r10), then one scenario per journey
 * theme (s0–s11). Version-sensitive facts follow concept-model.md §7 (Next.js 16.3).
 */
export const QUIZ: QuizQuestion[] = [
  // ---------- the brief's reviewer questions ----------
  {
    id: 'r1', source: 'reviewer', type: 'entities', title: 'What "use client" ships',
    prompt: 'You add "use client" to the top of ProfileForm.tsx and run next build. Which artifacts on the .next shelf let ProfileForm\'s code reach the browser?',
    candidates: ['server-chunks', 'browser-chunks', 'client-reference-manifest', 'server-reference-manifest', 'routes-manifest', 'prerender-manifest', 'build-manifest'],
    answer: ['browser-chunks', 'client-reference-manifest'],
    why: 'The compiler turns the directive into a boundary mark, and the bundler opens a browser entry where the settings page imports ProfileForm, so the module\'s code lands in a browser chunk. On the server side ProfileForm collapses into a reference whose row (keyed by module path: id and chunk) is written into the page\'s client-reference manifest. At request time the RSC runtime writes that reference into Flight, and the browser fetches exactly the chunk it names. Without the directive ProfileForm stays server-only and only its rendered output crosses.',
    replays: [{ journey: 'production-build', step: 4 }, { journey: 'production-build', step: 10 }, { journey: 'production-build', step: 11 }]
  },
  {
    id: 'r2', source: 'reviewer', type: 'regions', title: 'Two React runtimes',
    prompt: 'render-server renders /dashboard/settings (for this ○ route that happens once, at build; a dynamic route does it per request). Pick every region in which a React build executes on the server to render it.',
    candidates: ['http-entry', 'router-server', 'render-server', 'rsc-runtime', 'ssr-runtime', 'data-caches', 'browser', 'client-router'],
    answer: ['rsc-runtime', 'ssr-runtime'],
    why: 'render-server holds two React builds. The react-server build runs Server Components and turns them into Flight rows, but cannot render HTML or touch the DOM. The stream is teed: react-dom/server consumes one copy, loads Client Components such as DashboardNav from the ssr layer and renders the HTML, without running SettingsPage again. render-server itself only hosts them, and the browser\'s React runs later, in the tab.',
    replays: [{ journey: 'app-initial', step: 1 }, { journey: 'app-initial', step: 11 }, { journey: 'app-initial', step: 12 }]
  },
  {
    id: 'r3', source: 'reviewer', type: 'choice', title: 'Why Flight, if there is HTML',
    prompt: 'The browser already has the full HTML for /dashboard/settings. What does it need the inline Flight chunks (self.__next_f) for?',
    options: [
      'To rebuild the server\'s React tree, with references where Client Components go, so only the islands hydrate and later navigations can merge patches',
      'To run the Server Components a second time in the browser and check the HTML',
      'As a binary backup copy of the HTML in case the document fails to parse',
      'Nothing in production; the chunks only feed the dev overlay'
    ],
    answer: 0, highlight: ['html', 'next-f', 'react-client', 'router-state-tree'],
    why: 'HTML is the painted result: it has no component boundaries, props or client references. The inline Flight rows (bootstrap, text, form state and base64 rows) let the client runtime rebuild the same element tree the server had, so hydrateRoot attaches state and handlers to DashboardNav and ProfileForm and leaves Server Component output exactly as painted. The same tree seeds the client router. Flight is textual rows with base64 rows for binary data, not HTML and not code.',
    replays: [{ journey: 'app-initial', step: 13 }, { journey: 'app-initial', step: 17 }, { journey: 'whole-lifecycle', step: 9 }]
  },
  {
    id: 'r4', source: 'reviewer', type: 'entities', title: 'The layout keeps its state',
    prompt: 'DashboardNav\'s menu is open on /dashboard/settings and you click a link to /dashboard/billing. Which source modules does the RSC runtime execute for the navigation response?',
    candidates: ['src-root-layout', 'src-dashboard-layout', 'src-settings-page', 'src-billing-page', 'src-dashboard-nav', 'src-account-summary'],
    answer: ['src-billing-page'],
    why: 'The request carries the client\'s FlightRouterState. The server walks it against the target tree: "" and dashboard match, so that prefix is locked and rendering starts at the first divergent segment. Only BillingPage runs. The client merges the patch at the one LayoutRouter that owns dashboard/children; every node above it, DashboardNav included, keeps its React identity, so the menu stays open. DashboardNav is a Client Component and never runs in the RSC runtime anyway.',
    replays: [{ journey: 'app-navigation', step: 8 }, { journey: 'app-navigation', step: 9 }, { journey: 'app-navigation', step: 11 }]
  },
  {
    id: 'r5', source: 'reviewer', type: 'regions', title: 'A static asset',
    prompt: 'The browser requests /_next/static/chunks/app/dashboard/layout-3c4d.js. Pick every region above the network line that this request touches, including where the file is read from.',
    candidates: ['source', 'build', 'artifacts', 'http-entry', 'router-server', 'render-server', 'rsc-runtime', 'ssr-runtime', 'data-caches'],
    answer: ['http-entry', 'router-server', 'artifacts'],
    why: 'The Node HTTP server hands every request to router-server, which climbs the ladder. Configured headers and redirects run; Proxy does not, because its matcher only covers /dashboard; at step 5 the filesystem check recognizes build output and streams the file straight from the .next shelf. render-server and both React runtimes never see it, and nothing is compiled: the build ran long before.',
    replays: [{ journey: 'request-routing', step: 10 }, { journey: 'request-routing', step: 11 }]
  },
  {
    id: 'r6', source: 'reviewer', type: 'choice', title: 'UI in the action response',
    prompt: 'ProfileForm submits updateProfile, which writes the new name to the database. In which case does the single action response carry the re-rendered route (f) next to the return value (a)?',
    options: [
      'updateProfile calls updateTag("profile") after the write',
      'updateProfile calls revalidateTag("profile", "max") after the write',
      'updateProfile only returns { ok: true }',
      'Always: every action response re-renders the page'
    ],
    answer: 0, highlight: ['action-handler', 'data-cache', 'server-cache', 'rsc-runtime-entity', 'flight'],
    why: 'An action is one POST and one text/x-component response. The return value always rides in a. The handler renders the current route again inside the same request only when something changed what the page reads: updateTag or revalidatePath expire entries now, and refresh(), a cookie write or redirect() also make it re-render. revalidateTag with a profile such as "max" only marks entries stale-while-revalidate, so f stays empty and a later read refreshes in the background.',
    replays: [{ journey: 'server-actions', step: 12 }, { journey: 'server-actions', step: 13 }, { journey: 'caching', step: 18 }]
  },
  {
    id: 'r7', source: 'reviewer', type: 'entities', title: 'Where the caches live',
    prompt: 'Which of these caches live inside the browser tab rather than on the server?',
    candidates: ['request-memo', 'data-cache', 'server-cache', 'image-cache', 'next-cache-dir', 'route-cache', 'segment-cache'],
    answer: ['route-cache', 'segment-cache'],
    why: 'On the server, request memoization keeps function results for one request; "use cache" entries keep serialized function or component results (in memory per instance by default, or in a remote handler); the server cache keeps whole prerendered routes as HTML plus RSC payload; the image cache keeps optimized variants on disk; .next/cache keeps build results. In the tab, the docs\' "Client Cache" has two drawers: the Route Cache holds route trees per URL and the Segment Cache holds segment content, with shared layouts stored once. ("use cache: private" is the one variant whose entries stay in the browser.)',
    replays: [{ journey: 'caching', step: 1 }, { journey: 'caching', step: 10 }, { journey: 'app-navigation', step: 2 }]
  },
  {
    id: 'r8', source: 'reviewer', type: 'choice', title: 'PPR and a personalized page',
    prompt: '/dashboard/billing reads cookies() only inside a <Suspense> boundary around <InvoiceList />, and cacheComponents is on. What is rendered per request?',
    options: [
      'Only InvoiceList; the layouts and the rest of BillingPage come from the prebuilt shell',
      'The whole page, because it reads cookies()',
      'Nothing on the server; cookies are read in the browser',
      'Only the root and dashboard layouts'
    ],
    answer: 0, highlight: ['ppr-shell', 'server-cache', 'suspense-hole', 'src-billing-page'],
    why: 'In Next.js 16, cacheComponents makes Partial Prerendering the default. The build renders the route from the root until it reaches the Suspense boundary that reads cookies, stores everything outside it as a static shell and saves where it stopped. A request streams the shell straight from the server cache, then resumes the render with the real cookies: only InvoiceList runs and fills the hole. Move cookies() up to the page root and the hole swallows the page.',
    replays: [{ journey: 'caching', step: 13 }, { journey: 'caching', step: 14 }, { journey: 'caching', step: 15 }, { journey: 'caching', step: 17 }]
  },
  {
    id: 'r9', source: 'reviewer', type: 'choice', title: 'Fast Refresh and Server Components',
    prompt: 'next dev is running and DashboardNav\'s menu is open. You save AccountSummary.tsx, a Server Component. What happens in the tab?',
    options: [
      'Fast Refresh swaps AccountSummary\'s code in the browser',
      'The router fetches a new RSC payload and merges it like a navigation; the menu stays open',
      'The page reloads fully and the menu closes',
      'Nothing until you reload by hand'
    ],
    answer: 1, highlight: ['src-account-summary', 'dev-hmr', 'dev-hmr-client', 'app-router', 'rsc-runtime-entity', 'flight'],
    why: 'No browser code ever runs AccountSummary, so there is nothing for Fast Refresh to swap: it exists only for client modules. The bundler replaces the server chunk, the cached module is dropped, and the HMR socket says "server components changed". The HMR client asks the router to refresh inside a transition; the server renders again and the Flight is merged like a navigation patch, so Client Components keep their state. Only a page in an error state reloads.',
    replays: [{ journey: 'dev-mode', step: 13 }, { journey: 'dev-mode', step: 14 }, { journey: 'dev-mode', step: 15 }]
  },
  {
    id: 'r10', source: 'reviewer', type: 'choice', title: 'What a custom server replaces',
    prompt: 'A custom server.js calls handle(req, res) for /dashboard/settings. Which statement is true?',
    options: [
      'The request climbs the same ladder (headers, redirects, Proxy, filesystem…) and render-server renders it as under next start',
      'server.js replaces router-server, so redirects and Proxy no longer run',
      'server.js renders React itself and Next.js only supplies the bundles',
      'The request skips Proxy because the custom server already matched it'
    ],
    answer: 0, highlight: ['custom-server', 'custom-handle', 'routing-ladder', 'proxy', 'loader-tree'],
    why: 'A custom server is a ring around the entry, not a replacement for what is inside it. It owns the socket and decides whether to call handle; once it does, the request enters the same machine: configured headers and redirects, Proxy, the filesystem check, then render-server, for App Router and Pages Router routes alike. Only what server.js answers on its own, before handle, is invisible to Next.js.',
    replays: [{ journey: 'custom-server', step: 4 }, { journey: 'custom-server', step: 8 }]
  },

  // ---------- one scenario per journey ----------
  {
    id: 's0', source: 'scenario', journey: 'whole-lifecycle', type: 'entities', title: 'What crosses as code',
    prompt: 'First load of /dashboard/settings. Which of these source modules reach the browser as code, not only as rendered output?',
    candidates: ['src-root-layout', 'src-dashboard-layout', 'src-settings-page', 'src-dashboard-nav', 'src-profile-form', 'src-account-summary', 'src-actions'],
    answer: ['src-dashboard-nav', 'src-profile-form'],
    why: 'Only modules behind a "use client" boundary have their implementation in browser chunks. The layouts, SettingsPage and AccountSummary run on the server and arrive as Flight rows and HTML: data, not code. actions.ts is a "use server" file; the browser holds only the action ID, never the function.',
    replays: [{ journey: 'whole-lifecycle', step: 8 }, { journey: 'whole-lifecycle', step: 9 }]
  },
  {
    id: 's1', source: 'scenario', journey: 'production-build', type: 'entities', title: 'A standalone folder',
    prompt: 'You set output: \'standalone\' and run next build. Which build entities decide which files end up in .next/standalone and put them there?',
    candidates: ['route-discovery', 'bundler', 'split-chunks', 'route-analysis', 'prerender', 'tracing', 'standalone'],
    answer: ['tracing', 'standalone'],
    why: 'File tracing starts at each server entry and follows every require and file read statically, producing the minimal list of files the route needs at runtime. Standalone output copies exactly those files, plus a small server of its own, into one folder that runs with plain Node. The bundler and the chunk policy produce the chunks but do not decide what is deployed; static assets and public/ are copied next to it by the deploy step.',
    replays: [{ journey: 'production-build', step: 15 }, { journey: 'production-build', step: 16 }]
  },
  {
    id: 's2', source: 'scenario', journey: 'request-routing', type: 'entities', title: 'The ladder for a page',
    prompt: 'A signed-in GET /dashboard/settings arrives under next start. Which ladder steps run before the request is handed to render-server?',
    candidates: ['rung-headers', 'rung-redirects', 'proxy', 'rung-before-files', 'rung-filesystem', 'rung-after-files', 'rung-dynamic', 'rung-fallback'],
    answer: ['rung-headers', 'rung-redirects', 'proxy', 'rung-before-files', 'rung-filesystem'],
    why: 'The first five steps run in order: configured headers, configured redirects, Proxy (formerly Middleware; its matcher covers /dashboard, and since Next.js 16 it runs on Node by default), beforeFiles rewrites and the filesystem check, which matches the app route. afterFiles rewrites, dynamic routes and fallback rewrites only matter when nothing has matched yet, so they are skipped.',
    replays: [{ journey: 'request-routing', step: 5 }, { journey: 'request-routing', step: 7 }, { journey: 'request-routing', step: 8 }]
  },
  {
    id: 's3', source: 'scenario', journey: 'pages-initial', type: 'entities', title: 'Server-only in the Pages Router',
    prompt: 'First load of /products/42, a Pages Router page. Which of these stay on the server and never run in the browser?',
    candidates: ['gssp', 'gip', 'pages-document', 'pages-app', 'pages-product-page', 'next-data'],
    answer: ['gssp', 'pages-document'],
    why: 'getServerSideProps is cut out of the browser chunk at build time and runs only on the server, with the request. _document builds the HTML shell on the server and never renders again. _app and ProductPage ship as code and hydrate as one whole tree; __NEXT_DATA__ carries the props a second time so hydration can reuse them; getInitialProps has to ship too, because it runs in the browser on later client navigations.',
    replays: [{ journey: 'pages-initial', step: 3 }, { journey: 'pages-initial', step: 5 }, { journey: 'pages-initial', step: 8 }, { journey: 'pages-initial', step: 12 }]
  },
  {
    id: 's4', source: 'scenario', journey: 'pages-navigation', type: 'choice', title: 'prefetch={false} in Pages',
    prompt: 'In the Pages Router, a <Link href="/posts/7" prefetch={false}> scrolls into view and you then hover it. What is prefetched?',
    options: [
      'Nothing, neither on scroll nor on hover',
      'Nothing on scroll; the page chunk and its JSON on hover',
      'The page chunk and its JSON on scroll; nothing on hover',
      'The page chunk and its JSON on scroll, and again on hover'
    ],
    answer: 1, highlight: ['pages-prefetch', 'pages-router', 'pages-data-endpoint', 'browser-chunks'],
    why: 'prefetch={false} turns off only the viewport prefetch. Hover prefetching is a separate path that does not consult the Set of prefetched URLs, so it still fetches the chunk and, for a getStaticProps page like /posts/7, its JSON. The only way to avoid it in the Pages Router is a plain <a> or moving the route to the App Router.',
    replays: [{ journey: 'pages-navigation', step: 1 }, { journey: 'pages-navigation', step: 2 }]
  },
  {
    id: 's5', source: 'scenario', journey: 'app-initial', type: 'entities', title: 'Who runs DashboardNav',
    prompt: 'First load of /dashboard/settings. Which entities execute DashboardNav\'s component code?',
    candidates: ['rsc-runtime-entity', 'ssr-runtime-entity', 'react-client', 'flight-tee', 'loader-tree', 'client-reference-manifest'],
    answer: ['ssr-runtime-entity', 'react-client'],
    why: 'The RSC runtime never runs a Client Component: it looks DashboardNav up in the client-reference manifest and writes a reference plus its props. The SSR runtime meets that reference while consuming its copy of the stream, loads the real module from the ssr layer and renders it, so the nav is in the HTML. In the tab, the React client runtime runs it again to hydrate it. The tee only splits bytes and the loader tree only describes segments.',
    replays: [{ journey: 'app-initial', step: 8 }, { journey: 'app-initial', step: 12 }, { journey: 'app-initial', step: 19 }]
  },
  {
    id: 's6', source: 'scenario', journey: 'app-navigation', type: 'choice', title: 'Back to a cached page',
    prompt: 'After navigating to /dashboard/billing you press Back. The tree and segments of /dashboard/settings are still fresh in the client cache. What does the server do?',
    options: [
      'Nothing: no request is sent; the router restores the tree and swaps the slot from the client cache',
      'It renders SettingsPage again and sends a patch',
      'It sends the full HTML document for /dashboard/settings',
      'It re-runs the shared layouts, then SettingsPage'
    ],
    answer: 0, highlight: ['route-cache', 'segment-cache', 'app-router', 'browser-history'],
    why: 'The history entry holds the route tree and the Segment Cache still holds the segments it was built from, so the navigation completes with no request and no server work. A Link click to a dynamic page would refetch instead, because dynamic entries are stale immediately by default; staleTimes or cacheLife.stale change that. With cacheComponents, React\'s <Activity> also keeps the previous route mounted but hidden, so its state survives back and forward.',
    replays: [{ journey: 'app-navigation', step: 13 }, { journey: 'app-navigation', step: 15 }]
  },
  {
    id: 's7', source: 'scenario', journey: 'server-actions', type: 'entities', title: 'From an ID to a function',
    prompt: 'The ProfileForm POST carries a Next-Action header with the ID 603a9c1e2b44…. Which artifacts does the action handler use to turn that ID into a function it can run?',
    candidates: ['server-reference-manifest', 'client-reference-manifest', 'routes-manifest', 'middleware-manifest', 'server-chunks', 'browser-chunks'],
    answer: ['server-reference-manifest', 'server-chunks'],
    why: 'The browser only ever holds the ID that the compiler assigned at build time. The handler looks it up in the server-reference manifest and loads the module from the server chunks to resolve the export. An ID that is not there, for example from a form rendered by an older deploy, is rejected before any code runs ("Failed to find Server Action"). There is no fallback and no guessing.',
    replays: [{ journey: 'server-actions', step: 2 }, { journey: 'server-actions', step: 8 }]
  },
  {
    id: 's8', source: 'scenario', journey: 'caching', type: 'entities', title: 'What updateTag expires',
    prompt: 'updateProfile calls updateTag("profile"). Which server-side stores have tagged entries expired right away, in this request?',
    candidates: ['request-memo', 'data-cache', 'server-cache', 'image-cache', 'next-cache-dir'],
    answer: ['data-cache', 'server-cache'],
    why: 'Tags are attached to "use cache" entries and to cached routes, and updateTag, which only works inside Server Actions, expires both immediately so the action can read its own write. Request memoization ends with the request anyway; the image and build caches are keyed by their inputs, not by tags. revalidateTag("profile", "max") would instead mark the same entries stale-while-revalidate.',
    replays: [{ journey: 'server-actions', step: 12 }, { journey: 'caching', step: 18 }]
  },
  {
    id: 's9', source: 'scenario', journey: 'dev-mode', type: 'entities', title: 'Editing a Client Component',
    prompt: 'next dev is running and DashboardNav\'s menu is open. You save DashboardNav.tsx. Which entities apply the new code inside the tab?',
    candidates: ['dev-watcher', 'dev-turbopack', 'dev-hmr', 'dev-hmr-client', 'dev-fast-refresh', 'app-router', 'rsc-runtime-entity'],
    answer: ['dev-hmr-client', 'dev-fast-refresh'],
    why: 'The watcher and Turbopack rebuild the module on the server side and the HMR socket carries it, but they only deliver it. In the tab the HMR client receives the update and Fast Refresh finds the mounted DashboardNav by its ID; the hook signature is unchanged, so it re-renders with the new code and open stays true. No RSC payload and no router refresh are involved.',
    replays: [{ journey: 'dev-mode', step: 9 }, { journey: 'dev-mode', step: 11 }, { journey: 'dev-mode', step: 12 }]
  },
  {
    id: 's10', source: 'scenario', journey: 'custom-server', type: 'entities', title: 'A health check',
    prompt: 'server.js answers GET /healthz itself, before it would call handle. Which entities take part in that response?',
    candidates: ['custom-server', 'custom-healthz', 'custom-handle', 'routing-ladder', 'rung-headers', 'proxy', 'loader-tree'],
    answer: ['custom-server', 'custom-healthz'],
    why: 'server.js owns the socket and writes the answer without calling handle, so the request never enters the machine inside the ring: no configured headers, no Proxy, no manifests, no render. Anything Proxy enforces, such as a session check, does not apply to a request answered this way.',
    replays: [{ journey: 'custom-server', step: 6 }, { journey: 'custom-server', step: 7 }]
  },
  {
    id: 's11', source: 'scenario', journey: 'optimizations', type: 'entities', title: 'One image, one width',
    prompt: 'The browser picks the 640-pixel entry from a next/image srcset and requests it. Which entities produce or store that variant?',
    candidates: ['next-image', 'image-optimizer', 'sharp', 'image-cache', 'public-dir', 'rsc-runtime-entity', 'server-cache'],
    answer: ['image-optimizer', 'sharp', 'image-cache'],
    why: '/_next/image is an early exit in router-server: the optimizer resizes the original with sharp, picks the format from the Accept header and stores the result in .next/cache/images, keyed by URL, width, quality and format. React never runs. next/image only reserves the box and lists the widths; public/ holds the original. Since Next.js 16 the defaults are a 4-hour minimum cache TTL and qualities [75].',
    replays: [{ journey: 'optimizations', step: 7 }, { journey: 'request-routing', step: 12 }]
  }
]
