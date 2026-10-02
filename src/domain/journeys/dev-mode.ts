import type { Journey } from '../types'

const ON_DEMAND = { label: 'on-demand-entry-handler.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/server/dev/on-demand-entry-handler.ts' }
const FAST_REFRESH = { label: 'Fast Refresh', url: 'https://nextjs.org/docs/architecture/fast-refresh' }
const TURBOPACK = { label: 'Turbopack', url: 'https://nextjs.org/docs/app/api-reference/turbopack' }
const SERVER_LIB = { label: 'server/lib', url: 'https://github.com/vercel/next.js/tree/canary/packages/next/src/server/lib' }

export const DEV_MODE: Journey = {
  id: 'j9',
  slug: 'dev-mode',
  title: 'Development mode',
  following: 'the changed module DashboardNav.tsx through the HMR channel, then AccountSummary.tsx as a new RSC payload',
  whatShouldClick: 'Dev builds on demand and pushes results over a socket; Fast Refresh exists only for client code; server edits mean a new RSC payload.',
  steps: [
    {
      id: 'j9-1', kind: 'explain', title: 'Two processes',
      story: 'next dev starts a parent process that only supervises. The child it spawns does everything else: it holds the HTTP server, router-server, render-server and the bundler in one long-lived process, so build and request work interleave inside it.',
      camera: { kind: 'entities', ids: ['dev-parent', 'dev-child', 'dev-static-workers', 'dev-turbopack'] },
      states: { 'dev-parent': 'current', 'dev-child': 'active', 'dev-turbopack': 'active' },
      edges: ['e-dev-parent-child', 'e-dev-child-turbopack'],
      internals: ['cli/next-dev.ts forks server/lib/start-server.ts', 'router-server.ts creates the dev bundler (dev-bundler-service.ts) inside the child', 'output in .next/dev since 16.0'],
      sources: [SERVER_LIB]
    },
    {
      id: 'j9-2', kind: 'move', title: 'Restart on config change',
      story: 'Saving next.config.js cannot be applied to a running server, because redirects, rewrites and bundler options were read at startup. The child exits with a special code and the parent starts a new one with the same options.',
      camera: { kind: 'entities', ids: ['dev-parent', 'dev-child'] },
      token: { at: 'dev-child', glyph: 'process', label: 'config changed · exit → restart' },
      states: { 'dev-parent': 'active', 'dev-child': 'replaced' },
      edges: ['e-dev-child-exit'],
      internals: ['RESTART_EXIT_CODE = 77 (server/lib/utils.ts), checked by the parent in cli/next-dev.ts', 'the parent forks the child again with the same argv and env']
    },
    {
      id: 'j9-3', kind: 'explain', title: 'A route map without manifests',
      story: 'In production the server reads route tables from manifests written by the build. In dev the watcher builds the same tables live from app/, pages/, proxy.ts, .env and tsconfig: pages, handlers, layouts, slots and matchers. It also reports a path defined in both app/ and pages/, and regenerates the route types.',
      camera: { kind: 'entities', ids: ['dev-watcher', 'dev-child', 'dev-turbopack'] },
      token: { at: 'dev-watcher', glyph: 'segment', label: 'live route map · no manifests' },
      states: { 'dev-watcher': 'current', 'dev-child': 'active', 'routing-ladder': 'active', 'routes-manifest': 'na' },
      edges: ['e-dev-watcher-ladder'],
      internals: ['router-utils/setup-dev-bundler.ts: watcher callback rebuilds the route tables', 'conflict: "Conflicting app and page file was found"', '.next/types: route types for the editor and tsc', 'route add / remove → HMR addedPage / removedPage message']
    },
    {
      id: 'j9-4', kind: 'move', title: 'Compiled when asked for',
      story: 'Nothing is compiled at startup. The first GET /dashboard/settings waits while the bundler compiles just that route and its imports; every later request for it is answered at once. With Webpack the route becomes an entry record that moves from added to building to built.',
      camera: { kind: 'entities', ids: ['dev-child', 'dev-entries', 'dev-turbopack'] },
      token: { at: 'dev-turbopack', glyph: 'request', label: 'GET /dashboard/settings · compiling' },
      states: { 'dev-child': 'active', 'dev-turbopack': 'current', 'dev-entries': 'new', 'routing-ladder': 'active' },
      edges: ['e-dev-child-turbopack', 'e-dev-ladder-entries'],
      internals: ['--webpack: ensurePage() adds an entry; ADDED → BUILDING → BUILT', 'every Webpack rebuild includes every live entry: only changed modules are invalidated, but chunk graph, codegen and hashing run for the whole compilation', 'Turbopack: the request asks for the route\'s tasks; only those are computed'],
      sources: [ON_DEMAND]
    },
    {
      id: 'j9-5', kind: 'explain', title: 'Idle entries are dropped',
      story: 'With Webpack every live entry is part of every rebuild, so unused ones cost time. A timer marks entries that were idle too long (about 6 s sweeps, 60 s idle by default) and the next compilation drops them. The open tab pings over the socket to keep its own page alive.',
      camera: { kind: 'entities', ids: ['dev-entries', 'dev-eviction', 'dev-hmr'] },
      token: { at: 'dev-entries', glyph: 'machine', label: 'idle > 60 s → disposed' },
      states: { 'dev-entries': 'stale', 'dev-eviction': 'current', 'dev-hmr': 'active' },
      edges: ['e-dev-eviction-entries', 'e-dev-hmr-entries'],
      internals: ['setInterval(…, pingIntervalTime + 1000), pingIntervalTime = clamp(maxInactiveAge, 1000, 5000)', 'maxInactiveAge: 60 s default, onDemandEntries config', 'handlePing(pathname) for pages; handleAppDirPing(tree) for app'],
      sources: [ON_DEMAND, { label: 'onDemandEntries', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/onDemandEntries' }]
    },
    {
      id: 'j9-6', kind: 'explain', title: 'Turbopack: nothing to evict',
      story: 'Turbopack, the default dev bundler, has no entry list. It computes only the tasks a request asks for, and a file change marks just the dependent tasks dirty, so cost follows what you open and edit rather than what is still registered. Its results also survive a restart in the on-disk cache.',
      camera: { kind: 'entities', ids: ['dev-watcher', 'dev-entries', 'dev-eviction', 'dev-turbopack'] },
      states: { 'dev-turbopack': 'current', 'dev-watcher': 'active', 'dev-entries': 'na', 'dev-eviction': 'na', 'next-cache-dir': 'fresh' },
      edges: ['e-dev-watcher-turbopack'],
      internals: ['turbo-tasks: a function call with arguments is a task; results live in Vc cells', 'invalidation propagates bottom-up; only the affected subgraph recomputes', 'filesystem cache on by default for next dev and next build (16.3)', 'opt out of Turbopack with next dev --webpack'],
      sources: [TURBOPACK, { label: 'turbopackFileSystemCache', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache' }]
    },
    {
      id: 'j9-7', kind: 'explain', title: 'A worker per static-params call',
      story: 'generateStaticParams and getStaticPaths run in a fresh worker for each call, which is killed afterwards. Module state left behind by earlier edits cannot leak into the path list, so dev reproduces what a clean build would produce.',
      camera: { kind: 'entities', ids: ['dev-parent', 'dev-child', 'dev-static-workers'] },
      token: { at: 'dev-static-workers', glyph: 'process', label: 'getStaticPaths · /posts/[id]' },
      states: { 'dev-child': 'active', 'dev-static-workers': 'new' },
      edges: ['e-dev-child-workers'],
      internals: ['server/dev/static-paths-worker.ts', 'worker started per request for static paths, then ended'],
      sources: [{ label: 'generateStaticParams', url: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params' }]
    },
    {
      id: 'j9-8', kind: 'move', title: 'The socket',
      story: 'The page opens a WebSocket to /_next/hmr. router-server takes that upgrade, checks the origin against the allowed dev origins and hands the socket to the bundler; any other upgrade continues through normal routing. From now on the server can push messages to the tab.',
      camera: { kind: 'entities', ids: ['dev-turbopack', 'dev-hmr', 'dev-hmr-client'] },
      token: { at: 'dev-hmr', glyph: 'request', label: 'GET /_next/hmr · Upgrade' },
      states: { 'dev-hmr': 'current', 'dev-hmr-client': 'new', 'routing-ladder': 'active', 'dev-turbopack': 'kept' },
      edges: ['e-dev-ladder-hmr', 'e-dev-hmr-client'],
      internals: ['allowedDevOrigins: cross-origin dev requests blocked by default; * and ** wildcards on hostnames', 'message kinds: building · built · sync · addedPage · removedPage · serverOnlyChanges · serverComponentChanges · reloadPage', 'pings travel the other way'],
      sources: [{ label: 'allowedDevOrigins', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins' }]
    },
    {
      id: 'j9-9', kind: 'transform', title: 'Edit 1: a Client Component',
      story: 'You save DashboardNav.tsx. The watcher sees the change, the bundler recompiles that module and updates the browser chunk that holds it, and the socket carries a client-change message with the new module code.',
      camera: { kind: 'entities', ids: ['dev-watcher', 'dev-turbopack', 'dev-hmr'] },
      token: { at: 'dev-turbopack', glyph: 'transformed-module', label: 'DashboardNav.tsx · recompiled' },
      states: { 'src-dashboard-nav': 'replaced', 'dev-watcher': 'active', 'dev-turbopack': 'current', 'browser-chunks': 'replaced', 'dev-hmr': 'active' },
      edges: ['e-dev-nav-watcher', 'e-dev-watcher-turbopack', 'e-dev-turbopack-browser-chunks', 'e-dev-turbopack-hmr'],
      internals: ['SWC compiles the module for the client layer with the react-refresh transform', 'Turbopack: turbo-tasks invalidation; --webpack: the entry rebuilds']
    },
    {
      id: 'j9-10', kind: 'predict', title: 'Is the menu still open?',
      story: 'Before the save, DashboardNav was rendered with open = true. The edit changed only its markup, not its hooks. The HMR client has just received the new module.',
      camera: { kind: 'entities', ids: ['dev-hmr', 'dev-hmr-client', 'dev-fast-refresh'] },
      token: { at: 'dev-hmr-client', glyph: 'transformed-module', label: 'client change · DashboardNav' },
      states: { 'dev-hmr': 'active', 'dev-hmr-client': 'current', 'dev-fast-refresh': 'active', 'client-components': 'active' },
      edges: ['e-dev-hmr-client'],
      question: {
        text: 'DashboardNav has open = true. After the edit, is it still open?',
        options: [
          'Yes: the new implementation is swapped in and useState keeps open = true',
          'No: the component remounts, so open goes back to its initial value',
          'No: the page reloads to load the new chunk',
          'Only if the server renders DashboardLayout again'
        ],
        answer: 0,
        why: 'Fast Refresh finds the mounted component by its registered ID. The hook signature is unchanged, so React re-renders it with the new code and keeps its state.'
      }
    },
    {
      id: 'j9-11', kind: 'reveal', title: 'Fast Refresh keeps state',
      story: 'The compiler registered every component with an ID and a signature of its hooks. Fast Refresh finds the mounted DashboardNav by its ID, sees the same signature, and re-renders it with the new implementation: open stays true and nothing else on the page changes.',
      camera: { kind: 'entities', ids: ['dev-hmr', 'dev-hmr-client', 'dev-fast-refresh'] },
      token: { at: 'dev-fast-refresh', glyph: 'component-client', label: 'DashboardNav · open = true kept' },
      states: { 'dev-hmr-client': 'active', 'dev-fast-refresh': 'current', 'client-components': 'kept', dom: 'kept' },
      edges: ['e-dev-client-refresh', 'e-dev-refresh-components'],
      internals: ['$RefreshReg$(DashboardNav, "<module id> DashboardNav") registers the component', '$RefreshSig$() captures the hook list: useState, usePathname', 'react-refresh: performReactRefresh() schedules the update'],
      sources: [FAST_REFRESH]
    },
    {
      id: 'j9-12', kind: 'explain', title: 'When state is lost',
      story: 'If the edit adds or removes a hook, the signature no longer matches and that component remounts with fresh state. If the file also exports something that is not a component, the update cannot be applied in place: it bubbles up to the importers, and a full reload happens when none of them can accept it.',
      camera: { kind: 'entities', ids: ['dev-hmr', 'dev-hmr-client', 'dev-fast-refresh'] },
      token: { at: 'dev-fast-refresh', glyph: 'component-client', label: 'hook added → remount' },
      states: { 'dev-fast-refresh': 'current', 'client-components': 'replaced', dom: 'active', 'dev-hmr-client': 'active' },
      edges: ['e-dev-client-refresh', 'e-dev-refresh-components'],
      internals: ['// @refresh reset forces a remount on every edit', 'class components always remount', 'a runtime error during render is recovered on the next successful edit'],
      sources: [FAST_REFRESH]
    },
    {
      id: 'j9-13', kind: 'transform', title: 'Edit 2: a Server Component',
      story: 'Now you save AccountSummary.tsx, a Server Component. Nothing in the browser runs its code, so there is nothing to swap there. The bundler replaces its server chunk, the cached copy of the old module is deleted, and the socket says "server components changed".',
      camera: { kind: 'entities', ids: ['dev-turbopack', 'dev-module-cache', 'dev-hmr'] },
      token: { at: 'dev-module-cache', glyph: 'server-chunk', label: 'AccountSummary · module cleared' },
      states: { 'src-account-summary': 'replaced', 'dev-watcher': 'active', 'dev-turbopack': 'active', 'server-chunks': 'replaced', 'dev-module-cache': 'invalid', 'dev-hmr': 'active', 'dev-fast-refresh': 'na' },
      edges: ['e-dev-summary-watcher', 'e-dev-watcher-turbopack', 'e-dev-turbopack-server-chunks', 'e-dev-turbopack-hmr'],
      internals: ['server/dev/require-cache.ts: deleteCache() for the replaced chunks', 'sent by server/dev/hot-reloader-turbopack.ts (or hot-reloader-webpack.ts with --webpack)', 'message: serverComponentChanges (serverOnlyChanges is the Pages Router message, for pages whose server-only code changed)']
    },
    {
      id: 'j9-14', kind: 'move', title: 'A new RSC payload',
      story: 'The HMR client asks the router to refresh the current page, inside a transition. The server renders the tree again with the new module and returns Flight, which is merged into the page like a navigation patch, so Client Components such as DashboardNav keep their state. Only if the page was in an error state does the client reload instead.',
      camera: { kind: 'entities', ids: ['app-router', 'rsc-runtime-entity', 'flight', 'router-state-tree'] },
      token: { at: 'flight', glyph: 'flight', label: 'Flight · new output' },
      states: { 'dev-hmr-client': 'active', 'app-router': 'current', 'dev-module-cache': 'fresh', 'rsc-runtime-entity': 'active', flight: 'new', 'client-components': 'kept', 'dev-fast-refresh': 'na' },
      edges: ['e-dev-client-router', 'e-router-ladder', 'e-dev-module-cache-rsc', 'e-rsc-flight', 'e-flight-router-patch'],
      internals: ['client/dev/hot-reloader/app/hot-reloader-app.tsx: startTransition(() => publicAppRouterInstance.hmrRefresh())', 'hmrRefresh() dispatches the hmr-refresh action; hmrRefreshReducer refetches like router.refresh() (refreshDynamicData)', 'request header next-hmr-refresh: 1 marks the refetch (fetch-server-response.ts)', 'window.location.reload() instead when a runtime error happened or the page is the error document'],
      sources: [{ label: 'useRouter', url: 'https://nextjs.org/docs/app/api-reference/functions/use-router' }]
    },
    {
      id: 'j9-15', kind: 'explain', title: 'HMR is the channel, Fast Refresh is one ending',
      story: 'HMR is the bundler-level channel: it moves updated modules and messages over the socket and knows nothing about React. Fast Refresh is a React mechanism at the end of that channel, and it exists only for client code; server edits end in a router refresh instead.',
      camera: { kind: 'entities', ids: ['dev-hmr', 'dev-hmr-client', 'dev-fast-refresh'] },
      states: { 'dev-hmr': 'active', 'dev-hmr-client': 'active', 'dev-fast-refresh': 'current', 'app-router': 'active' },
      edges: ['e-dev-hmr-client', 'e-dev-client-refresh', 'e-dev-client-router']
    },
    {
      id: 'j9-16', kind: 'explain', title: 'Custom server in dev',
      story: 'A custom server owns the HTTP socket, so the WebSocket upgrade reaches it first: unless it forwards upgrade events to Next.js, the HMR socket never opens. server.js itself is outside the watcher and the bundler, so editing it means restarting by hand.',
      camera: { kind: 'entities', ids: ['custom-server', 'routing-ladder', 'dev-hmr'] },
      token: { at: 'custom-server', glyph: 'request', label: 'upgrade /_next/hmr → forward' },
      states: { 'custom-server': 'current', 'routing-ladder': 'active', 'dev-hmr': 'active' },
      edges: ['e-dev-custom-upgrade'],
      internals: ['server.on("upgrade", (req, socket, head) => app.getUpgradeHandler()(req, socket, head))', 'nodemon or similar to restart on server.js changes'],
      sources: [{ label: 'Custom server', url: 'https://nextjs.org/docs/app/guides/custom-server' }]
    },
    {
      id: 'j9-17', kind: 'explain', title: 'Dev is not production',
      story: 'Several things are switched off or changed in dev so that edits show up immediately: caching is mostly off, links prefetch on hover but not in the viewport, code is not minified, chunks are split for fast rebuilds, source maps are on, React runs its development build, and Strict Mode renders components twice.',
      camera: { kind: 'world' },
      states: { 'server-cache': 'na', 'segment-cache': 'na', 'prefetch-scheduler': 'na', 'browser-chunks': 'active', 'dev-turbopack': 'active', 'react-client': 'active' },
      edges: [],
      internals: ['viewport prefetch off, hover prefetch on', 'Strict Mode double render and double effects (dev only)', 'development React: extra checks and warnings']
    },
    {
      id: 'j9-18', kind: 'explain', title: 'Dev numbers measure dev',
      story: 'A slow first load in dev is mostly compile time, and a fast one may be the persistent cache. Neither says anything about production, where compilation happened at build time and the code is minified and cached. Measure performance with next build and next start.',
      camera: { kind: 'entities', ids: ['dev-child', 'dev-turbopack', 'dev-entries'] },
      states: { 'dev-turbopack': 'current', 'dev-entries': 'active', 'dev-child': 'active' },
      edges: ['e-dev-child-turbopack'],
      sources: [{ label: 'Local development', url: 'https://nextjs.org/docs/app/guides/local-development' }]
    },
    {
      id: 'j9-19', kind: 'explain', title: 'Internals',
      story: 'For readers who want to open the source: these are the files that implement each machine in this column.',
      camera: { kind: 'region', id: 'dev' },
      states: {
        'dev-parent': 'active', 'dev-child': 'active', 'dev-static-workers': 'active', 'dev-watcher': 'active', 'dev-entries': 'active', 'dev-eviction': 'active',
        'dev-turbopack': 'active', 'dev-module-cache': 'active', 'dev-hmr': 'active', 'dev-hmr-client': 'active', 'dev-fast-refresh': 'active'
      },
      edges: [],
      internals: [
        'cli/next-dev.ts: parent process; RESTART_EXIT_CODE (77, server/lib/utils.ts)',
        'server/lib/start-server.ts, router-server.ts: child process, HTTP + upgrade handling',
        'server/lib/dev-bundler-service.ts, router-utils/setup-dev-bundler.ts: dev bundler, watcher, route tables',
        'server/dev/on-demand-entry-handler.ts: ensurePage, entries, handlePing / handleAppDirPing, ADDED / BUILDING / BUILT',
        'server/dev/hot-reloader-turbopack.ts and hot-reloader-webpack.ts (hot-reloader-rspack.ts for Rspack): send HMR messages',
        'server/dev/static-paths-worker.ts: static-params isolation (jest-worker, started by next-dev-server.ts)',
        'server/dev/require-cache.ts: deleteCache(), server module cache clearing',
        'client/dev/hot-reloader/app/hot-reloader-app.tsx and pages/hot-reloader-pages.ts: HMR client, pings, hmrRefresh',
        'react-refresh/runtime + SWC react_refresh transform: $RefreshReg$, $RefreshSig$'
      ],
      sources: [ON_DEMAND, SERVER_LIB, { label: 'server/dev', url: 'https://github.com/vercel/next.js/tree/canary/packages/next/src/server/dev' }]
    },
    {
      id: 'j9-20', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'entities', ids: ['dev-hmr', 'dev-hmr-client', 'dev-fast-refresh', 'dev-module-cache'] },
      states: { 'dev-hmr': 'active', 'dev-hmr-client': 'active', 'dev-fast-refresh': 'active', 'dev-module-cache': 'fresh' },
      edges: ['e-dev-hmr-client', 'e-dev-client-refresh', 'e-dev-client-router'],
      checks: [
        { statement: 'Fast Refresh applies to Server Components.', isTrue: false, why: 'A Server Component never exists in the browser as code, only its rendered output does. Editing it replaces the server module and the page gets a new RSC payload (step 14).' },
        { statement: 'Editing a Server Component preserves its client children\'s state.', isTrue: true, why: 'The refresh merges new Flight into the existing tree, so mounted Client Components such as DashboardNav keep their identity and state (step 14).' },
        { statement: 'Dev timings predict production.', isTrue: false, why: 'Dev compiles on demand, skips minification and most caching, and runs development React. Production numbers come from next build and next start (step 18).' }
      ]
    }
  ]
}
