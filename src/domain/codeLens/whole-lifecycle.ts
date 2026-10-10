import type { LensStep } from '../types'
import { ACTION_ID, DN_NAV, off, PF_FORM, REF_FORM, REF_NAV, ROOT_ROW, source } from './specimen'

const DN_SPLIT = ['DN2', 'DN3', 'DN4', 'DN5', 'DN6', 'DN7', 'DN9', 'DN10', 'DN11', 'DN12']

/** the shelf ledger: j0-5 shows it, j0-6 keeps it dimmed */
const SHELF_LEDGER = [
  '⚡ "…/components/DashboardNav.tsx" → chunks ["static/chunks/app/dashboard/layout-3c4d.js"] · client-reference-manifest',
  '⚡ "…/components/ProfileForm.tsx" → chunks ["static/chunks/app/dashboard/settings/page-5e6f.js"] · client-reference-manifest',
  `⇄ "${ACTION_ID}" → updateProfile · app/actions.ts · worker app/dashboard/settings/page · server-reference-manifest`,
  '⊘ server/app/layout.js · server/app/dashboard/layout.js · server/app/dashboard/settings/page.js · server-chunks only',
  '○ server/app/dashboard/settings.html · settings.rsc (○ because SP5 is ▤) · prerendered-outputs'
]

