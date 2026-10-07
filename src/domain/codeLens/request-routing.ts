import type { LensStep } from '../types'
import { off, source } from './specimen'

/** routes-manifest.json rows as next build writes them (regexes from Next's path-to-regexp, docs/code-lens/request-routing.md) */
const HEADER_ROW = '{ "source": "/:path*", "headers": [{ "key": "X-Frame-Options", "value": "DENY" }], "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }'
const REDIRECT_ROW = '{ "source": "/old-settings", "destination": "/dashboard/settings", "statusCode": 308, "regex": "^(?!/_next)/old-settings(?:/)?$" }'
const TRAILING = '{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, … }'

/**
 * the lens along J2: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/request-routing.md).
 */
export const STEPS: LensStep[] = [
  off('j2-1'),
  {
    step: 'j2-2', mode: 'peek', form: 'json',
    summary: ['in memory before the first request: BUILD_ID k7Qm2xLp9 · routes-manifest headers ← NC3 · redirects ← NC4 · the Proxy matcher ← PX8'],
    panes: [
      {
        title: '.next/routes-manifest.json', entity: 'routes-manifest', abridged: true,
        rows: [
          { text: `"headers": [${HEADER_ROW}],`, from: ['NC3'], fate: 'server-only', note: 'step 1' },
          { fold: 1, label: '1 redirect Next adds itself: a trailing slash → 308 without it', lines: [TRAILING] },
          { text: `"redirects": [ …, ${REDIRECT_ROW} ],`, from: ['NC4'], fate: 'server-only', note: 'step 2' },
          { text: '"rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] },', note: 'steps 4, 6, 8: none in this app' },
          { fold: 2, label: '2 route tables: staticRoutes, dynamicRoutes (each with its regex)', lines: ['"staticRoutes": [{ "page": "/dashboard/settings", "regex": "^/dashboard/settings(?:/)?$", … }, …],', '"dynamicRoutes": [{ "page": "/products/[id]", "regex": "^/products/([^/]+?)(?:/)?$", … }, …],'] }
        ]
      },
      {
        title: '.next/server/functions-config-manifest.json', entity: 'middleware-manifest',
        hint: 'a Node proxy keeps its matchers here; middleware-manifest.json holds only Edge middleware', abridged: true,
        rows: [
          { text: '"/_middleware": { "runtime": "nodejs", "matchers": [{ "regexp": "…/dashboard…", "originalSource": "/dashboard/:path*" }] }', from: ['PX8'], fate: 'server-only', note: 'step 3: the regexp also covers /_next/data/… and .rsc forms' }
        ]
      }
    ],
    links: [
      { fate: 'server-only', entities: ['routes-manifest', 'routing-ladder'], from: ['NC3', 'NC4'] },
      { fate: 'server-only', entities: ['middleware-manifest'], from: ['PX8'] }
    ],
    motion: ['connect'], reduced: 'static'
  },
  {
    step: 'j2-3', mode: 'peek', form: 'json',
    summary: ['step 1 · NC3 headers() → "/:path*" matches /dashboard/settings → X-Frame-Options: DENY joins whatever answer comes back'],
    panes: [{
      title: 'routes-manifest.json · headers', entity: 'routes-manifest', abridged: true,
      rows: [
        { ...source(['NC3'])[0], note: 'next.config.js, as written' },
        { text: HEADER_ROW, from: ['NC3'], fate: 'server-only', change: 'same', morph: '"/:path*"', note: 'as stored: the source becomes a regex' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['rung-headers'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j2-4', mode: 'peek', form: 'json',
    summary: ['step 2 · NC4 redirects() → permanent: true is stored as statusCode 308 · /dashboard/settings: no match · /old-settings would leave here'],
    panes: [{
      title: 'routes-manifest.json · redirects', entity: 'routes-manifest', abridged: true,
      rows: [
        { ...source(['NC4'])[0], note: 'next.config.js, as written' },
        { text: REDIRECT_ROW, from: ['NC4'], fate: 'server-only', change: 'same', morph: '308', note: 'permanent: true → 308' },
        { text: 'GET /old-settings → 308 · location: /dashboard/settings', from: ['NC4'], fate: 'server-only', note: 'not this request: it would leave here' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['rung-redirects'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j2-5', mode: 'open', form: 'http',
    panes: [
      {
        title: 'proxy → router-server · session cookie present', entity: 'proxy', abridged: true,
        rows: [
          { text: 'GET /dashboard/settings · cookie: session=…', note: 'the request (context)' },
          { text: 'matched "/dashboard/:path*"', from: ['PX8'], fate: 'server-only', change: 'new', note: 'so proxy(request) runs' },
          { text: 'x-middleware-next: 1', from: ['PX6'], fate: 'server-only', change: 'new', morph: 'next', note: 'NextResponse.next(): climb on to step 4' }
        ]
      },
      {
        title: 'the branch not taken · no session cookie', abridged: true,
        rows: [
          { text: '307 Temporary Redirect · location: http://…/login', from: ['PX3', 'PX4'], fate: 'server-only', note: 'NextResponse.redirect: 307 unless told otherwise; the request would end here' }
        ]
      }
    ],
    links: [
      { fate: 'server-only', entities: ['proxy'] },
      { fate: 'server-only', entities: ['middleware-manifest'], from: ['PX8'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  off('j2-6'),
  {
    step: 'j2-7', mode: 'peek', form: 'json',
    summary: ['step 5 · /dashboard/settings is a static route: app-paths-manifest "/dashboard/settings/page" → app/dashboard/settings/page.js'],
    panes: [
      {
        title: '.next/server/app-paths-manifest.json', abridged: true,
        rows: [{ text: '{ "/dashboard/settings/page": "app/dashboard/settings/page.js", … }', from: ['SP4'], fate: 'server-only', note: 'the match: an exact page route' }]
      },
      {
        title: '.next/server/pages-manifest.json', abridged: true,
        rows: [{ text: '{ "/api/hello": "pages/api/hello.js", "/products/[id]": "pages/products/[id].js", … }', from: ['AH2', 'PR7'], note: 'not tried: a static route wins first' }]
      }
    ],
    links: [{ fate: 'server-only', entities: ['rung-filesystem'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  off('j2-8'),
  {
    step: 'j2-9', mode: 'peek', form: 'http',
    summary: ['router-server → render-server: /dashboard/settings · params {} · App or Pages is decided inside render-server'],
    panes: [], links: [], motion: []
  },
  off('j2-10'),
  {
    step: 'j2-11', mode: 'peek', form: 'http',
    summary: ['GET /_next/static/chunks/framework-a1b2c3.js → 200 from .next/static · cache-control: public, max-age=31536000, immutable · PX8 did not match: Proxy never ran'],
    panes: [{
      title: 'GET /_next/static/chunks/framework-a1b2c3.js', entity: 'early-exits', abridged: true,
      rows: [
        { text: '200 · cache-control: public, max-age=31536000, immutable', note: 'streamed from disk; React never runs' },
        { ...source(['PX8'])[0], note: 'no match for /_next/static: Proxy skipped' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['proxy'], from: ['PX8'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j2-12', mode: 'open', form: 'json',
    panes: [{
      title: 'GET /api/hello · application/json', entity: 'route-handler', abridged: true,
      rows: [
        { text: 'content-type: application/json; charset=utf-8', from: ['AH3'], fate: 'server-only', change: 'new', note: 'res.json sets it' },
        { text: '{"ok":true}', from: ['AH3'], fate: 'server-only', change: 'new', morph: 'ok', note: 'the whole body: no React, no HTML' }
      ]
    }],
    footer: ['image · GET /_next/image?url=%2Fhero.jpg&w=640&q=75 → a 640 px variant in the format the Accept header allows, kept in .next/cache/images; no React either'],
    links: [{ fate: 'server-only', entities: ['route-handler'] }],
    motion: ['transform'], reduced: 'side-by-side'
  },
  off('j2-13'),
  off('j2-14')
]
