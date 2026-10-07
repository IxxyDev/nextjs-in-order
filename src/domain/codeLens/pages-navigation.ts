// src/domain/codeLens/pages-navigation.ts
import type { LensStep } from '../types'
import { PRODUCT_CHUNK, source } from './specimen'

/** illustrative chunk names, as in docs/code-lens/pages-initial.md */
const POST_CHUNK = 'static/chunks/pages/posts/[id]-8a9b.js'

/**
 * the lens along J4: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/pages-navigation.md).
 */
export const STEPS: LensStep[] = [
  {
    step: 'j4-1', mode: 'peek', form: 'http',
    summary: ['PR11 <Link href="/posts/7"> in view → the posts page chunk + /_next/data/k7Qm2xLp9/posts/7.json (● target; a getServerSideProps target gets its chunk only) · once per URL'],
    panes: [{
      title: 'prefetch · /posts/7', entity: 'pages-prefetch', abridged: true,
      rows: [
        { ...source(['PR11'])[0], note: 'scrolled into view (IntersectionObserver)' },
        { text: 'GET /_next/static/chunks/pages/posts/%5Bid%5D-8a9b.js', from: ['PO10'], fate: 'split', change: 'new', note: 'PostPage: code' },
        { text: 'GET /_next/data/k7Qm2xLp9/posts/7.json · purpose: prefetch · x-nextjs-data: 1', from: ['PO8'], fate: 'server-only', mark: 'cached', change: 'new', note: 'a getStaticProps page: its JSON too' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['pages-product-page'], from: ['PR11'] },
      { fate: 'split', entities: ['browser-chunks'], from: ['PO10'] },
      { fate: 'server-only', entities: ['pages-data-endpoint'] },
      { fate: 'cached', entities: ['pages-data-endpoint'] }
    ],
    motion: []
  },
  {
    step: 'j4-2', mode: 'peek', form: 'http',
    summary: ['hover → prefetch again, skipping next/link\'s Set (bypassPrefetchedCheck: true) · priority: true skips the router\'s data cache, so posts/7.json is requested on every hover'],
    panes: [{
      title: 'hover · /posts/7', entity: 'pages-prefetch', abridged: true,
      rows: [
        { text: 'onMouseEnter → prefetch(router, "/posts/7", "/posts/7", { locale, priority: true, bypassPrefetchedCheck: true })', from: ['PR11'], fate: 'split', change: 'new', note: 'the Set is not consulted' },
        { text: 'GET /_next/data/k7Qm2xLp9/posts/7.json · purpose: prefetch', from: ['PO8'], fate: 'server-only', mark: 'cached', change: 'new', note: 'sent again on each hover (unstable_skipClientCache)' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['pages-product-page', 'pages-prefetch'] },
      { fate: 'server-only', entities: ['pages-data-endpoint'] }
    ],
    motion: []
  },
  { step: 'j4-3', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j4-4', mode: 'open', form: 'json',
    chip: 'no HTML is rendered: the endpoint runs getServerSideProps and sends its result as JSON',
    panes: [{
      title: 'GET /_next/data/k7Qm2xLp9/products/42.json', entity: 'pages-data-endpoint', abridged: true,
      rows: [
        { text: 'GET /_next/data/k7Qm2xLp9/products/42.json · x-nextjs-data: 1', note: 'request (context)' },
        { text: '200 · Content-Type: application/json; charset=utf-8', note: 'response (context)' },
        { text: '{' },
        { text: '  "pageProps": { "product": { "name": "Desk lamp" } },', from: ['PR5'], fate: 'server-only', change: 'new', morph: 'product', note: "PR5's return value, nothing else" },
        { text: '  "__N_SSP": true', change: 'new', note: 'came from getServerSideProps' },
        { text: '}' },
        { text: 'no document: _document is not rendered', from: ['DC2'], fate: 'server-only', change: 'gone' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['gssp', 'pages-data-endpoint'], from: ['PR5'] },
      { fate: 'server-only', entities: ['pages-document'], from: ['DC2'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  {
    step: 'j4-5', mode: 'peek', form: 'json',
    summary: ['posts/7.json is read from .next/server/pages/posts/7.json as the build stored it · x-nextjs-cache: HIT · getStaticProps (PO6) does not run while it is fresh (PO8: 60 s)'],
    panes: [{
      title: 'GET /_next/data/k7Qm2xLp9/posts/7.json', entity: 'server-cache', abridged: true,
      rows: [
        { text: '200 · x-nextjs-cache: HIT', note: 'fresh: no render' },
        { text: '{ "pageProps": { "post": { "title": "Notes on ISR" } }, "__N_SSG": true }', from: ['PO6', 'PO7'], mark: 'static-shell', note: 'written at build, next to 7.html' },
        { text: 'stale after 60 s: served, then regenerated behind', from: ['PO8'], mark: 'cached' }
      ]
    }],
    links: [
      { fate: 'static-shell', entities: ['server-cache', 'pages-data-endpoint'] },
      { fate: 'cached', entities: ['server-cache'] }
    ],
    motion: []
  },
  {
    step: 'j4-6', mode: 'peek', form: 'js',
    summary: ['what if · no data request: the router calls ProductPage.getInitialProps (PI1–PI3) in the tab with { pathname, query, asPath }, so the fetch to api.example.com leaves from the browser'],
    panes: [{
      title: PRODUCT_CHUNK, entity: 'browser-chunks', badge: 'what if', hint: 'getInitialProps instead of getServerSideProps', abridged: true,
      rows: [
        { text: 'ProductPage.getInitialProps = async ({ query }) => {', from: ['PI1'], fate: 'split', change: 'same', note: 'runs in the tab on this navigation' },
        { text: '    const res = await fetch(`https://api.example.com/products/${query.id}`);', from: ['PI2'], fate: 'split', change: 'same', note: 'from the browser: no req, no res' },
        { text: '    return { product: await res.json() };', from: ['PI3'], fate: 'split', change: 'same' },
        { text: '};' }
      ]
    }],
    links: [{ fate: 'split', entities: ['gip', 'pages-product-page'] }],
    motion: []
  },
  {
    step: 'j4-7', mode: 'peek', form: 'manifest',
    summary: [`_buildManifest.js: "/posts/[id]" → ["${POST_CHUNK}"] · the PostPage chunk (PO10–PO14): step 1 only added <link rel="prefetch">; the hover\'s loadPage (step 2) ran it`],
    panes: [{
      title: 'static/k7Qm2xLp9/_buildManifest.js', entity: 'build-manifest', abridged: true,
      rows: [
        { text: 'self.__BUILD_MANIFEST = {__rewrites: {…},' },
        { text: `  "/posts/[id]": ["${POST_CHUNK}"],`, from: ['PO10'], fate: 'split', note: 'the chunk this click needs' },
        { text: `  "/products/[id]": ["${PRODUCT_CHUNK}"],`, from: ['PR7'], fate: 'split' },
        { text: '  sortedPages: ["/_app", "/_error", …, "/posts/[id]", "/products/[id]"]', note: 'to match a URL to a page in the tab' },
        { text: '};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['pages-post-page', 'browser-chunks'], from: ['PO10'] },
      { fate: 'split', entities: ['browser-chunks'], from: ['PR7'] }
    ],
    motion: []
  },
  {
    step: 'j4-8', mode: 'open', form: 'dom',
    chip: 'one render of _app with a new Component prop: what sits in the slot changes type, so React replaces it',
    panes: [{
      title: 'React tree · <App Component={PostPage} />', entity: 'pages-app', abridged: true,
      rows: [
        { text: '<App Component={PostPage} pageProps={{ post }}>', from: ['AP4'], fate: 'split', mark: 'shared-layout', change: 'same', morph: 'Component', note: 'kept: rendered again, not remounted' },
        { text: '  <ThemeProvider>', from: ['AP6', 'TP4'], fate: 'split', mark: 'shared-layout', change: 'same', note: 'kept: theme state (TP4) and DOM stay' },
        { text: '    <ProductPage product={…}>', from: ['PR7'], fate: 'split', change: 'gone', note: 'replaced: a different type in the slot' },
        { fold: 3, label: '3 lines of ProductPage\'s <article>: unmounted with it', from: ['PR9', 'PR10', 'PR11'], change: 'gone' },
        { text: '    <PostPage post={…}>', from: ['PO10'], fate: 'split', change: 'new', note: 'mounted with posts/7.json\'s pageProps' },
        { text: '      <article><h1>Notes on ISR</h1></article>', from: ['PO12', 'PO14'], fate: 'split', change: 'new' },
        { text: 'no document: _document exists only in the first HTML', from: ['DC2'], fate: 'server-only', change: 'gone' }
      ]
    }],
    links: [
      { fate: 'shared-layout', entities: ['pages-app'] },
      { fate: 'split', entities: ['pages-app'], from: ['AP4', 'AP6'] },
      { fate: 'split', entities: ['pages-product-page'], from: ['PR7'] },
      { fate: 'split', entities: ['pages-post-page'], from: ['PO10', 'PO12', 'PO14'] },
      { fate: 'server-only', entities: ['pages-document'], from: ['DC2'] }
    ],
    motion: ['swap'], reduced: 'static'
  },
  { step: 'j4-9', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j4-10', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j4-11', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j4-12', mode: 'off', panes: [], links: [], motion: [] }
]
