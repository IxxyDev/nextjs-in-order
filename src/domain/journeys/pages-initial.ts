import type { Journey } from '../types'

const GSSP = { label: 'getServerSideProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props' }
const GIP = { label: 'getInitialProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-initial-props' }
const ASO = { label: 'Automatic Static Optimization', url: 'https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization' }

export const PAGES_INITIAL: Journey = {
  id: 'j3',
  slug: 'pages-initial',
  title: 'Pages Router: the initial request',
  following: 'GET /products/42 (getServerSideProps), with /posts/7 (getStaticProps + ISR) as a parallel ghost',
  whatShouldClick: 'The whole page tree renders, the props are shipped twice, and the whole tree hydrates.',
  steps: [
    {
      id: 'j3-1', kind: 'explain', title: 'The strategy comes from the exports',
      story: 'In the Pages Router the build decides a page\'s strategy from what the file exports. A page with getServerSideProps is dynamic ƒ, one with getStaticProps is SSG ●, and one with no data function is prerendered as plain HTML ○. A getInitialProps on _app would switch that last optimization off for every page without getStaticProps.',
      camera: { kind: 'entities', ids: ['route-analysis', 'prerender-manifest', 'pages-manifest', 'prerender'] },
      token: { at: 'route-analysis', glyph: 'segment', label: '/products/[id] ƒ · /posts/[id] ●' },
      states: { 'route-analysis': 'current', 'prerender-manifest': 'new', 'pages-manifest': 'new', prerender: 'active' },
      edges: ['e-analysis-prerender-manifest', 'e-route-analysis-prerender'],
      internals: [
        'getServerSideProps → ƒ (rendered per request)',
        'getStaticProps (+ getStaticPaths) → ● (.html + .json at build, ISR with revalidate)',
        'no data function, no getInitialProps → ○ Automatic Static Optimization (.html at build)',
        'toggle: _app.getInitialProps present → pages without getStaticProps lose ASO and render per request'
      ],
      sources: [ASO]
    },
    {
      id: 'j3-2', kind: 'move', title: 'Matching /products/42',
      story: 'GET /products/42 climbs the same ladder as any request. No file and no static page has that path, so the dynamic routes are tried in priority order: static before dynamic before catch-all. /products/[id] matches with id = 42, and render-server finds its compiled module in the pages manifest.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'rung-dynamic', 'routes-manifest', 'pages-manifest', 'pages-renderer'] },
      token: { at: 'rung-dynamic', glyph: 'request', label: 'GET /products/42 → /products/[id]' },
      states: { 'routing-ladder': 'active', 'rung-dynamic': 'current', 'routes-manifest': 'active', 'pages-manifest': 'active', 'pages-renderer': 'new' },
      edges: ['e-manifest-ladder', 'e-dynamic-pages', 'e-pages-manifest-renderer'],
      internals: ['routes-manifest dynamicRoutes: { page: "/products/[id]", regex: "^/products/([^/]+?)(?:/)?$" }', 'pages-manifest: "/products/[id]": "pages/products/[id].js"', 'params: { id: "42" }']
    },
    {
      id: 'j3-3', kind: 'transform', title: 'getServerSideProps runs, on the server only',
      story: 'Before anything renders, the page\'s data function runs on the server with the request, the response, the params and the query, and reads product 42 from the database. Its code was cut out of the browser chunk at build time, so the chunk the browser will get has a hole where the function was.',
      camera: { kind: 'entities', ids: ['pages-renderer', 'gssp', 'browser-chunks'] },
      token: { at: 'browser-chunks', glyph: 'browser-chunk', label: 'products/[id] chunk · ✂ hole (no gSSP)' },
      states: { 'pages-renderer': 'active', gssp: 'current', db: 'active', 'browser-chunks': 'kept' },
      edges: ['e-pages-gssp', 'e-db-gssp', 'e-gssp-chunks-strip'],
      internals: ['getServerSideProps({ params: { id: "42" }, req, res, query }) → { props: { product } }', 'SWC next_ssg transform drops the export and every import only it uses from the client build', 'never cached by the framework; set Cache-Control on res yourself'],
      sources: [GSSP]
    },
    {
      id: 'j3-4', kind: 'explain', title: 'The ghost lane: /posts/7',
      story: 'The other page, /posts/7, ran getStaticProps at build time and was stored as HTML plus JSON. A request reads that entry: fresh is served, stale is served while a regeneration runs behind it. A post the build did not prerender follows getStaticPaths\' fallback: a 404, a fallback page, or a blocking first render.',
      camera: { kind: 'entities', ids: ['pages-renderer', 'server-cache', 'isr-regeneration', 'prerender-manifest'] },
      token: { at: 'server-cache', glyph: 'html', label: '/posts/7 · HTML + JSON · revalidate 60' },
      states: { 'pages-renderer': 'active', 'server-cache': 'fresh', 'isr-regeneration': 'active', 'prerender-manifest': 'active' },
      edges: ['e-prerender-manifest-cache', 'e-pages-server-cache', 'e-pages-regen'],
      internals: [
        'fresh → serve; stale → serve + regenerate in the background (see J8)',
        'fallback: false → unknown ids are 404',
        'fallback: true → a fallback page at once (router.isFallback), JSON fetched in the browser, then stored',
        'fallback: "blocking" → the first visitor waits for the render, then it is stored (this app)'
      ],
      sources: [{ label: 'getStaticPaths', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-static-paths' }, { label: 'ISR (Pages)', url: 'https://nextjs.org/docs/pages/guides/incremental-static-regeneration' }]
    },
    {
      id: 'j3-5', kind: 'explain', title: 'getInitialProps: the chunk without a hole',
      story: 'Suppose ProductPage used the older getInitialProps instead. It would run on the server for this first document, and in the browser on every later client navigation to the page. To run in the browser, its code has to be in the page chunk: no hole, and anything it imports, such as an API key, ships too.',
      camera: { kind: 'entities', ids: ['pages-renderer', 'gip', 'gssp', 'browser-chunks'] },
      token: { at: 'browser-chunks', glyph: 'browser-chunk', label: 'products/[id] chunk · gIP inside, no hole' },
      states: { 'pages-renderer': 'active', gip: 'current', gssp: 'kept', 'browser-chunks': 'active' },
      edges: ['e-pages-gip', 'e-gip-chunks'],
      internals: ['ProductPage.getInitialProps = async ({ query, req }) => ({ product })', 'req and res exist only on the server run; code must work in both environments', 'security: secrets read inside getInitialProps end up in the browser bundle'],
      sources: [GIP]
    },
    {
      id: 'j3-6', kind: 'transform', title: '_app wraps the page',
      story: 'The props are complete, so the tree can be assembled: _app receives the page component and its props and renders <ThemeProvider> around it. _app wraps every page, which is the only way the Pages Router shares UI across pages.',
      camera: { kind: 'entities', ids: ['pages-renderer', 'gssp', 'ssr-runtime-entity'] },
      token: { at: 'ssr-runtime-entity', glyph: 'segment', label: '<App Component={ProductPage} />' },
      states: { 'pages-renderer': 'active', gssp: 'kept', 'ssr-runtime-entity': 'current' },
      edges: ['e-pages-gssp', 'e-pages-ssr'],
      internals: ['pages/_app.tsx: export default function App({ Component, pageProps }) { return <ThemeProvider><Component {...pageProps} /></ThemeProvider> }'],
      sources: [{ label: 'Custom App', url: 'https://nextjs.org/docs/pages/building-your-application/routing/custom-app' }]
    },
    {
      id: 'j3-7', kind: 'transform', title: 'The whole tree becomes HTML',
      story: 'The ordinary React server renderer turns the entire tree into HTML: _app, ProductPage and every component under it. There is no RSC runtime and no Flight here. The data was fetched before rendering started, so nothing can stream in later the way a Suspense boundary does in the App Router.',
      camera: { kind: 'entities', ids: ['ssr-runtime-entity', 'html', 'pages-renderer', 'rsc-runtime-entity'] },
      token: { at: 'html', glyph: 'html', label: 'HTML of the whole page tree' },
      states: { 'ssr-runtime-entity': 'current', html: 'new', 'pages-renderer': 'active', 'rsc-runtime-entity': 'na' },
      edges: ['e-pages-ssr', 'e-ssr-html'],
      internals: ['article: _app tree rendered with renderToReadableStream from react-dom/server', '16.3 release notes: rendering moved to native Node streams (version-sensitive)', 'page-level data: one data function per page, no per-component fetching'],
      sources: [{ label: 'Next.js 16.3', url: 'https://nextjs.org/blog/next-16-3' }]
    },
    {
      id: 'j3-8', kind: 'transform', title: '_document builds the shell',
      story: '_document places the rendered app inside <Html>, <Head> and <body>. <Main/> marks where the app HTML goes; <NextScript/> looks up this page\'s chunks in the build manifest and writes their script tags. _document exists only on the server and never renders again on a client navigation.',
      camera: { kind: 'entities', ids: ['pages-document', 'html', 'build-manifest'] },
      token: { at: 'pages-document', glyph: 'html', label: '<Main/> + <NextScript/>' },
      states: { 'pages-document': 'current', html: 'active', 'build-manifest': 'active' },
      edges: ['e-build-manifest-document', 'e-document-html'],
      internals: ['build-manifest pages["/products/[id]"]: framework, main, pages/_app, pages/products/[id] chunks', 'lowPriorityFiles: _buildManifest.js, _ssgManifest.js (used later by the client router)'],
      sources: [{ label: 'Custom Document', url: 'https://nextjs.org/docs/pages/building-your-application/routing/custom-document' }]
    },
    {
      id: 'j3-9', kind: 'transform', title: 'The props, a second time',
      story: 'The same props are serialized again into a JSON script tag, __NEXT_DATA__, next to the HTML that already shows them. The browser needs them to render the same tree during hydration. Big props are paid for twice, which is why Next.js warns above 128 kB.',
      camera: { kind: 'entities', ids: ['pages-document', 'html', 'next-data'] },
      token: { at: 'next-data', glyph: 'json', label: '__NEXT_DATA__ · props again' },
      states: { 'pages-document': 'active', html: 'active', 'next-data': 'current' },
      edges: ['e-html-next-data'],
      internals: ['<script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"product":{…}}},"page":"/products/[id]","query":{"id":"42"},"buildId":"k7Qm2xLp9"}</script>', 'duplication cost: the product appears once as markup and once as JSON', 'warning above 128 kB (largePageDataBytes)'],
      sources: [{ label: 'Large page data', url: 'https://nextjs.org/docs/messages/large-page-data' }]
    },
    {
      id: 'j3-10', kind: 'predict', title: 'What the browser downloads',
      story: 'The document is about to leave. In J5 the browser received code only for the two Client Components; everything else arrived as data.',
      camera: { kind: 'entities', ids: ['html', 'browser-chunks', 'dom'] },
      token: { at: 'html', glyph: 'html', label: 'document · __NEXT_DATA__ · script tags' },
      states: { html: 'current', 'browser-chunks': 'kept', dom: 'dimmed' }, edges: [],
      question: {
        text: 'After paint, how much of the page\'s component code has the browser downloaded?',
        options: [
          'None: the HTML is already complete',
          'Only the interactive components, as in the App Router',
          'All of it: _app, ProductPage and every component they render',
          'Only getServerSideProps, to run it again in the browser'
        ],
        answer: 2,
        why: 'The Pages Router has no Server Components. Every component in the page tree is browser code, so its chunk and _app\'s chunk are listed in the script tags. Only getServerSideProps was cut out.'
      }
    },
    {
      id: 'j3-11', kind: 'reveal', title: 'Data and the whole tree cross',
      story: 'The HTML crosses as data, with __NEXT_DATA__ inside it. Then the script tags pull the framework, _app and the products page chunk across as code: every component of the page, interactive or not. Compare the App Router, where only Client Components cross as code.',
      camera: { kind: 'entities', ids: ['html', 'dom', 'browser-chunks', 'pages-app', 'pages-product-page', 'next-data'] },
      token: { at: 'pages-product-page', glyph: 'browser-chunk', label: 'whole page tree (code)' },
      states: { html: 'kept', dom: 'new', 'next-data': 'new', 'browser-chunks': 'active', 'pages-app': 'new', 'pages-product-page': 'current' },
      edges: ['e-html-dom', 'e-html-next-data', 'e-chunks-pages-app', 'e-chunks-product-page']
    },
    {
      id: 'j3-12', kind: 'transform', title: 'The whole tree hydrates',
      story: 'The browser paints the HTML; nothing responds yet. Then React reads the props from __NEXT_DATA__ and hydrates from the root: _app and every component of ProductPage execute again in the browser and attach their handlers. Nothing stays static, unlike J5, where only two islands lit up.',
      camera: { kind: 'entities', ids: ['dom', 'next-data', 'react-client', 'pages-app', 'pages-product-page'] },
      token: { at: 'pages-app', glyph: 'component-client', label: 'whole tree hydrated' },
      states: { dom: 'kept', 'next-data': 'active', 'react-client': 'active', 'pages-app': 'current', 'pages-product-page': 'active', 'client-components': 'na' },
      edges: ['e-next-data-react', 'e-react-pages-app', 'e-pages-app-product'],
      internals: ['order: chunks load → __NEXT_DATA__ parsed → hydrateRoot(<App Component pageProps />) → handlers attached', 'every component function runs once more in the browser, with the same props']
    },
    {
      id: 'j3-13', kind: 'explain', title: 'When the two renders disagree',
      story: 'Hydration only works if the browser render produces the markup the server sent. Date.now(), Math.random(), reading window during render, or a browser extension changing the DOM make them differ. React then warns and re-renders the subtree on the client, which shows up as flicker.',
      camera: { kind: 'entities', ids: ['react-client', 'pages-product-page', 'dom'] },
      token: { at: 'pages-product-page', glyph: 'dom', label: 'server ≠ browser' },
      states: { 'react-client': 'active', 'pages-product-page': 'invalid', dom: 'replaced' },
      edges: ['e-pages-app-product'],
      internals: ['fix: render the same value on both sides, move browser-only values into useEffect, or suppressHydrationWarning for one text node']
    },
    {
      id: 'j3-14', kind: 'explain', title: 'An optimized page renders twice',
      story: 'A dynamic-route page prerendered with no data function has no request at build time, so its first browser render sees an empty query and router.isReady is false. After hydration the router reads the real URL and renders again with the query filled. Pages with getServerSideProps, like this one, get the query on the first render.',
      camera: { kind: 'entities', ids: ['pages-router', 'pages-product-page', 'react-client'] },
      token: { at: 'pages-router', glyph: 'machine', label: 'isReady false → true' },
      states: { 'pages-router': 'current', 'pages-product-page': 'active', 'react-client': 'kept' },
      edges: ['e-pages-router-product'],
      internals: ['useRouter().isReady flips after hydration for statically optimized pages', 'read router.query inside useEffect or guard on isReady'],
      sources: [{ label: 'useRouter (Pages)', url: 'https://nextjs.org/docs/pages/api-reference/functions/use-router' }, ASO]
    },
    {
      id: 'j3-15', kind: 'explain', title: 'Against the App Router',
      story: 'Side by side with J5 the limits show: data belongs to the page, not to components; layouts are only what _app shares; the whole tree is browser code and hydrates; and HTML can start only after the data function finishes. Compare mode lines both initial loads up step by step.',
      camera: { kind: 'world' },
      states: { 'pages-renderer': 'active', gssp: 'active', html: 'active', 'next-data': 'active', 'pages-app': 'active', 'pages-product-page': 'active', 'rsc-runtime-entity': 'kept', flight: 'kept', 'client-components': 'kept' },
      edges: ['e-pages-gssp', 'e-pages-ssr', 'e-html-next-data', 'e-chunks-product-page'],
      internals: ['C1 initial load: Pages /products/42 vs App /dashboard/settings', 'C5 hydration: full tree vs Client Components only']
    },
    {
      id: 'j3-16', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'world' },
      states: { gssp: 'active', gip: 'active', 'browser-chunks': 'active', 'pages-app': 'active', 'pages-product-page': 'active' },
      edges: ['e-gssp-chunks-strip', 'e-gip-chunks', 'e-chunks-product-page'],
      checks: [
        { statement: 'getServerSideProps code can end up in the browser.', isTrue: false, why: 'The build removes it and the imports only it uses from the browser chunk; only the props it returns cross, as data.' },
        { statement: 'getInitialProps code can end up in the browser.', isTrue: true, why: 'It runs in the browser on client navigations, so it must be in the page chunk, along with everything it imports.' },
        { statement: 'Only interactive components hydrate in the Pages Router.', isTrue: false, why: 'The whole page tree is browser code and hydrates from the root; Client-Component-only hydration is an App Router property.' }
      ]
    }
  ]
}
