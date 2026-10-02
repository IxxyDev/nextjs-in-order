import type { Journey } from '../types'

const DOCS = 'https://nextjs.org/docs/app'

export const OPTIMIZATIONS: Journey = {
  id: 'j11',
  slug: 'optimizations',
  title: 'Built-in optimizations',
  following: 'the request GET /dashboard/settings as each built-in lever is applied: rendering, chunks, imports, lazy boundaries, images, fonts, scripts and tracing',
  whatShouldClick: 'Each optimization moves work earlier (to the build) or narrower (fewer bytes, fewer renders), and each one follows from a mechanism already on the map.',
  steps: [
    {
      id: 'j11-1', kind: 'explain', title: 'Static: no work at request time',
      story: 'The cheapest render is one that already happened. The settings page reads only cached data, so the build renders it once and every request is answered from the server cache without running React.',
      camera: { kind: 'entities', ids: ['route-analysis', 'prerender', 'prerendered-outputs', 'server-cache'] },
      token: { at: 'server-cache', glyph: 'html', label: '/dashboard/settings · rendered once at build' },
      states: { 'route-analysis': 'active', prerender: 'kept', 'prerendered-outputs': 'kept', 'server-cache': 'fresh', html: 'active', 'rsc-runtime-entity': 'na', 'ssr-runtime-entity': 'na' },
      edges: ['e-route-analysis-prerender', 'e-prerender-outputs', 'e-outputs-server-cache', 'e-server-cache-html'],
      internals: ['○ /dashboard/settings in the build summary', 'cacheComponents: true → nothing is cached by default; the page is static because getProfile() is "use cache"', 'without Cache Components a route stays static until it reads cookies(), headers(), searchParams or an uncached fetch'],
      sources: [{ label: 'cacheComponents', url: `${DOCS}/api-reference/config/next-config-js/cacheComponents` }, { label: 'Caching', url: `${DOCS}/getting-started/caching` }]
    },
    {
      id: 'j11-2', kind: 'explain', title: 'ISR: reuse, then refresh',
      story: 'When data changes now and then, a rendered result can still be reused. Post 7 is served from the cache and, once it is older than 60 seconds, regenerated in the background while the stale copy keeps answering, so no visitor waits for the render.',
      camera: { kind: 'entities', ids: ['server-cache', 'isr-regeneration', 'pages-renderer'] },
      token: { at: 'server-cache', glyph: 'html', label: 'posts/7 · stale → regenerate behind' },
      states: { 'server-cache': 'stale', 'isr-regeneration': 'current', 'pages-renderer': 'active', html: 'active', dom: 'new' },
      edges: ['e-pages-regen', 'e-regen-server-cache'],
      internals: ['getStaticProps → { revalidate: 60 }', 'App Router counterpart: cacheLife("hours") on getProfile(); revalidateTag("profile", "max") for stale-while-revalidate'],
      sources: [{ label: 'ISR', url: 'https://nextjs.org/docs/pages/guides/incremental-static-regeneration' }]
    },
    {
      id: 'j11-3', kind: 'explain', title: 'PPR: only the stable part is prebuilt',
      story: 'Billing cannot be fully static because one part reads cookies. The build still renders everything outside the Suspense boundary as a shell, so a request only computes the hole.',
      camera: { kind: 'entities', ids: ['prerender', 'ppr-shell', 'server-cache', 'rsc-runtime-entity'] },
      token: { at: 'server-cache', glyph: 'html', label: 'billing shell ⏸ · stored' },
      states: { 'src-billing-page': 'active', prerender: 'active', 'ppr-shell': 'current', 'server-cache': 'fresh', 'rsc-runtime-entity': 'active', 'suspense-hole': 'active' },
      edges: ['e-prerender-ppr', 'e-ppr-server-cache', 'e-ppr-resume'],
      internals: ['◐ /dashboard/billing', 'cacheComponents: true implements PPR; experimental.ppr was removed in 16.0'],
      sources: [{ label: 'cacheComponents', url: `${DOCS}/api-reference/config/next-config-js/cacheComponents` }]
    },
    {
      id: 'j11-4', kind: 'explain', title: 'Chunks along stable lines',
      story: 'Browser code is grouped so it caches well: React and Next in one framework chunk that rarely changes, large packages in chunks of their own, a small runtime, and one chunk per route. Moving from settings to billing downloads only billing\'s chunk.',
      camera: { kind: 'entities', ids: ['bundler', 'flight-client-entry-plugin', 'split-chunks', 'browser-chunks'] },
      token: { at: 'browser-chunks', glyph: 'browser-chunk', label: 'framework · lib · runtime · route' },
      states: { bundler: 'active', 'flight-client-entry-plugin': 'kept', 'split-chunks': 'current', 'browser-chunks': 'new' },
      edges: ['e-bundler-client-entry', 'e-client-entry-split', 'e-split-browser-chunks'],
      internals: ['framework: react, react-dom, scheduler, next → framework-a1b2c3.js', 'lib: a node_modules module larger than ~160 KB gets its own chunk', 'runtime: webpack-9c0d.js', 'route: app/dashboard/billing/page-7a8b.js', 'these are the Webpack splitChunks cacheGroups; Turbopack (default since 16.0) chunks by its own rules with the same aims'],
      sources: [{ label: 'Turbopack', url: `${DOCS}/api-reference/turbopack` }]
    },
    {
      id: 'j11-5', kind: 'transform', title: 'Barrel imports rewritten',
      story: 'A named import from a package that re-exports everything would drag the whole package into the graph. For listed packages the compiler rewrites the import to the one file that defines it, so there is less to bundle and less to ship.',
      camera: { kind: 'entities', ids: ['src-profile-form', 'swc', 'bundler'] },
      token: { at: 'swc', glyph: 'transformed-module', label: 'import { Button } from \'ui-kit\' → ui-kit/button' },
      states: { 'src-profile-form': 'active', swc: 'current', bundler: 'kept' },
      edges: ['e-form-compile', 'e-swc-bundler'],
      internals: ['next.config.js: experimental.optimizePackageImports: ["ui-kit"]', 'a built-in list of popular packages is optimized without configuration', 'modularizeImports is the older, pattern-based form of the same rewrite'],
      sources: [{ label: 'optimizePackageImports', url: `${DOCS}/api-reference/config/next-config-js/optimizePackageImports` }]
    },
    {
      id: 'j11-6', kind: 'transform', title: 'A lazy boundary, a separate chunk',
      story: 'Wrapping ProfileForm\'s import in next/dynamic makes the import a boundary: the bundler puts everything behind it into its own chunk, and the browser fetches that chunk only when the form first renders, showing a fallback meanwhile. Turning off server rendering for it is allowed only from a Client Component.',
      camera: { kind: 'entities', ids: ['next-dynamic', 'suspense-hole', 'react-client', 'client-components'] },
      token: { at: 'next-dynamic', glyph: 'browser-chunk', label: 'ProfileForm · own lazy chunk' },
      states: { 'src-profile-form': 'active', bundler: 'kept', 'split-chunks': 'active', 'next-dynamic': 'new', 'suspense-hole': 'active', 'client-components': 'kept' },
      edges: ['e-split-dynamic', 'e-dynamic-suspense'],
      internals: ['const ProfileForm = dynamic(() => import(\'@/components/ProfileForm\'), { loading: () => <p>…</p> })', 'App Router: a composite of React.lazy() and Suspense; loading becomes the fallback', 'Pages Router: Loadable waits delay: 200 ms before showing loading (loadable.shared-runtime.tsx)', 'ssr: false inside a Server Component is an error'],
      sources: [{ label: 'Lazy loading', url: `${DOCS}/guides/lazy-loading` }, { label: 'loadable.shared-runtime.tsx', url: 'https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/loadable.shared-runtime.tsx' }]
    },
    {
      id: 'j11-7', kind: 'move', title: 'One image, many sizes',
      story: 'The image component reserves the box from its width and height before any byte arrives and lists several widths in srcset. The browser picks 640 and asks the server; the optimizer resizes with sharp, chooses WebP from the Accept header, stores the result on disk and answers without React.',
      camera: { kind: 'entities', ids: ['next-image', 'image-optimizer', 'sharp', 'rung-filesystem'] },
      token: { at: 'image-optimizer', glyph: 'request', label: 'hero.jpg · w=640 · q=75' },
      states: { 'next-image': 'current', dom: 'active', 'rung-filesystem': 'kept', 'image-optimizer': 'active', sharp: 'active', 'image-cache': 'new', 'rsc-runtime-entity': 'dimmed' },
      edges: ['e-next-image-dom', 'e-next-image-optimizer', 'e-filesystem-image', 'e-image-sharp', 'e-image-cache'],
      internals: ['cache key /hero.jpg|640|75|webp in .next/cache/images', 'Accept: image/avif,image/webp,… → webp (avif only when images.formats lists it)', 'srcset from deviceSizes [640, 750, 828, 1080, 1200, 1920, 2048, 3840]', '16.0 defaults: minimumCacheTTL 4 h, qualities [75], imageSizes without 16, maximumRedirects 3, local IPs blocked, localPatterns.search required for query strings', 'SVG is not optimized by the default loader'],
      sources: [{ label: 'Image component', url: `${DOCS}/api-reference/components/image` }, { label: 'Upgrading to 16', url: `${DOCS}/guides/upgrading/version-16` }]
    },
    {
      id: 'j11-8', kind: 'transform', title: 'Local fonts become CSS at build',
      story: 'A next/font/local call in the root layout is executed by the build, not the browser. The font file is copied next to the other static assets under a hashed name, and an @font-face rule with a class name is generated, so the page ships CSS pointing at its own origin.',
      camera: { kind: 'entities', ids: ['src-root-layout', 'font-loader', 'bundler', 'swc'] },
      token: { at: 'font-loader', glyph: 'transformed-module', label: 'localFont() → @font-face + className' },
      states: { 'src-root-layout': 'active', 'font-loader': 'current', bundler: 'kept', 'font-css': 'new' },
      edges: ['e-root-layout-font', 'e-font-loader-css'],
      internals: ['const font = localFont({ src: \'./fonts/<name>.woff2\' }) → { className, style, variable }', 'file → .next/static/media/<hash>.woff2', 'next-font-loader in the CSS loader chain (Webpack); Turbopack handles next/font itself', 'preload link only on routes that use the font'],
      sources: [{ label: 'Font module', url: `${DOCS}/api-reference/components/font` }]
    },
    {
      id: 'j11-9', kind: 'move', title: 'Google fonts are fetched by the build',
      story: 'next/font/google takes one extra hop: during the build the loader downloads the stylesheet and font files from Google and self-hosts them, so a visitor\'s browser never contacts Google. If the download fails, the dev server warns and uses a fallback font, while next build fails.',
      camera: { kind: 'entities', ids: ['google-fonts', 'font-loader', 'src-root-layout', 'bundler'] },
      token: { at: 'google-fonts', glyph: 'request', label: 'fonts.googleapis.com · at build' },
      states: { 'google-fonts': 'current', 'font-loader': 'active', 'src-root-layout': 'active', 'font-css': 'new', dom: 'dimmed' },
      edges: ['e-google-font-loader', 'e-root-layout-font', 'e-font-loader-css'],
      internals: ['download moment: next build; in dev, the first compile that reaches the font', 'dev failure: "Failed to download … Using fallback font instead", fallback @font-face emitted', 'build failure: the error is thrown and the build stops; CI needs access to Google Fonts', 'no request to Google at runtime'],
      sources: [{ label: 'Font module', url: `${DOCS}/api-reference/components/font` }, { label: 'font/src/google/loader.ts', url: 'https://github.com/vercel/next.js/blob/canary/packages/font/src/google/loader.ts' }]
    },
    {
      id: 'j11-10', kind: 'explain', title: 'Fallback metrics stop the jump',
      story: 'Until the web font arrives, text is drawn in a local fallback, and swapping fonts would normally shift the layout. The loader also writes a fallback face sized to the web font\'s metrics, so the swap does not move anything.',
      camera: { kind: 'entities', ids: ['font-css', 'dom', 'next-f', 'next-image'] },
      token: { at: 'font-css', glyph: 'json', label: 'fallback · size-adjust · ascent-override' },
      states: { 'font-loader': 'kept', 'font-css': 'current', dom: 'active' },
      edges: ['e-font-loader-css', 'e-font-css-dom'],
      internals: ['adjustFontFallback on by default → "<Font> Fallback" with size-adjust, ascent-override, descent-override, line-gap-override', 'fallback base: Arial (sans-serif) or Times New Roman (serif)', 'display: swap by default'],
      sources: [{ label: 'Font module', url: `${DOCS}/api-reference/components/font` }]
    },
    {
      id: 'j11-11', kind: 'explain', title: 'Third-party scripts on a timeline',
      story: 'next/script decides when a third-party script runs relative to hydration: beforeInteractive before it, afterInteractive (the default) right after it, lazyOnload in idle time. The fourth strategy, worker, moves the script into a web worker, but it is experimental, Pages Router only and not supported by Turbopack, so it does not apply to this page.',
      camera: { kind: 'entities', ids: ['dom', 'react-client', 'next-script', 'script-worker'] },
      token: { at: 'next-script', glyph: 'runtime', label: 'before ▸ hydrate ▸ after ▸ idle' },
      states: { dom: 'active', 'react-client': 'active', 'next-script': 'current', 'script-worker': 'na' },
      edges: ['e-react-script', 'e-script-worker'],
      internals: ['<Script src="…" strategy="beforeInteractive" /> belongs in the root layout; it is injected into the initial HTML', 'afterInteractive: default', 'lazyOnload: browser idle time', 'worker: experimental.nextScriptWorkers + Partytown; Pages Router only; n/a under Turbopack', 'onLoad / onReady / onError need a Client Component'],
      sources: [{ label: 'Script component', url: `${DOCS}/api-reference/components/script` }, { label: 'Turbopack', url: `${DOCS}/api-reference/turbopack` }]
    },
    {
      id: 'j11-12', kind: 'explain', title: 'Tracing shrinks the deploy, not the render',
      story: 'File tracing lists only the files each server entry needs, so the deploy is smaller and a fresh instance starts faster. Once running, the React render executes exactly the same code.',
      camera: { kind: 'entities', ids: ['server-chunks', 'tracing', 'standalone', 'rsc-runtime-entity'] },
      token: { at: 'tracing', glyph: 'server-chunk', label: 'settings/page.js.nft.json' },
      states: { 'server-chunks': 'active', tracing: 'current', standalone: 'new', 'rsc-runtime-entity': 'kept' },
      edges: ['e-server-chunks-tracing', 'e-tracing-standalone'],
      internals: ['@vercel/nft → .nft.json per entry', 'output: "standalone" copies the traced subset of node_modules', 'cold start: fewer files to load; render cost unchanged'],
      sources: [{ label: 'output', url: `${DOCS}/api-reference/config/next-config-js/output` }]
    },
    {
      id: 'j11-13', kind: 'predict', title: 'Which lever touches the render?',
      story: 'Every lever so far makes something smaller or earlier. Only some of them change what happens when /dashboard/settings is rendered.',
      camera: { kind: 'world' },
      states: { 'rsc-runtime-entity': 'current', 'ssr-runtime-entity': 'current', 'next-image': 'active', 'font-loader': 'active', 'next-script': 'active', tracing: 'active' },
      edges: [],
      question: {
        text: 'Which of these speeds up the React render itself?',
        options: ['next/image, because the page carries smaller images', 'next/font, because no font request blocks the page', 'File tracing, because there is less code to load', 'None of them'],
        answer: 3,
        why: 'Images, fonts and scripts change the bytes and requests around the document; tracing changes the deploy and startup. The render runs the same components either way. What makes it cheaper is not running it per request: static, ISR and PPR.'
      }
    },
    {
      id: 'j11-14', kind: 'reveal', title: 'Levers around the render',
      story: 'None of image, font, script or tracing changes the render; they act before it, after it or beside it. Static, ISR and PPR avoid the render at request time, and chunking reduces what the browser downloads before it can hydrate.',
      camera: { kind: 'world' },
      states: {
        'rsc-runtime-entity': 'kept', 'ssr-runtime-entity': 'kept', 'server-cache': 'fresh', 'ppr-shell': 'current', 'isr-regeneration': 'current', prerender: 'current',
        'split-chunks': 'active', 'browser-chunks': 'active', 'next-image': 'na', 'image-optimizer': 'na', 'font-loader': 'na', 'font-css': 'na', 'next-script': 'na', tracing: 'na'
      },
      edges: [],
      internals: ['render-time levers: ○ static, ● ISR, ◐ PPR (and "use cache" inside a dynamic render)', 'download-time levers: chunk policy, optimizePackageImports, next/dynamic', 'around the render: next/image, next/font, next/script', 'deploy-time: file tracing']
    },
    {
      id: 'j11-15', kind: 'explain', title: 'Levers on the map',
      story: 'Each optimization sits on a mechanism already on the map: build levers move work earlier, server levers serve stored results, browser levers ship fewer bytes at better moments. None of them adds a new step to the request; they shrink an existing step or move it into the build.',
      camera: { kind: 'world' },
      states: {
        'route-analysis': 'active', prerender: 'active', 'prerendered-outputs': 'active', 'server-cache': 'fresh', 'isr-regeneration': 'active', 'ppr-shell': 'active',
        swc: 'active', 'split-chunks': 'active', 'browser-chunks': 'active', 'next-dynamic': 'active',
        'next-image': 'active', 'image-optimizer': 'active', sharp: 'active', 'image-cache': 'fresh',
        'font-loader': 'active', 'google-fonts': 'active', 'font-css': 'active', 'next-script': 'active', 'script-worker': 'na',
        tracing: 'active', standalone: 'active'
      },
      edges: [],
      internals: ['build: route analysis, prerender, SWC import rewrite, chunk policy, next/font, tracing', 'request: server cache, ISR regeneration, PPR resume, image optimizer + sharp + image cache', 'browser: route and lazy chunks, reserved image box, fallback font metrics, script strategies']
    },
    {
      id: 'j11-16', kind: 'check', title: 'Check yourself',
      story: 'Three statements about the levers you just placed.',
      camera: { kind: 'world' },
      states: { tracing: 'active', standalone: 'active', 'font-loader': 'active', 'google-fonts': 'active', 'image-optimizer': 'active', 'image-cache': 'fresh' },
      edges: [],
      checks: [
        { statement: 'Tracing makes rendering faster.', isTrue: false, why: 'Tracing decides which files ship with each server entry. It shrinks the deploy and speeds a cold start; the render runs the same code.' },
        { statement: 'next/font/google fetches the font at request time.', isTrue: false, why: 'The loader downloads the stylesheet and files during the build (the first compile in dev) and self-hosts them. The browser never contacts Google, and a failed download stops next build.' },
        { statement: 'The image optimizer resizes the same image again on every request.', isTrue: false, why: 'The first request for a url, width, quality and format stores the result in the image cache; later requests are served from disk until the entry expires.' }
      ]
    }
  ]
}
