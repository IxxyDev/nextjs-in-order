// src/domain/entities.ts
import type { Entity } from './types'

const DOCS = 'https://nextjs.org/docs/app'

export const ENTITIES: Entity[] = [
  // ---------- Source ----------
  {
    id: 'src-root-layout', short: 'app/layout.tsx', name: 'app/layout.tsx', region: 'source', glyph: 'source-module', x: 160, y: 90,
    phase: ['build', 'request'], env: ['node'], role: 'module',
    what: 'Root layout, a Server Component. Renders <html> and <body> and wraps every route.',
    consumes: ['props from the loader tree', 'lib/data.ts'], produces: ['React elements → Flight rows'],
    exists: 'source at build time; executed per request in the RSC runtime', connects: ['loader-tree'], reaches: 'data'
  },
  {
    id: 'src-dashboard-layout', short: 'dashboard/layout.tsx', name: 'app/dashboard/layout.tsx', region: 'source', glyph: 'source-module', x: 160, y: 240,
    phase: ['build', 'request'], env: ['node'], role: 'module',
    what: 'Shared dashboard layout, a Server Component. Renders <DashboardNav /> and a slot for the child segment.',
    consumes: ['children slot'], produces: ['React elements → Flight rows', 'a LayoutRouter boundary for its child'],
    exists: 'source at build time; executed per request', connects: ['loader-tree'], reaches: 'data'
  },
  {
    id: 'src-settings-page', short: 'settings/page.tsx', name: 'app/dashboard/settings/page.tsx', region: 'source', glyph: 'source-module', x: 160, y: 390,
    phase: ['build', 'request'], env: ['node'], role: 'module',
    what: 'Async Server Component page. Awaits getProfile() and renders <AccountSummary /> and <ProfileForm />.',
    consumes: ['getProfile() from lib/data.ts'], produces: ['React elements → Flight rows'],
    exists: 'source at build time; executed per request', connects: ['loader-tree'], reaches: 'data'
  },
  {
    id: 'src-billing-page', short: 'billing/page.tsx', name: 'app/dashboard/billing/page.tsx', region: 'source', glyph: 'source-module', x: 160, y: 540,
    phase: ['build', 'request'], env: ['node'], role: 'module',
    what: 'Async Server Component page with a Suspense boundary around <InvoiceList />, which reads cookies().',
    consumes: ['getInvoices()', 'cookies()'], produces: ['static shell + a dynamic hole'],
    exists: 'source at build time; executed per request', connects: ['loader-tree'], reaches: 'data'
  },
  {
    id: 'src-dashboard-nav', short: 'DashboardNav.tsx', name: 'components/DashboardNav.tsx', region: 'source', glyph: 'source-module', x: 340, y: 90,
    badge: '"use client"', phase: ['build', 'request', 'browser'], env: ['node', 'browser'], role: 'module',
    what: 'Client Component with useState(open) and usePathname(). Its implementation ships to the browser.',
    consumes: ['props from DashboardLayout'], produces: ['a client reference on the server', 'DOM + state in the browser'],
    exists: 'build: compiled twice (ssr layer and browser layer); request: rendered by SSR; browser: hydrated',
    connects: ['client-reference-manifest', 'browser-chunks'], reaches: 'code'
  },
  {
    id: 'src-profile-form', short: 'ProfileForm.tsx', name: 'components/ProfileForm.tsx', region: 'source', glyph: 'source-module', x: 340, y: 240,
    badge: '"use client"', phase: ['build', 'request', 'browser'], env: ['node', 'browser'], role: 'module',
    what: 'Client Component that calls the updateProfile Server Action through useActionState.',
    consumes: ['updateProfile reference'], produces: ['form submission → POST with Next-Action'],
    exists: 'build, request (SSR), browser (hydrated)', connects: ['client-reference-manifest', 'browser-chunks', 'action-handler'], reaches: 'code'
  },
  {
    id: 'src-account-summary', short: 'AccountSummary.tsx', name: 'components/AccountSummary.tsx', region: 'source', glyph: 'source-module', x: 340, y: 390,
    phase: ['build', 'request'], env: ['node'], role: 'module',
    what: 'Server Component that shows profile fields. Its source never reaches the browser; only its rendered rows do.',
    consumes: ['profile data'], produces: ['Flight rows'], exists: 'build; executed per request', connects: ['loader-tree'], reaches: 'data'
  },
  {
    id: 'src-actions', short: 'actions.ts', name: 'app/actions.ts', region: 'source', glyph: 'source-module', x: 340, y: 540,
    badge: '"use server"', phase: ['build', 'request'], env: ['node'], role: 'module',
    what: 'updateProfile(formData): mutates the database, then updateTag("profile"). Gets a stable action ID at build.',
    consumes: ['serialized form data'], produces: ['return value', 'cache invalidation'],
    exists: 'build; executed per POST', connects: ['server-reference-manifest', 'action-handler'], reaches: 'no'
  },
  {
    id: 'public-dir', short: 'public/', name: 'public/ · files served as-is', region: 'source', glyph: 'source-module', x: 420, y: 625,
    phase: ['build', 'startup', 'request'], env: ['storage'], role: 'artifact',
    what: 'Static files such as public/logo.svg and public/hero.jpg. They are not compiled; router-server lists them at startup and serves a match straight from disk at the filesystem step.',
    consumes: ['files copied at deploy'], produces: ['bytes served under the same path (/logo.svg)'],
    exists: 'per deploy', connects: ['early-exits'], reaches: 'data',
    sources: [{ label: 'public folder', url: `${DOCS}/api-reference/file-conventions/public-folder` }]
  },

  // ---------- Build ----------
  {
    id: 'next-build', short: 'next build', name: 'next build · pipeline', region: 'build', glyph: 'process', x: 600, y: 110, badge: 'Node',
    phase: ['build'], env: ['node'], role: 'process',
    what: 'Runs the production pipeline in a fixed order: buildId, config, route discovery, compile and bundle, trace, analyze, prerender, standalone, summary. Ends by printing the ○ ● ƒ route tree.',
    consumes: ['source tree', 'next.config.js'], produces: ['.next/', 'build summary'],
    exists: 'one run per deploy', connects: ['route-discovery', 'bundler', 'route-analysis', 'tracing'], reaches: 'no',
    internals: ['buildId k7Qm2xLp9 → .next/BUILD_ID', 'next.config.js loaded once; redirects, rewrites and headers resolved before routes are written', 'packages/next/src/build/index.ts'],
    sources: [{ label: 'next build (CLI)', url: `${DOCS}/api-reference/cli/next` }]
  },
  {
    id: 'route-discovery', short: 'Route discovery', name: 'Route discovery · app/ + pages/ walk', region: 'build', glyph: 'segment', x: 900, y: 110,
    phase: ['build', 'dev'], env: ['node'], role: 'route-description',
    what: 'Walks app/ and pages/ and turns folders and special files into a route map and one loader tree per app route. The route map is what the bundler uses as entrypoints.',
    consumes: ['app/ and pages/ folders'], produces: ['route map → routes-manifest', 'loader trees', 'bundler entrypoints'],
    exists: 'build (prod); continuous through the watcher in dev', connects: ['routes-manifest', 'loader-tree', 'bundler'], reaches: 'no',
    internals: ['/dashboard/settings → ["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]', 'pages routes: /products/[id], /posts/[id], /api/hello'],
    sources: [{ label: 'Project structure', url: `${DOCS}/getting-started/project-structure` }]
  },
  {
    id: 'swc', short: 'SWC', name: 'SWC compiler', region: 'build', glyph: 'machine', x: 600, y: 330, badge: 'Rust',
    phase: ['build', 'dev'], env: ['rust', 'node-worker'], role: 'compiler',
    what: 'Transforms one file at a time: strips types, compiles JSX, downlevels, minifies, marks "use client" and assigns "use server" IDs. Never sees the module graph.',
    consumes: ['one .ts/.tsx/.js module'], produces: ['one transformed module'],
    exists: 'build and dev, per file', connects: [], reaches: 'no',
    internals: ['@next/swc-<platform> via N-API, WASM fallback', 'transforms: serverComponents, serverActions, optimizePackageImports, react-refresh (dev, client layer)'],
    sources: [{ label: 'Next.js compiler', url: `${DOCS}/architecture/nextjs-compiler` }]
  },
  {
    id: 'bundler', short: 'Bundler', name: 'Bundler · Turbopack (Webpack via --webpack)', region: 'build', glyph: 'machine', x: 900, y: 330, badge: 'Rust',
    phase: ['build', 'dev'], env: ['rust', 'node'], role: 'bundler',
    what: 'Walks imports from every entrypoint, builds the module graph, assigns layers, splits chunks per target and emits manifests. Sees the whole application.',
    consumes: ['entrypoints', 'transformed modules'], produces: ['server chunks', 'browser chunks', 'manifests'],
    exists: 'build; long-lived object in dev', connects: ['layers', 'client-reference-manifest', 'browser-chunks', 'server-chunks'], reaches: 'no',
    versionNote: {
      article: 'Webpack was the long-time default; Turbopack "became default in 16".',
      current: 'Turbopack is the default for next dev and next build since 16.0; Webpack stays available with --webpack.',
      why: 'The three-compiler stitching model belongs to Webpack; Turbopack uses one unified graph.'
    },
    sources: [{ label: 'Turbopack', url: `${DOCS}/api-reference/turbopack` }]
  },
  {
    id: 'layers', short: 'Layers', name: 'Bundler layers · rsc / ssr / app-pages-browser', region: 'build', glyph: 'runtime', x: 1150, y: 330,
    phase: ['build'], env: ['node'], role: 'bundler',
    what: 'A label on every module that decides resolution conditions and loaders. The rsc layer activates the react-server condition, so import "react" resolves to the server build without useState.',
    consumes: ['module + how it was reached'], produces: ['resolution rules per module'],
    exists: 'build', connects: ['rsc-runtime-entity'], reaches: 'no',
    internals: ['WEBPACK_LAYERS_NAMES: shared, rsc, ssr, action-browser, api-node, api-edge, middleware, instrument, edge-asset, app-pages-browser, pages-dir-*']
  },
  {
    id: 'route-analysis', short: 'Route analysis', name: 'Route analysis', region: 'build', glyph: 'machine', x: 1450, y: 190,
    phase: ['build'], env: ['node'], role: 'route-description',
    what: 'Classifies every route: static ○, SSG ●, dynamic ƒ, ISR, or a PPR shell with dynamic holes, from exports, dynamic API usage and "use cache".',
    consumes: ['route modules'], produces: ['strategy per route', 'build summary tree'],
    exists: 'build', connects: ['prerender', 'prerender-manifest'], reaches: 'no'
  },
  {
    id: 'prerender', short: 'Prerender', name: 'Prerender', region: 'build', glyph: 'machine', x: 1450, y: 470,
    phase: ['build'], env: ['node'], role: 'renderer',
    what: 'Renders static routes at build time with the same RSC and SSR runtimes, storing HTML, RSC payload and PPR shells.',
    consumes: ['static routes'], produces: ['prerendered outputs'],
    exists: 'build; again on ISR regeneration', connects: ['prerendered-outputs', 'server-cache'], reaches: 'data'
  },
  {
    id: 'tracing', short: 'Tracing', name: 'File tracing', region: 'build', glyph: 'machine', x: 1650, y: 330,
    phase: ['build'], env: ['node'], role: 'artifact',
    what: 'Statically finds the minimal file set each server entry needs, so output: "standalone" can ship without the whole node_modules.',
    consumes: ['server entries'], produces: ['.nft.json lists', '.next/standalone'],
    exists: 'build', connects: ['standalone'], reaches: 'no',
    internals: ['@vercel/nft', '.next/server/app/dashboard/settings/page.js.nft.json'],
    sources: [{ label: 'output: standalone', url: `${DOCS}/api-reference/config/next-config-js/output` }]
  },
  {
    id: 'flight-client-entry-plugin', short: 'client entries', name: 'Client entry creation · flight-client-entry-plugin', region: 'build', glyph: 'machine', x: 740, y: 540,
    phase: ['build', 'dev'], env: ['node'], role: 'bundler',
    what: 'For each server entry, creates a matching browser entry at every "use client" boundary it reaches. That is how ProfileForm gets into a browser chunk although the page that imports it never ships.',
    consumes: ['module graph per server entry'], produces: ['browser entries at client boundaries'],
    exists: 'build; per compilation in dev', connects: ['split-chunks', 'flight-manifest-plugin'], reaches: 'no',
    internals: ['next/src/build/webpack/plugins/flight-client-entry-plugin.ts', 'entry name: app/dashboard/settings/page → client entry with ./components/ProfileForm.tsx'],
    versionNote: {
      article: 'Webpack plugins create the client entries and the client-reference manifest.',
      current: 'Still the --webpack path. Turbopack, the default since 16.0, does the same inside its unified graph and emits the same manifests.',
      why: 'The step is the same in both bundlers; only the plugin name belongs to Webpack.'
    },
    sources: [{ label: 'Turbopack', url: `${DOCS}/api-reference/turbopack` }]
  },
  {
    id: 'split-chunks', short: 'splitChunks', name: 'Chunk policy · splitChunks', region: 'build', glyph: 'machine', x: 1000, y: 540,
    phase: ['build'], env: ['node'], role: 'bundler',
    what: 'Decides how browser modules are grouped into files: one framework chunk for React and Next, lib chunks for large packages, a runtime chunk and one chunk per route segment.',
    consumes: ['browser module graph'], produces: ['framework, lib, runtime and route chunks'],
    exists: 'build', connects: ['browser-chunks'], reaches: 'no',
    internals: ['optimization.splitChunks.cacheGroups: framework, lib (node_modules package > ~160 KB)', 'framework-a1b2c3.js · webpack-9c0d.js · app/dashboard/settings/page-5e6f.js'],
    versionNote: {
      article: 'optimization.splitChunks with framework / lib / runtime groups.',
      current: 'That is the --webpack configuration. Turbopack applies its own chunking with the same goals: shared framework code, per-route chunks.',
      why: 'Chunk names and boundaries differ between bundlers; the idea of route-level splitting does not.'
    },
    sources: [{ label: 'Turbopack', url: `${DOCS}/api-reference/turbopack` }]
  },
  {
    id: 'flight-manifest-plugin', short: 'flight-manifest', name: 'Client reference writer · flight-manifest-plugin', region: 'build', glyph: 'machine', x: 1260, y: 540,
    phase: ['build', 'dev'], env: ['node'], role: 'bundler',
    what: 'Once chunks exist, writes one row per client module: its id, the chunk files that contain it and the export name. The RSC runtime will read these rows instead of running the module.',
    consumes: ['client entries', 'chunk graph'], produces: ['page_client-reference-manifest.js per route'],
    exists: 'build; per compilation in dev', connects: ['client-reference-manifest'], reaches: 'no',
    internals: ['next/src/build/webpack/plugins/flight-manifest-plugin.ts', '{ id: "(app-pages-browser)/./components/ProfileForm.tsx", chunks: ["app/dashboard/settings/page-5e6f"], name: "default" }']
  },
  {
    id: 'standalone', short: 'standalone', name: 'Standalone output · .next/standalone', region: 'build', glyph: 'server-chunk', x: 1650, y: 540, badge: 'Node',
    phase: ['build'], env: ['node', 'storage'], role: 'artifact',
    what: 'With output: "standalone", copies only the traced files, a minimal node_modules subset and its own server.js into one folder that runs with node server.js.',
    consumes: ['traced file lists'], produces: ['.next/standalone/'],
    exists: 'per deploy', connects: [], reaches: 'no',
    internals: ['.next/standalone/server.js', 'public/ and .next/static are not copied; the deploy step adds them', 'custom server files are not traced'],
    sources: [{ label: 'output: standalone', url: `${DOCS}/api-reference/config/next-config-js/output` }]
  },

  // ---------- Artifact shelf ----------
  {
    id: 'routes-manifest', short: 'routes-manifest', name: 'routes-manifest.json', region: 'artifacts', glyph: 'manifest', x: 110, y: 740,
    phase: ['build', 'startup'], env: ['storage', 'node'], role: 'manifest',
    what: 'Static and dynamic routes with regexes and priority, plus redirects, rewrites and headers from next.config.',
    consumes: ['route discovery', 'next.config'], produces: ['the routing table router-server loads at startup'],
    exists: 'per deploy', connects: ['routing-ladder'], reaches: 'no'
  },
  {
    id: 'pages-manifest', short: 'pages-manifest', name: 'pages-manifest.json · app-paths-manifest.json', region: 'artifacts', glyph: 'manifest', x: 292, y: 740,
    phase: ['build', 'request'], env: ['storage', 'node'], role: 'manifest',
    what: 'Route → compiled server module path (or .html for a static page). render-server uses it to require the right route module.',
    consumes: ['route map', 'server build'], produces: ['route module lookup'], exists: 'per deploy', connects: ['server-chunks'], reaches: 'no',
    internals: ['"/products/[id]": "pages/products/[id].js"', '"/dashboard/settings/page": "app/dashboard/settings/page.js"']
  },
  {
    id: 'build-manifest', short: 'build-manifest', name: 'build-manifest.json', region: 'artifacts', glyph: 'manifest', x: 474, y: 740,
    phase: ['build', 'request'], env: ['storage', 'node'], role: 'manifest',
    what: 'Route → browser chunk files. Used to emit <script> tags; a browser copy ships as _buildManifest.js.',
    consumes: ['client chunk graph'], produces: ['script tag lists'], exists: 'per deploy', connects: ['browser-chunks'], reaches: 'data'
  },
  {
    id: 'prerender-manifest', short: 'prerender-manifest', name: 'prerender-manifest.json', region: 'artifacts', glyph: 'manifest', x: 656, y: 740,
    phase: ['build', 'startup'], env: ['storage', 'node'], role: 'manifest',
    what: 'Which routes were prerendered, their revalidate and expire seconds, fallback mode and data routes.',
    consumes: ['route analysis'], produces: ['ISR decisions'], exists: 'per deploy', connects: ['server-cache'], reaches: 'no'
  },
  {
    id: 'middleware-manifest', short: 'middleware-manifest', name: 'middleware-manifest.json', region: 'artifacts', glyph: 'manifest', x: 838, y: 740,
    phase: ['build', 'startup'], env: ['storage', 'node'], role: 'manifest',
    what: 'Proxy matchers compiled to regexes plus header and cookie conditions.',
    consumes: ['proxy.ts config'], produces: ['ladder step 3 decision input'], exists: 'per deploy', connects: ['proxy'], reaches: 'no'
  },
  {
    id: 'client-reference-manifest', short: 'client-ref manifest', name: 'page_client-reference-manifest.js', region: 'artifacts', glyph: 'manifest', x: 1020, y: 740,
    phase: ['build', 'request'], env: ['storage', 'node'], role: 'manifest',
    what: 'Client module id → browser chunks and export names. The RSC runtime reads it whenever it meets a "use client" boundary.',
    consumes: ['flight-client-entry-plugin output'], produces: ['{ id, chunks, name } references placed into Flight'],
    exists: 'per deploy', connects: ['rsc-runtime-entity', 'browser-chunks'], reaches: 'no',
    internals: ['{ id: "(app-pages-browser)/./components/DashboardNav.tsx", chunks: ["app/dashboard/layout-3c4d"], name: "default" }']
  },
  {
    id: 'server-reference-manifest', short: 'server-ref manifest', name: 'server-reference-manifest', region: 'artifacts', glyph: 'manifest', x: 1202, y: 740,
    phase: ['build', 'request'], env: ['storage', 'node'], role: 'manifest',
    what: 'Action ID → server module and export. Unknown IDs from an old deploy are rejected before anything runs.',
    consumes: ['serverActions transform'], produces: ['action lookup'], exists: 'per deploy', connects: ['action-handler'], reaches: 'no'
  },
  {
    id: 'server-chunks', short: 'server chunks', name: 'server chunks · .next/server/app/…', region: 'artifacts', glyph: 'server-chunk', x: 1384, y: 740, badge: 'Node',
    phase: ['build', 'request'], env: ['storage', 'node'], role: 'artifact',
    what: 'Executable route modules for the Node target, loaded with require by render-server.',
    consumes: ['server target build'], produces: ['route modules'], exists: 'per deploy; dev: evicted from the require cache on server edits', connects: ['loader-tree'], reaches: 'no'
  },
  {
    id: 'browser-chunks', short: 'browser chunks', name: 'browser chunks · .next/static/chunks/…', region: 'artifacts', glyph: 'browser-chunk', x: 1566, y: 740, badge: 'browser',
    phase: ['build', 'browser'], env: ['storage', 'browser'], role: 'artifact',
    what: 'Framework, lib, runtime, route and dynamic-import chunks. Content-hashed and cached for a year. The only build output that executes in the browser.',
    consumes: ['client target build'], produces: ['executable modules in the browser'], exists: 'per deploy', connects: ['client-components'], reaches: 'code',
    internals: ['framework-a1b2c3.js', 'main-app-d4e5f6.js', 'app/dashboard/layout-3c4d.js (DashboardNav)', 'app/dashboard/settings/page-5e6f.js (ProfileForm)']
  },
  {
    id: 'prerendered-outputs', short: 'prerendered', name: 'prerendered .html / .rsc / shells', region: 'artifacts', glyph: 'html', x: 1748, y: 740,
    phase: ['build', 'request'], env: ['storage'], role: 'artifact',
    what: 'Per static route: HTML, RSC payload, per-segment prefetch files and PPR static shell. Seeds the server cache.',
    consumes: ['prerender'], produces: ['initial server cache entries'], exists: 'until ISR regenerates', connects: ['server-cache'], reaches: 'data'
  },
  {
    id: 'next-cache-dir', short: '.next/cache', name: '.next/cache', region: 'artifacts', glyph: 'cache', x: 1930, y: 740, badge: 'fs',
    phase: ['build', 'request'], env: ['storage'], role: 'cache',
    what: 'Persistent directory: bundler filesystem cache across builds, optimized images, and the default store for the server cache.',
    consumes: ['bundler results', 'optimized images', 'rendered routes'], produces: ['reuse across builds and restarts'],
    exists: 'across builds and process restarts', connects: ['image-cache', 'server-cache', 'bundler'], reaches: 'no',
    internals: ['build cache key: module / task inputs; value: transformed modules and turbo-tasks results', 'skipped with --no-cache or a CI job that does not restore the directory', 'images/ holds the optimizer cache; the server cache writes here unless a cacheHandler is configured'],
    versionNote: {
      article: 'A Webpack filesystem cache, plus Turbopack caching in dev.',
      current: 'Turbopack is the default bundler and its persistent filesystem cache is on by default for next dev and next build (16.3).',
      why: 'A second build reuses unchanged work, so keeping .next/cache between CI runs matters.'
    },
    sources: [{ label: 'turbopackFileSystemCache', url: `${DOCS}/api-reference/config/next-config-js/turbopackFileSystemCache` }, { label: 'Next.js 16.3', url: 'https://nextjs.org/blog/next-16-3' }]
  },

  // ---------- HTTP entry ----------
  {
    id: 'node-http', short: 'Node HTTP', name: 'Node HTTP server · one (req, res) callback', region: 'http-entry', glyph: 'machine', x: 170, y: 940, badge: 'Node',
    phase: ['startup', 'request'], env: ['node'], role: 'transport',
    what: 'next start creates a plain http.createServer with a single handler. It starts listening before initialization finishes; early requests wait.',
    consumes: ['socket'], produces: ['calls into router-server'], exists: 'process lifetime', connects: ['routing-ladder'], reaches: 'no'
  },
  {
    id: 'request-queue', short: 'Early requests', name: 'Early requests · queued until ready', region: 'http-entry', glyph: 'request', x: 170, y: 1060,
    phase: ['startup'], env: ['node'], role: 'transport',
    what: 'The socket accepts connections before router-server has finished loading. Requests that arrive in that window wait and are handled once initialization completes.',
    consumes: ['requests during startup'], produces: ['the same requests, released to router-server'], exists: 'startup only', connects: ['node-http', 'routing-ladder'], reaches: 'no',
    internals: ['packages/next/src/server/lib/start-server.ts: listen first, then await the request handler'],
    sources: [{ label: 'next start', url: `${DOCS}/api-reference/cli/next` }]
  },
  {
    id: 'custom-server', short: 'server.js', name: 'server.js · custom server ring', region: 'http-entry', glyph: 'process', x: 220, y: 1180,
    phase: ['startup', 'request'], env: ['node'], role: 'process',
    what: 'Optional wrapper that owns the socket and calls handle(req, res, parsedUrl?). It wraps router-server; it never replaces it.',
    consumes: ['req, res'], produces: ['handle() calls'], exists: 'process lifetime; not compiled or watched by Next', connects: ['routing-ladder', 'custom-handle', 'custom-healthz'], reaches: 'no',
    internals: ['const app = next({ dev }); await app.prepare(); const handle = app.getRequestHandler()', 'createServer((req, res) => handle(req, res, parse(req.url, true))).listen(3000)', 'not traced by output: \'standalone\'; output: \'export\' has no server'],
    sources: [{ label: 'Custom server', url: `${DOCS}/guides/custom-server` }]
  },
  {
    id: 'custom-healthz', short: '/healthz', name: 'GET /healthz · answered by server.js', region: 'http-entry', glyph: 'response', x: 75, y: 1180,
    phase: ['request'], env: ['node'], role: 'transport',
    what: 'A response server.js writes itself without calling handle. Next.js never sees the request: no ladder, no Proxy, no manifests.',
    consumes: ['GET /healthz'], produces: ['200 ok'], exists: 'per request', connects: ['custom-server'], reaches: 'data',
    internals: ['if (pathname === "/healthz") { res.statusCode = 200; return res.end("ok") }'],
    sources: [{ label: 'Custom server', url: `${DOCS}/guides/custom-server` }]
  },

  // ---------- router-server ----------
  {
    id: 'custom-handle', short: 'handle()', name: 'handle(req, res, parsedUrl?) · app.getRequestHandler()', region: 'router-server', glyph: 'machine', x: 410, y: 920,
    phase: ['startup', 'request'], env: ['node'], role: 'router',
    what: 'The function a custom server gets from app.getRequestHandler(). It is router-server\'s own request handler: whatever is passed in climbs the same eight-step ladder as under next start.',
    consumes: ['req, res from server.js', 'optional parsedUrl (pathname, query)'], produces: ['the request on the routing ladder'],
    exists: 'created after app.prepare(); called per request', connects: ['custom-server', 'routing-ladder'], reaches: 'no',
    internals: ['a passed parsedUrl rebuilds req.url before routing', 'deprecated app.render() normalizes its arguments and calls the same requestHandler', 'packages/next/src/server/next.ts: NextCustomServer'],
    sources: [{ label: 'Custom server', url: `${DOCS}/guides/custom-server` }, { label: 'packages/next/src/server/next.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/server/next.ts' }]
  },
  {
    id: 'routing-ladder', short: 'Routing ladder', name: 'Routing ladder · 8 steps', region: 'router-server', glyph: 'machine', x: 620, y: 920,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'headers → redirects → Proxy → beforeFiles rewrites → filesystem check → afterFiles rewrites → dynamic routes → fallback rewrites. Most requests leave before React.',
    consumes: ['raw request', 'routing manifests loaded at startup'], produces: ['an early response or a resolved route for render-server'],
    exists: 'per request', connects: ['routes-manifest', 'proxy', 'early-exits', 'loader-tree'], reaches: 'no',
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'rung-headers', short: '1 headers', name: 'Ladder step 1 · config headers', region: 'router-server', glyph: 'machine', x: 410, y: 1040,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Headers from next.config.js whose source matches the path are added to the response. Nothing exits here; the request always climbs on.',
    consumes: ['request path'], produces: ['response headers (X-Frame-Options on /:path*)'], exists: 'per request', connects: ['routes-manifest', 'rung-redirects'], reaches: 'no',
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'rung-redirects', short: '2 redirects', name: 'Ladder step 2 · config redirects', region: 'router-server', glyph: 'machine', x: 550, y: 1040,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Redirects from next.config.js. A match ends the request here with a 307/308 and a Location header; Proxy never runs for it.',
    consumes: ['request path'], produces: ['redirect response, or continue'], exists: 'per request', connects: ['routes-manifest', 'proxy'], reaches: 'no',
    internals: ['redirects: /old-settings → /dashboard/settings (permanent: true → 308)'],
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'proxy', short: '3 Proxy', name: 'Proxy (formerly Middleware)', region: 'router-server', glyph: 'machine', x: 690, y: 1040, badge: 'Node',
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Ladder step 3. Runs proxy.ts for paths matching the manifest, encodes its decision (redirect, rewrite, headers, next) in response headers that router-server reads back.',
    consumes: ['matched request'], produces: ['decision headers'], exists: 'per matched request', connects: ['middleware-manifest'], reaches: 'no',
    versionNote: {
      article: 'Middleware always executes on the Edge runtime because it sits on the hot path.',
      current: 'Renamed proxy.ts in 16.0; runs on Node.js by default and the runtime cannot be configured. middleware.ts remains, deprecated, for Edge.',
      why: 'The ladder position is unchanged; the runtime badge is what moved.'
    },
    sources: [{ label: 'proxy.js', url: `${DOCS}/api-reference/file-conventions/proxy` }]
  },
  {
    id: 'rung-before-files', short: '4 beforeFiles', name: 'Ladder step 4 · beforeFiles rewrites', region: 'router-server', glyph: 'machine', x: 830, y: 1040,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Rewrites listed under beforeFiles run before any file or page is checked, so they can shadow both.',
    consumes: ['request path'], produces: ['rewritten path, or unchanged'], exists: 'per request', connects: ['routes-manifest', 'rung-filesystem'], reaches: 'no',
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'rung-filesystem', short: '5 filesystem', name: 'Ladder step 5 · filesystem check', region: 'router-server', glyph: 'machine', x: 410, y: 1150,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Checks the path against what is known to exist: build chunks under /_next/static, files in public/, the image endpoint and every page and handler route. A match exits here or is handed to render-server.',
    consumes: ['request path', 'page and file lists loaded at startup'], produces: ['static file, image request, or a resolved route'], exists: 'per request', connects: ['early-exits', 'image-optimizer', 'loader-tree', 'route-handler', 'public-dir'], reaches: 'no',
    internals: ['static routes match before dynamic ones: /dashboard/settings before /products/[id]', 'packages/next/src/server/lib/router-utils/filesystem.ts'],
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'rung-after-files', short: '6 afterFiles', name: 'Ladder step 6 · afterFiles rewrites', region: 'router-server', glyph: 'machine', x: 550, y: 1150,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Rewrites that apply only when no file or static page matched. They map the path to another one and the filesystem check is repeated.',
    consumes: ['unmatched path'], produces: ['rewritten path'], exists: 'per request', connects: ['routes-manifest', 'rung-dynamic'], reaches: 'no',
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'rung-dynamic', short: '7 dynamic', name: 'Ladder step 7 · dynamic routes', region: 'router-server', glyph: 'machine', x: 690, y: 1150,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'Dynamic routes such as /products/[id] are tried in priority order, using regexes from the routes manifest.',
    consumes: ['unmatched path'], produces: ['route + params'], exists: 'per request', connects: ['routes-manifest', 'rung-fallback'], reaches: 'no',
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'rung-fallback', short: '8 fallback', name: 'Ladder step 8 · fallback rewrites', region: 'router-server', glyph: 'machine', x: 830, y: 1150,
    phase: ['request'], env: ['node'], role: 'router',
    what: 'The last chance: fallback rewrites run after every page and dynamic route failed, typically to proxy to another app. After this comes the 404.',
    consumes: ['unmatched path'], produces: ['rewritten path, or 404'], exists: 'per request', connects: ['routes-manifest'], reaches: 'no',
    sources: [{ label: 'Execution order', url: `${DOCS}/api-reference/file-conventions/proxy#execution-order` }]
  },
  {
    id: 'early-exits', short: 'Early exits', name: 'Early exits · static, public/, image, handlers', region: 'router-server', glyph: 'machine', x: 410, y: 1265,
    phase: ['request'], env: ['node'], role: 'router',
    what: '/_next/static/* and public/* files are served from disk; /_next/image goes to the optimizer; Route Handlers and API Routes render without React.',
    consumes: ['filesystem check result'], produces: ['responses that never touch React'], exists: 'per request', connects: ['browser-chunks', 'public-dir', 'image-optimizer', 'route-handler'], reaches: 'data'
  },
  {
    id: 'image-optimizer', short: 'Image optimizer', name: 'Image optimizer · /_next/image', region: 'router-server', glyph: 'machine', x: 590, y: 1265, badge: 'sharp',
    phase: ['request'], env: ['node'], role: 'renderer',
    what: 'GET /_next/image?url=/hero.jpg&w=640&q=75 is answered here: the source is read, resized and re-encoded for the Accept header, and the result is cached on disk. React is never involved.',
    consumes: ['url, w, q', 'Accept header'], produces: ['resized, re-encoded image'], exists: 'per request; cache persists', connects: ['image-cache', 'public-dir'], reaches: 'data',
    internals: ['cache key /hero.jpg|640|75|webp in .next/cache/images', '16.0 defaults: minimumCacheTTL 4 h, qualities [75], local IPs blocked'],
    versionNote: {
      article: 'Cache keyed by url + width + quality.',
      current: 'Format is part of the key; 16.0 changed defaults (minimumCacheTTL 4 h, qualities [75], local IPs blocked, maximumRedirects 3).',
      why: 'The same URL can produce several cached files, one per format the browsers ask for.'
    },
    sources: [{ label: 'Image component', url: `${DOCS}/api-reference/components/image` }, { label: 'Upgrading to 16', url: `${DOCS}/guides/upgrading/version-16` }]
  },

  // ---------- render-server ----------
  {
    id: 'loader-tree', short: 'Loader tree', name: 'Loader tree · route segments', region: 'render-server', glyph: 'segment', x: 1030, y: 980,
    phase: ['build', 'request'], env: ['node'], role: 'route-description',
    what: 'Recursive [segment, parallelRoutes, modules] description of a route built from app/ folders. Rendering walks it root → dashboard → settings.',
    consumes: ['app/ folders and special files'], produces: ['the shape the RSC runtime renders and FlightRouterState mirrors'],
    exists: 'per deploy (dev: rebuilt by the watcher)', connects: ['rsc-runtime-entity', 'router-state-tree'], reaches: 'data',
    internals: ['["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]']
  },
  {
    id: 'rsc-runtime-entity', short: 'RSC runtime', name: 'RSC runtime', region: 'rsc-runtime', glyph: 'runtime', x: 1290, y: 980, badge: 'react-server',
    phase: ['build', 'request'], env: ['node'], role: 'runtime',
    what: 'The react-server build of React. Executes Server Components (async allowed), emits Flight rows, and replaces every "use client" component with a reference from the client-reference manifest. It cannot produce HTML.',
    consumes: ['loader tree', 'server modules', 'client-reference manifest'], produces: ['Flight stream'],
    exists: 'per request', connects: ['client-reference-manifest', 'flight'], reaches: 'data',
    internals: ['react.react-server.js via the react-server export condition', 'react-server-dom-webpack/server']
  },
  {
    id: 'flight', short: 'Flight', name: 'Flight · RSC payload', region: 'rsc-runtime', glyph: 'flight', x: 1480, y: 980,
    phase: ['request'], env: ['node', 'network', 'browser'], role: 'protocol',
    what: 'Numbered, streamable rows: rendered Server Component output, client references with props, the route structure and Suspense boundaries. Text rows with base64 rows for binary data.',
    consumes: ['RSC render'], produces: ['one copy for SSR, one copy inlined into HTML or sent alone on navigation'],
    exists: 'per response', connects: ['flight-tee', 'ssr-runtime-entity', 'next-f'], reaches: 'data',
    versionNote: {
      article: 'Described as a "special binary stream".',
      current: 'The wire format is line-oriented text; binary data travels as base64 rows (self.__next_f type 3).',
      why: 'Calling the whole payload "binary" hides that you can read it in DevTools.'
    }
  },
  {
    id: 'flight-tee', short: 'Tee', name: 'Stream tee', region: 'render-server', glyph: 'machine', x: 1660, y: 1085,
    phase: ['request'], env: ['node'], role: 'transport',
    what: 'Splits the Flight stream into two identical streams: one for the SSR runtime, one to inline as self.__next_f chunks.',
    consumes: ['Flight stream'], produces: ['two Flight streams'], exists: 'per document request', connects: ['ssr-runtime-entity', 'next-f'], reaches: 'no'
  },
  {
    id: 'ssr-runtime-entity', short: 'SSR runtime', name: 'SSR runtime', region: 'ssr-runtime', glyph: 'runtime', x: 1290, y: 1190, badge: 'react-dom/server',
    phase: ['build', 'request'], env: ['node'], role: 'runtime',
    what: 'Ordinary React. Deserializes the first Flight copy into elements, resolves client references to the real modules on the server and renders HTML with Suspense placeholders. It does not re-execute Server Component source.',
    consumes: ['Flight copy 1', 'Client Component modules (ssr layer)'], produces: ['HTML stream'],
    exists: 'per document request', connects: ['flight', 'html'], reaches: 'data'
  },
  {
    id: 'html', short: 'HTML', name: 'HTML document', region: 'ssr-runtime', glyph: 'html', x: 1480, y: 1190,
    phase: ['request', 'browser'], env: ['node', 'network', 'browser'], role: 'protocol',
    what: 'The streamed document: markup, Suspense placeholders, <script> tags for browser chunks and inline self.__next_f pushes.',
    consumes: ['SSR output', 'build-manifest chunk list', 'inline Flight'], produces: ['what the browser paints'],
    exists: 'per initial request', connects: ['dom', 'browser-chunks'], reaches: 'data'
  },
  {
    id: 'action-handler', short: 'Action handler', name: 'Server Action handler', region: 'render-server', glyph: 'action', x: 1030, y: 1220,
    phase: ['request'], env: ['node'], role: 'renderer',
    what: 'POST with Next-Action: looks the ID up in the server-reference manifest, decodes arguments, decrypts closures, runs the function, then may re-render the route in the same response.',
    consumes: ['Next-Action POST'], produces: ['Flight with a (return value) and optional f (re-rendered route)'],
    exists: 'per action', connects: ['server-reference-manifest', 'flight', 'data-cache'], reaches: 'data'
  },
  {
    id: 'route-handler', short: 'Route Handler', name: 'Route Handler and API Route wrappers', region: 'render-server', glyph: 'action', x: 1030, y: 1100,
    phase: ['request'], env: ['node', 'edge'], role: 'renderer',
    what: 'For router-server an endpoint is the same kind of exit as a page: render-server loads the module. A Route Handler gets a method table (GET, POST…) from route.ts; pages/api/hello.ts gets (req, res) with body parsing and res.json(). Neither runs React.',
    consumes: ['resolved route', 'Request or (req, res)'], produces: ['Response, e.g. { ok: true }'], exists: 'per request', connects: ['server-chunks', 'pages-manifest'], reaches: 'data',
    sources: [{ label: 'Route Handlers', url: `${DOCS}/api-reference/file-conventions/route` }, { label: 'API Routes', url: 'https://nextjs.org/docs/pages/building-your-application/routing/api-routes' }]
  },

  // ---------- Data sources and server caches ----------
  {
    id: 'db', short: 'Database', name: 'Database / APIs', region: 'data-caches', glyph: 'data-source', x: 150, y: 1395,
    phase: ['request', 'build'], env: ['storage'], role: 'data-source',
    what: 'Whatever Server Components, data functions and actions read and mutate.',
    consumes: ['queries', 'mutations'], produces: ['data'], exists: 'always', connects: [], reaches: 'no'
  },
  {
    id: 'server-cache', short: 'Server cache', name: 'Server cache · prerendered HTML + RSC', region: 'data-caches', glyph: 'cache', x: 500, y: 1395, badge: 'server store',
    phase: ['build', 'request'], env: ['storage', 'node'], role: 'cache',
    what: 'Key: route path + params. Value: HTML, RSC payload and meta (revalidate, tags). Miss → render and store; fresh → serve without React; stale → serve and regenerate in the background.',
    consumes: ['prerender', 'ISR regeneration'], produces: ['responses without rendering'],
    exists: 'until revalidate, expire or redeploy', connects: ['prerender-manifest', 'next-cache-dir'], reaches: 'data',
    internals: ['older docs: "Full Route Cache"; article: "incremental cache"', 'cacheHandler / cacheMaxMemorySize for self-hosting'],
    versionNote: {
      article: 'Called the incremental cache.',
      current: 'Current docs call it the Next.js server cache; "Full Route Cache" is a retired name.',
      why: 'Three names, one mechanism: rendered HTML + RSC per route key, shared by every user.'
    },
    sources: [{ label: 'Caching', url: `${DOCS}/getting-started/caching` }, { label: 'Self-hosting: caching', url: `${DOCS}/guides/self-hosting` }]
  },
  {
    id: 'data-cache', short: '"use cache"', name: '"use cache" entries', region: 'data-caches', glyph: 'cache', x: 850, y: 1395, badge: 'server memory',
    phase: ['request'], env: ['node', 'storage'], role: 'cache',
    what: 'Results of functions and components marked "use cache", keyed by arguments and closed-over values, with cacheLife profiles and cacheTag tags. Nothing is cached without the directive.',
    consumes: ['first render'], produces: ['reused results'], exists: 'per cacheLife profile',
    connects: ['action-handler'], reaches: 'data',
    versionNote: {
      article: 'Next.js 14 cached fetch implicitly; 16 with Cache Components caches nothing by default.',
      current: 'Confirmed: cacheComponents: true makes data fetching dynamic by default. updateTag expires now; revalidateTag(tag, profile) is stale-while-revalidate.',
      why: 'The site shows caching as opt-in with explicit invalidators, not as a default to escape.'
    },
    sources: [{ label: 'Caching', url: `${DOCS}/getting-started/caching` }]
  },
  {
    id: 'image-cache', short: 'Image cache', name: 'Image optimizer cache · .next/cache/images', region: 'data-caches', glyph: 'cache', x: 1200, y: 1395, badge: 'fs',
    phase: ['request'], env: ['storage', 'node'], role: 'cache',
    what: 'Key: url + width + quality + format. Value: the sharp-transformed image, so each variant is computed once.',
    consumes: ['/_next/image requests'], produces: ['cached variants'], exists: 'per TTL', connects: ['image-optimizer', 'next-cache-dir'], reaches: 'data',
    internals: ['/hero.jpg|640|75|webp', 'minimumCacheTTL 4 h by default (16.0)'],
    sources: [{ label: 'Image component', url: `${DOCS}/api-reference/components/image` }]
  },
  {
    id: 'request-memo', short: 'Memoization', name: 'Request memoization', region: 'data-caches', glyph: 'cache', x: 1550, y: 1395, badge: 'one request',
    phase: ['request'], env: ['node'], role: 'cache',
    what: 'Within one render pass, identical fetch GETs (and React cache() calls) run once. Dies with the request.',
    consumes: ['duplicate calls'], produces: ['one execution'], exists: 'one request', connects: ['rsc-runtime-entity'], reaches: 'no',
    internals: ['key: function + arguments; different arguments run again', 'React cache() for non-fetch calls'],
    sources: [{ label: 'Caching', url: `${DOCS}/getting-started/caching` }]
  },

  // ---------- Browser ----------
  {
    id: 'dom', short: 'DOM', name: 'DOM · painted before interactivity', region: 'browser', glyph: 'dom', x: 200, y: 1660,
    phase: ['browser'], env: ['browser'], role: 'runtime',
    what: 'The HTML as painted. Visible immediately; not interactive until Client Components hydrate.',
    consumes: ['HTML stream'], produces: ['pixels', 'a tree React attaches to'], exists: 'tab', connects: ['html'], reaches: 'data'
  },
  {
    id: 'next-f', short: '__next_f', name: 'self.__next_f chunks', region: 'browser', glyph: 'json', x: 200, y: 1880,
    phase: ['browser'], env: ['browser'], role: 'transport',
    what: 'Inline <script> pushes that carry Flight inside the HTML: [0] bootstrap, [1, text], [2, formState], [3, base64]. The browser replays existing chunks, then listens for late ones.',
    consumes: ['inline scripts'], produces: ['reconstructed Flight stream'], exists: 'per document', connects: ['flight', 'react-client'], reaches: 'data'
  },
  {
    id: 'react-client', short: 'React client', name: 'React client runtime · hydrateRoot', region: 'browser', glyph: 'runtime', x: 500, y: 1660, badge: 'react-dom/client',
    phase: ['browser'], env: ['browser'], role: 'runtime',
    what: 'Rebuilds the element tree from Flight, loads the chunks named by client references, and hydrates only Client Components. Server Component output stays as delivered but is represented in the tree.',
    consumes: ['reconstructed Flight', 'browser chunks'], produces: ['hydrated islands'], exists: 'tab', connects: ['next-f', 'client-components', 'app-router'], reaches: 'data'
  },
  {
    id: 'client-components', short: 'Client Components', name: 'Client Components · DashboardNav, ProfileForm', region: 'browser', glyph: 'component-client', x: 800, y: 1660,
    phase: ['browser'], env: ['browser'], role: 'module',
    what: 'The only application code that runs in the browser. Their state survives navigations that keep their LayoutRouter slot.',
    consumes: ['props from Flight'], produces: ['interactivity', 'state'], exists: 'tab', connects: ['browser-chunks'], reaches: 'code'
  },

  // ---------- Client router ----------
  {
    id: 'app-router', short: 'App router', name: 'App client router', region: 'client-router', glyph: 'machine', x: 1150, y: 1660,
    phase: ['browser'], env: ['browser'], role: 'router',
    what: 'Owns the client copy of the route tree. On navigation it sends FlightRouterState to the server, receives a patch for the divergent subtree and swaps one LayoutRouter slot.',
    consumes: ['<Link>', 'router.push', 'action results'], produces: ['Flight requests', 'tree merges', 'History API updates'],
    exists: 'tab', connects: ['router-state-tree', 'route-cache', 'segment-cache', 'prefetch-scheduler'], reaches: 'data'
  },
  {
    id: 'router-state-tree', short: 'FlightRouterState', name: 'FlightRouterState · client copy', region: 'client-router', glyph: 'segment', x: 1450, y: 1660,
    phase: ['browser', 'request'], env: ['browser', 'network'], role: 'protocol',
    what: 'The route shape the client has, sent as Next-Router-State-Tree. The server walks it against the loader tree to find the shared prefix.',
    consumes: ['initial Flight', 'patches'], produces: ['navigation diff input'], exists: 'tab', connects: ['loader-tree', 'app-router'], reaches: 'data'
  },
  {
    id: 'route-cache', short: 'Route cache', name: 'Route cache · trees', region: 'client-router', glyph: 'cache', x: 1250, y: 1880, badge: 'browser tab',
    phase: ['browser'], env: ['browser'], role: 'cache',
    what: 'Prefetched route structures per URL (docs: part of the "Client Cache").',
    consumes: ['/_tree prefetches'], produces: ['instant structure on click'], exists: 'tab, staleness rules', connects: ['app-router'], reaches: 'data'
  },
  {
    id: 'segment-cache', short: 'Segment cache', name: 'Segment cache · content', region: 'client-router', glyph: 'cache', x: 1550, y: 1880, badge: 'browser tab',
    phase: ['browser'], env: ['browser'], role: 'cache',
    what: 'Prefetched segment content; shared layouts are stored once and reused across routes (docs: "Client Cache"; 16.3 adds per-route App Shells).',
    consumes: ['segment prefetches', 'navigation responses'], produces: ['cache-hit navigations with no network'], exists: 'tab, staleness rules', connects: ['app-router'], reaches: 'data'
  },
  {
    id: 'prefetch-scheduler', short: 'Prefetch scheduler', name: 'Prefetch scheduler', region: 'client-router', glyph: 'machine', x: 1820, y: 1660,
    phase: ['browser'], env: ['browser'], role: 'router',
    what: 'Turns visible or hovered <Link>s into prioritized, deduplicated, cancellable prefetch tasks.',
    consumes: ['<Link> visibility and hover'], produces: ['prefetch requests'], exists: 'tab', connects: ['route-cache', 'segment-cache'], reaches: 'no'
  },

  {
    id: 'layout-router', short: 'LayoutRouter', name: 'LayoutRouter boundary · ⟦ ⟧', region: 'render-server', glyph: 'segment', x: 1880, y: 940,
    phase: ['request', 'browser'], env: ['node', 'browser'], role: 'router',
    what: 'A Client Component slot placed at every parent → child transition while the loader tree is rendered. Later the client router swaps the content of exactly one slot and leaves the others untouched.',
    consumes: ['segment key'], produces: ['a swap point in the tree'], exists: 'per tree position, server and browser',
    connects: ['loader-tree', 'app-router'], reaches: 'code', internals: ['layout-router.tsx in next/src/client/components']
  },
  {
    id: 'segment-slices', short: 'Segment slices', name: 'Segment slices · [segment, tree patch, content, head]', region: 'render-server', glyph: 'flight', x: 1880, y: 1220,
    phase: ['request'], env: ['node', 'network'], role: 'protocol',
    what: 'Flight carries content per segment as compact slices: the segment, how to patch the structure there, its rendered content and its head data. Slices are what make the stream resumable and navigations partial.',
    consumes: ['recursive segment render'], produces: ['rows the client merges into one LayoutRouter slot'], exists: 'per response',
    connects: ['flight', 'router-state-tree'], reaches: 'data'
  },
  {
    id: 'ppr-shell', short: 'PPR shell', name: 'Static shell + postponed state · PPR', region: 'render-server', glyph: 'html', x: 1730, y: 920,
    phase: ['build', 'request'], env: ['node', 'storage'], role: 'artifact',
    what: 'A build render that stopped at a Suspense boundary whose subtree reads request data. Everything outside the boundary became the static shell; the place where rendering stopped was saved so a request can resume there.',
    consumes: ['build render of /dashboard/billing'], produces: ['shell HTML + Flight rows served at once', 'a resume point for the dynamic part'],
    exists: 'per deploy, until revalidated; stored in the server cache like a static route', connects: ['prerender', 'server-cache', 'rsc-runtime-entity', 'suspense-hole'], reaches: 'data',
    internals: ['"postponed state" is an implementation term: the serialized resume point', 'response header x-nextjs-postponed', 'the shell for /dashboard/billing: RootLayout + DashboardLayout + BillingPage up to <InvoicesSkeleton/>'],
    versionNote: {
      article: 'PPR as its own feature: experimental.ppr, a static shell and a postponed state.',
      current: 'cacheComponents: true implements PPR as the default behavior; experimental.ppr and experimental_ppr were removed in 16.0. The docs no longer name the postponed state, but resuming works the same way.',
      why: 'The mechanism is unchanged; the switch is cacheComponents, not a PPR flag.'
    },
    sources: [{ label: 'cacheComponents', url: `${DOCS}/api-reference/config/next-config-js/cacheComponents` }, { label: 'Upgrading to 16', url: `${DOCS}/guides/upgrading/version-16` }]
  },
  {
    id: 'pages-renderer', short: 'Pages renderer', name: 'Pages renderer · data function + _app + _document', region: 'render-server', glyph: 'machine', x: 1880, y: 1040,
    phase: ['build', 'request'], env: ['node'], role: 'renderer',
    what: 'Renders Pages Router routes such as pages/products/[id].tsx and pages/posts/[id].tsx: dispatches on the page exports (static file, getStaticProps entry, getServerSideProps or getInitialProps run), renders the page inside _app and _document, and produces HTML plus a JSON copy of the props.',
    consumes: ['page module from pages-manifest', 'data function result'], produces: ['HTML + props JSON (__NEXT_DATA__)'],
    exists: 'per render: at build, on a cache miss, on ISR regeneration and on every getServerSideProps request', connects: ['server-cache', 'pages-manifest', 'db', 'gssp', 'gip', 'pages-document'], reaches: 'data',
    internals: ['getStaticProps → { props, revalidate: 60 }', 'getStaticPaths → { paths, fallback: "blocking" }', 'stored as .next/server/pages/posts/7.html + 7.json', 'packages/next/src/server/render.tsx: renderToHTMLImpl'],
    sources: [{ label: 'getStaticProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-static-props' }, { label: 'ISR (Pages)', url: 'https://nextjs.org/docs/pages/guides/incremental-static-regeneration' }, { label: 'getServerSideProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props' }]
  },
  {
    id: 'isr-regeneration', short: 'Regeneration', name: 'Background regeneration · stale-while-revalidate', region: 'render-server', glyph: 'process', x: 1660, y: 1220,
    phase: ['request'], env: ['node'], role: 'process',
    what: 'Started when a stale entry is served: renders the route again after the response has left, and replaces the cache entry only if the render succeeds. The visitor who triggered it never waits for it.',
    consumes: ['a stale server cache entry'], produces: ['a fresh entry for the next visitor'],
    exists: 'after a stale hit, until the new entry is stored', connects: ['server-cache', 'pages-renderer'], reaches: 'no',
    internals: ['prerender-manifest: initialRevalidateSeconds 60 for /posts/7', 'a failed regeneration keeps serving the old entry', 'App Router: revalidateTag(tag, "max") marks entries stale the same way'],
    sources: [{ label: 'ISR', url: `${DOCS}/guides/incremental-static-regeneration` }, { label: 'revalidateTag', url: `${DOCS}/api-reference/functions/revalidateTag` }]
  },
  {
    id: 'suspense-hole', short: 'Suspense hole', name: 'Suspense boundary · streamed hole', region: 'browser', glyph: 'segment', x: 500, y: 1880,
    phase: ['request', 'browser'], env: ['node', 'browser'], role: 'boundary',
    what: 'A boundary whose fallback shipped in the first HTML chunk. A later chunk carries the real content plus a tiny script that swaps it into place; React hydrates it selectively when its code is ready.',
    consumes: ['late HTML + Flight chunks'], produces: ['filled content, paint before the whole page is done'], exists: 'per document',
    connects: ['html', 'react-client'], reaches: 'data'
  },

  // ---------- Pages Router (J3, J4) ----------
  {
    id: 'gssp', short: 'getServerSideProps', name: 'getServerSideProps · pages/products/[id].tsx', region: 'render-server', glyph: 'machine', x: 1770, y: 1040, badge: 'Node',
    phase: ['request'], env: ['node'], role: 'renderer',
    what: 'Data function of /products/[id]. Runs on the server for every request with req, res, params and query, and returns { props: { product } }. The bundler removes it, and every import only it uses, from the browser chunk.',
    consumes: ['req, res, params { id: "42" }, query', 'database'], produces: ['{ props } for the page'],
    exists: 'per request: the document request and every /_next/data request for this page', connects: ['pages-renderer', 'pages-data-endpoint', 'db'], reaches: 'data',
    internals: ['export async function getServerSideProps({ params, req, res, query }) → { props: { product } }', 'never cached by the framework; Cache-Control on res is up to the page', 'removed from the client build by the SWC next_ssg transform, together with imports only it uses'],
    sources: [{ label: 'getServerSideProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props' }]
  },
  {
    id: 'gip', short: 'getInitialProps', name: 'getInitialProps · legacy data function', region: 'render-server', glyph: 'machine', x: 1770, y: 1150, badge: 'Node + browser',
    phase: ['request', 'browser'], env: ['node', 'browser'], role: 'renderer',
    what: 'The older data function, attached to the page component. It runs on the server for the first document and in the browser on every client navigation to the page, so its code ships inside the page chunk.',
    consumes: ['context: pathname, query, asPath; req and res on the server only'], produces: ['props for the page'],
    exists: 'per navigation, in whichever environment the navigation happens', connects: ['pages-renderer', 'pages-router', 'browser-chunks'], reaches: 'code',
    internals: ['ProductPage.getInitialProps = async (ctx) => ({ product })', 'anything it imports (API keys, SDKs) lands in the browser chunk', '_app.getInitialProps turns off Automatic Static Optimization for pages without getStaticProps', 'with _app.getInitialProps, navigating to a getServerSideProps page runs _app.getInitialProps in the browser and getServerSideProps on the server'],
    sources: [{ label: 'getInitialProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-initial-props' }, { label: 'Automatic Static Optimization', url: 'https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization' }]
  },
  {
    id: 'pages-data-endpoint', short: '/_next/data', name: '/_next/data/{buildId}/… endpoint', region: 'render-server', glyph: 'machine', x: 1965, y: 1140,
    phase: ['request'], env: ['node'], role: 'renderer',
    what: 'Answers client navigations of the Pages Router with { pageProps } only: it runs getServerSideProps for SSR pages and returns the stored JSON for getStaticProps pages. No HTML is rendered.',
    consumes: ['GET /_next/data/k7Qm2xLp9/products/42.json'], produces: ['{ pageProps } as JSON'],
    exists: 'per navigation; the buildId in the path changes with every deploy', connects: ['gssp', 'server-cache', 'pages-router', 'routes-manifest'], reaches: 'data',
    internals: ['routes-manifest dataRoutes: /_next/data/k7Qm2xLp9/products/[id].json', 'getStaticProps pages: posts/7.json from the prerendered outputs, regenerated by ISR like the HTML', 'a buildId mismatch after a deploy → 404 → the client router falls back to a full page load'],
    sources: [{ label: 'getServerSideProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props' }, { label: 'getStaticProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-static-props' }]
  },
  {
    id: 'pages-document', short: '_document', name: '_document · <Html><Head/><Main/><NextScript/>', region: 'render-server', glyph: 'html', x: 1770, y: 1290, badge: 'Node',
    phase: ['request', 'build'], env: ['node'], role: 'renderer',
    what: 'The outer HTML shell of every Pages Router document. <Main/> is where the rendered app goes; <NextScript/> writes the script tags from build-manifest and the __NEXT_DATA__ script. It renders only on the server and never on client navigation.',
    consumes: ['rendered app HTML', 'build-manifest chunk list', 'serialized props'], produces: ['the full document'],
    exists: 'per document request (and at build for static pages)', connects: ['build-manifest', 'html', 'next-data'], reaches: 'data',
    internals: ['pages/_document.tsx: <Html><Head/><body><Main/><NextScript/></body></Html>', 'event handlers and state in _document never run in the browser'],
    sources: [{ label: 'Custom Document', url: 'https://nextjs.org/docs/pages/building-your-application/routing/custom-document' }]
  },
  {
    id: 'next-data', short: '__NEXT_DATA__', name: '__NEXT_DATA__ · inline props JSON', region: 'browser', glyph: 'json', x: 200, y: 1990,
    phase: ['request', 'browser'], env: ['node', 'network', 'browser'], role: 'protocol',
    what: '<script id="__NEXT_DATA__" type="application/json"> with pageProps, page, query and buildId. It repeats data the HTML already shows, because hydration has to render the same tree with the same props.',
    consumes: ['pageProps from the data function'], produces: ['hydration input in the browser'],
    exists: 'per document', connects: ['pages-document', 'react-client'], reaches: 'data',
    internals: ['{ "props": { "pageProps": { "product": { … } } }, "page": "/products/[id]", "query": { "id": "42" }, "buildId": "k7Qm2xLp9" }', 'warning when page data exceeds 128 kB (largePageDataBytes)'],
    sources: [{ label: 'Large page data', url: 'https://nextjs.org/docs/messages/large-page-data' }]
  },
  {
    id: 'pages-app', short: '_app', name: '_app · <App> with ThemeProvider', region: 'browser', glyph: 'component-client', x: 800, y: 1770,
    phase: ['request', 'browser'], env: ['node', 'browser'], role: 'module',
    what: 'pages/_app.tsx wraps every page: <App Component={ProductPage} pageProps={…} /> renders <ThemeProvider> around the page. It renders on the server for the document, hydrates in the browser and stays mounted across client navigations.',
    consumes: ['Component', 'pageProps'], produces: ['the wrapped page tree'],
    exists: 'per document on the server; for the whole tab in the browser', connects: ['pages-product-page', 'pages-post-page', 'browser-chunks'], reaches: 'code',
    internals: ['static/chunks/pages/_app chunk', 'state in _app (theme) survives every client navigation'],
    sources: [{ label: 'Custom App', url: 'https://nextjs.org/docs/pages/building-your-application/routing/custom-app' }]
  },
  {
    id: 'pages-product-page', short: 'ProductPage', name: 'ProductPage · pages/products/[id].tsx', region: 'browser', glyph: 'component-client', x: 800, y: 1880,
    phase: ['request', 'browser'], env: ['node', 'browser'], role: 'module',
    what: 'The page component of /products/42 and every component it renders. In the Pages Router all of it is browser code: it renders on the server for HTML and executes again in the browser to hydrate.',
    consumes: ['pageProps.product'], produces: ['DOM', '<Link href="/posts/7">'],
    exists: 'per document; replaced when the client router swaps Component', connects: ['pages-app', 'browser-chunks', 'pages-prefetch'], reaches: 'code',
    internals: ['static/chunks/pages/products/[id] chunk: the component tree, without getServerSideProps']
  },
  {
    id: 'pages-post-page', short: 'PostPage', name: 'PostPage · pages/posts/[id].tsx', region: 'browser', glyph: 'component-client', x: 800, y: 1990,
    phase: ['build', 'browser'], env: ['node', 'browser'], role: 'module',
    what: 'The page component of /posts/7, a getStaticProps page with revalidate: 60. On a client navigation its chunk is loaded and it replaces ProductPage inside the same _app.',
    consumes: ['pageProps.post'], produces: ['DOM'],
    exists: 'from the navigation on, for as long as /posts/7 is shown', connects: ['pages-app', 'browser-chunks'], reaches: 'code',
    internals: ['static/chunks/pages/posts/[id] chunk: the component tree, without getStaticProps or getStaticPaths']
  },
  {
    id: 'pages-router', short: 'Pages router', name: 'Pages client router · next/router', region: 'client-router', glyph: 'machine', x: 1150, y: 1990,
    phase: ['browser'], env: ['browser'], role: 'router',
    what: 'Handles <Link> clicks and router.push in the Pages Router: fetches the target data (/_next/data, stored JSON, or getInitialProps in the tab), loads the page chunk, swaps Component inside the kept _app and pushes the URL to history.',
    consumes: ['<Link>', 'router.push()', '_buildManifest.js'], produces: ['data requests', 'page chunk loads', 'Component swaps', 'history entries'],
    exists: 'tab', connects: ['pages-data-endpoint', 'pages-app', 'browser-history', 'pages-prefetch'], reaches: 'data',
    internals: ['packages/next/src/shared/lib/router/router.ts: change() → getRouteInfo() → set()', 'router.isReady false on the first render of a statically optimized page with a dynamic route'],
    sources: [{ label: 'useRouter (Pages)', url: 'https://nextjs.org/docs/pages/api-reference/functions/use-router' }]
  },
  {
    id: 'pages-prefetch', short: 'Prefetch Set', name: 'Pages prefetch · Set of prefetched URLs', region: 'client-router', glyph: 'cache', x: 1450, y: 1990, badge: 'browser tab',
    phase: ['browser'], env: ['browser'], role: 'cache',
    what: 'Production only. A <Link> entering the viewport loads the target page chunk and, for a getStaticProps target, its JSON; a getServerSideProps target gets its chunk only. Viewport prefetches are deduplicated through a Set of URLs; hover prefetches skip it.',
    consumes: ['<Link> visibility and hover'], produces: ['chunk loads', 'static JSON requests'],
    exists: 'tab; never emptied', connects: ['pages-router', 'browser-chunks', 'pages-data-endpoint'], reaches: 'no',
    internals: ['prefetched Set keyed by href + as + locale in next/link (pages)', 'prefetch={false}: no viewport prefetch, hover still prefetches', 'off in next dev'],
    versionNote: {
      article: 'Hover prefetch re-requests the JSON every time; prefetch={false} only disables the viewport prefetch.',
      current: 'Unchanged for the Pages Router (16.3): docs say prefetch={false} still prefetches on hover. The per-hover repeat is observed in source, not documented.',
      why: 'The only full opt-out is a plain <a> or moving the route to the App Router, where prefetch={false} means never.'
    },
    sources: [{ label: 'Link (Pages)', url: 'https://nextjs.org/docs/pages/api-reference/components/link' }]
  },
  {
    id: 'browser-history', short: 'History', name: 'History API · pushState / popstate', region: 'client-router', glyph: 'machine', x: 1750, y: 1990,
    phase: ['browser'], env: ['browser'], role: 'router',
    what: 'The browser session history. Client routers push an entry instead of loading a document; Back fires popstate and the router replays its own navigation for the stored URL.',
    consumes: ['pushState(state, "", url)'], produces: ['URL bar updates', 'popstate events'],
    exists: 'tab', connects: ['pages-router', 'app-router'], reaches: 'no',
    internals: ['Pages Router stores { url, as, options, __N: true, key } in history.state', 'shallow: router.push(url, as, { shallow: true }) changes only the URL and router.query'],
    sources: [{ label: 'Shallow routing', url: 'https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing' }]
  },

  // ---------- Dev ----------
  {
    id: 'dev-parent', short: 'Parent', name: 'Parent process · supervisor', region: 'dev', glyph: 'process', x: 2210, y: 110,
    phase: ['dev'], env: ['node'], role: 'process',
    what: 'The process next dev starts first. It does no serving itself: it spawns the child and restarts it with the same options when the child exits because next.config changed.',
    consumes: ['child exit codes'], produces: ['a fresh child process'], exists: 'dev session', connects: ['dev-child'], reaches: 'no',
    internals: ['cli/next-dev.ts: forks server/lib/start-server.ts as the child', 'child exits with RESTART_EXIT_CODE (77, server/lib/utils.ts) → parent forks again'],
    sources: [{ label: 'next dev (CLI)', url: `${DOCS}/api-reference/cli/next` }]
  },
  {
    id: 'dev-child', short: 'Child', name: 'Child process · server + bundler', region: 'dev', glyph: 'process', x: 2300, y: 370,
    phase: ['dev'], env: ['node'], role: 'process',
    what: 'Runs the HTTP server, router-server, render-server and the bundler as one long-lived object; compiles routes when they are first requested.',
    consumes: ['requests', 'file changes'], produces: ['responses', 'HMR messages'], exists: 'until next.config changes', connects: ['dev-watcher', 'dev-hmr', 'dev-turbopack', 'dev-static-workers'], reaches: 'no',
    internals: ['server/lib/start-server.ts', 'server/lib/router-server.ts creates the dev bundler: dev-bundler-service.ts', 'output in .next/dev since 16.0, so next dev and next build can run side by side'],
    versionNote: {
      article: 'Dev writes into .next like a build.',
      current: '16.0: next dev writes to .next/dev and holds a lockfile against a second instance.',
      why: 'A dev session and a production build no longer overwrite each other.'
    },
    sources: [{ label: 'Upgrading to 16', url: `${DOCS}/guides/upgrading/version-16` }]
  },
  {
    id: 'dev-static-workers', short: 'Static-params worker', name: 'Static-params worker · per call', region: 'dev', glyph: 'process', x: 2120, y: 370,
    phase: ['dev'], env: ['node-worker'], role: 'process',
    what: 'A fresh worker started for each generateStaticParams / getStaticPaths call and killed afterwards, so the call runs with clean module state, as it would in a build.',
    consumes: ['one generateStaticParams / getStaticPaths call'], produces: ['a path list'], exists: 'one call', connects: ['dev-child'], reaches: 'no',
    internals: ['server/dev/static-paths-worker.ts: next-dev-server.ts starts a jest-worker (one worker) per static-paths call and ends it afterwards'],
    sources: [{ label: 'generateStaticParams', url: `${DOCS}/api-reference/functions/generate-static-params` }]
  },
  {
    id: 'dev-watcher', short: 'Watcher', name: 'File watcher · live route map', region: 'dev', glyph: 'watcher', x: 2210, y: 560,
    phase: ['dev'], env: ['node'], role: 'route-description',
    what: 'Replaces the production manifests: rebuilds page lists, handlers, layouts, slots and matchers on every change, detects app/ vs pages/ conflicts and writes .next/types.',
    consumes: ['app/', 'pages/', 'proxy.ts', '.env*', 'tsconfig.json'], produces: ['in-memory route tables', '.next/types', 'route-change messages'], exists: 'dev session', connects: ['routing-ladder', 'dev-turbopack'], reaches: 'no',
    internals: ['server/lib/router-utils/setup-dev-bundler.ts: watcher callback rebuilds the route tables', 'conflicting app and page error when one path exists in both routers'],
    sources: [{ label: 'Project structure', url: `${DOCS}/getting-started/project-structure` }]
  },
  {
    id: 'dev-entries', short: 'On-demand entries', name: 'On-demand entries · --webpack', region: 'dev', glyph: 'machine', x: 2090, y: 860,
    phase: ['dev'], env: ['node'], role: 'bundler',
    what: 'The Webpack path: one record per requested page with status added → building → built, a last-active time and a dispose flag. Every rebuild includes every live entry.',
    consumes: ['requested pages', 'browser pings'], produces: ['compiled entries'], exists: 'dev session', connects: ['dev-eviction', 'dev-hmr'], reaches: 'no',
    internals: ['server/dev/on-demand-entry-handler.ts: ensurePage(), entries map, ADDED / BUILDING / BUILT'],
    sources: [{ label: 'on-demand-entry-handler.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/server/dev/on-demand-entry-handler.ts' }]
  },
  {
    id: 'dev-eviction', short: 'Eviction timer', name: 'Entry eviction · --webpack', region: 'dev', glyph: 'machine', x: 2330, y: 860,
    phase: ['dev'], env: ['node'], role: 'process',
    what: 'A timer that marks entries idle longer than the inactive age; the next compilation drops them. Browser pings reset the clock for the page that is open.',
    consumes: ['entry last-active times'], produces: ['dispose flags'], exists: 'dev session', connects: ['dev-entries'], reaches: 'no',
    internals: ['setInterval(…, pingIntervalTime + 1000), pingIntervalTime = clamp(maxInactiveAge, 1000, 5000)', 'maxInactiveAge default 60 s (onDemandEntries config)'],
    versionNote: {
      article: 'Sweep every 6 s, dispose after 60 s idle.',
      current: 'Same defaults; 60 s is the configurable maxInactiveAge and the sweep interval is derived from it. Applies to the --webpack path only.',
      why: 'With Turbopack, the default since 16.0, there are no entries to evict.'
    },
    sources: [{ label: 'onDemandEntries', url: `${DOCS}/api-reference/config/next-config-js/onDemandEntries` }, { label: 'on-demand-entry-handler.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/server/dev/on-demand-entry-handler.ts' }]
  },
  {
    id: 'dev-turbopack', short: 'Turbopack (dev)', name: 'Turbopack in dev · demand-driven graph', region: 'dev', glyph: 'machine', x: 2210, y: 990, badge: 'Rust',
    phase: ['dev'], env: ['rust'], role: 'bundler',
    what: 'The default dev bundler. Only the work a request asks for is computed; a file change marks the affected tasks dirty and only that subgraph is recomputed, so there is nothing to evict.',
    consumes: ['requests from the child', 'file changes'], produces: ['server chunks', 'browser chunks', 'HMR updates'], exists: 'dev session; persistent cache across restarts', connects: ['dev-hmr', 'server-chunks', 'next-cache-dir'], reaches: 'no',
    internals: ['turbo-tasks: functions, tasks, Vc cells; dirty propagation bottom-up', 'filesystem cache in .next on by default for dev (16.3)'],
    versionNote: {
      article: 'Turbopack as the fast alternative to Webpack in dev.',
      current: 'Default for next dev and next build since 16.0; persistent filesystem cache on by default (16.3). Opt out with --webpack.',
      why: 'On-demand entries and eviction describe the opt-in Webpack path.'
    },
    sources: [{ label: 'Turbopack', url: `${DOCS}/api-reference/turbopack` }, { label: 'turbopackFileSystemCache', url: `${DOCS}/api-reference/config/next-config-js/turbopackFileSystemCache` }]
  },
  {
    id: 'dev-module-cache', short: 'require cache', name: 'Server module cache · require', region: 'dev', glyph: 'cache', x: 2090, y: 1220,
    phase: ['dev'], env: ['node'], role: 'cache',
    what: 'Node keeps every required server chunk in memory. On a server edit the entries for the replaced chunks are deleted, so the next render loads the new code.',
    consumes: ['server change notifications'], produces: ['fresh module loads'], exists: 'child process', connects: ['server-chunks', 'rsc-runtime-entity'], reaches: 'no',
    internals: ['server/dev/require-cache.ts: deleteCache() (calls the internal deleteFromRequireCache)', 'server/dev/hot-reloader-turbopack.ts clears server chunks before sending serverComponentChanges'],
    sources: [{ label: 'server/dev', url: 'https://github.com/vercel/next.js/tree/canary/packages/next/src/server/dev' }]
  },
  {
    id: 'dev-hmr', short: 'HMR socket', name: 'HMR WebSocket · /_next/hmr', region: 'dev', glyph: 'machine', x: 2210, y: 1320,
    phase: ['dev'], env: ['node', 'network'], role: 'transport',
    what: 'router-server takes the upgrade event for /_next/hmr, checks the origin and hands the socket to the bundler. It carries build lifecycle, route-map changes, change classification and reload commands.',
    consumes: ['compilation events', 'browser pings'], produces: ['messages to the browser'], exists: 'dev session', connects: ['dev-hmr-client', 'routing-ladder', 'dev-entries'], reaches: 'data',
    internals: ['messages: building · built · sync · addedPage · removedPage · serverComponentChanges · reloadPage · serverOnlyChanges', 'other upgrade paths continue through normal routing'],
    versionNote: {
      article: 'Origins checked against a list from the config.',
      current: 'allowedDevOrigins: cross-origin dev requests are blocked by default; hostname matching with * and ** wildcards.',
      why: 'Opening the dev server from another host needs that host listed.'
    },
    sources: [{ label: 'allowedDevOrigins', url: `${DOCS}/api-reference/config/next-config-js/allowedDevOrigins` }]
  },
  {
    id: 'dev-hmr-client', short: 'HMR client', name: 'HMR client · in the tab', region: 'dev', glyph: 'runtime', x: 2210, y: 1600,
    phase: ['dev', 'browser'], env: ['browser'], role: 'runtime',
    what: 'Dev-only code in the page that holds the socket, applies module updates, pings with the open route and decides what each message means: Fast Refresh, a router refresh or a full reload.',
    consumes: ['HMR messages'], produces: ['module updates', 'router refreshes', 'pings'], exists: 'tab, dev only', connects: ['dev-hmr', 'dev-fast-refresh', 'app-router'], reaches: 'no',
    internals: ['client/dev/hot-reloader/app/hot-reloader-app.tsx and pages/hot-reloader-pages.ts: the two HMR clients', 'ping: pathname (pages) / router tree (app)'],
    sources: [{ label: 'Fast Refresh', url: `${DOCS}/architecture/fast-refresh` }]
  },
  {
    id: 'dev-fast-refresh', short: 'Fast Refresh', name: 'Fast Refresh · react-refresh', region: 'dev', glyph: 'machine', x: 2210, y: 1800,
    phase: ['dev', 'browser'], env: ['browser'], role: 'runtime',
    what: 'Swaps Client Component implementations in place using IDs and hook signatures registered by SWC. Exists only for the client layer; server edits trigger a router refresh instead.',
    consumes: ['client change updates', 'registered component IDs + hook signatures'], produces: ['state-preserving updates', 'remounts'], exists: 'tab, dev only', connects: ['client-components'], reaches: 'no',
    internals: ['SWC react-refresh transform: $RefreshReg$(Component, id), $RefreshSig$() per hook list', 'non-component export → update bubbles to importers → full reload if nothing accepts it'],
    sources: [{ label: 'Fast Refresh', url: `${DOCS}/architecture/fast-refresh` }]
  }
]

const byId = new Map(ENTITIES.map((e) => [e.id, e]))

export function entityById(id: string): Entity {
  const e = byId.get(id)
  if (!e) throw new Error(`unknown entity ${id}`)
  return e
}
