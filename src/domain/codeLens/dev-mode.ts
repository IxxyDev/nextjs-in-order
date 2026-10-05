// src/domain/codeLens/dev-mode.ts
import type { LensStep } from '../types'
import { source } from './specimen'

const off = (step: string): LensStep => ({ step, mode: 'off', panes: [], links: [], motion: [] })

/**
 * the lens along J9: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/dev-mode.md).
 */
export const STEPS: LensStep[] = [
  off('j9-1'),
  {
    step: 'j9-2', mode: 'peek', form: 'terminal',
    summary: ['next.config.js saved (NC3, NC4 are read once, at startup) → ⚠ Found a change in next.config.js. Restarting the server to apply the changes... → exit 77 → the parent forks a new child'],
    panes: [
      {
        title: 'next.config.js', abridged: true,
        rows: source(['NC3', 'NC4']).map((l) => ({ ...l, note: 'read at startup: a running server cannot pick it up' }))
      },
      {
        title: 'terminal · next dev', entity: 'dev-child', abridged: true,
        rows: [
          { text: ' ⚠ Found a change in next.config.js. Restarting the server to apply the changes...', note: 'the child exits with code 77' },
          { text: ' ✓ Ready in 812ms', note: 'the new child, same options' }
        ]
      }
    ],
    links: [{ fate: 'server-only', entities: ['dev-child', 'dev-parent'] }],
    motion: []
  },
  off('j9-3'),
  {
    step: 'j9-4', mode: 'peek', form: 'terminal',
    summary: ['first GET /dashboard/settings waits for its compile (the time sits in next.js: …) · the second is answered at once'],
    panes: [{
      title: 'terminal · next dev', entity: 'dev-turbopack', abridged: true,
      rows: [
        { text: ' ○ Compiling /dashboard/settings ...', note: 'printed only when a compile passes 3 s' },
        { text: ' GET /dashboard/settings 200 in 4.2s (next.js: 3.8s, proxy.ts: 12ms, application-code: 390ms)', note: 'first request: the route is compiled' },
        { text: ' GET /dashboard/settings 200 in 68ms (next.js: 9ms, proxy.ts: 3ms, application-code: 56ms)', note: 'already compiled' }
      ]
    }],
    links: [], motion: []
  },
  off('j9-5'),
  off('j9-6'),
  off('j9-7'),
  {
    step: 'j9-8', mode: 'peek', form: 'http',
    summary: ['GET /_next/hmr · Upgrade: websocket → 101 Switching Protocols, after the origin check (allowedDevOrigins) · first message {"type":"turbopack-connected",…}'],
    panes: [{
      title: 'WebSocket · /_next/hmr', entity: 'dev-hmr', abridged: true,
      rows: [
        { text: 'GET /_next/hmr · Upgrade: websocket · Connection: Upgrade', note: 'taken by router-server, not routed as a page' },
        { text: 'HTTP/1.1 101 Switching Protocols', note: 'the socket is handed to the bundler' },
        { text: '← {"type":"turbopack-connected","data":{"sessionId":…}}', note: 'then sync, building, built…' }
      ]
    }],
    links: [], motion: []
  },
  {
    step: 'j9-9', mode: 'open', form: 'tsx',
    footer: ['socket → browser · {"type":"turbopack-message","data":[{"type":"partial","instruction":{"type":"ChunkListUpdate",…}}]}: the new module code, inside JSON'],
    panes: [{
      title: 'components/DashboardNav.tsx · saved', entity: 'src-dashboard-nav', abridged: true,
      rows: [
        { fold: 5, label: '5 lines unchanged: the directive, the imports, the function', from: ['DN1', 'DN2', 'DN3', 'DN4', 'DN5'], change: 'same' },
        ...source(['DN6', 'DN7'], 'same').map((l) => ({ ...l, note: 'hooks unchanged' })),
        ...source(['DN9'], 'same'),
        ...source(['DN10'], 'gone'),
        ...source(['NE1'], 'new').map((l) => ({ ...l, morph: 'button', note: 'the edit: markup only' })),
        { fold: 2, label: '2 <Link> lines, unchanged', from: ['DN11', 'DN12'], change: 'same' }
      ]
    }],
    links: [{ fate: 'split', entities: ['src-dashboard-nav', 'dev-turbopack'] }],
    motion: ['swap'], reduced: 'side-by-side'
  },
  off('j9-10'),
  {
    step: 'j9-11', mode: 'open', form: 'js',
    chip: 'dev only: the react-refresh transform runs on the client layer; production output has none of these lines',
    panes: [{
      title: 'DashboardNav.js · client layer, dev', entity: 'dev-fast-refresh', abridged: true,
      rows: [
        { text: 'var _s = $RefreshSig$();', fate: 'split', change: 'new', note: 'one signature per component that calls hooks' },
        { text: 'export default function DashboardNav() {', from: ['DN5'], fate: 'split', change: 'same' },
        { text: '    _s();', fate: 'split', change: 'new' },
        { text: '    const [open, setOpen] = useState(false);', from: ['DN6'], fate: 'split', mark: 'shared-layout', change: 'same', cut: '<boolean>', note: 'open = true survives' },
        { fold: 5, label: '5 lines: usePathname() and the <nav>, compiled to _jsxDEV(…) calls', from: ['DN7', 'DN9', 'DN10', 'DN11', 'DN12'], change: 'same' },
        { text: '}' },
        { text: '_s(DashboardNav, "…", false, function() { return [usePathname]; });', fate: 'split', change: 'new', morph: '_s', note: 'the key hashes useState{[open, setOpen](false)} and usePathname{pathname}' },
        { text: '_c = DashboardNav;', fate: 'split', change: 'new' },
        { text: '$RefreshReg$(_c, "DashboardNav");', fate: 'split', change: 'new', morph: '$RefreshReg$', note: 'the ID it is found by (the runtime adds the module id)' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['dev-fast-refresh'] },
      { fate: 'shared-layout', entities: ['client-components'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  {
    step: 'j9-12', mode: 'peek', form: 'tsx',
    summary: ['a hook added or removed → a new signature → DashboardNav remounts and open is false again · // @refresh reset forces that on every edit'],
    panes: [{
      title: 'components/DashboardNav.tsx · what if', abridged: true,
      rows: [
        ...source(['NE2'], 'new'),
        ...source(['DN6', 'DN7'], 'same'),
        ...source(['NE3'], 'new')
      ]
    }],
    links: [{ fate: 'split', entities: ['dev-fast-refresh'] }],
    motion: []
  },
  {
    step: 'j9-13', mode: 'open', form: 'json',
    footer: ['no Fast Refresh · nothing in the browser runs AccountSummary, so no module code is sent: the old server chunk is cleared and the tab is told to refetch'],
    panes: [
      {
        title: 'components/AccountSummary.tsx · saved', entity: 'src-account-summary', abridged: true,
        rows: [
          ...source(['AS2'], 'gone'),
          ...source(['AE1'], 'new').map((l) => ({ ...l, morph: 'Email address', note: 'the edit' }))
        ]
      },
      {
        title: 'socket /_next/hmr → browser', entity: 'dev-hmr', abridged: true,
        rows: [
          { text: '{"type":"serverComponentChanges"}', fate: 'server-only', change: 'new', morph: 'serverComponentChanges', note: 'no code inside: only "refetch this page"' }
        ]
      }
    ],
    links: [
      { fate: 'server-only', entities: ['src-account-summary', 'dev-module-cache'], from: ['AS2', 'AE1'] },
      { fate: 'server-only', entities: ['dev-hmr'] }
    ],
    motion: ['fade-in'], reduced: 'side-by-side'
  },
  {
    step: 'j9-14', mode: 'open', form: 'flight-patch',
    chip: 'hmrRefresh() inside startTransition: the same path as router.refresh(), marked with next-hmr-refresh: 1',
    panes: [{
      title: 'GET /dashboard/settings?_rsc=… · text/x-component', entity: 'flight', abridged: true,
      rows: [
        { text: 'GET /dashboard/settings?_rsc=… · RSC: 1 · Next-Router-State-Tree: … · next-hmr-refresh: 1', note: 'header line (context)' },
        { text: '1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]', from: ['DL5'], fate: 'client-boundary', change: 'same', note: 'the same reference as before' },
        { text: '0:{"f":[[["",{"children":["dashboard",…]}],…]],"S":false,…}', fate: 'server-only', change: 'new', note: 'rendered again on the server, with the new module' },
        { text: '   …["$","dl",null,{"children":[["$","dt",null,{"children":"Email address"}],…]}]…', from: ['AS2', 'AE1'], fate: 'server-only', change: 'new', morph: 'Email address', note: "AccountSummary's new output" },
        { text: '   …["$","$L1",null,{}]…', from: ['DL5'], fate: 'client-boundary', change: 'same', morph: '$L1', note: 'same type, same place: React keeps it' },
        { text: 'DashboardNav · open = true', from: ['DN6'], fate: 'split', mark: 'shared-layout', change: 'same', note: 'kept: no remount, no Fast Refresh' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity'] },
      { fate: 'client-boundary', entities: ['flight', 'app-router'] },
      { fate: 'shared-layout', entities: ['client-components'] },
      { fate: 'split', entities: ['client-components'], from: ['DN6'] }
    ],
    motion: ['swap'], reduced: 'side-by-side'
  },
  off('j9-15'),
  off('j9-16'),
  off('j9-17'),
  off('j9-18'),
  off('j9-19'),
  off('j9-20')
]
