import type { LensStep } from '../types'
import { source } from './specimen'

/**
 * the lens along J10: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/custom-server.md).
 */
export const STEPS: LensStep[] = [
  { step: 'j10-1', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j10-2', mode: 'peek', form: 'js',
    summary: ['server.js · plain Node, never compiled by Next.js · SV4 next({ dev }) · SV5 handle = app.getRequestHandler() · SV6 app.prepare() loads the tables'],
    panes: [{
      title: 'server.js', entity: 'custom-server', abridged: true,
      rows: source(['SV3', 'SV4', 'SV5', 'SV6'])
    }],
    links: [
      { fate: 'server-only', entities: ['custom-server'], from: ['SV3', 'SV4'] },
      { fate: 'server-only', entities: ['custom-handle'], from: ['SV5'] },
      { fate: 'server-only', entities: ['routing-ladder', 'routes-manifest', 'middleware-manifest'], from: ['SV6'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j10-3', mode: 'peek', form: 'js',
    summary: ["SV7 createServer(…) · SV12 .listen(3000): our server owns the socket; next start's own server is never created"],
    panes: [{
      title: 'server.js', entity: 'custom-server', abridged: true,
      rows: source(['SV1', 'SV7', 'SV12'])
    }],
    links: [{ fate: 'server-only', entities: ['custom-server'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j10-4', mode: 'peek', form: 'js',
    summary: ['SV11 handle(req, res, parsedUrl) → the same ladder as next start: NC3 headers apply at step 1, the PX8 matcher at step 3'],
    panes: [{
      title: 'server.js · and what applies inside handle', abridged: true,
      rows: [
        ...source(['SV8', 'SV11']),
        { ...source(['NC3'])[0], note: 'next.config.js: applies at step 1' },
        { ...source(['PX8'])[0], note: 'proxy.ts: matches /dashboard at step 3' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['custom-handle'], from: ['SV8', 'SV11'] },
      { fate: 'server-only', entities: ['routing-ladder'], from: ['NC3'] },
      { fate: 'server-only', entities: ['proxy'], from: ['PX8'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j10-5', mode: 'open', form: 'http',
    panes: [{
      title: 'GET /legacy/settings · through handle', entity: 'custom-handle', abridged: true,
      rows: [
        { text: 'GET /legacy/settings', note: 'as it reaches server.js (context)' },
        { text: 'GET /dashboard/settings', from: ['SV10'], fate: 'server-only', change: 'new', morph: '/dashboard/settings', note: 'handle rebuilt req.url from parsedUrl: the ladder sees only this' },
        { text: '1 headers  "/:path*" ✓ → x-frame-options: DENY', from: ['NC3'], fate: 'server-only', change: 'new' },
        { text: '3 proxy  "/dashboard/:path*" ✓ → x-middleware-next: 1', from: ['PX8', 'PX6'], fate: 'server-only', change: 'new', note: 'Proxy runs: the rewrite does not skip it' },
        { text: '5 filesystem → page /dashboard/settings', change: 'new' },
        { text: '200 · x-frame-options: DENY · content-type: text/html; charset=utf-8', change: 'new', note: 'the same answer as /dashboard/settings' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['custom-handle'], from: ['SV10'] },
      { fate: 'server-only', entities: ['routing-ladder'], from: ['NC3'] },
      { fate: 'server-only', entities: ['proxy'], from: ['PX8', 'PX6'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  { step: 'j10-6', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j10-7', mode: 'open', form: 'http',
    panes: [{
      title: 'GET /healthz · answered by server.js', entity: 'custom-healthz', abridged: true,
      rows: [
        { text: 'GET /healthz', note: 'the request (context)' },
        { text: '200 · ok', from: ['SV9'], fate: 'server-only', change: 'new', morph: 'ok', note: 'res.end(\'ok\'): handle is never called' },
        { text: 'x-frame-options: DENY', from: ['NC3'], fate: 'server-only', change: 'gone', note: 'missing: headers() runs inside handle' },
        { text: 'proxy(request) · the session check', from: ['PX3'], fate: 'server-only', change: 'gone', note: 'never ran, whatever the matcher says' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['custom-healthz'], from: ['SV9'] },
      { fate: 'server-only', entities: ['rung-headers'], from: ['NC3'] },
      { fate: 'server-only', entities: ['proxy'], from: ['PX3'] }
    ],
    motion: ['swap'], reduced: 'side-by-side'
  },
  { step: 'j10-8', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j10-9', mode: 'peek', form: 'js',
    summary: ['what if SR1 app.render(req, res, "/dashboard/settings") → req.url = formatUrl({ …parsedUrl, pathname, query }) → this.requestHandler(req, res): deprecated, warns, skips nothing'],
    panes: [{ title: 'server.js', entity: 'custom-server', badge: 'what if', hint: 'J10: the deprecated app.render', abridged: true, rows: source(['SR1']) }],
    links: [{ fate: 'server-only', entities: ['custom-handle', 'routing-ladder', 'proxy'], from: ['SR1'] }],
    motion: []
  },
  { step: 'j10-10', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j10-11', mode: 'peek', form: 'files',
    summary: ["NC6 output: 'standalone' traces the route entries, not server.js: .next/standalone/server.js is Next's own, yours fails with Cannot find module"],
    panes: [{
      title: '.next/standalone/', entity: 'standalone', abridged: true,
      rows: [
        { text: 'server.js', from: ['NC6'], fate: 'server-only', note: "generated by Next, not yours" },
        { text: 'node_modules/', note: 'only what the route entries import' },
        { text: 'your server.js and what only it requires', from: ['SV1', 'SV3'], fate: 'server-only', change: 'gone', note: 'not traced: Error: Cannot find module …' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['standalone', 'tracing'], from: ['NC6'] },
      { fate: 'server-only', entities: ['custom-server'], from: ['SV1', 'SV3'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j10-12', mode: 'peek', form: 'js',
    summary: ['what if NV1 useFileSystemPublicRoutes: false · router-server skips page files unless next.config rewrote the path · SV10\'s handle(…, { pathname }) re-enters that check and finds no page · per the docs, a client navigation can still reach them'],
    panes: [
      { title: 'next.config.js', badge: 'what if', hint: 'J10: file routes hidden from the server', abridged: true, rows: source(['NV1']) },
      { title: 'server.js', entity: 'custom-server', abridged: true, rows: source(['SV10']).map((l) => ({ ...l, note: 'with NV1: no page found, only a rewrite would reach one' })) }
    ],
    links: [
      { fate: 'server-only', entities: ['rung-filesystem'], from: ['NV1'] },
      { fate: 'server-only', entities: ['custom-handle'], from: ['SV10'] }
    ],
    motion: []
  },
  { step: 'j10-13', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j10-14', mode: 'off', panes: [], links: [], motion: [] }
]
