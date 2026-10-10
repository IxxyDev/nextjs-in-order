import type { LensStep } from '../types'
import { off, source } from './specimen'

/**
 * the lens along J8: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/caching.md).
 */
export const STEPS: LensStep[] = [
  off('j8-1'),
  {
    step: 'j8-2', mode: 'peek', form: 'tsx',
    summary: ['⊘ SP5 getProfile() · asked twice in one render → one run, one result · the memo is dropped when the request ends'],
    panes: [{ title: 'app/dashboard/settings/page.tsx', entity: 'src-settings-page', abridged: true, rows: source(['SP4', 'SP5', 'SP8']) }],
    links: [
      { fate: 'server-only', entities: ['request-memo', 'db'], from: ['SP5'] },
      { fate: 'server-only', entities: ['src-settings-page', 'rsc-runtime-entity'], from: ['SP4'] },
      { fate: 'server-only', entities: ['src-account-summary'], from: ['SP8'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j8-3', mode: 'peek', form: 'tsx',
    summary: ["▤ DA2–DA5 getProfile: 'use cache' · cacheTag('profile') · cacheLife('hours') → stored across requests · ⌛ DA7–DA8 getInvoices: no directive → runs on every request"],
    panes: [{ title: 'lib/data.ts', abridged: true, rows: [...source(['DA2', 'DA3', 'DA4', 'DA5']), { text: '}' }, ...source(['DA7', 'DA8']), { text: '}' }] }],
    links: [
      { fate: 'cached', entities: ['data-cache'] },
      { fate: 'suspended', entities: ['db', 'rsc-runtime-entity'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j8-4', mode: 'open', form: 'files',
    panes: [{
      title: '.next/server/app/dashboard/ · the seed for /dashboard/settings', entity: 'prerendered-outputs', abridged: true,
      rows: [
        { text: 'settings.html', from: ['SP4'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the document, rendered at build' },
        { text: 'settings.rsc', from: ['SP4'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the same render as Flight rows' },
        { fold: 1, label: 'settings.segments/: one prefetch file per segment (J6)' },
        { text: 'settings.meta  { "headers": { "x-next-cache-tags": "…,profile", … }, … }', from: ['DA4'], fate: 'server-only', mark: 'cached', change: 'new', morph: 'profile', note: "cacheTag('profile') reached the route" },
        { text: '.next/prerender-manifest.json  "/dashboard/settings": { "initialRevalidateSeconds": 3600, … }', from: ['DA4'], fate: 'server-only', mark: 'cached', change: 'new', note: "cacheLife('hours'): 1 h; expire 86400 (1 d)" },
        { text: 'server cache · key /dashboard/settings → HTML · RSC · meta', from: ['SP5'], fate: 'server-only', mark: 'cached', change: 'new', note: 'seeded from these files, shared by every visitor' }
      ]
    }],
    links: [
      { fate: 'static-shell', entities: ['prerendered-outputs'] },
      { fate: 'cached', entities: ['server-cache', 'prerender-manifest'], from: ['DA4'] },
      { fate: 'cached', entities: ['server-cache'], from: ['SP5'] }
    ],
    motion: ['connect'], reduced: 'static'
  },
  {
    step: 'j8-5', mode: 'peek', form: 'http',
    summary: ['GET /posts/7 → 200 · x-nextjs-cache: HIT · 12 s old < revalidate 60 (PO8): stored HTML, getStaticProps does not run'],
    panes: [{ title: 'pages/posts/[id].tsx', entity: 'pages-post-page', abridged: true, rows: source(['PO8']) }],
    links: [{ fate: 'cached', entities: ['server-cache'] }],
    motion: [], reduced: 'static'
  },
  off('j8-6'),
  {
    step: 'j8-7', mode: 'peek', form: 'http',
    summary: ['GET /posts/7 → 200 · x-nextjs-cache: STALE · the old HTML leaves now; PO6–PO8 run again behind it and replace the entry'],
    panes: [{ title: 'pages/posts/[id].tsx', entity: 'pages-post-page', abridged: true, rows: [...source(['PO6', 'PO7', 'PO8']), { text: '}' }] }],
    links: [
      { fate: 'static-shell', entities: ['isr-regeneration'] },
      { fate: 'cached', entities: ['server-cache', 'isr-regeneration'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j8-8', mode: 'peek', form: 'http',
    summary: ["GET /posts/8 → 200 · x-nextjs-cache: MISS · not in paths, fallback: 'blocking' (PO4): this visitor waits for the render, then it is stored with revalidate 60"],
    panes: [{ title: 'pages/posts/[id].tsx', entity: 'pages-post-page', abridged: true, rows: source(['PO4', 'PO6', 'PO8']) }],
    links: [
      { fate: 'static-shell', entities: ['pages-renderer'] },
      { fate: 'cached', entities: ['server-cache'] }
    ],
    motion: [], reduced: 'static'
  },
  off('j8-9'),
  off('j8-10'),
  {
    step: 'j8-11', mode: 'peek', form: 'files',
    summary: ['GET /_next/image?url=%2Fhero.jpg&w=640&q=75 · Accept: image/webp → cache key = getHash([CACHE_VERSION, href, w, q, mimeType]) of /hero.jpg · 640 · 75 · image/webp → a file in .next/cache/images, kept across restarts'],
    panes: [], links: [], motion: []
  },
  off('j8-12'),
  {
    step: 'j8-13', mode: 'open', form: 'html',
    panes: [{
      title: '.next/server/app/dashboard/billing.html · the shell', entity: 'ppr-shell', abridged: true,
      rows: [
        { text: '<html lang="en"><body><section class="dashboard"><nav …>…</nav>', from: ['RL2', 'DL4'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the layouts' },
        { text: '<h1>Billing</h1>', from: ['BP6'], fate: 'server-only', mark: 'static-shell', change: 'new' },
        { text: '<!--$?--><template id="B:0"></template>', from: ['BP7'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the boundary, still pending' },
        { text: '<p>Loading invoices…</p><!--/$-->', from: ['BP13'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the fallback is in the shell' },
        { fold: 6, label: '6 lines of InvoiceList: not rendered at build, it reads cookies()', from: ['IL1', 'IL2', 'IL3', 'IL4', 'IL5', 'IL6'], change: 'gone' },
        { text: 'billing.meta  { "postponed": "…", … }', from: ['BP8'], fate: 'server-only', mark: 'suspended', change: 'new', morph: 'postponed', note: 'where rendering stopped: resumed per request' }
      ]
    }],
    footer: ['◐ /dashboard/billing · shell at build, hole per request'],
    links: [
      { fate: 'static-shell', entities: ['ppr-shell'] },
      { fate: 'suspended', entities: ['prerender', 'server-cache'] },
      { fate: 'server-only', entities: ['rsc-runtime-entity'], from: ['BP6', 'BP7', 'BP13'] }
    ],
    motion: ['fade-in'], reduced: 'side-by-side'
  },
  {
    step: 'j8-14', mode: 'peek', form: 'http',
    summary: ['GET /dashboard/billing → 200 · text/html · billing.html streams first, straight from the server cache: layouts, <h1>, the skeleton · no cookies() read yet'],
    panes: [], links: [], motion: []
  },
  {
    step: 'j8-15', mode: 'open', form: 'html',
    panes: [{
      title: 'GET /dashboard/billing · the rest of the same response', entity: 'html', abridged: true,
      rows: [
        { fold: 2, label: 'shell bytes, already sent: the layouts, <h1>, the skeleton', from: ['BP6', 'BP13'], change: 'same' },
        { text: "cookies() → this visitor's session · getInvoices(session) → db.findMany(…)", from: ['IL4', 'DA7', 'DA8'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'uncached: runs on every request' },
        { text: '<div hidden id="S:0"><ul><li>€12.00</li>…</ul></div>', from: ['IL6'], fate: 'server-only', mark: 'suspended', change: 'new', morph: 'S:0', note: "InvoiceList's HTML, hidden at first" },
        { text: '<script>$RC("B:0","S:0")</script>', from: ['BP8'], fate: 'server-only', mark: 'suspended', change: 'new', morph: 'B:0', note: 'swaps it in for the skeleton' },
        { text: '<script>self.__next_f.push([1,"…"])</script>', from: ['IL6'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'the same rows, for React in the tab' }
      ]
    }],
    links: [
      { fate: 'suspended', entities: ['suspense-hole', 'html'] },
      { fate: 'suspended', entities: ['db', 'rsc-runtime-entity'], from: ['IL4', 'DA7', 'DA8'] }
    ],
    motion: ['fill'], reduced: 'side-by-side'
  },
  off('j8-16'),
  {
    step: 'j8-17', mode: 'open', form: 'html', chip: 'what if: cookies() read in BillingPage (not part of the app), with loading.tsx as the boundary above it · without one, Cache Components reports the route as blocking',
    panes: [
      {
        title: 'app/dashboard/billing/page.tsx', entity: 'src-billing-page', badge: 'what if', hint: 'J8: cookies() read above the boundary', abridged: true,
        rows: source(['BV1', 'BV2', 'BV4', 'BV5'])
      },
      {
        title: 'app/dashboard/billing/loading.tsx', entity: 'src-billing-page', badge: 'what if', hint: 'J8: a boundary above the cookies-up page', abridged: false,
        rows: source(['BL1', 'BL2'])
      },
      {
        title: '.next/server/app/dashboard/billing.html · the shell', entity: 'ppr-shell', abridged: true,
        rows: [
          { text: '<html lang="en"><body><section class="dashboard"><nav …>…</nav>', from: ['RL2', 'DL4'], fate: 'server-only', mark: 'static-shell', change: 'same', note: 'the shell ends here' },
          { text: '<!--$?--><template id="B:0"></template>', from: ['BV1'], fate: 'server-only', mark: 'suspended', change: 'new', morph: 'B:0', note: 'the hole: all of BillingPage' },
          { text: '<p>Loading billing…</p><!--/$-->', from: ['BL2'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'loading.tsx: the fallback, in the shell' },
          { fold: 3, label: '3 lines no longer in the shell: <h1>Billing</h1>, the boundary, the skeleton', from: ['BP6', 'BP7', 'BP13'], change: 'gone' },
          { text: 'billing.meta  { "postponed": "…", … }', from: ['BV1'], fate: 'server-only', mark: 'suspended', change: 'same', note: 'now resumes at the page root' }
        ]
      }
    ],
    links: [
      { fate: 'static-shell', entities: ['ppr-shell'] },
      { fate: 'suspended', entities: ['suspense-hole'] },
      { fate: 'server-only', entities: ['src-root-layout', 'src-dashboard-layout'], from: ['RL2', 'DL4'] },
      { fate: 'server-only', entities: ['src-billing-page'], from: ['BV1', 'BV2', 'BV4', 'BV5', 'BL1', 'BL2'] }
    ],
    motion: ['swap'], reduced: 'static'
  },
  {
    step: 'j8-18', mode: 'peek', form: 'tsx',
    summary: ["⊘ AC6 updateTag('profile'): expire now, the action's response carries f · what if AV2 revalidateTag('profile', 'max'): stale-while-revalidate, no f"],
    panes: [
      { title: 'app/actions.ts', entity: 'src-actions', abridged: true, rows: source(['AC2', 'AC6']) },
      { title: 'app/actions.ts', entity: 'src-actions', badge: 'what if', hint: 'J7, J8: revalidateTag instead of updateTag', abridged: true, rows: source(['AV1', 'AV2']) }
    ],
    links: [
      { fate: 'server-only', entities: ['data-cache', 'action-handler'], from: ['AC2', 'AC6'] },
      { fate: 'server-only', entities: ['server-cache'], from: ['AV1', 'AV2'] }
    ],
    motion: [], reduced: 'static'
  },
  off('j8-19'),
  off('j8-20')
]
