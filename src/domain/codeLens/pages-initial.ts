// src/domain/codeLens/pages-initial.ts
import type { LensStep } from '../types'
import { PRODUCT_CHUNK, source } from './specimen'

/** illustrative chunk names, in the style of experience-architecture.md §2 (details in docs/code-lens/pages-initial.md) */
const APP_CHUNK = 'static/chunks/pages/_app-2c3d.js'

const PR_GSSP = ['PR2', 'PR3', 'PR4', 'PR5']
const PR_PAGE = ['PR7', 'PR9', 'PR10', 'PR11']
const AP_TREE = ['AP3', 'AP4', 'AP6', 'AP7']

/**
 * the lens along J3: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/pages-initial.md).
 */
export const STEPS: LensStep[] = [
  {
    step: 'j3-1', mode: 'peek', form: 'tsx',
    summary: [
      'pages/products/[id].tsx exports getServerSideProps (PR3) → ƒ, rendered per request',
      'pages/posts/[id].tsx exports getStaticPaths (PO3) + getStaticProps (PO6) → ●, HTML + JSON at build, revalidate 60 (PO8)',
      'a page with no data function and no getInitialProps → ○, HTML at build (Automatic Static Optimization)'
    ],
    panes: [], links: [], motion: []
  },
  {
    step: 'j3-2', mode: 'peek', form: 'json',
    summary: [
      'routes-manifest dynamicRoutes: "/products/[id]" · regex "^/products/([^/]+?)(?:/)?$" → id = "42"',
      'pages-manifest: "/products/[id]": "pages/products/[id].js"'
    ],
    panes: [
      {
        title: '.next/routes-manifest.json', entity: 'routes-manifest', abridged: true,
        rows: [
          { text: '"dynamicRoutes": [{' },
          { text: '  "page": "/products/[id]",', note: 'from the file name, not from a line' },
          { text: '  "regex": "^/products/([^/]+?)(?:/)?$",', note: 'matches /products/42' },
          { text: '  "routeKeys": { "nxtPid": "nxtPid" },' },
          { text: '  "namedRegex": "^/products/(?<nxtPid>[^/]+?)(?:/)?$"', note: 'gives params { id: "42" }' },
          { text: '}, …]' }
        ]
      },
      {
        title: '.next/server/pages-manifest.json', entity: 'pages-manifest', abridged: true,
        rows: [
          { text: '"/products/[id]": "pages/products/[id].js",', note: 'the compiled module render-server loads' },
          { text: '"/posts/[id]": "pages/posts/[id].js",' },
          { text: '"/_app": "pages/_app.js", "/_document": "pages/_document.js", …' }
        ]
      }
    ],
    links: [], motion: []
  },
  {
    step: 'j3-3', mode: 'open', form: 'js', split: true,
    chip: 'the browser build drops getServerSideProps and every import only it uses (Turbopack: next_strip_page_exports; Webpack: SWC next_ssg)',
    panes: [
      {
        side: 'server', title: 'server/pages/products/[id].js', entity: 'gssp', abridged: true,
        rows: [
          { text: 'import { db } from "@/lib/data";', from: ['PR2'], fate: 'server-only', change: 'same' },
          { text: 'export async function getServerSideProps({ params }) {', from: ['PR3'], fate: 'server-only', change: 'same', morph: 'getServerSideProps' },
          { text: '    const product = await db.find("product", params.id);', from: ['PR4'], fate: 'server-only', change: 'same', note: 'per request' },
          { text: '    return { props: { product } };', from: ['PR5'], fate: 'server-only', change: 'same', note: 'only this result crosses' },
          { text: '}' },
          { fold: 5, label: '5 lines of ProductPage: the server copy renders the HTML (step 7)', from: ['PR1', ...PR_PAGE], change: 'same' }
        ]
      },
      {
        side: 'browser', title: PRODUCT_CHUNK, entity: 'browser-chunks', abridged: true,
        rows: [
          { fold: 4, label: '4 lines of getServerSideProps and the db import: cut', from: PR_GSSP, change: 'gone' },
          { fold: 1, label: '1 import line, unchanged', from: ['PR1'], change: 'same' },
          { text: 'export var __N_SSP = true;', fate: 'split', change: 'new', morph: '__N_SSP', note: 'all that is left: a flag for the client router' },
          { text: 'export default function ProductPage({ product }) {', from: ['PR7'], fate: 'split', change: 'same', cut: ': {…}' },
          { text: '    return _jsxs("article", { children: [', from: ['PR9'], fate: 'split', change: 'same' },
          { text: '        _jsx("h1", { children: product.name }),', from: ['PR10'], fate: 'split', change: 'same' },
          { text: '        _jsx(Link, { href: "/posts/7", children: "Read the post" })', from: ['PR11'], fate: 'split', change: 'same' },
          { text: '    ] });' },
          { text: '}' }
        ]
      }
    ],
    links: [
      { fate: 'server-only', entities: ['gssp'] },
      { fate: 'split', entities: ['browser-chunks'] }
    ],
    motion: ['split'], reduced: 'three-pane'
  },
  {
    step: 'j3-4', mode: 'peek', form: 'files',
    summary: [
      '.next/server/pages/posts/7.html + 7.json · written at build by getStaticProps (PO6) · revalidate 60 (PO8)',
      'prerender-manifest "/posts/7": initialRevalidateSeconds 60 · srcRoute "/posts/[id]" · dataRoute "/_next/data/k7Qm2xLp9/posts/7.json"',
      "an id not in getStaticPaths (PO4) → fallback: 'blocking': the first visitor waits for the render"
    ],
    panes: [
      {
        title: '.next/server/pages/posts/', entity: 'server-cache', abridged: true,
        rows: [
          { text: '7.html', from: ['PO10'], mark: 'static-shell', note: 'PostPage rendered at build' },
          { text: '7.json   {"pageProps":{"post":{…}},"__N_SSG":true}', from: ['PO6', 'PO7'], mark: 'static-shell', note: 'what getStaticProps returned' }
        ]
      },
      {
        title: '.next/prerender-manifest.json', entity: 'prerender-manifest', abridged: true,
        rows: [
          { text: '"/posts/7": { "initialRevalidateSeconds": 60, "srcRoute": "/posts/[id]",', from: ['PO8'], mark: 'cached' },
          { text: '  "dataRoute": "/_next/data/k7Qm2xLp9/posts/7.json", … }' }
        ]
      }
    ],
    links: [
      { fate: 'static-shell', entities: ['server-cache'] },
      { fate: 'cached', entities: ['server-cache', 'isr-regeneration'] },
      { fate: 'cached', entities: ['prerender-manifest'], from: ['PO8'] }
    ],
    motion: []
  },
  {
    step: 'j3-5', mode: 'peek', form: 'js',
    summary: ['what if · getInitialProps (PI1–PI3) stays in the page chunk: no hole, no __N_SSP; the api.example.com URL ships with it'],
    panes: [{
      title: PRODUCT_CHUNK, entity: 'browser-chunks', badge: 'what if', hint: 'getInitialProps instead of getServerSideProps', abridged: true,
      rows: [
        { text: 'ProductPage.getInitialProps = async ({ query }) => {', from: ['PI1'], fate: 'split', change: 'new', note: 'server for this document, the tab on navigation' },
        { text: '    const res = await fetch(`https://api.example.com/products/${query.id}`);', from: ['PI2'], fate: 'split', change: 'new', note: 'readable by anyone who opens the chunk' },
        { text: '    return { product: await res.json() };', from: ['PI3'], fate: 'split', change: 'new' },
        { text: '};' },
        { fold: 5, label: '5 lines of ProductPage, as in step 3', from: ['PR1', ...PR_PAGE], change: 'same' }
      ]
    }],
    links: [{ fate: 'split', entities: ['gip', 'browser-chunks'] }],
    motion: []
  },
  {
    step: 'j3-6', mode: 'peek', form: 'tsx',
    summary: ['_app (AP4–AP7) wraps the page: <ThemeProvider><Component {...pageProps} /></ThemeProvider> · Component = ProductPage, pageProps = { product }'],
    panes: [{
      title: 'pages/_app.tsx', abridged: true,
      rows: [
        ...source(['AP3', 'AP4', 'AP6']),
        { ...source(['AP7'])[0], note: 'Component = ProductPage · pageProps = PR5\'s { product }' }
      ]
    }],
    links: [{ fate: 'split', entities: ['ssr-runtime-entity'] }],
    motion: []
  },
  {
    step: 'j3-7', mode: 'open', form: 'html',
    chip: 'react-dom/server: no RSC runtime, no Flight rows, no $L references; every component becomes tags',
    panes: [{
      title: 'HTML · <App Component={ProductPage} />', entity: 'html', abridged: true,
      rows: [
        { text: 'App › ThemeProvider: no tags of their own in this app', from: ['AP4', 'AP6', 'TP5'], fate: 'split', change: 'same', note: 'rendered in the same pass, around the page' },
        { text: '<article>', from: ['PR9'], fate: 'split', change: 'new', morph: 'article' },
        { text: '<h1>Desk lamp</h1>', from: ['PR10'], fate: 'split', change: 'new', morph: 'h1', note: 'product.name: data fetched before the render' },
        { text: '<a href="/posts/7">Read the post</a>', from: ['PR11'], fate: 'split', change: 'new', morph: 'a', note: '<Link> renders a plain <a>' },
        { text: '</article>' }
      ]
    }],
    links: [{ fate: 'split', entities: ['ssr-runtime-entity', 'html'] }],
    motion: ['transform'], reduced: 'side-by-side'
  },
  {
    step: 'j3-8', mode: 'peek', form: 'html',
    summary: ['_document (DC1–DC3): <Html><Head /><body> around <div id="__next">…</div>; <NextScript/> writes one <script defer> per chunk in build-manifest pages["/products/[id]"]'],
    panes: [{
      title: 'GET /products/42 · text/html', entity: 'html', abridged: true,
      rows: [
        { text: '<!DOCTYPE html><html><head>…</head><body>', from: ['DC3'], fate: 'server-only', note: '<Html><Head /><body>' },
        { text: '<div id="__next"><article>…</article></div>', from: ['DC3'], fate: 'server-only', note: '<Main/>: the HTML from step 7' },
        { text: '<script src="/_next/static/chunks/framework-a1b2c3.js" defer=""></script>', from: ['DC3'], fate: 'server-only', note: '<NextScript/>' },
        { fold: 3, label: '3 more chunk tags: main, pages/_app, pages/products/[id] (step 11)', lines: ['<script src="/_next/static/chunks/main-4f5a6b.js" defer=""></script>', `<script src="/_next/${APP_CHUNK}" defer=""></script>`, '<script src="/_next/static/chunks/pages/products/%5Bid%5D-6e7f.js" defer=""></script>'] },
        { text: '<script src="/_next/static/k7Qm2xLp9/_buildManifest.js" defer=""></script>', from: ['DC3'], fate: 'server-only', note: 'lowPriorityFiles: for the client router later' },
        { text: '</body></html>' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['pages-document', 'html'] },
      { fate: 'server-only', entities: ['build-manifest'], from: ['DC3'] }
    ],
    motion: []
  },
  {
    step: 'j3-9', mode: 'open', form: 'json',
    chip: 'the same props a second time: once as markup (step 7), once as JSON; Next.js warns above 128 kB',
    panes: [{
      title: '<script id="__NEXT_DATA__" type="application/json">', entity: 'next-data', abridged: true,
      rows: [
        { text: '{' },
        { text: '  "props": {' },
        { text: '    "pageProps": { "product": { "name": "Desk lamp" } },', from: ['PR5'], fate: 'server-only', change: 'new', morph: 'product', note: "PR5's return value, again" },
        { text: '    "__N_SSP": true', change: 'new', note: 'the page has getServerSideProps' },
        { text: '  },' },
        { text: '  "page": "/products/[id]", "query": { "id": "42" }, "buildId": "k7Qm2xLp9",', change: 'new', note: 'what hydration needs to pick the page' },
        { text: '  "isFallback": false, "gssp": true, …', change: 'new' },
        { text: '}' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['next-data', 'html'] }],
    motion: ['wrap'], reduced: 'side-by-side'
  },
  { step: 'j3-10', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j3-11', mode: 'open', form: 'html',
    footer: [
      '0 B of getServerSideProps in the browser · ⊘ PR2–PR5 were cut at build (step 3); only their result crosses, inside __NEXT_DATA__',
      'code · ⚡ every line of _app and ProductPage, interactive or not (in J0 step 8 only the Client Components crossed as code)'
    ],
    panes: [{
      title: 'GET /products/42 · what the tags fetch', entity: 'browser-chunks', abridged: true,
      rows: [
        { text: '<script src="/_next/static/chunks/framework-a1b2c3.js" defer=""></script>', note: 'React itself' },
        { text: '<script src="/_next/static/chunks/main-4f5a6b.js" defer=""></script>', note: 'the Pages client router' },
        { text: `<script src="/_next/${APP_CHUNK}" defer=""></script>`, from: [...AP_TREE, 'TP3', 'TP4', 'TP5'], fate: 'split', change: 'new', note: '_app and ThemeProvider: code' },
        { text: '<script src="/_next/static/chunks/pages/products/%5Bid%5D-6e7f.js" defer=""></script>', from: ['PR1', ...PR_PAGE], fate: 'split', change: 'new', note: 'ProductPage, every line: code' },
        { text: '<script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"product":…},"__N_SSP":true},…}</script>', from: ['PR5'], fate: 'server-only', change: 'same', note: 'PR5: data only' },
        { fold: 4, label: '4 more tags: polyfills (nomodule), webpack runtime, _buildManifest.js, _ssgManifest.js', lines: ['<script src="/_next/static/chunks/polyfills-….js" nomodule=""></script>', '<script src="/_next/static/chunks/webpack-9c0d.js" defer=""></script>', '<script src="/_next/static/k7Qm2xLp9/_buildManifest.js" defer=""></script>', '<script src="/_next/static/k7Qm2xLp9/_ssgManifest.js" defer=""></script>'] }
      ]
    }],
    links: [
      { fate: 'split', entities: ['pages-app', 'browser-chunks'], from: ['AP4'] },
      { fate: 'split', entities: ['pages-product-page', 'browser-chunks'], from: ['PR7'] },
      { fate: 'server-only', entities: ['next-data'] }
    ],
    motion: ['wrap', 'fade-to-zero'], reduced: 'static'
  },
  {
    step: 'j3-12', mode: 'open', form: 'dom',
    chip: 'nothing stays static: compare J0 step 9, where the layouts and AccountSummary stayed as painted',
    panes: [{
      title: 'document · after hydration', entity: 'dom', abridged: true,
      rows: [
        { text: '<div id="__next">', note: 'hydrateRoot target' },
        { text: 'App · ThemeProvider', from: ['AP4', 'AP6', 'TP4'], fate: 'split', mark: 'shared-layout', change: 'same', note: 'hydrated: _app runs in the tab too' },
        { text: '<article>', from: ['PR9'], fate: 'split', change: 'same', note: 'hydrated · ProductPage ran again' },
        { text: '<h1>Desk lamp</h1>', from: ['PR10'], fate: 'split', change: 'same', note: 'hydrated · same props, same text' },
        { text: '<a href="/posts/7">Read the post</a>', from: ['PR11'], fate: 'split', change: 'same', note: 'hydrated · clicks go to the client router' },
        { text: '<script id="__NEXT_DATA__">', from: ['PR5'], fate: 'server-only', change: 'same', note: 'consumed: the pageProps hydration rendered with' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['pages-app', 'react-client'], from: ['AP4', 'AP6'] },
      { fate: 'split', entities: ['pages-product-page', 'react-client'], from: PR_PAGE },
      { fate: 'shared-layout', entities: ['pages-app'] },
      { fate: 'server-only', entities: ['next-data'] }
    ],
    motion: ['light-up'], reduced: 'static'
  },
  { step: 'j3-13', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j3-14', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j3-15', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j3-16', mode: 'off', panes: [], links: [], motion: [] }
]
