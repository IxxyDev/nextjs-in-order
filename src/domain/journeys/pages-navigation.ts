import type { Journey } from '../types'

const LINK = { label: 'Link (Pages)', url: 'https://nextjs.org/docs/pages/api-reference/components/link' }

export const PAGES_NAVIGATION: Journey = {
  id: 'j4',
  slug: 'pages-navigation',
  title: 'Pages Router: navigation',
  following: '<Link href="/posts/7"> on /products/42, then the click',
  whatShouldClick: '_app stays, the page swaps, and the data comes from /_next/data or runs in the browser.',
  steps: [
    {
      id: 'j4-1', kind: 'move', title: 'A link in the viewport',
      story: 'ProductPage renders <Link href="/posts/7">. When it scrolls into view in production, the router loads the target page chunk and, because /posts/7 is a getStaticProps page, its JSON as well. A link to a getServerSideProps page would get its chunk only. Each URL is remembered in a Set, so the viewport prefetch happens once.',
      camera: { kind: 'entities', ids: ['pages-product-page', 'pages-prefetch', 'browser-chunks', 'pages-data-endpoint'] },
      token: { at: 'pages-prefetch', glyph: 'request', label: 'prefetch /posts/7 · chunk + JSON' },
      states: { 'pages-product-page': 'active', 'pages-prefetch': 'current', 'browser-chunks': 'active', 'pages-data-endpoint': 'active', 'pages-app': 'kept' },
      edges: ['e-product-prefetch', 'e-chunks-prefetch', 'e-prefetch-endpoint'],
      internals: ['IntersectionObserver in next/link (pages)', 'SSG target: page chunk + /_next/data/k7Qm2xLp9/posts/7.json', 'SSR target: page chunk only (data would be stale by click time)', 'prefetch is off in next dev'],
      sources: [LINK]
    },
    {
      id: 'j4-2', kind: 'move', title: 'Hover prefetch',
      story: 'Hovering the link prefetches again, and this path does not consult the Set: each hover asks for the JSON once more (seen in the source, not documented). prefetch={false} turns off only the viewport prefetch; hover still fetches.',
      camera: { kind: 'entities', ids: ['pages-product-page', 'pages-prefetch', 'pages-data-endpoint'] },
      token: { at: 'pages-prefetch', glyph: 'request', label: 'hover → GET posts/7.json (again)' },
      states: { 'pages-product-page': 'active', 'pages-prefetch': 'current', 'pages-data-endpoint': 'active' },
      edges: ['e-product-prefetch', 'e-prefetch-endpoint'],
      internals: ['article snapshot, observed in source: hover prefetch bypasses the prefetched Set', 'docs: prefetch={false} "will not happen when entering the viewport, but will happen on hover"', 'full opt-out: a plain <a>, or the App Router where prefetch={false} means never'],
      sources: [LINK]
    },
    {
      id: 'j4-3', kind: 'predict', title: 'A link to an SSR page',
      story: 'Which data path a navigation takes depends on the target\'s data function. Take an SSR target first: the browser follows a link to /products/42, whose data comes from getServerSideProps.',
      camera: { kind: 'entities', ids: ['pages-router', 'gssp', 'browser-chunks'] },
      token: { at: 'pages-router', glyph: 'request', label: 'navigate → /products/42' },
      states: { 'pages-router': 'current', gssp: 'dimmed', 'browser-chunks': 'kept' }, edges: [],
      question: {
        text: 'Navigating to /products/42 on the client: does the browser run getServerSideProps?',
        options: [
          'Yes: the page chunk contains it, so it runs in the tab',
          'No: the router asks the server, which runs it and returns only the props as JSON',
          'No: the router reuses the props in __NEXT_DATA__ from the first load',
          'No: the server renders a new HTML document and the browser reloads'
        ],
        answer: 1,
        why: 'The function is not in any browser chunk. The client router requests /_next/data/k7Qm2xLp9/products/42.json; the server runs getServerSideProps for that request and sends { pageProps }, with no HTML.'
      }
    },
    {
      id: 'j4-4', kind: 'reveal', title: 'The data route',
      story: 'The router sends GET /_next/data/k7Qm2xLp9/products/42.json. router-server recognizes a data route, the endpoint runs getServerSideProps on the server with this request, and the answer is just { pageProps } as JSON. No HTML is rendered and _document is not involved.',
      camera: { kind: 'entities', ids: ['pages-router', 'routing-ladder', 'pages-data-endpoint', 'gssp'] },
      token: { at: 'pages-data-endpoint', glyph: 'json', label: 'products/42.json → { pageProps }' },
      states: { 'pages-router': 'active', 'routing-ladder': 'active', 'pages-data-endpoint': 'current', gssp: 'active', db: 'active', 'pages-document': 'dimmed' },
      edges: ['e-pages-router-ladder', 'e-ladder-data-endpoint', 'e-endpoint-gssp', 'e-db-gssp', 'e-endpoint-router'],
      internals: ['the buildId in the path ties the data to one deploy; after a redeploy the old id 404s and the router falls back to a full page load', 'request header x-nextjs-data: 1 on data requests'],
      sources: [{ label: 'getServerSideProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props' }]
    },
    {
      id: 'j4-5', kind: 'move', title: 'The SSG lane',
      story: 'For /posts/7 the same kind of URL, /_next/data/k7Qm2xLp9/posts/7.json, is answered from the stored JSON that the build wrote next to the HTML. getStaticProps does not run unless the entry is stale, and then ISR regenerates it in the background as it does for the HTML. Here it was already prefetched.',
      camera: { kind: 'entities', ids: ['pages-data-endpoint', 'server-cache', 'pages-prefetch', 'pages-router'] },
      token: { at: 'server-cache', glyph: 'json', label: 'posts/7.json · stored · fresh' },
      states: { 'pages-data-endpoint': 'active', 'server-cache': 'fresh', 'pages-prefetch': 'kept', 'pages-router': 'active' },
      edges: ['e-server-cache-endpoint', 'e-endpoint-router'],
      internals: ['.next/server/pages/posts/7.json', 'same entry key as the HTML; revalidate 60 applies to both']
    },
    {
      id: 'j4-6', kind: 'transform', title: 'The getInitialProps lane',
      story: 'If the target page used getInitialProps, there would be no data request at all: the router loads the page chunk, which contains the function, and calls it right in the tab. Whatever it fetches is fetched from the browser.',
      camera: { kind: 'entities', ids: ['pages-router', 'pages-product-page', 'gip', 'browser-chunks'] },
      token: { at: 'pages-router', glyph: 'machine', label: 'getInitialProps in the tab' },
      states: { 'pages-router': 'current', 'pages-product-page': 'active', gip: 'active', 'browser-chunks': 'kept', 'pages-data-endpoint': 'na' },
      edges: ['e-gip-chunks', 'e-router-gip'],
      internals: ['ctx in the browser: pathname, query, asPath; no req or res', 'with _app.getInitialProps, a navigation to a getServerSideProps page runs both: _app\'s in the browser, the page\'s on the server'],
      sources: [{ label: 'getInitialProps', url: 'https://nextjs.org/docs/pages/api-reference/functions/get-initial-props' }]
    },
    {
      id: 'j4-7', kind: 'move', title: 'The page chunk',
      story: 'The click on /posts/7 needs the page component as well as its data. The router looks the page up in the browser copy of the build manifest and loads the posts page chunk. It is code, and here it is already in memory from the viewport prefetch.',
      camera: { kind: 'entities', ids: ['browser-chunks', 'pages-post-page', 'pages-router', 'build-manifest'] },
      token: { at: 'pages-post-page', glyph: 'browser-chunk', label: 'pages/posts/[id] chunk' },
      states: { 'browser-chunks': 'active', 'pages-post-page': 'current', 'pages-router': 'active', 'build-manifest': 'kept' },
      edges: ['e-chunks-post-page'],
      internals: ['_buildManifest.js: route → chunk list in the browser', 'data and chunk are requested in parallel']
    },
    {
      id: 'j4-8', kind: 'transform', title: '_app stays, the page swaps',
      story: 'With chunk and props ready, the router renders _app again with a different Component: PostPage instead of ProductPage. React reconciles. _app and the ThemeProvider keep their state and DOM; the whole subtree under them is replaced, because a different component type sits in that slot.',
      camera: { kind: 'entities', ids: ['pages-router', 'pages-app', 'pages-product-page', 'pages-post-page'] },
      token: { at: 'pages-post-page', glyph: 'component-client', label: 'Component = PostPage' },
      states: { 'pages-router': 'active', 'pages-app': 'kept', 'pages-product-page': 'replaced', 'pages-post-page': 'new', 'pages-document': 'dimmed' },
      edges: ['e-router-pages-app', 'e-pages-app-post'],
      internals: ['<App Component={PostPage} pageProps={{ post }} />', '_document is not rendered: it exists only in the first HTML'],
      sources: [{ label: 'Custom App', url: 'https://nextjs.org/docs/pages/building-your-application/routing/custom-app' }]
    },
    {
      id: 'j4-9', kind: 'explain', title: 'History',
      story: 'The router pushes /posts/7 onto the browser history instead of loading a document. Back fires popstate; the router reads the stored entry and runs the same mechanism in reverse: data for /products/42, its chunk, a Component swap.',
      camera: { kind: 'entities', ids: ['pages-router', 'browser-history'] },
      token: { at: 'browser-history', glyph: 'machine', label: 'pushState /posts/7' },
      states: { 'pages-router': 'active', 'browser-history': 'current', 'pages-app': 'kept' },
      edges: ['e-pages-router-history'],
      internals: ['history.state: { url, as, options, __N: true, key }', 'scroll restoration is opt-in (experimental.scrollRestoration)']
    },
    {
      id: 'j4-10', kind: 'explain', title: 'Shallow routing',
      story: 'router.push with shallow: true changes only the URL and router.query: no data function runs and nothing is fetched. It works only within the same page; a shallow push to another page is an ordinary navigation.',
      camera: { kind: 'entities', ids: ['pages-router', 'browser-history', 'pages-post-page', 'pages-data-endpoint'] },
      token: { at: 'pages-router', glyph: 'request', label: 'shallow push · URL only' },
      states: { 'pages-router': 'current', 'browser-history': 'active', 'pages-post-page': 'kept', 'pages-data-endpoint': 'na' },
      edges: ['e-pages-router-history'],
      internals: ['router.push("/posts/7?tab=comments", undefined, { shallow: true })', 'useEffect on router.query reacts to the change; getStaticProps / getServerSideProps do not run'],
      sources: [{ label: 'Shallow routing', url: 'https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#shallow-routing' }]
    },
    {
      id: 'j4-11', kind: 'explain', title: 'Then and now',
      story: 'The articles describe Pages Router prefetch as viewport chunk-plus-JSON, chunk only for SSR targets, and a repeat on hover. Checked against Next.js 16.3, that is still how it behaves; only the hover repeat is undocumented. The App Router\'s rewritten prefetching did not change this router.',
      camera: { kind: 'entities', ids: ['pages-prefetch', 'pages-router', 'prefetch-scheduler'] },
      states: { 'pages-prefetch': 'current', 'pages-router': 'kept', 'prefetch-scheduler': 'kept' }, edges: [],
      internals: ['V13: prefetch={false} disables the viewport prefetch only; hover still prefetches (docs)', 'App Router contrast: prefetch={false} means never, hover does not re-prefetch unless expired'],
      sources: [LINK, { label: 'Link (App)', url: 'https://nextjs.org/docs/app/api-reference/components/link' }]
    },
    {
      id: 'j4-12', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'world' },
      states: { 'pages-router': 'active', 'pages-prefetch': 'active', 'pages-data-endpoint': 'active', 'pages-app': 'kept', 'pages-post-page': 'active' },
      edges: ['e-prefetch-endpoint', 'e-endpoint-router', 'e-pages-app-post'],
      checks: [
        { statement: 'Shallow routing works across pages.', isTrue: false, why: 'It only changes the URL of the current page; a shallow push to a different page runs a normal navigation with data and chunk.' },
        { statement: 'SSR pages prefetch their data on viewport.', isTrue: false, why: 'Only the chunk is prefetched for a getServerSideProps page; its data is requested from /_next/data at click time.' },
        { statement: 'A client navigation renders _document again.', isTrue: false, why: '_document exists only in the first HTML response; navigations keep _app and swap Component.' }
      ]
    }
  ]
}
