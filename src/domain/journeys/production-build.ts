import type { Journey } from '../types'

export const PRODUCTION_BUILD: Journey = {
  id: 'j1',
  slug: 'production-build',
  title: 'Production build',
  following: 'ProfileForm.tsx from source to a browser chunk and a manifest row, then the route /dashboard/settings from discovery to a prerendered shell',
  whatShouldClick: 'The compiler sees one file; the bundler sees the whole graph; manifests are how runtime finds what build produced.',
  steps: [
    {
      id: 'j1-1', kind: 'explain', title: 'One command, a fixed pipeline',
      story: 'next build runs the same stages in the same order every time: pick a build ID, load config, discover routes, compile and bundle, trace files, analyze routes, prerender, assemble standalone output and print a summary. Each stage consumes what the previous one wrote.',
      camera: { kind: 'region', id: 'build' },
      states: { 'next-build': 'current', 'route-discovery': 'active', swc: 'active', bundler: 'active', tracing: 'active', 'route-analysis': 'active', prerender: 'active', standalone: 'active' },
      edges: ['e-build-discovery'],
      internals: ['buildId k7Qm2xLp9 → .next/BUILD_ID', 'order: buildId → config → redirects/rewrites/headers → route discovery → compile + bundle → trace → analyze → prerender → standalone → summary', 'packages/next/src/build/index.ts'],
      sources: [{ label: 'next build (CLI)', url: 'https://nextjs.org/docs/app/api-reference/cli/next' }]
    },
    {
      id: 'j1-2', kind: 'move', title: 'Folders become a route map',
      story: 'The app and pages folders are walked and every folder with a page becomes a route. For /dashboard/settings the walk also produces a loader tree: root, then dashboard, then settings, each node pointing at its layout and page.',
      camera: { kind: 'entities', ids: ['route-discovery', 'src-root-layout', 'src-settings-page', 'routes-manifest', 'loader-tree'] },
      token: { at: 'route-discovery', glyph: 'segment', label: 'route /dashboard/settings' },
      states: { 'route-discovery': 'current', 'next-build': 'kept', 'src-root-layout': 'active', 'src-dashboard-layout': 'active', 'src-settings-page': 'active', 'src-billing-page': 'active', 'routes-manifest': 'new', 'loader-tree': 'new' },
      edges: ['e-build-discovery', 'e-discovery-routes-manifest', 'e-discovery-loader'],
      internals: ['["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]', 'pages routes: /products/[id], /posts/[id], /api/hello', 'next-app-loader turns each tree into a route module entry']
    },
    {
      id: 'j1-3', kind: 'transform', title: 'The compiler sees one file',
      story: 'SWC takes ProfileForm alone: types are stripped, JSX becomes function calls, syntax is downleveled for the target browsers. One file goes in, one file comes out; nothing about the rest of the app is known here.',
      camera: { kind: 'entities', ids: ['src-profile-form', 'swc'] },
      token: { at: 'swc', glyph: 'transformed-module', label: 'ProfileForm.js ✂ types · JSX' },
      states: { 'src-profile-form': 'active', swc: 'current' }, edges: ['e-form-compile'],
      internals: ['@next/swc-<platform> loaded through N-API; @next/swc-wasm-nodejs as fallback', 'jobs spread over worker_threads (registerWorkerScheduler)', 'next-swc-loader passes per-layer options (Webpack path)', 'Next-specific passes: removeConsole, reactRemoveProperties (data-testid), styled-components / emotion', 'Babel config present: with Webpack SWC is switched off; with Turbopack (16+) Babel runs on user code while SWC still does Next\'s own transforms'],
      sources: [{ label: 'Next.js compiler', url: 'https://nextjs.org/docs/app/architecture/nextjs-compiler' }, { label: 'Turbopack', url: 'https://nextjs.org/docs/app/api-reference/turbopack' }]
    },
    {
      id: 'j1-4', kind: 'transform', title: 'Directives become marks and IDs',
      story: 'The "use client" line at the top of ProfileForm is turned into a boundary mark the bundler will recognize. The "use server" file gets the other treatment: updateProfile is registered under an action ID, 7f3a9c1e2b44…, so the browser will only ever hold the ID.',
      camera: { kind: 'entities', ids: ['src-profile-form', 'src-actions', 'swc', 'server-reference-manifest'] },
      token: { at: 'swc', glyph: 'reference', label: 'boundary mark · ID 7f3a9c1e2b44…' },
      states: { 'src-profile-form': 'active', 'src-actions': 'active', swc: 'current', 'server-reference-manifest': 'new' },
      edges: ['e-form-swc', 'e-actions-swc'],
      internals: ['serverComponents transform: marks the client boundary', 'serverActions transform: registerServerReference(fn, "7f3a9c1e2b44…", "updateProfile")', 'next-flight-loader adds client/server boundary markers in the rsc layer (Webpack path)']
    },
    {
      id: 'j1-5', kind: 'transform', title: 'Barrel imports shrink',
      story: 'A named import from a package that re-exports hundreds of components would pull all of them into the graph. For packages listed in optimizePackageImports the compiler rewrites the import to point straight at the one file that defines Button, so the module list the bundler will walk gets shorter.',
      camera: { kind: 'entities', ids: ['src-profile-form', 'swc', 'bundler'] },
      token: { at: 'swc', glyph: 'transformed-module', label: 'import { Button } from \'ui-kit\' → ui-kit/button' },
      states: { 'src-profile-form': 'active', swc: 'current', bundler: 'kept' }, edges: ['e-form-compile', 'e-swc-bundler'],
      internals: ['next.config.js: experimental.optimizePackageImports: ["ui-kit"]', 'modularizeImports is the older, pattern-based form of the same rewrite'],
      sources: [{ label: 'optimizePackageImports', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports' }]
    },
    {
      id: 'j1-6', kind: 'predict', title: 'Who puts ProfileForm in the browser?',
      story: 'ProfileForm now carries a client boundary mark. The settings page imports it, and the settings page itself will never run in the browser.',
      camera: { kind: 'entities', ids: ['src-profile-form', 'swc', 'bundler', 'browser-chunks'] },
      token: { at: 'swc', glyph: 'transformed-module', label: 'ProfileForm.js · "use client" mark' },
      states: { 'src-profile-form': 'active', swc: 'kept', bundler: 'active', 'browser-chunks': 'dimmed' }, edges: [],
      question: {
        text: 'Which tool decides that ProfileForm ends up in the browser bundle: the compiler or the bundler?',
        options: ['The compiler, when it reads "use client"', 'The bundler, while walking the module graph from the route entries', 'The RSC runtime, the first time the page is requested', 'The browser, when it meets the client reference'],
        answer: 1,
        why: 'The compiler only marks the boundary inside one file and never learns who imports it. The bundler starts from the settings page entry, follows its imports, meets the marked module and opens a browser entry there. That decision is what puts ProfileForm into a browser chunk.'
      }
    },
    {
      id: 'j1-7', kind: 'reveal', title: 'The graph is the bundler\'s',
      story: 'The bundler starts from the entrypoints that route discovery produced and follows every import, collecting transformed modules into one graph. Only here is it visible that the settings page imports ProfileForm and that the import crosses a client boundary; the compiler never saw that edge.',
      camera: { kind: 'entities', ids: ['route-discovery', 'swc', 'bundler', 'src-settings-page', 'src-profile-form'] },
      token: { at: 'bundler', glyph: 'transformed-module', label: 'settings/page → ProfileForm (client boundary)' },
      states: { bundler: 'current', 'route-discovery': 'kept', swc: 'kept', 'src-settings-page': 'active', 'src-profile-form': 'active' },
      edges: ['e-discovery-bundler', 'e-swc-bundler']
    },
    {
      id: 'j1-8', kind: 'explain', title: 'Three layers, two Reacts',
      story: 'Every module in the graph is labelled with a layer: rsc for Server Components, ssr for rendering Client Components to HTML, and app-pages-browser for the browser. Only in the rsc layer is the react-server condition on, so the same import of react resolves to two different files depending on where it was reached.',
      camera: { kind: 'entities', ids: ['bundler', 'layers', 'src-settings-page', 'src-profile-form'] },
      token: { at: 'layers', glyph: 'runtime', label: 'rsc · ssr · app-pages-browser' },
      states: { layers: 'current', bundler: 'kept', 'src-settings-page': 'active', 'src-profile-form': 'active' }, edges: ['e-bundler-layers'],
      internals: ['rsc layer: import "react" → react/react.react-server.js (no useState, no useEffect)', 'ssr and app-pages-browser layers: import "react" → react/index.js', 'all layers: shared, rsc, ssr, action-browser, api-node, api-edge, middleware, instrument, edge-asset, app-pages-browser, pages-dir-browser/edge/node']
    },
    {
      id: 'j1-9', kind: 'explain', title: 'Webpack stitches, Turbopack unifies',
      story: 'With Webpack the same source is built by three compilers, one each for the browser, Node and Edge, and their results are stitched together afterwards. Turbopack, the default since Next.js 16, keeps all targets in one graph and recomputes only what changed. The output is the same set of chunks and manifests either way.',
      camera: { kind: 'entities', ids: ['swc', 'bundler', 'layers'] },
      token: { at: 'bundler', glyph: 'machine', label: 'Turbopack (default) · Webpack via --webpack' },
      states: { bundler: 'current', layers: 'active', swc: 'kept' }, edges: ['e-swc-bundler', 'e-bundler-layers'],
      internals: ['Turbopack embeds SWC for parsing and transforms', 'turbo-tasks: functions, tasks, values, Vc cells; dirty propagation bottom-up', 'crates: turbopack-core, -ecmascript, -css, -resolve, -node', 'Next drives Turbopack through an N-API Project object', 'a custom webpack() config makes next build fail unless --webpack or --turbopack is passed', '16.3: persistent filesystem cache on by default for build', 'Rspack: experimental'],
      sources: [{ label: 'Turbopack', url: 'https://nextjs.org/docs/app/api-reference/turbopack' }, { label: 'Next.js 16.3', url: 'https://nextjs.org/blog/next-16-3' }]
    },
    {
      id: 'j1-10', kind: 'transform', title: 'A browser entry at the boundary',
      story: 'Where the settings page reaches ProfileForm, the bundler opens a separate browser entry, so the client module ships while the page around it does not. The chunk policy then groups browser code: one framework chunk for React and Next, lib chunks for large packages, a runtime chunk and one chunk per route.',
      camera: { kind: 'entities', ids: ['bundler', 'flight-client-entry-plugin', 'split-chunks', 'browser-chunks'] },
      token: { at: 'browser-chunks', glyph: 'browser-chunk', label: 'settings/page-5e6f.js (ProfileForm)' },
      states: { bundler: 'active', 'flight-client-entry-plugin': 'current', 'split-chunks': 'active', 'browser-chunks': 'new', 'src-profile-form': 'active' },
      edges: ['e-bundler-client-entry', 'e-client-entry-split', 'e-split-browser-chunks'],
      internals: ['flight-client-entry-plugin (Webpack); Turbopack does the same inside its graph', 'optimization.splitChunks: framework, lib (> ~160 KB), runtime', 'framework-a1b2c3.js · main-app-d4e5f6.js · webpack-9c0d.js · app/dashboard/settings/page-5e6f.js']
    },
    {
      id: 'j1-11', kind: 'transform', title: 'ProfileForm becomes a reference',
      story: 'On the server side ProfileForm collapses into a reference: an id, the chunk that contains it, an export name. That row is written into the settings page\'s client-reference manifest, which is what the RSC runtime will read instead of running the component.',
      camera: { kind: 'entities', ids: ['split-chunks', 'flight-manifest-plugin', 'client-reference-manifest'] },
      token: { at: 'client-reference-manifest', glyph: 'reference', label: 'ref → app/dashboard/settings/page-5e6f' },
      states: { 'split-chunks': 'kept', 'flight-manifest-plugin': 'current', 'client-reference-manifest': 'new', 'src-profile-form': 'replaced', 'browser-chunks': 'kept' },
      edges: ['e-split-flight-manifest', 'e-flight-manifest-crm'],
      internals: ['.next/server/app/dashboard/settings/page_client-reference-manifest.js', '{ id: "(app-pages-browser)/./components/ProfileForm.tsx", chunks: ["app/dashboard/settings/page-5e6f"], name: "default" }', 'flight-manifest-plugin (Webpack path)']
    },
    {
      id: 'j1-12', kind: 'explain', title: 'Every manifest has a reader',
      story: 'The shelf fills with manifests: routes, pages, build, prerender, proxy, client references and server references. Each one is written once here and read by exactly one part of the running server, so runtime never has to rediscover what build already decided.',
      camera: { kind: 'entities', ids: ['routes-manifest', 'server-reference-manifest', 'routing-ladder', 'action-handler', 'rsc-runtime-entity'] },
      states: {
        'routes-manifest': 'new', 'pages-manifest': 'new', 'build-manifest': 'new', 'prerender-manifest': 'new', 'middleware-manifest': 'new', 'client-reference-manifest': 'new', 'server-reference-manifest': 'new',
        'routing-ladder': 'active', 'server-chunks': 'active', html: 'active', 'server-cache': 'active', proxy: 'active', 'rsc-runtime-entity': 'active', 'action-handler': 'active'
      },
      edges: ['e-crm-rsc'],
      internals: ['routes-manifest.json → router-server at startup', 'server/pages-manifest.json + app-paths-manifest.json → render-server module lookup', 'build-manifest.json → <script> tags', 'prerender-manifest.json → ISR decisions', 'server/middleware-manifest.json → ladder step 3 (Proxy)', '*_client-reference-manifest.js → RSC runtime', 'server-reference-manifest → action handler', 'Turbopack writes identical manifests']
    },
    {
      id: 'j1-13', kind: 'explain', title: 'Each route gets a strategy',
      story: 'Route analysis looks at what each route reads. The settings page only reads cached data, so a full static shell is possible. The billing page reads cookies inside a Suspense boundary, so it gets a static shell with a hole that is filled per request. /products/42 runs per request; /posts/[id] is static and regenerated every 60 seconds.',
      camera: { kind: 'entities', ids: ['route-analysis', 'src-settings-page', 'src-billing-page', 'prerender-manifest'] },
      token: { at: 'route-analysis', glyph: 'segment', label: 'strategies ○ ◐ ƒ ●' },
      states: { 'route-analysis': 'current', 'src-settings-page': 'active', 'src-billing-page': 'active', bundler: 'kept', 'prerender-manifest': 'new' },
      edges: ['e-analysis-prerender-manifest'],
      internals: ['/dashboard/settings: getProfile() is "use cache" + cacheTag("profile") → ○ static', '/dashboard/billing: cookies() inside <Suspense> → ◐ static shell + dynamic hole (cacheComponents: true implements PPR)', '/products/[id]: getServerSideProps → ƒ dynamic', '/posts/[id]: getStaticProps revalidate 60 + getStaticPaths fallback "blocking" → ● SSG with ISR'],
      sources: [{ label: 'cacheComponents', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents' }]
    },
    {
      id: 'j1-14', kind: 'transform', title: 'Static routes are rendered now',
      story: 'Prerender runs the same RSC and SSR runtimes that will serve requests, once, at build time. The settings page is stored as HTML plus its RSC payload and one prefetch file per segment; post 7 as HTML plus JSON; billing as a shell with the dynamic part postponed. These files seed the server cache.',
      camera: { kind: 'entities', ids: ['route-analysis', 'prerender', 'prerendered-outputs', 'server-cache'] },
      token: { at: 'prerendered-outputs', glyph: 'html', label: 'settings.html · .rsc · .segments/ · billing shell ⏸' },
      states: { 'route-analysis': 'kept', prerender: 'current', 'prerendered-outputs': 'new', 'server-cache': 'new', 'rsc-runtime-entity': 'active', 'ssr-runtime-entity': 'active' },
      edges: ['e-route-analysis-prerender', 'e-prerender-outputs', 'e-outputs-server-cache'],
      internals: ['.next/server/app/dashboard/settings.html · settings.rsc · settings.meta', 'settings.segments/_tree.segment.rsc + one *.segment.rsc per segment: the Segment Cache prefetch files (16.x; the single .prefetch.rsc is gone)', '.next/server/pages/posts/7.html · posts/7.json', '/dashboard/billing: static shell + postponed state (implementation term; the resume mechanism is what cacheComponents uses for PPR)'],
      sources: [{ label: 'cacheComponents', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents' }]
    },
    {
      id: 'j1-15', kind: 'explain', title: 'Tracing the files a route needs',
      story: 'File tracing starts at the settings page\'s server entry and follows every require and file read statically. The result is the minimal list of files that entry needs at runtime, often a small fraction of node_modules.',
      camera: { kind: 'entities', ids: ['server-chunks', 'tracing', 'standalone'] },
      token: { at: 'tracing', glyph: 'server-chunk', label: 'settings/page.js.nft.json' },
      states: { 'server-chunks': 'active', tracing: 'current', standalone: 'dimmed' }, edges: ['e-server-chunks-tracing'],
      internals: ['@vercel/nft', '.next/server/app/dashboard/settings/page.js.nft.json: { version: 1, files: [...] }', 'outputFileTracingIncludes / outputFileTracingExcludes to adjust'],
      sources: [{ label: 'output: standalone', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/output' }]
    },
    {
      id: 'j1-16', kind: 'transform', title: 'A folder that runs on its own',
      story: 'With output set to standalone, the traced files are copied into one folder together with a small server of its own. That folder runs with plain Node and no full install; static assets and public files are copied next to it by the deploy step.',
      camera: { kind: 'entities', ids: ['tracing', 'standalone', 'server-chunks'] },
      token: { at: 'standalone', glyph: 'server-chunk', label: '.next/standalone/server.js' },
      states: { tracing: 'kept', standalone: 'current', 'server-chunks': 'kept' }, edges: ['e-tracing-standalone'],
      internals: ['.next/standalone/server.js · .next/standalone/node_modules (traced subset)', 'cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/', 'a custom server is not traced and cannot be combined with standalone'],
      sources: [{ label: 'output: standalone', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/output' }]
    },
    {
      id: 'j1-17', kind: 'explain', title: 'The summary',
      story: 'The build ends by printing every route with its symbol: ○ Static, ● SSG (static HTML from getStaticProps or generateStaticParams), ◐ Partial Prerender (static HTML with dynamic server-streamed content), ƒ Dynamic (rendered on demand). What is left behind is a set of artifact families: manifests, server chunks, browser chunks, prerendered files and a cache for the next build.',
      camera: { kind: 'world' },
      token: { at: 'next-build', glyph: 'process', label: '○ ● ◐ ƒ route tree' },
      states: {
        'next-build': 'current', 'route-analysis': 'kept',
        'routes-manifest': 'kept', 'pages-manifest': 'kept', 'build-manifest': 'kept', 'prerender-manifest': 'kept', 'middleware-manifest': 'kept', 'client-reference-manifest': 'kept', 'server-reference-manifest': 'kept',
        'server-chunks': 'kept', 'browser-chunks': 'kept', 'prerendered-outputs': 'kept', 'next-cache-dir': 'kept', standalone: 'kept'
      },
      edges: ['e-analysis-summary'],
      internals: ['legend: ○ (Static) prerendered as static content · ● (SSG) prerendered as static HTML · ◐ (Partial Prerender) prerendered as static HTML with dynamic server-streamed content · ƒ (Dynamic) server-rendered on demand', '○ /dashboard/settings', '◐ /dashboard/billing', 'ƒ /products/[id]', '● /posts/[id] ├ /posts/7 · Revalidate 1m', '.next/: server/, static/, cache/, standalone/, *.json manifests, BUILD_ID']
    },
    {
      id: 'j1-18', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'region', id: 'build' },
      states: { swc: 'active', bundler: 'active', 'flight-client-entry-plugin': 'active', 'split-chunks': 'active', 'client-reference-manifest': 'active', 'build-manifest': 'active', 'browser-chunks': 'active' },
      edges: ['e-swc-bundler', 'e-bundler-client-entry', 'e-split-browser-chunks', 'e-flight-manifest-crm'],
      checks: [
        { statement: 'SWC decides which chunk a module lands in.', isTrue: false, why: 'SWC transforms one file at a time and never sees the graph. Chunk assignment is the bundler\'s: client entries at boundaries plus the chunk policy.' },
        { statement: 'Turbopack replaces SWC.', isTrue: false, why: 'Turbopack is a bundler and embeds SWC for parsing and transforms. It replaces Webpack, not the compiler.' },
        { statement: 'Every manifest is sent to the browser.', isTrue: false, why: 'Only build-manifest has a client copy, for the Pages router. Routes, prerender, proxy and both reference manifests stay on the server; the browser receives references inside Flight, never the manifest.' }
      ]
    }
  ]
}
