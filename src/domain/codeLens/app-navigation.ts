// src/domain/codeLens/app-navigation.ts
import type { LensStep } from '../types'
import { source } from './specimen'

/** Next-Router-State-Tree after a prefetch: the target tree, with "refetch" on the first segment the client cache cannot fill */
const TARGET_TREE = '["",{"children":["dashboard",{"children":["billing",{…"refetch"…}]}]}]'

/**
 * the lens along J6: one entry per journey step, in order (docs/code-lens.md §10.2, details in docs/code-lens/app-navigation.md).
 * The patch at j6-10 is j0-10's; the prefetch steps show the 16.3 Segment Cache requests.
 */
export const STEPS: LensStep[] = [
  {
    step: 'j6-1', mode: 'peek', form: 'tsx',
    summary: ['DN12 <Link href="/dashboard/billing"> enters the viewport → one prefetch task · priority Default (hover raises it to Intent) · deduplicated per URL · dropped if it leaves'],
    panes: [{
      title: 'components/DashboardNav.tsx', entity: 'src-dashboard-nav', abridged: true,
      rows: [{ ...source(['DN12'])[0], note: 'a prefetch task for /dashboard/billing' }]
    }],
    links: [{ fate: 'split', entities: ['client-components', 'prefetch-scheduler'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j6-2', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j6-3', mode: 'open', form: 'http',
    panes: [
      {
        title: 'prefetch · the tree', entity: 'routing-ladder', abridged: true,
        rows: [
          { text: 'GET /dashboard/billing', from: ['DN12'], fate: 'split', change: 'new', note: 'the Link\'s href' },
          { text: 'RSC: 1', change: 'new' },
          { text: 'Next-Router-Prefetch: 1', change: 'new' },
          { text: 'Next-Router-Segment-Prefetch: /_tree', change: 'new', morph: '/_tree', note: 'structure only' }
        ]
      },
      {
        title: '200 · text/x-component', entity: 'route-cache', hint: 'served from billing.segments/_tree.segment.rsc, written at build', abridged: true,
        rows: [
          { text: '0:{"buildId":"k7Qm2xLp9","tree":{"name":"","param":null,"prefetchHints":…,"slots":{"children":', from: ['RL1'], fate: 'server-only', change: 'new' },
          { text: '  {"name":"dashboard","param":null,…,"slots":{"children":', from: ['DL2'], fate: 'server-only', change: 'new' },
          { text: '    {"name":"billing","param":null,…,"slots":{"children":', change: 'new' },
          { text: '      {"name":"__PAGE__","param":null,…,"slots":null}}}}}}},"staleTime":…}', from: ['BP3'], fate: 'server-only', change: 'new', note: 'names only: no content' }
        ]
      }
    ],
    links: [
      { fate: 'split', entities: ['prefetch-scheduler'] },
      { fate: 'server-only', entities: ['route-cache'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j6-4', mode: 'open', form: 'flight',
    panes: [{
      title: 'prefetch · the missing segment', entity: 'segment-cache', abridged: true,
      rows: [
        { text: 'GET /dashboard/billing · Next-Router-Segment-Prefetch: /dashboard/billing/__PAGE__', change: 'new', note: 'one request per missing segment' },
        { fold: 2, label: '2 segments not requested: "" and dashboard are already in the Segment Cache', from: ['RL2', 'DL4'], change: 'same' },
        { text: '0:{"buildId":"k7Qm2xLp9","data":[{"rsc":…,"isPartial":"$@…",…}],…}', from: ['BP3'], fate: 'server-only', change: 'new', note: 'isPartial never resolves: the page has a hole' },
        { text: '1:"$Sreact.suspense"', change: 'new' },
        { text: '   …["$","h1",null,{"children":"Billing"}]…', from: ['BP6'], fate: 'server-only', mark: 'static-shell', change: 'new' },
        { text: '   …["$","$1",null,{"fallback":["$","p",null,{"children":"Loading invoices…"}],"children":"$L2"}]…', from: ['BP7', 'BP8'], fate: 'server-only', mark: 'suspended', change: 'new', morph: '$L2', note: 'hole: no row 2 in a prefetch' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['flight', 'src-billing-page'] },
      { fate: 'static-shell', entities: ['segment-cache'] },
      { fate: 'suspended', entities: ['src-billing-page'] }
    ],
    motion: ['fill'], reduced: 'static'
  },
  { step: 'j6-5', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j6-6', mode: 'open', form: 'http',
    panes: [{
      title: 'navigation request', entity: 'app-router', abridged: true,
      rows: [
        { text: 'GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb', from: ['DN12'], fate: 'split', change: 'new', morph: '_rsc', note: 'a hash of the headers below: the CDN key' },
        { text: 'RSC: 1', change: 'new' },
        { text: 'Next-Router-State-Tree: %5B%22%22%2C%7B%22children%22%3A…', change: 'new', note: 'URL-encoded JSON' },
        { text: `  ${TARGET_TREE}`, change: 'new', morph: '"refetch"', note: 'decoded: the target tree, marked where rendering starts' },
        { text: 'Next-Url: /dashboard/settings', change: 'new', note: 'the page the click came from' }
      ]
    }],
    links: [{ fate: 'split', entities: ['app-router', 'routing-ladder'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j6-7', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j6-8', mode: 'peek', form: 'json',
    summary: ['🔒 "" and dashboard: no mark in the header tree, so they are locked and not rendered · the "refetch" mark sits in billing\'s subtree: rendering starts there'],
    panes: [{
      title: 'Next-Router-State-Tree against the loader tree', entity: 'loader-tree', abridged: true,
      rows: [
        { text: TARGET_TREE, note: 'the header, decoded' },
        { text: '"" · app/layout.tsx', from: ['RL1'], fate: 'server-only', mark: 'shared-layout', note: 'locked' },
        { text: '"dashboard" · app/dashboard/layout.tsx', from: ['DL2'], fate: 'server-only', mark: 'shared-layout', note: 'locked' },
        { text: '"billing" · app/dashboard/billing/page.tsx', from: ['BP3'], fate: 'server-only', note: 'under the "refetch" mark: rendered' }
      ]
    }],
    links: [
      { fate: 'shared-layout', entities: ['src-root-layout', 'src-dashboard-layout'] },
      { fate: 'server-only', entities: ['loader-tree', 'router-state-tree'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j6-9', mode: 'peek', form: 'tsx',
    summary: ['⊘ runs: BillingPage BP3–BP8, and InvoiceList behind the boundary (IL4 reads cookies, IL5 the db) · 🔒 not called: RootLayout RL1, DashboardLayout DL2'],
    panes: [{
      title: 'what the RSC runtime calls', entity: 'rsc-runtime-entity', abridged: true,
      rows: [
        ...source(['BP3', 'BP6', 'BP7', 'BP8']),
        { ...source(['IL5'])[0], note: 'components/InvoiceList.tsx' },
        { ...source(['RL1'])[0], note: 'not called' },
        { ...source(['DL2'])[0], note: 'not called' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity', 'src-billing-page'], from: ['BP3', 'BP6', 'BP7', 'BP8', 'IL5'] },
      { fate: 'static-shell', entities: ['src-billing-page'] },
      { fate: 'suspended', entities: ['db'], from: ['IL5'] },
      { fate: 'suspended', entities: ['src-billing-page'], from: ['BP8'] },
      { fate: 'shared-layout', entities: ['src-root-layout', 'src-dashboard-layout'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j6-10', mode: 'open', form: 'flight-patch',
    panes: [{
      title: 'GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb · text/x-component', entity: 'flight', abridged: true,
      rows: [
        { text: `RSC: 1 · Next-Router-State-Tree: ${TARGET_TREE}`, note: 'the request (context)' },
        {
          fold: 3, label: '3 settings rows from the first load: not in this patch', from: ['DL5', 'SP9', 'AS2'], change: 'gone',
          lines: ['1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]', '2:I[…,["static/chunks/app/dashboard/settings/page-5e6f.js"],"default"]', '0:{"P":…,"c":["","dashboard","settings"],…}']
        },
        { text: '1:"$Sreact.suspense"', change: 'new' },
        { text: '0:{"f":[["children","dashboard","children","billing",[…tree patch…],[…seed…],…,false]],"q":"","i":false,"S":false,…,"b":"k7Qm2xLp9"}', from: ['BP3'], fate: 'server-only', change: 'new', note: 'starts at billing' },
        { text: '   …["$","h1",null,{"children":"Billing"}]…', from: ['BP6'], fate: 'server-only', mark: 'static-shell', change: 'new' },
        { text: '   …["$","$1",null,{"fallback":["$","p",null,{"children":"Loading invoices…"}],"children":"$L2"}]…', from: ['BP7', 'BP8'], fate: 'server-only', mark: 'suspended', change: 'new', morph: '$L2', note: 'hole' },
        { text: '2:["$","ul",null,{"children":[["$","li","inv_1",{"children":"€12.00"}],…]}]', from: ['IL6'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'fills $L2 later' },
        { text: 'no rows: RootLayout · DashboardLayout · DashboardNav', from: ['RL1', 'RL2', 'DL2', 'DL4', 'DL5', 'DN6'], mark: 'shared-layout', change: 'same', note: 'kept' },
        { text: 'no <html>, no <script>: the SSR runtime is not involved', note: 'text/x-component only' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['segment-slices'] },
      { fate: 'static-shell', entities: ['flight'] },
      { fate: 'suspended', entities: ['flight'] },
      { fate: 'shared-layout', entities: ['app-router'] }
    ],
    motion: ['swap', 'fill'], reduced: 'side-by-side'
  },
  {
    step: 'j6-11', mode: 'open', form: 'dom',
    panes: [{
      title: 'document · after the merge', entity: 'dom', hint: 'the LayoutRouter for dashboard/children swaps settings → billing', abridged: true,
      rows: [
        { text: '<section class="dashboard">', from: ['DL4'], fate: 'server-only', mark: 'shared-layout', change: 'same', note: 'kept: the same node' },
        { text: '<nav data-open="true">…</nav>', from: ['DN6', 'DN9'], fate: 'split', mark: 'shared-layout', change: 'same', note: 'kept: the menu stays open' },
        { text: '<dl>…ada@example.com…</dl>', from: ['AS2'], fate: 'server-only', change: 'gone', note: 'settings unmounted' },
        { text: '<form>…</form>', from: ['PF7', 'PF8'], fate: 'split', change: 'gone' },
        { text: '<h1>Billing</h1>', from: ['BP6'], fate: 'server-only', mark: 'static-shell', change: 'new', morph: 'Billing' },
        { text: '<ul><li>€12.00</li>…</ul>', from: ['IL6'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'fills the hole when row 2 arrives' }
      ]
    }],
    links: [
      { fate: 'shared-layout', entities: ['client-components', 'dom'] },
      { fate: 'split', entities: ['client-components'], from: ['DN6', 'DN9'] },
      { fate: 'server-only', entities: ['src-settings-page'], from: ['AS2'] },
      { fate: 'split', entities: ['src-settings-page'], from: ['PF7', 'PF8'] },
      { fate: 'server-only', entities: ['layout-router', 'src-billing-page'], from: ['BP6', 'IL6'] },
      { fate: 'static-shell', entities: ['layout-router'] },
      { fate: 'suspended', entities: ['layout-router'] }
    ],
    motion: ['swap'], reduced: 'static'
  },
  {
    step: 'j6-12', mode: 'peek', form: 'json',
    summary: ['history.pushState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: … }, "", "/dashboard/billing") · the client FlightRouterState now matches the server\'s tree for billing'],
    panes: [{
      title: 'history entry + FlightRouterState', entity: 'router-state-tree', abridged: true,
      rows: [
        { text: 'history.pushState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: … }, "", "/dashboard/billing")', note: 'Back restores this tree' },
        { text: '["",{"children":["dashboard",{"children":["billing",{"children":["__PAGE__",{}]}]}]},…]', from: ['RL1', 'DL2', 'BP3'], fate: 'server-only', change: 'new', note: 'was …"settings"…' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['router-state-tree', 'app-router'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j6-13', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j6-14', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j6-15', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j6-16', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j6-17', mode: 'off', panes: [], links: [], motion: [] },
  { step: 'j6-18', mode: 'off', panes: [], links: [], motion: [] }
]
