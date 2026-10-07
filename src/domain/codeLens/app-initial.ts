// src/domain/codeLens/app-initial.ts
import type { LensStep } from '../types'
import { DN_NAV, PF_FORM, source } from './specimen'

const REF_NAV = '1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]'
const REF_FORM = '2:I[…,["static/chunks/app/dashboard/settings/page-5e6f.js"],"default"]'
/** the root row exactly as j0-7 writes it */
const ROOT_ROW = '0:{"P":…,"c":["","dashboard","settings"],"q":"","i":false,"f":[[["",{…}],…,…,false]],"S":true,…,"b":"k7Qm2xLp9"}'
const ROUTE_STATE = '["",{"children":["dashboard",{"children":["settings",{"children":["__PAGE__",{}]}]}]},…]'
const PRERENDERED = '○ route: this render ran at build; a production GET is served its stored result (settings.html + settings.rsc)'

/**
 * the lens along J5: one entry per journey step, in order (docs/code-lens.md §10.2, details in docs/code-lens/app-initial.md).
 * Row numbers follow j0-7: 1:I DashboardNav, 2:I ProfileForm, 0: the root row.
 */
export const STEPS: LensStep[] = [
  /** e2e relies on j5-1 being off */
  { step: 'j5-1', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j5-2', mode: 'peek', form: 'js',
    summary: ['import "react" resolves twice: rsc layer → react.react-server.js (no useState) · ssr + browser layers → index.js (full React) · the "react-server" export condition, set at build'],
    panes: [{
      title: 'the same import, two layers', abridged: true,
      rows: [
        { text: 'import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";', from: ['SP4'], fate: 'server-only', note: 'SettingsPage, rsc layer → jsx-runtime.react-server.js' },
        { ...source(['DN4'])[0], note: 'DashboardNav, browser + ssr layers → index.js: the full React' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['layers', 'src-settings-page'] },
      { fate: 'split', entities: ['src-dashboard-nav'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j5-3', mode: 'peek', form: 'json',
    summary: ['loader tree for /dashboard/settings: "" → dashboard → settings → __PAGE__ · each node [segment, parallelRoutes, modules] with lazy layout / page references'],
    panes: [{
      title: 'loader tree · next-app-loader', entity: 'loader-tree', abridged: true,
      rows: [
        { text: '["", { children:', from: ['RL1'], fate: 'server-only', note: 'root segment' },
        { text: '  ["dashboard", { children:', from: ['DL2'], fate: 'server-only' },
        { text: '    ["settings", { children:' },
        { text: '      ["__PAGE__", {}, { page: [ …, "…/app/dashboard/settings/page.tsx" ] }]', from: ['SP4'], fate: 'server-only', note: 'the page is a leaf' },
        { text: '    }, {…}, …],' },
        { text: '  }, { layout: [ …, "…/app/dashboard/layout.tsx" ] }, …],', from: ['DL2'], fate: 'server-only' },
        { text: '}, { layout: [ …, "…/app/layout.tsx" ] }, …]', from: ['RL1'], fate: 'server-only' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['loader-tree'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j5-4', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j5-5', mode: 'peek', form: 'tsx',
    summary: ['DL6 {children} is a slot: the renderer wraps it in a LayoutRouter (a Client Component from Next) at the dashboard → settings boundary'],
    panes: [{
      title: 'app/dashboard/layout.tsx', entity: 'src-dashboard-layout', abridged: true,
      rows: [
        ...source(['DL2', 'DL4']),
        { ...source(['DL6'])[0], note: 'the slot: a LayoutRouter owns it' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['layout-router', 'loader-tree'], from: ['DL6'] },
      { fate: 'shared-layout', entities: ['layout-router'] },
      { fate: 'server-only', entities: ['loader-tree'], from: ['DL2', 'DL4'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j5-6', mode: 'peek', form: 'flight', chip: PRERENDERED,
    summary: ['⊘ RootLayout · DashboardLayout · SettingsPage · AccountSummary → output only, as rows · ▤ getProfile() → its values ("Ada", "ada@example.com"), not the call'],
    panes: [{
      title: 'Flight · what the run leaves behind', entity: 'rsc-runtime-entity', abridged: true,
      rows: [
        { text: '   …["$","section",null,{"className":"dashboard","children":[…]}]…', from: ['DL2', 'DL4'], fate: 'server-only', note: 'DashboardLayout → its output' },
        { text: '   …["$","dl",null,{"children":[…,["$","dd",null,{"children":"ada@example.com"}],…]}]…', from: ['SP8', 'AS2'], fate: 'server-only', note: 'AccountSummary → its output' },
        { text: '   …"ada@example.com"…"Ada"…', from: ['SP5', 'DA2', 'DA3'], fate: 'server-only', mark: 'cached', note: 'getProfile() → values only' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity'] },
      { fate: 'server-only', entities: ['src-account-summary'], from: ['AS2'] },
      { fate: 'cached', entities: ['db'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j5-7', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j5-8', mode: 'open', form: 'manifest',
    panes: [
      {
        title: 'server/app/dashboard/settings/page_client-reference-manifest.js', entity: 'client-reference-manifest', abridged: true, hint: 'chunks as Turbopack writes them; --webpack: [chunkId, file, …]',
        rows: [
          { text: '<DashboardNav />', from: ['DL5'], fate: 'client-boundary', note: 'reached: in the rsc layer DL1 is the proxy, carrying its path' },
          { text: 'globalThis.__RSC_MANIFEST["/dashboard/settings/page"] = {' },
          { text: '  clientModules: {' },
          { text: '    "…/components/DashboardNav.tsx": { id: …, name: "*", chunks: ["static/chunks/app/dashboard/layout-3c4d.js"], async: false },', from: ['DL5'], fate: 'client-boundary', change: 'same', morph: '"…/components/DashboardNav.tsx"', note: 'keyed by path' },
          { fold: 1, label: '1 more row: ProfileForm, read when SP9 renders', from: ['PF1'], change: 'same' },
          { text: '  }, ssrModuleMapping: {…}, …' }
        ]
      },
      {
        title: 'Flight · the row written', entity: 'rsc-runtime-entity', abridged: true,
        rows: [
          { text: REF_NAV, from: ['DL5'], fate: 'client-boundary', change: 'new', morph: 'layout-3c4d.js', note: 'id + chunk from the manifest; "default" appears only here' },
          { text: '   …["$","$L1",null,{}]…', from: ['DL5'], fate: 'client-boundary', change: 'new', morph: '$L1', note: 'where <DashboardNav /> stood, with its props ({})' }
        ]
      }
    ],
    links: [
      { fate: 'client-boundary', entities: ['client-reference-manifest', 'rsc-runtime-entity'] },
      { fate: 'client-boundary', entities: ['browser-chunks'], from: ['DL5'] }
    ],
    motion: ['connect', 'reference'], reduced: 'static'
  },
  {
    step: 'j5-9', mode: 'peek', form: 'json',
    summary: ['FlightRouterState: the route\'s shape, no content · segment seed data: the content per segment, nested the same way, so each slice can stream and be replaced alone'],
    panes: [{
      title: 'the two halves of row 0 "f"', abridged: true,
      rows: [
        { text: ROUTE_STATE, note: 'FlightRouterState: shape only' },
        { text: '[rsc, {"children":[rsc, {"children":[rsc, {"children":[rsc, {}, …]}, …]}, …]}, null, false, …]', from: ['RL2', 'DL4', 'AS2'], fate: 'server-only', note: 'seed data: [node, children, loading, isPartial, …] per segment' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['segment-slices'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j5-10', mode: 'open', form: 'flight', chip: PRERENDERED,
    panes: [{
      title: 'Flight · GET /dashboard/settings', entity: 'flight', abridged: true,
      rows: [
        { text: REF_NAV, from: ['DL5'], fate: 'client-boundary', change: 'new', note: 'DashboardNav, used as $L1' },
        { text: REF_FORM, from: ['SP9'], fate: 'client-boundary', change: 'new', note: 'ProfileForm, used as $L2' },
        { text: ROOT_ROW, fate: 'server-only', change: 'new', note: 'the tree + every segment inline' },
        { text: '   …["$","html",null,{"lang":"en","children":["$","body",null,{"children":["$","$L…",null,{…}]}]}]…', from: ['RL2'], fate: 'server-only', change: 'new', note: 'segment "": $L… is the LayoutRouter slot' },
        { text: '   …["$","section",null,{"className":"dashboard","children":[["$","$L1",null,{}],["$","$L…",null,{…}]]}]…', from: ['DL4', 'DL5', 'DL6'], fate: 'client-boundary', change: 'new', morph: '$L1', note: 'segment dashboard' },
        { fold: 1, label: '1 segment with no layout of its own: settings (only its slot)' },
        { text: '   …["$","dl",null,{"children":[…,["$","dd",null,{"children":"ada@example.com"}],…]}]…', from: ['AS2'], fate: 'server-only', change: 'new', note: 'segment __PAGE__: AccountSummary\'s output' },
        { text: '   …["$","$L2",null,{"name":"Ada"}]…', from: ['SP9'], fate: 'client-boundary', change: 'new', morph: '$L2', note: 'props become data' },
        { fold: 6, label: '6 rows of Next\'s own: client references (LayoutRouter …), "$Sreact.fragment", metadata' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity'] },
      { fate: 'server-only', entities: ['segment-slices'], from: ['RL2', 'AS2'] },
      { fate: 'client-boundary', entities: ['flight'] }
    ],
    motion: ['reference'], reduced: 'static'
  },
  {
    step: 'j5-11', mode: 'peek', form: 'flight',
    summary: ['⑂ ×2 · the same Flight bytes twice: copy 1 → the SSR runtime (HTML, step 12) · copy 2 → self.__next_f in the same document (step 13)'],
    panes: [], links: [], motion: []
  },
  {
    step: 'j5-12', mode: 'open', form: 'html', chip: PRERENDERED,
    panes: [{
      title: 'GET /dashboard/settings · text/html', entity: 'html', hint: 'written from copy 1 of the Flight stream', abridged: true,
      rows: [
        { text: '<html lang="en"><body><section class="dashboard">', from: ['RL2', 'DL4'], fate: 'server-only', change: 'new', note: 'from the rows: layouts not run again' },
        { text: '<nav data-open="false">', from: ['DN9', 'DN6'], fate: 'split', change: 'new', morph: 'nav', note: 'ssr-layer DashboardNav runs here: useState(false)' },
        { text: '  <button>Menu</button>', from: ['DN10'], fate: 'split', change: 'new', note: 'no onClick in HTML' },
        { text: '  <a href="/dashboard/settings" aria-current="true">Settings</a>', from: ['DN11'], fate: 'split', change: 'new', note: 'usePathname() read on the server' },
        { text: '  <a href="/dashboard/billing">Billing</a>', from: ['DN12'], fate: 'split', change: 'new' },
        { text: '</nav>' },
        { text: '<dl><dt>Email</dt><dd>ada@example.com</dd>…</dl>', from: ['AS2'], fate: 'server-only', change: 'new', note: 'from row 0: AccountSummary not run again' },
        { text: '<form …><input name="name" value="Ada"/><button>Save</button></form>', from: PF_FORM, fate: 'split', change: 'new', note: 'ssr-layer ProfileForm' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['ssr-runtime-entity', 'html'] },
      { fate: 'split', entities: ['src-dashboard-nav'], from: DN_NAV },
      { fate: 'server-only', entities: ['html'] }
    ],
    motion: ['transform'], reduced: 'static'
  },
  {
    step: 'j5-13', mode: 'peek', form: 'html',
    summary: ['self.__next_f.push types: [0] bootstrap · [1, text] Flight rows · [2, formState] after a no-JS action (absent here) · [3, base64] binary rows (none here)'],
    panes: [{
      title: 'copy 2 · <script> tags in the HTML stream', entity: 'next-f', abridged: true,
      rows: [
        { text: '<script>(self.__next_f=self.__next_f||[]).push([0])</script>', note: 'bootstrap' },
        { text: '<script>self.__next_f.push([1,"1:I[…,[\\"static/chunks/app/dashboard/layout-3c4d.js\\"],\\"default\\"]\\n…"])</script>', from: ['DL5'], fate: 'client-boundary', morph: '1:I', note: 'rows as text' },
        { text: ';self.__next_f.push([2,…])', note: 'form state: only after a no-JS action submit' },
        { text: '<script>self.__next_f.push([3,"…base64…"])</script>', note: 'binary rows: none on this page' }
      ]
    }],
    links: [{ fate: 'client-boundary', entities: ['next-f'] }],
    motion: ['wrap'], reduced: 'static'
  },
  {
    step: 'j5-14', mode: 'peek', form: 'html',
    summary: ['billing, not settings: chunk 1 leaves with the skeleton in a <template id="B:0"> hole · chunk 2 later carries <div hidden id="S:0"> with the invoices and $RC("B:0","S:0") to swap them in'],
    panes: [{
      title: 'GET /dashboard/billing · text/html, two chunks', entity: 'html', abridged: true,
      rows: [
        { text: '<h1>Billing</h1>', from: ['BP6'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'chunk 1' },
        { text: '<!--$?--><template id="B:0"></template><p>Loading invoices…</p><!--/$-->', from: ['BP7', 'BP13'], fate: 'server-only', mark: 'static-shell', change: 'new', morph: 'B:0', note: 'the fallback holds the place' },
        { text: '<div hidden id="S:0"><ul><li>€12.00</li>…</ul></div>', from: ['IL6'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'chunk 2, when the invoices resolve' },
        { text: '<script>$RC("B:0","S:0")</script>', from: ['BP8'], fate: 'server-only', mark: 'suspended', change: 'new', morph: 'B:0', note: 'swaps the content into the hole' }
      ]
    }],
    links: [
      { fate: 'static-shell', entities: ['html'] },
      { fate: 'suspended', entities: ['suspense-hole'] },
      { fate: 'server-only', entities: ['src-billing-page'] }
    ],
    motion: ['fill'], reduced: 'static'
  },
  {
    step: 'j5-15', mode: 'peek', form: 'files',
    summary: [
      '0 B of JS in the browser · ⊘ RootLayout · DashboardLayout · SettingsPage · AccountSummary · getProfile',
      'code · ⚡ framework · main-app · app/dashboard/layout-3c4d.js (DashboardNav) · app/dashboard/settings/page-5e6f.js (ProfileForm)'
    ],
    panes: [{
      title: 'what the browser fetches after the document', entity: 'browser-chunks', abridged: true,
      rows: [
        { text: '/_next/static/chunks/framework-….js', note: 'React itself' },
        { text: '/_next/static/chunks/main-app-….js', note: 'the App Router runtime' },
        { text: '/_next/static/chunks/app/dashboard/layout-3c4d.js', from: ['DN5'], fate: 'split', note: 'named by 1:I' },
        { text: '/_next/static/chunks/app/dashboard/settings/page-5e6f.js', from: ['PF4'], fate: 'split', note: 'named by 2:I' }
      ]
    }],
    links: [{ fate: 'split', entities: ['browser-chunks', 'client-components'] }],
    motion: ['fade-to-zero'], reduced: 'static'
  },
  { step: 'j5-16', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j5-17', mode: 'open', form: 'flight',
    panes: [{
      title: 'self.__next_f → Flight, in the browser', entity: 'next-f', hint: 'replays the chunks already in the array, then hooks push for the rest', abridged: true,
      rows: [
        { text: '[0] · [1,"1:I[…]\\n2:I[…]\\n0:{…"] · [1,"…"]', change: 'same', note: 'already in the array: replayed in order' },
        { text: REF_NAV, from: ['DL5'], fate: 'client-boundary', change: 'new', morph: '1:I', note: 'a reference: its chunk loads in step 18' },
        { text: REF_FORM, from: ['SP9'], fate: 'client-boundary', change: 'new', morph: '2:I' },
        { text: ROOT_ROW, fate: 'server-only', change: 'new', note: 'the same root row the server wrote' },
        { text: '   …["$","$L1",null,{}]…', from: ['DL5'], fate: 'client-boundary', change: 'new', note: 'where DashboardNav goes' },
        { text: '   …["$","dl",null,{…"ada@example.com"…}]…', from: ['AS2'], fate: 'server-only', change: 'new', note: 'output only: no code to run' }
      ]
    }],
    links: [
      { fate: 'client-boundary', entities: ['react-client'] },
      { fate: 'server-only', entities: ['react-client'] }
    ],
    motion: ['transform'], reduced: 'static'
  },
  {
    step: 'j5-18', mode: 'peek', form: 'files',
    summary: ['1:I → static/chunks/app/dashboard/layout-3c4d.js (DashboardNav) · 2:I → static/chunks/app/dashboard/settings/page-5e6f.js (ProfileForm) · hydration waits only for these'],
    panes: [{
      title: 'the two referenced chunks', entity: 'browser-chunks', abridged: true,
      rows: [
        { text: 'static/chunks/app/dashboard/layout-3c4d.js', from: ['DN5', 'DN6', ...DN_NAV], fate: 'split', note: '← 1:I · DashboardNav' },
        { text: 'static/chunks/app/dashboard/settings/page-5e6f.js', from: ['PF4', ...PF_FORM], fate: 'split', note: '← 2:I · ProfileForm' }
      ]
    }],
    links: [{ fate: 'split', entities: ['browser-chunks', 'client-components'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j5-19', mode: 'open', form: 'dom',
    panes: [{
      title: 'document · after hydration', entity: 'dom', abridged: true,
      rows: [
        { text: '<section class="dashboard">', from: ['DL4'], fate: 'server-only', change: 'same', note: 'static · as painted' },
        { text: '<nav data-open="false">…</nav>', from: DN_NAV, fate: 'split', change: 'same', note: 'hydrated · open=false · onClick live' },
        { text: '<dl>…ada@example.com…</dl>', from: ['AS2'], fate: 'server-only', change: 'same', note: 'static · as painted, still in the React tree' },
        { text: '<form>…<input name="name" value="Ada"/>…</form>', from: PF_FORM, fate: 'split', change: 'same', note: 'hydrated · formAction live (J7)' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['client-components', 'react-client'] },
      { fate: 'server-only', entities: ['dom'] }
    ],
    motion: ['light-up'], reduced: 'static'
  },
  {
    step: 'j5-20', mode: 'peek', form: 'json',
    summary: ['the client router\'s FlightRouterState: "" → dashboard → settings → __PAGE__, the shape of the server\'s loader tree (step 3) · every later navigation patches it'],
    panes: [{
      title: 'FlightRouterState · client copy', entity: 'router-state-tree', abridged: true,
      rows: [{ text: ROUTE_STATE, from: ['RL1', 'DL2', 'SP4'], fate: 'server-only', note: 'seeded from row 0 "f"' }]
    }],
    links: [{ fate: 'server-only', entities: ['router-state-tree', 'app-router'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j5-21', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j5-22', mode: 'off', panes: [], links: [], motion: [] }
]