/** docs/code-lens.md §5: the lens along J0 */
export const STEPS: LensStep[] = [
  off('j0-1'),
  {
    step: 'j0-2', mode: 'peek', form: 'tsx',
    summary: ['DashboardNav.tsx · 15 lines · ⚡B 1 (DN1) · ⚡S 10 (DN2–DN7, DN9–DN12) · imported by dashboard/layout.tsx DL5 ⚡B'],
    panes: [{
      title: 'components/DashboardNav.tsx', entity: 'src-dashboard-nav', abridged: false,
      rows: [...source(['DL5'], 'new').map((l) => ({ ...l, note: 'context: app/dashboard/layout.tsx' })), ...source(['DN1', ...DN_SPLIT], 'new')]
    }],
    links: [
      { fate: 'client-boundary', entities: ['src-dashboard-nav', 'src-dashboard-layout'] },
      { fate: 'split', entities: ['src-dashboard-nav'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j0-3', mode: 'open', form: 'js',
    panes: [{
      title: 'DashboardNav.js', hint: 'one output for both client layers, ssr and browser', abridged: true,
      rows: [
        { text: '/* __next_internal_client_entry_do_not_use__ default auto */', from: ['DN1'], fate: 'client-boundary', change: 'same', morph: 'client', note: "'use client' → marker comment" },
        { text: 'import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";', fate: 'split', change: 'new', note: 'automatic JSX runtime' },
        { fold: 3, label: '3 import lines, unchanged', from: ['DN2', 'DN3', 'DN4'], change: 'same' },
        { text: 'export default function DashboardNav() {', from: ['DN5'], fate: 'split', change: 'same' },
        { text: '    const [open, setOpen] = useState(false);', from: ['DN6'], fate: 'split', change: 'same', cut: '<boolean>' },
        { text: '    return _jsxs("nav", { "data-open": open, children: [', from: ['DN9'], fate: 'split', change: 'same', morph: 'nav' },
        { text: '        _jsx("button", { onClick: () => setOpen(!open), children: "Menu" }),', from: ['DN10'], fate: 'split', change: 'same', morph: 'button' },
        { fold: 2, label: '2 <Link> lines, compiled to _jsx(Link, …) the same way', from: ['DN11', 'DN12'], change: 'same' }
      ]
    }],
    links: [
      { fate: 'client-boundary', entities: ['swc'] },
      { fate: 'split', entities: ['swc'] },
      { fate: 'client-boundary', entities: ['src-dashboard-nav'], from: ['DN1'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  {
    step: 'j0-4', mode: 'open', form: 'js-reference', split: true,
    panes: [
      {
        side: 'server', title: 'server · rsc layer', entity: 'layers', abridged: true,
        rows: [
          { text: 'import { registerClientReference } from "react-server-dom-turbopack/server";', from: ['DN1'], fate: 'client-boundary', change: 'new' },
          { text: 'export default registerClientReference(', from: ['DN5'], fate: 'client-boundary', change: 'same', morph: 'export default', note: 'function → reference' },
          { fold: 1, label: '1 line: a stub that throws if the server calls it', lines: ['    function() { throw new Error("Attempted to call the default export of … from the server …"); },'] },
          { text: '    "…/components/DashboardNav.tsx",', fate: 'client-boundary', change: 'new', note: 'the key step 5 looks up' },
          { text: '    "default",', fate: 'client-boundary', change: 'new' },
          { text: ');' },
          { fold: 10, label: '10 lines of DashboardNav (stay in the browser chunk)', from: DN_SPLIT, change: 'gone' }
        ]
      },
      {
        side: 'browser', title: 'static/chunks/app/dashboard/layout-3c4d.js', entity: 'browser-chunks',
        badge: '×2', hint: 'a second copy in the ssr layer stays on the server and renders HTML in step 7', abridged: true,
        rows: [
          { text: 'function DashboardNav() {', from: ['DN5'], fate: 'split', change: 'same' },
          { text: '    const [open, setOpen] = useState(false);', from: ['DN6'], fate: 'split', change: 'same' },
          { text: '    return _jsxs("nav", { "data-open": open, children: [ … ] });', from: DN_NAV, fate: 'split', change: 'same' },
          { text: '}' }
        ]
      }
    ],
    links: [
      { fate: 'client-boundary', entities: ['layers'] },
      { fate: 'split', entities: ['browser-chunks'] }
    ],
    motion: ['split'], reduced: 'three-pane'
  },
  {
    step: 'j0-5', mode: 'peek', form: 'manifest', summary: SHELF_LEDGER,
    panes: [
      {
        title: 'server/app/dashboard/settings/page_client-reference-manifest.js', entity: 'client-reference-manifest', abridged: true,
        rows: [
          { text: 'globalThis.__RSC_MANIFEST["/dashboard/settings/page"] = {' },
          { text: '  clientModules: {' },
          { text: '    "…/components/DashboardNav.tsx": { id: …, name: "*", chunks: ["static/chunks/app/dashboard/layout-3c4d.js"], async: false },', from: ['DN1'], fate: 'client-boundary', change: 'new' },
          { text: '    "…/components/ProfileForm.tsx":  { id: …, name: "*", chunks: ["static/chunks/app/dashboard/settings/page-5e6f.js"], async: false }', from: ['PF1'], fate: 'client-boundary', change: 'new' },
          { text: '  }, ssrModuleMapping: {…}, …' },
          { text: '}' }
        ]
      },
      {
        title: 'server/server-reference-manifest.json', entity: 'server-reference-manifest', abridged: true,
        rows: [
          { text: `{ node: { "${ACTION_ID}": { workers: { "app/dashboard/settings/page": { moduleId: …, async: false } },`, from: ['AC4'], fate: 'action-id', change: 'new' },
          { text: '  exportedName: "updateProfile", filename: "app/actions.ts" } }, edge: {}, encryptionKey: "…" }', from: ['AC4'], fate: 'action-id', change: 'new' }
        ]
      }
    ],
    links: [
      { fate: 'client-boundary', entities: ['client-reference-manifest'] },
      { fate: 'action-id', entities: ['server-reference-manifest'] },
      { fate: 'server-only', entities: ['server-chunks'] },
      { fate: 'split', entities: ['browser-chunks'] },
      { fate: 'static-shell', entities: ['prerendered-outputs'] }
    ],
    motion: ['connect'], reduced: 'static'
  },
  {
    step: 'j0-6', mode: 'peek', form: 'manifest', dimmed: true, chip: 'GET /dashboard/settings · no code changes form here',
    summary: SHELF_LEDGER, panes: [], links: [], motion: []
  },
  {
    step: 'j0-7', mode: 'open', form: 'flight',
    chip: '○ route: this render ran at build; a production GET is served these rows from settings.rsc',
    panes: [{
      title: 'Flight · GET /dashboard/settings', entity: 'flight', badge: '⑂ ×2', hint: 'teed: one copy renders HTML (step 8), one is inlined for the browser', abridged: true,
      rows: [
        { text: REF_NAV, from: ['DL5'], fate: 'client-boundary', change: 'new', note: "reference to step 4's chunk" },
        { text: REF_FORM, from: ['SP9'], fate: 'client-boundary', change: 'new' },
        { text: ROOT_ROW, fate: 'server-only', change: 'new', note: 'tree + seed' },
        { text: '   …["$","section",null,{"className":"dashboard","children":[["$","$L1",null,{}],…]}]…', from: ['DL4', 'DL5'], fate: 'client-boundary', change: 'same', morph: '$L1', note: '<DashboardNav /> → ["$","$L1",null,{}]' },
        { text: '   …["$","dl",null,{"children":[…,["$","dd",null,{"children":"ada@example.com"}],…]}]…', from: ['AS2'], fate: 'server-only', change: 'same', morph: 'dl', note: '<AccountSummary …/> → its output' },
        { text: '   …["$","$L2",null,{"name":"Ada"}]…', from: ['SP9'], fate: 'client-boundary', change: 'same', morph: '$L2', note: 'props become data' },
        { text: 'rendered by the ssr copy → html', from: DN_NAV, fate: 'split', note: 'ghost row: the code is not in Flight' },
        { fold: 6, label: '6 rows of Next\'s own: client references (LayoutRouter …), "$Sreact.fragment", metadata' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity'] },
      { fate: 'client-boundary', entities: ['flight', 'client-reference-manifest'] },
      { fate: 'split', entities: ['ssr-runtime-entity'] }
    ],
    motion: ['reference'], reduced: 'side-by-side'
  },
  {
    step: 'j0-8', mode: 'open', form: 'html',
    footer: [
      '0 B of JS in the browser · ⊘ RootLayout · DashboardLayout · SettingsPage · AccountSummary · getProfile · updateProfile body',
      `1 ID · ⇄ updateProfile → createServerReference("${ACTION_ID}", callServer, void 0, findSourceMapURL, "updateProfile") in page-5e6f.js`
    ],
    panes: [{
      title: 'GET /dashboard/settings · text/html', entity: 'html', abridged: true,
      rows: [
        { text: '<html lang="en"><body><section class="dashboard">', from: ['RL2', 'DL4'], fate: 'server-only', note: 'output only' },
        { text: '<nav data-open="false"><button>Menu</button><a href="/dashboard/settings" aria-current="true">Settings</a>…</nav>', from: DN_NAV, fate: 'split', note: "ssr copy's HTML" },
        { text: '<dl><dt>Email</dt><dd>ada@example.com</dd>…</dl>', from: ['AS2'], fate: 'server-only', note: 'output only' },
        { text: '<form …><input name="name" value="Ada"/><button>Save</button></form>', from: PF_FORM, fate: 'split', note: 'action fields folded (J7)' },
        { text: '<script src="/_next/static/chunks/app/dashboard/layout-3c4d.js" async=""></script>', fate: 'split', change: 'new', note: 'code crosses' },
        { text: '<script>(self.__next_f=self.__next_f||[]).push([0])</script>', change: 'new', note: 'bootstrap' },
        { text: '<script>self.__next_f.push([1,"1:I[…,[\\"static/chunks/app/dashboard/layout-3c4d.js\\"],\\"default\\"]\\n…"])</script>', from: ['DL5'], fate: 'client-boundary', change: 'same', morph: '1:I', note: 'row → inline chunk' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['html'] },
      { fate: 'split', entities: ['browser-chunks', 'html'] },
      { fate: 'client-boundary', entities: ['next-f'] },
      { fate: 'action-id', entities: ['browser-chunks'] }
    ],
    motion: ['wrap', 'fade-to-zero'], reduced: 'static'
  },
  {
    step: 'j0-9', mode: 'open', form: 'dom',
    panes: [{
      title: 'document · after hydration', entity: 'dom', abridged: true,
      rows: [
        { text: '<section class="dashboard">', from: ['DL4'], fate: 'server-only', change: 'same', note: 'static · as painted' },
        { text: '<nav data-open="false">…</nav>', from: DN_NAV, fate: 'split', change: 'same', note: 'hydrated · open=false · onClick live' },
        { text: '<dl>…ada@example.com…</dl>', from: ['AS2'], fate: 'server-only', change: 'same', note: 'static · as painted' },
        { text: '<form>…</form>', from: PF_FORM, fate: 'split', change: 'same', note: 'hydrated · formAction live (J7)' },
        { text: 'self.__next_f', fate: 'client-boundary', change: 'same', note: 'consumed: rows replayed into the React tree' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['client-components'] },
      { fate: 'client-boundary', entities: ['react-client'] },
      { fate: 'server-only', entities: ['dom'] }
    ],
    motion: ['light-up'], reduced: 'static'
  },
  {
    step: 'j0-10', mode: 'open', form: 'flight-patch',
    panes: [{
      title: 'GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb · text/x-component', entity: 'flight', abridged: true,
      rows: [
        { text: 'GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb · RSC: 1 · Next-Router-State-Tree: …"settings"…', note: 'header line (context)' },
        {
          fold: 3, label: '3 settings rows from step 7: not in this patch', from: ['DL5', 'SP9', 'AS2'], change: 'gone',
          lines: [REF_NAV, REF_FORM, '0:{"P":…,"c":["","dashboard","settings"],…}']
        },
        { text: '1:"$Sreact.suspense"', change: 'new' },
        { text: '0:{"f":[["children","dashboard","children","billing",[…tree patch…],[…seed…],…,false]],"q":"","i":false,"S":false,…,"b":"k7Qm2xLp9"}', from: ['BP3'], fate: 'server-only', change: 'new', note: 'starts at billing' },
        { text: '   …["$","h1",null,{"children":"Billing"}]…', from: ['BP6'], fate: 'server-only', mark: 'static-shell', change: 'new' },
        { text: '   …["$","$1",null,{"fallback":["$","p",null,{"children":"Loading invoices…"}],"children":"$L2"}]…', from: ['BP7', 'BP8'], fate: 'server-only', mark: 'suspended', change: 'new', morph: '$L2', note: 'hole' },
        { text: '2:["$","ul",null,{"children":[["$","li","inv_1",{"children":"€12.00"}],…]}]', from: ['IL6'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'fills $L2 later' },
        { text: 'DashboardLayout {children} → LayoutRouter swaps settings for billing', from: ['DL6'], fate: 'server-only', change: 'same', note: 'the slot: replaced, not re-rendered' },
        { text: 'no rows: RootLayout · DashboardLayout · DashboardNav', from: ['RL1', 'RL2', 'DL2', 'DL4', 'DL5', 'DN6'], mark: 'shared-layout', change: 'same', note: 'kept' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity'], from: ['BP3', 'BP6', 'BP7', 'BP8', 'IL6'] },
      { fate: 'static-shell', entities: ['flight'] },
      { fate: 'suspended', entities: ['suspense-hole'] },
      { fate: 'shared-layout', entities: ['src-root-layout', 'src-dashboard-layout', 'client-components'] },
      { fate: 'server-only', entities: ['layout-router'], from: ['DL6'] }
    ],
    motion: ['swap', 'fill'], reduced: 'side-by-side'
  }
]
