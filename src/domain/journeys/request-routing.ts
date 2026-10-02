import type { Journey } from '../types'

const ORDER = { label: 'Proxy: execution order', url: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy#execution-order' }

export const REQUEST_ROUTING: Journey = {
  id: 'j2',
  slug: 'request-routing',
  title: 'Incoming request and server routing',
  following: 'GET /dashboard/settings up the routing ladder, then a static chunk, a public file, an image and an API request',
  whatShouldClick: 'Most requests never reach React; router-server decides, render-server renders.',
  steps: [
    {
      id: 'j2-1', kind: 'explain', title: 'One server, one callback',
      story: 'next start opens a plain Node HTTP server with a single callback, and every request enters through it, whatever it asks for. The socket starts listening before the server is ready, so requests that arrive early are held and released once loading finishes.',
      camera: { kind: 'entities', ids: ['node-http', 'request-queue', 'custom-server', 'routing-ladder'] },
      token: { at: 'node-http', glyph: 'request', label: 'GET /dashboard/settings' },
      states: { 'node-http': 'current', 'request-queue': 'new', 'routing-ladder': 'dimmed' },
      edges: ['e-http-queue'],
      internals: ['http.createServer((req, res) => requestHandler(req, res))', 'packages/next/src/server/lib/start-server.ts: listen first, then await the request handler', 'two layers: lib/router-server.ts decides, lib/render-server.ts renders'],
      sources: [{ label: 'next start (CLI)', url: 'https://nextjs.org/docs/app/api-reference/cli/next' }]
    },
    {
      id: 'j2-2', kind: 'move', title: 'Startup loads the tables',
      story: 'Before the first request is handled, router-server reads what the build left behind into memory: the build ID, the lists of pages and handlers, the files in the public folder, the redirect and rewrite rules and the Proxy matchers. From then on every routing decision is a lookup in these tables.',
      camera: { kind: 'entities', ids: ['routes-manifest', 'middleware-manifest', 'public-dir', 'routing-ladder'] },
      token: { at: 'routing-ladder', glyph: 'manifest', label: 'buildId k7Qm2xLp9 · routes · matchers' },
      states: { 'routing-ladder': 'current', 'routes-manifest': 'active', 'middleware-manifest': 'active', 'public-dir': 'active', 'request-queue': 'kept', 'node-http': 'kept' },
      edges: ['e-manifest-ladder', 'e-public-ladder', 'e-queue-ladder'],
      internals: ['.next/BUILD_ID: k7Qm2xLp9', 'routes-manifest.json: headers, redirects, rewrites { beforeFiles, afterFiles, fallback }, staticRoutes, dynamicRoutes with regexes', 'server/pages-manifest.json + server/app-paths-manifest.json: pages and handlers', 'server/middleware-manifest.json: the matcher /dashboard/:path* as a regex', 'next dev: the watcher builds the same tables live'],
      sources: [ORDER]
    },
    {
      id: 'j2-3', kind: 'move', title: 'Step 1: configured headers',
      story: 'The request climbs a fixed ladder of eight steps. Step 1 applies the response headers from the config: the rule for /:path* matches, so X-Frame-Options will be on whatever answer comes back. Headers never end a request; it climbs on.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'rung-headers', 'rung-redirects', 'proxy', 'rung-before-files'] },
      token: { at: 'rung-headers', glyph: 'request', label: '1 headers: + X-Frame-Options' },
      states: { 'rung-headers': 'current', 'routing-ladder': 'kept', 'rung-redirects': 'dimmed', proxy: 'dimmed', 'rung-before-files': 'dimmed' },
      edges: ['e-ladder-headers'],
      internals: ['next.config.js: headers() → [{ source: "/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }] }]'],
      sources: [ORDER, { label: 'headers', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/headers' }]
    },
    {
      id: 'j2-4', kind: 'move', title: 'Step 2: configured redirects',
      story: 'Step 2 checks the configured redirects. /dashboard/settings matches none and climbs on, but a request for /old-settings would leave right here with a 308 to /dashboard/settings, before Proxy or any page code ran.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'rung-headers', 'rung-redirects', 'proxy', 'rung-before-files'] },
      token: { at: 'rung-redirects', glyph: 'request', label: '2 redirects: no match' },
      states: { 'rung-headers': 'kept', 'rung-redirects': 'current', 'routing-ladder': 'kept', proxy: 'dimmed', 'rung-before-files': 'dimmed' },
      edges: ['e-ladder-headers', 'e-headers-redirects'],
      internals: ['next.config.js: redirects() → [{ source: "/old-settings", destination: "/dashboard/settings", permanent: true }]', 'permanent: true → 308; permanent: false → 307'],
      sources: [ORDER, { label: 'redirects', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects' }]
    },
    {
      id: 'j2-5', kind: 'move', title: 'Step 3: Proxy',
      story: 'The path matches the Proxy matcher /dashboard/:path*, so the proxy function runs. The session cookie is present, so it lets the request through; its decision travels back to router-server as headers. Since Next.js 16 Proxy runs on Node by default; the articles describe it on the Edge runtime under its old name, Middleware.',
      camera: { kind: 'entities', ids: ['rung-redirects', 'proxy', 'rung-before-files', 'middleware-manifest'] },
      token: { at: 'proxy', glyph: 'request', label: '3 Proxy: matcher ✓ → next' },
      states: { 'rung-headers': 'kept', 'rung-redirects': 'kept', proxy: 'current', 'middleware-manifest': 'active', 'routing-ladder': 'kept', 'rung-before-files': 'dimmed' },
      edges: ['e-redirects-proxy', 'e-middleware-manifest-proxy'],
      internals: ['proxy.ts: export const config = { matcher: ["/dashboard/:path*"] }', 'no session cookie → NextResponse.redirect(new URL("/login", request.url))', 'decision encoded in response headers (x-middleware-next, x-middleware-rewrite, Location) and read back by router-server', 'inside Proxy, rsc, next-router-state-tree and next-router-prefetch are stripped from request.headers', 'article snapshot: Middleware, always Edge · current: proxy.ts, Node.js, runtime option not allowed; middleware.ts deprecated for Edge'],
      sources: [{ label: 'proxy.js', url: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy' }, { label: 'Upgrading to 16', url: 'https://nextjs.org/docs/app/guides/upgrading/version-16' }]
    },
    {
      id: 'j2-6', kind: 'move', title: 'Step 4: beforeFiles rewrites',
      story: 'Step 4 applies beforeFiles rewrites, the only rewrites allowed to shadow real files and pages because they run before anything is looked up. The example app defines none, so the path is unchanged.',
      camera: { kind: 'entities', ids: ['proxy', 'rung-before-files', 'rung-filesystem', 'rung-fallback'] },
      token: { at: 'rung-before-files', glyph: 'request', label: '4 beforeFiles: none' },
      states: { 'rung-headers': 'kept', 'rung-redirects': 'kept', proxy: 'kept', 'rung-before-files': 'current', 'rung-filesystem': 'dimmed', 'routing-ladder': 'kept' },
      edges: ['e-proxy-before-files'],
      internals: ['next.config.js: rewrites() may return { beforeFiles, afterFiles, fallback }; a plain array means afterFiles'],
      sources: [ORDER, { label: 'rewrites', url: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites' }]
    },
    {
      id: 'j2-7', kind: 'move', title: 'Step 5: the filesystem check',
      story: 'Step 5 compares the path with everything known to exist: build files, public files, the image endpoint, pages and handlers. /dashboard/settings is an exact page route, so the climb stops here with a match.',
      camera: { kind: 'entities', ids: ['rung-headers', 'rung-before-files', 'rung-filesystem', 'early-exits'] },
      token: { at: 'rung-filesystem', glyph: 'request', label: '5 filesystem: page /dashboard/settings' },
      states: { 'rung-headers': 'kept', 'rung-redirects': 'kept', proxy: 'kept', 'rung-before-files': 'kept', 'rung-filesystem': 'current', 'routing-ladder': 'kept' },
      edges: ['e-before-files-filesystem'],
      internals: ['order inside the check: /_next/static, public/, /_next/image, then static page and handler routes', 'static routes match before dynamic ones: /dashboard/settings wins without trying /products/[id]', 'packages/next/src/server/lib/router-utils/filesystem.ts'],
      sources: [ORDER]
    },
    {
      id: 'j2-8', kind: 'explain', title: 'Steps 6–8 are skipped',
      story: 'The last three steps do not run for this request. afterFiles rewrites, dynamic routes such as /products/[id] and fallback rewrites only matter when nothing has matched yet, which is why a real file or page always beats a pattern.',
      camera: { kind: 'entities', ids: ['rung-filesystem', 'rung-after-files', 'rung-dynamic', 'rung-fallback'] },
      token: { at: 'rung-filesystem', glyph: 'request', label: '5 filesystem: match' },
      states: { 'rung-headers': 'kept', 'rung-redirects': 'kept', proxy: 'kept', 'rung-before-files': 'kept', 'rung-filesystem': 'current', 'rung-after-files': 'na', 'rung-dynamic': 'na', 'rung-fallback': 'na', 'routing-ladder': 'kept' },
      edges: [],
      internals: ['6 afterFiles rewrites → filesystem check again', '7 dynamic routes in priority order (regexes from routes-manifest)', '8 fallback rewrites, then 404'],
      sources: [ORDER]
    },
    {
      id: 'j2-9', kind: 'move', title: 'Handoff to render-server',
      story: 'router-server hands the request to render-server together with what it worked out: the resolved path and its params. Deciding and rendering are separate jobs; if render-server answers that it cannot render the path, the ladder resumes at the next step (the dotted line back).',
      camera: { kind: 'entities', ids: ['rung-filesystem', 'rung-after-files', 'loader-tree'] },
      token: { at: 'loader-tree', glyph: 'request', label: '/dashboard/settings · params {}' },
      states: { 'rung-filesystem': 'kept', 'rung-after-files': 'dimmed', 'loader-tree': 'current', 'rsc-runtime-entity': 'dimmed', 'routing-ladder': 'kept' },
      edges: ['e-filesystem-loader', 'e-loader-after-files'],
      internals: ['router-server and render-server talk over server/lib/server-ipc', 'render-server hosts BaseServer → NextNodeServer; the article\'s NextWebServer was removed in 15.x', 'App and Pages routes share this handoff; the router choice happens inside render-server'],
      sources: [{ label: 'packages/next/src/server/lib', url: 'https://github.com/vercel/next.js/tree/canary/packages/next/src/server/lib' }]
    },
    {
      id: 'j2-10', kind: 'predict', title: 'A request for a chunk',
      story: 'The HTML for /dashboard/settings lists its browser chunks, so the browser now asks for them. The first one is the framework chunk.',
      camera: { kind: 'entities', ids: ['node-http', 'routing-ladder', 'rung-filesystem', 'early-exits', 'loader-tree'] },
      token: { at: 'routing-ladder', glyph: 'request', label: 'GET /_next/static/chunks/framework-a1b2c3.js' },
      states: { 'node-http': 'kept', 'routing-ladder': 'current', 'rung-filesystem': 'dimmed', 'early-exits': 'dimmed', 'loader-tree': 'dimmed' },
      edges: ['e-http-ladder'],
      question: {
        text: 'GET /_next/static/chunks/framework-a1b2c3.js: which regions does it touch?',
        options: ['HTTP entry, router-server, render-server and the RSC runtime', 'HTTP entry and router-server only; it leaves at the filesystem step', 'HTTP entry, router-server and render-server, which streams the file', 'None: Next.js never sees chunk requests'],
        answer: 1,
        why: 'The filesystem step knows /_next/static is build output and serves the file from disk. No page or handler matched, so render-server and React are never reached.'
      }
    },
    {
      id: 'j2-11', kind: 'reveal', title: 'Static files leave at step 5',
      story: 'The chunk never reaches render-server: the filesystem step recognizes build output and streams the file from disk. Proxy did not even run, because its matcher only covers /dashboard. A request for /logo.svg takes the same exit from the public folder.',
      camera: { kind: 'entities', ids: ['proxy', 'rung-filesystem', 'early-exits', 'loader-tree'] },
      token: { at: 'early-exits', glyph: 'browser-chunk', label: '200 framework-a1b2c3.js · from disk' },
      states: { 'node-http': 'kept', 'routing-ladder': 'kept', 'rung-headers': 'kept', 'rung-redirects': 'kept', proxy: 'dimmed', 'rung-before-files': 'kept', 'rung-filesystem': 'kept', 'early-exits': 'current', 'browser-chunks': 'active', 'public-dir': 'active', 'loader-tree': 'dimmed' },
      edges: ['e-filesystem-exits', 'e-chunks-exits', 'e-public-exits'],
      internals: ['/_next/static/* → .next/static/*, Cache-Control: public, max-age=31536000, immutable', 'GET /logo.svg → public/logo.svg', 'a public file with the same path as a page is a conflict reported at build'],
      sources: [{ label: 'public folder', url: 'https://nextjs.org/docs/app/api-reference/file-conventions/public-folder' }]
    },
    {
      id: 'j2-12', kind: 'move', title: 'Images and endpoints',
      story: 'Two more exits. The image request leaves for the optimizer, which produces a 640-pixel variant in the format the browser accepts, keeps it in its disk cache and answers without React. GET /api/hello reaches render-server exactly like a page would, but its handler returns { ok: true } directly; Route Handlers work the same way with a method table.',
      camera: { kind: 'entities', ids: ['rung-filesystem', 'image-optimizer', 'image-cache', 'route-handler'] },
      token: { at: 'image-optimizer', glyph: 'request', label: 'GET /_next/image?url=/hero.jpg&w=640&q=75' },
      states: { 'rung-filesystem': 'kept', 'early-exits': 'kept', 'image-optimizer': 'current', 'image-cache': 'new', 'route-handler': 'active', 'rsc-runtime-entity': 'dimmed', 'ssr-runtime-entity': 'dimmed', 'loader-tree': 'dimmed' },
      edges: ['e-filesystem-image', 'e-image-cache', 'e-filesystem-route-handler'],
      internals: ['image cache key: /hero.jpg|640|75|webp in .next/cache/images; format chosen from the Accept header', '16.0 image defaults: minimumCacheTTL 4 h, qualities [75], local IPs blocked', 'pages/api/hello.ts: (req, res) => res.json({ ok: true }) with body parsing and cookie helpers', 'app/**/route.ts: export async function GET(request) → Response'],
      sources: [{ label: 'Image component', url: 'https://nextjs.org/docs/app/api-reference/components/image' }, { label: 'Route Handlers', url: 'https://nextjs.org/docs/app/api-reference/file-conventions/route' }]
    },
    {
      id: 'j2-13', kind: 'explain', title: 'Minimal mode',
      story: 'On serverless platforms the platform routes requests before Next.js is invoked, so the server runs in minimal mode: headers, redirects, rewrites and static files are handled outside, and the request is driven straight to rendering. router-server still owns the request; it just has far less to decide.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'rung-headers', 'rung-fallback', 'early-exits', 'loader-tree'] },
      token: { at: 'loader-tree', glyph: 'request', label: 'platform-routed request' },
      states: {
        'routing-ladder': 'active', 'rung-headers': 'na', 'rung-redirects': 'na', proxy: 'na', 'rung-before-files': 'na', 'rung-filesystem': 'na',
        'rung-after-files': 'na', 'rung-dynamic': 'na', 'rung-fallback': 'na', 'early-exits': 'na', 'image-optimizer': 'na', 'loader-tree': 'current'
      },
      edges: ['e-ladder-loader'],
      internals: ['minimalMode is an option of the custom server factory (packages/next/src/server/next.ts) and of BaseServer', 'NEXT_PRIVATE_MINIMAL_MODE=1', 'the platform reads the same routes manifest to configure its own routing'],
      sources: [{ label: 'packages/next/src/server/next.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/server/next.ts' }]
    },
    {
      id: 'j2-14', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'region', id: 'router-server' },
      states: {
        'node-http': 'active', 'routing-ladder': 'active', 'rung-headers': 'active', 'rung-redirects': 'active', proxy: 'active', 'rung-before-files': 'active', 'rung-filesystem': 'active',
        'rung-after-files': 'active', 'rung-dynamic': 'active', 'rung-fallback': 'active', 'early-exits': 'active', 'image-optimizer': 'active', 'loader-tree': 'active', 'route-handler': 'active'
      },
      edges: ['e-headers-redirects', 'e-redirects-proxy', 'e-proxy-before-files', 'e-before-files-filesystem', 'e-filesystem-exits', 'e-filesystem-image'],
      checks: [
        { statement: 'Proxy runs after the redirects from next.config.', isTrue: true, why: 'Configured headers and redirects are steps 1 and 2; Proxy is step 3. A configured redirect answers before Proxy ever runs.' },
        { statement: 'Every request reaches render-server.', isTrue: false, why: 'Redirects, static chunks, public files and images all leave inside router-server. Only matched pages and handlers are handed over.' },
        { statement: 'router-server renders HTML.', isTrue: false, why: 'router-server only decides where a request goes. Rendering happens in render-server, which receives the resolved path and params.' }
      ]
    }
  ]
}
