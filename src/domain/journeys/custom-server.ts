import type { Journey } from '../types'

const CUSTOM = { label: 'Custom server', url: 'https://nextjs.org/docs/app/guides/custom-server' }
const NEXT_TS = { label: 'packages/next/src/server/next.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/server/next.ts' }
const LADDER = ['custom-server', 'custom-handle', 'routing-ladder', 'rung-headers', 'rung-redirects', 'proxy', 'rung-before-files', 'rung-filesystem']

export const CUSTOM_SERVER: Journey = {
  id: 'j10',
  slug: 'custom-server',
  title: 'Custom server',
  following: 'GET /legacy/settings through server.js and handle, then GET /healthz answered by server.js alone',
  whatShouldClick: 'A custom server wraps Next.js; it does not replace router-server and render-server.',
  steps: [
    {
      id: 'j10-1', kind: 'explain', title: 'A ring around the entry',
      story: 'With a custom server, your own server.js starts first and Next.js runs inside it. It draws a ring around the HTTP entry and router-server: everything inside the ring works exactly as under next start; the ring only decides what gets in.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-healthz', 'custom-handle', 'routing-ladder', 'rung-fallback', 'early-exits'] },
      states: { 'custom-server': 'current', 'custom-handle': 'new', 'routing-ladder': 'kept', proxy: 'kept', 'rung-filesystem': 'kept', 'early-exits': 'kept' },
      edges: ['e-custom-handle', 'e-handle-ladder'],
      internals: ['server.js wraps router-server; render-server, the RSC runtime and the SSR runtime are untouched', 'packages/next/src/server/next.ts: NextCustomServer'],
      sources: [CUSTOM]
    },
    {
      id: 'j10-2', kind: 'explain', title: 'Three calls',
      story: 'server.js creates the Next.js app, waits for it to prepare, and asks it for a request handler. Preparing loads the same tables next start would load; the handler it returns is the one router-server uses for every request. server.js itself is plain Node code that Next.js never compiles.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'routing-ladder', 'routes-manifest', 'middleware-manifest'] },
      token: { at: 'custom-handle', glyph: 'machine', label: 'handle = app.getRequestHandler()' },
      states: { 'custom-server': 'active', 'custom-handle': 'current', 'routing-ladder': 'active', 'routes-manifest': 'active', 'middleware-manifest': 'active' },
      edges: ['e-custom-handle', 'e-manifest-ladder'],
      internals: [
        'const app = next({ dev: process.env.NODE_ENV !== "production" })',
        'await app.prepare(): initializes router-server (and the bundler in dev)',
        'const handle = app.getRequestHandler()',
        'next(options): dev, dir, hostname, port, httpServer, turbopack / webpack, minimalMode, customServer, conf',
        'server.js does not run through the Next.js compiler: no TypeScript or JSX transform, Node syntax only'
      ],
      sources: [CUSTOM, NEXT_TS]
    },
    {
      id: 'j10-3', kind: 'explain', title: 'We own the socket',
      story: 'Our own HTTP server owns the socket, so every request reaches our code first, and next start\'s own server is never created. That control is the only reason to have one: it needs a long-running Node process, so it cannot be deployed on serverless platforms such as Vercel.',
      camera: { kind: 'entities', ids: ['node-http', 'request-queue', 'custom-server', 'custom-healthz'] },
      token: { at: 'custom-server', glyph: 'request', label: 'GET /legacy/settings' },
      states: { 'custom-server': 'current', 'node-http': 'na', 'request-queue': 'na', 'custom-handle': 'dimmed' },
      edges: [],
      internals: ['createServer((req, res) => { … }).listen(3000)', 'docs: use one only when the integrated router cannot meet the app\'s requirements; it removes optimizations such as Automatic Static Optimization', 'a custom server cannot be deployed on Vercel'],
      sources: [CUSTOM]
    },
    {
      id: 'j10-4', kind: 'move', title: 'handle enters the same ladder',
      story: 'For an ordinary request server.js just calls handle, and from there the request climbs the same ladder as under next start: configured headers and redirects, then Proxy, whose matcher covers /dashboard, then the filesystem check. render-server renders the page as usual.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'routing-ladder', 'proxy', 'rung-filesystem', 'loader-tree'] },
      token: { at: 'proxy', glyph: 'request', label: '3 Proxy ✓' },
      states: { 'custom-server': 'active', 'custom-handle': 'active', 'routing-ladder': 'active', 'rung-headers': 'kept', 'rung-redirects': 'kept', proxy: 'current', 'rung-before-files': 'kept', 'rung-filesystem': 'kept', 'loader-tree': 'active' },
      edges: ['e-custom-handle', 'e-handle-ladder', 'e-headers-redirects', 'e-redirects-proxy', 'e-proxy-before-files', 'e-before-files-filesystem', 'e-filesystem-loader'],
      internals: ['handle(req, res, parse(req.url, true))', 'set response headers before calling handle: Next.js starts streaming the response inside it', 'Proxy runs on Node.js by default since 16.0 (formerly Middleware, Edge)'],
      sources: [CUSTOM, { label: 'Proxy: execution order', url: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy#execution-order' }]
    },
    {
      id: 'j10-5', kind: 'transform', title: 'Rewriting with parsedUrl',
      story: 'The app no longer has /legacy/settings, so server.js changes the path before handing it over: it passes handle a parsed URL whose pathname is /dashboard/settings. Next.js rebuilds the request URL from it, so from the first ladder step on this is the request from the previous step, Proxy included.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'routing-ladder', 'proxy'] },
      token: { at: 'custom-handle', glyph: 'request', label: '/legacy/settings → /dashboard/settings' },
      states: { 'custom-server': 'active', 'custom-handle': 'current', 'routing-ladder': 'active', proxy: 'active' },
      edges: ['e-custom-handle', 'e-handle-ladder'],
      internals: [
        'const parsedUrl = parse(req.url, true)',
        'if (parsedUrl.pathname === "/legacy/settings") return handle(req, res, { ...parsedUrl, pathname: "/dashboard/settings" })',
        'handle rebuilds req.url from parsedUrl before routing',
        'inside the ladder the same rewrite would be a beforeFiles rule in next.config.js'
      ],
      sources: [CUSTOM]
    },
    {
      id: 'j10-6', kind: 'predict', title: 'A health check',
      story: 'A load balancer polls GET /healthz. server.js checks the path first and writes 200 ok itself, without calling handle.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-healthz', 'custom-handle', 'proxy'] },
      token: { at: 'custom-server', glyph: 'request', label: 'GET /healthz' },
      states: { 'custom-server': 'current', 'custom-healthz': 'dimmed', 'custom-handle': 'dimmed', proxy: 'dimmed' },
      edges: [],
      question: {
        text: '/healthz is answered by server.js without calling handle. Does Proxy see it?',
        options: [
          'No: it never reaches handle, so no ladder step runs',
          'Yes: Proxy runs for every request the process receives',
          'Only if the Proxy matcher includes /healthz',
          'Only in development'
        ],
        answer: 0,
        why: 'Proxy is step 3 of the ladder, and the ladder starts inside handle. A request that server.js answers on its own never enters it, whatever the matcher says.'
      }
    },
    {
      id: 'j10-7', kind: 'reveal', title: 'Invisible to Next.js',
      story: 'No. server.js wrote the answer and never called handle, so the request never entered the machine inside the ring: no configured headers, no Proxy, no manifests. Anything Proxy enforces, such as the session check, does not apply to a request answered this way.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-healthz', 'custom-handle', 'routing-ladder', 'proxy'] },
      token: { at: 'custom-healthz', glyph: 'response', label: '200 ok' },
      states: { 'custom-server': 'active', 'custom-healthz': 'current', 'custom-handle': 'na', 'routing-ladder': 'na', 'rung-headers': 'na', 'rung-redirects': 'na', proxy: 'na', 'rung-before-files': 'na', 'rung-filesystem': 'na' },
      edges: ['e-custom-healthz'],
      internals: ['if (pathname === "/healthz") { res.statusCode = 200; return res.end("ok") }', 'X-Frame-Options from next.config.js headers() is missing on this response'],
      sources: [CUSTOM]
    },
    {
      id: 'j10-8', kind: 'explain', title: 'One handle, both routers',
      story: 'The same handle serves App Router and Pages Router routes. Whether /dashboard/settings is an App Router page and /products/42 a Pages Router page is decided after the ladder, inside render-server, exactly as without a custom server.',
      camera: { kind: 'entities', ids: ['custom-handle', 'routing-ladder', 'loader-tree', 'pages-renderer'] },
      states: { 'custom-server': 'active', 'custom-handle': 'active', 'routing-ladder': 'current', 'loader-tree': 'active', 'pages-renderer': 'active' },
      edges: ['e-handle-ladder', 'e-ladder-loader', 'e-ladder-pages'],
      internals: ['render-server hosts NextNodeServer; app routes go to the app renderer, pages routes to the pages renderer'],
      sources: [CUSTOM]
    },
    {
      id: 'j10-9', kind: 'explain', title: 'The deprecated shortcut',
      story: 'Older custom servers call app.render to render a page by name. That method is deprecated: today it only normalizes its arguments and calls the same request handler, so it skips nothing; the ladder and Proxy run as for handle.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'routing-ladder', 'proxy'] },
      token: { at: 'custom-handle', glyph: 'request', label: 'app.render(req, res, "/dashboard/settings")' },
      states: { 'custom-server': 'active', 'custom-handle': 'current', 'routing-ladder': 'active', proxy: 'active' },
      edges: ['e-custom-handle', 'e-handle-ladder'],
      internals: [
        'render(req, res, pathname, query, parsedUrl) → this.requestHandler(req, res, parsedUrl)',
        'renderToHTML, render404 and renderError delegate to the inner server directly',
        'all four warn: "Use app.getRequestHandler() with an adjusted parsed URL instead"',
        'article: these methods once bypassed router-server'
      ],
      sources: [NEXT_TS]
    },
    {
      id: 'j10-10', kind: 'explain', title: 'Behind another framework',
      story: 'Some apps mount Next.js behind NestJS or Express: a controller runs its own guards, then asks Next.js to render a view. The guards belong to the framework, outside the ring; Next.js only sees the call that follows, which today goes through the same handler.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'routing-ladder'] },
      token: { at: 'custom-server', glyph: 'request', label: 'guard ✓ → app.render(req, res, "/view")' },
      states: { 'custom-server': 'current', 'custom-handle': 'active', 'routing-ladder': 'active' },
      edges: ['e-custom-handle', 'e-handle-ladder'],
      internals: ['@Get("dashboard") @UseGuards(AuthGuard) view(@Req() req, @Res() res) { return app.render(req, res, "/view") }', 'prefer handle(req, res, { ...parsedUrl, pathname: "/view" }) over the deprecated render()'],
      sources: [CUSTOM]
    },
    {
      id: 'j10-11', kind: 'explain', title: 'Not traced, not exported',
      story: 'output: \'standalone\' copies only the files the server entries import. server.js is not one of them, so it and its own dependencies are left out, and starting it from the standalone folder fails with a missing module. output: \'export\' has no server at all, so there is nothing to wrap.',
      camera: { kind: 'entities', ids: ['tracing', 'standalone', 'custom-server'] },
      token: { at: 'standalone', glyph: 'server-chunk', label: 'standalone · no server.js' },
      states: { tracing: 'active', standalone: 'current', 'custom-server': 'invalid' },
      edges: ['e-tracing-custom-server'],
      internals: ['docs: standalone "does not trace custom server files"; the two cannot be used together', '.next/standalone/server.js is the generated minimal server, not yours', 'Error: Cannot find module … when a dependency only server.js imports is missing'],
      sources: [CUSTOM, { label: 'output', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/output' }]
    },
    {
      id: 'j10-12', kind: 'explain', title: 'Hiding file routes',
      story: 'useFileSystemPublicRoutes: false stops the server from answering pages by their file names, so server.js alone decides which paths reach a page. It hides them from the server only: a client-side navigation can still reach those pages, so it is not access control.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'rung-filesystem', 'app-router'] },
      token: { at: 'app-router', glyph: 'request', label: 'client navigation → hidden page' },
      states: { 'custom-server': 'active', 'custom-handle': 'active', 'rung-filesystem': 'na', 'app-router': 'current' },
      edges: ['e-custom-handle'],
      internals: ['next.config.js: useFileSystemPublicRoutes: false', 'docs: "disables filename routes from SSR; client-side routing may still access those paths"', 'server.js then maps paths to pages with handle(req, res, { ...parsedUrl, pathname })'],
      sources: [{ label: 'Custom server (Pages)', url: 'https://nextjs.org/docs/pages/building-your-application/configuring/custom-server' }]
    },
    {
      id: 'j10-13', kind: 'explain', title: 'In development',
      story: 'In next dev the HMR WebSocket arrives as an upgrade event on our server, so server.js has to forward it to Next.js or the page never receives updates. server.js is also outside the watcher, so editing it means restarting by hand.',
      camera: { kind: 'entities', ids: ['custom-server', 'custom-handle', 'routing-ladder', 'dev-hmr'] },
      token: { at: 'custom-server', glyph: 'request', label: 'upgrade /_next/hmr → forward' },
      states: { 'custom-server': 'current', 'custom-handle': 'active', 'routing-ladder': 'active', 'dev-hmr': 'active' },
      edges: ['e-dev-custom-upgrade'],
      internals: ['server.on("upgrade", (req, socket, head) => app.getUpgradeHandler()(req, socket, head))', 'nodemon or similar to restart on server.js changes'],
      sources: [CUSTOM]
    },
    {
      id: 'j10-14', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'entities', ids: [...LADDER, 'custom-healthz', 'loader-tree'] },
      states: { 'custom-server': 'active', 'custom-handle': 'active', 'custom-healthz': 'active', 'routing-ladder': 'active', 'rung-headers': 'active', 'rung-redirects': 'active', proxy: 'active', 'rung-before-files': 'active', 'rung-filesystem': 'active', 'loader-tree': 'active' },
      edges: ['e-custom-handle', 'e-handle-ladder', 'e-custom-healthz', 'e-ladder-loader'],
      checks: [
        { statement: 'A custom server can skip Proxy by calling handle with a modified URL.', isTrue: false, why: 'parsedUrl only changes the input. Whatever reaches handle climbs the whole ladder, Proxy included (step 5).' },
        { statement: 'A custom server replaces render-server.', isTrue: false, why: 'It wraps the HTTP entry and router-server. Rendering still happens in render-server, for App and Pages routes alike (step 8).' },
        { statement: 'A request server.js answers without calling handle is invisible to Next.js.', isTrue: true, why: 'The ladder starts inside handle, so /healthz gets no configured headers and no Proxy (step 7).' }
      ]
    }
  ]
}
