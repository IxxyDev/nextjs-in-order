import type { LensStep } from '../types'
import { ACTION_ID, NAV_CHUNK_NAME, off, source } from './specimen'

const ENTRY = `/* __next_internal_action_entry… {…} */`

/**
 * the lens along J1: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/production-build.md).
 */
export const STEPS: LensStep[] = [
  off('j1-1'),
  {
    step: 'j1-2', mode: 'peek', form: 'files',
    summary: [
      'app/ → /dashboard/settings · /dashboard/billing · pages/ → /products/[id] · /posts/[id] · /api/hello',
      'loader tree for /dashboard/settings: "" (layout.tsx) → dashboard (layout.tsx) → settings (page.tsx)'
    ],
    panes: [
      {
        title: 'route map · from app/ and pages/', entity: 'route-discovery', abridged: true,
        rows: [
          { text: 'app/dashboard/settings/page.tsx   → /dashboard/settings', from: ['SP4'], fate: 'server-only', change: 'new' },
          { text: 'app/dashboard/billing/page.tsx    → /dashboard/billing', from: ['BP3'], fate: 'server-only', change: 'new' },
          { text: 'pages/products/[id].tsx           → /products/[id]', from: ['PR7'], fate: 'split', change: 'new' },
          { text: 'pages/posts/[id].tsx              → /posts/[id]', from: ['PO10'], fate: 'split', change: 'new' },
          { text: 'pages/api/hello.ts                → /api/hello', from: ['AH2'], fate: 'server-only', change: 'new' }
        ]
      },
      {
        title: 'loader tree · /dashboard/settings', entity: 'loader-tree', abridged: true,
        rows: [
          { text: '["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]', from: ['RL1', 'DL2', 'SP4'], fate: 'server-only', change: 'new', note: 'each node also points at its layout or page' }
        ]
      }
    ],
    links: [
      { fate: 'server-only', entities: ['src-settings-page'], from: ['SP4'] },
      { fate: 'server-only', entities: ['src-billing-page'], from: ['BP3'] },
      { fate: 'server-only', entities: ['loader-tree', 'src-root-layout', 'src-dashboard-layout'], from: ['RL1', 'DL2'] },
      { fate: 'server-only', entities: ['route-discovery'], from: ['AH2'] },
      { fate: 'split', entities: ['route-discovery'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j1-3', mode: 'open', form: 'js',
    panes: [{
      title: 'ProfileForm.js', hint: 'SWC output for the client layers, shown unminified', abridged: true,
      rows: [
        { text: '/* __next_internal_client_entry_do_not_use__ default auto */', from: ['PF1'], fate: 'client-boundary', change: 'same', morph: 'client', note: "'use client' → marker comment" },
        { text: 'import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";', fate: 'split', change: 'new', note: 'automatic JSX runtime' },
        { fold: 2, label: '2 import lines, unchanged', from: ['PF2', 'PF3'], change: 'same' },
        { text: 'export default function ProfileForm({ name }) {', from: ['PF4'], fate: 'split', change: 'same', morph: 'ProfileForm', cut: ': { name: string }' },
        { fold: 1, label: '1 line: useActionState (J7)', from: ['PF5'], change: 'same' },
        { text: '    return _jsxs("form", { action: formAction, children: [', from: ['PF7'], fate: 'split', change: 'same', morph: 'form' },
        { text: '        _jsx("input", { name: "name", defaultValue: name }),', from: ['PF8'], fate: 'split', change: 'same', morph: 'input' },
        { fold: 1, label: '1 line: the Save button and its Saved message, compiled the same way (J7)', from: ['PF9'], change: 'same' },
        { text: '    ] });' }
      ]
    }],
    links: [
      { fate: 'client-boundary', entities: ['swc'] },
      { fate: 'split', entities: ['swc'] },
      { fate: 'client-boundary', entities: ['src-profile-form'], from: ['PF1'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  {
    step: 'j1-4', mode: 'open', form: 'js-reference', split: true,
    panes: [
      {
        side: 'server', title: 'server · app/actions.js', entity: 'swc', abridged: true,
        rows: [
          { text: ENTRY, from: ['AC1'], fate: 'action-id', change: 'same', morph: 'action', note: "from 'use server'" },
          { text: 'import { registerServerReference } from "private-next-rsc-server-reference";', fate: 'action-id', change: 'new' },
          { fold: 2, label: '2 import lines, unchanged', from: ['AC2', 'AC3'], change: 'same' },
          { text: 'export async function updateProfile(prevState, formData) {', from: ['AC4'], fate: 'action-id', change: 'same', cut: 'types' },
          { fold: 3, label: '3 lines of the body: stay here and run on the POST (J7)', from: ['AC5', 'AC6', 'AC7'], change: 'same' },
          { fold: 2, label: '2 lines: a check that every export is an async function', lines: ['import { ensureServerEntryExports } from "private-next-rsc-action-validate";', 'ensureServerEntryExports([updateProfile]);'] },
          { text: `registerServerReference(updateProfile, "${ACTION_ID}", null);`, from: ['AC4'], fate: 'action-id', change: 'new', morph: ACTION_ID, note: 'in the manifest' }
        ]
      },
      {
        side: 'browser', title: 'browser · app/actions.js', entity: 'swc',
        hint: 'what ProfileForm gets when it imports updateProfile (PF3)', abridged: true,
        rows: [
          { fold: 1, label: '1 line: the same action-entry comment', lines: [ENTRY] },
          { text: 'import { … } from "private-next-rsc-action-client-wrapper";', fate: 'action-id', change: 'new' },
          { text: 'const $$RSC_SERVER_ACTION_0 = createServerReference(', from: ['AC4'], fate: 'action-id', change: 'new' },
          { text: `    "${ACTION_ID}", …);`, from: ['AC4'], fate: 'action-id', change: 'new', morph: ACTION_ID },
          { text: 'export { $$RSC_SERVER_ACTION_0 as updateProfile };', from: ['PF3'], fate: 'action-id', change: 'new', note: 'the name PF3 imports' },
          { fold: 3, label: '3 lines of the body: not in the browser build', from: ['AC5', 'AC6', 'AC7'], change: 'gone' }
        ]
      }
    ],
    links: [
      { fate: 'action-id', entities: ['swc'] },
      { fate: 'action-id', entities: ['src-actions'], from: ['AC1'] },
      { fate: 'action-id', entities: ['server-reference-manifest'], from: ['AC4'] },
      { fate: 'action-id', entities: ['src-profile-form'], from: ['PF3'] }
    ],
    motion: ['split'], reduced: 'three-pane'
  },
  {
    step: 'j1-5', mode: 'open', form: 'js',
    panes: [
      {
        title: 'ProfileForm.js', hint: 'what if: ProfileForm imports Button from a barrel package · the Webpack path', abridged: true,
        rows: [
          { ...source(['NC5'])[0], note: 'context: next.config.js' },
          { text: 'import { Button } from "__barrel_optimize__?names=Button!=!ui-kit";', from: ['PB1'], fate: 'split', change: 'same', morph: 'Button', note: "'ui-kit' → a request for Button only" }
        ]
      },
      {
        title: 'ui-kit (the barrel) · as next-barrel-loader serves it', abridged: true,
        hint: 'Turbopack (the default) gets the same result by treating ui-kit as side-effect free',
        rows: [
          { fold: 3, label: 'every other re-export of ui-kit: dropped, never walked', change: 'gone', lines: ['export { Avatar } from "./avatar.js"', 'export { Badge } from "./badge.js"', '…'] },
          { text: 'export { Button } from "./button.js"', from: ['PB1'], fate: 'split', change: 'new', morph: 'Button', note: 'the one file that defines Button' }
        ]
      }
    ],
    links: [
      { fate: 'split', entities: ['swc', 'bundler'] },
      { fate: 'server-only', entities: ['swc'], from: ['NC5'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  off('j1-6'),
  {
    step: 'j1-7', mode: 'peek', form: 'tsx',
    summary: ['settings/page.tsx SP3 imports ProfileForm.tsx, whose PF1 is \'use client\': the edge only the bundler sees'],
    panes: [{
      title: 'the import edge', abridged: true,
      rows: [
        { ...source(['SP3'])[0], note: 'app/dashboard/settings/page.tsx' },
        { ...source(['PF1'])[0], note: 'components/ProfileForm.tsx: the boundary' }
      ]
    }],
    links: [
      { fate: 'client-boundary', entities: ['bundler'] },
      { fate: 'client-boundary', entities: ['src-settings-page'], from: ['SP3'] },
      { fate: 'client-boundary', entities: ['src-profile-form'], from: ['PF1'] }
    ],
    motion: ['connect'], reduced: 'static'
  },
  {
    step: 'j1-8', mode: 'peek', form: 'js',
    summary: ['import "react": rsc layer → react.react-server.js (no useState) · ssr and app-pages-browser → the full react'],
    panes: [{
      title: 'one import, two Reacts', entity: 'layers', abridged: true,
      rows: [
        { ...source(['PF2'])[0], note: 'components/ProfileForm.tsx' },
        { text: 'ssr · app-pages-browser: "react" → react/index.js', from: ['PF2'], fate: 'split', note: 'useState, useActionState …' },
        { text: 'rsc: "react" → react/react.react-server.js', from: ['SP4'], fate: 'server-only', note: 'SettingsPage reaches React here: no useState, no useEffect' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['layers', 'src-profile-form'] },
      { fate: 'server-only', entities: ['layers', 'src-settings-page'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  off('j1-9'),
  {
    step: 'j1-10', mode: 'open', form: 'files',
    panes: [{
      title: '.next/static/chunks/', entity: 'browser-chunks', hint: 'the browser entries (Webpack names, as in the journey)', abridged: true,
      rows: [
        { text: 'app/dashboard/settings/page-5e6f.js', from: ['PF4', 'PF7', 'PF8'], fate: 'split', change: 'new', morph: 'page-5e6f.js', note: 'ProfileForm: its code crosses' },
        { text: 'client entry at the boundary: settings/page.tsx → ProfileForm.tsx', from: ['SP3', 'PF1'], fate: 'client-boundary', change: 'new', note: 'opened by the bundler' },
        { fold: 2, label: 'SettingsPage and AccountSummary: no browser chunk (server-only)', from: ['SP4', 'AS1'], change: 'gone' },
        { text: 'framework-a1b2c3.js', change: 'new', note: 'React, ReactDOM, Next' },
        { text: 'main-app-d4e5f6.js', change: 'new', note: 'App Router bootstrap' },
        { text: 'webpack-9c0d.js', change: 'new', note: 'runtime' },
        { text: NAV_CHUNK_NAME, from: ['DN5'], fate: 'split', change: 'new', note: 'DashboardNav (J0)' }
      ]
    }],
    links: [
      { fate: 'split', entities: ['browser-chunks', 'split-chunks'] },
      { fate: 'client-boundary', entities: ['flight-client-entry-plugin'] }
    ],
    motion: ['split'], reduced: 'static'
  },
  {
    step: 'j1-11', mode: 'open', form: 'manifest',
    panes: [
      {
        title: 'server · ProfileForm in the rsc layer', abridged: true,
        rows: [
          { text: 'export default registerClientReference(function() { throw … }, "…/components/ProfileForm.tsx", "default");', from: ['PF1'], fate: 'client-boundary', change: 'new', morph: '"…/components/ProfileForm.tsx"', note: 'the body is gone; the path becomes the key' },
          { fold: 6, label: '6 lines of ProfileForm (stay in page-5e6f.js)', from: ['PF2', 'PF4', 'PF5', 'PF7', 'PF8', 'PF9'], change: 'gone' }
        ]
      },
      {
        title: 'server/app/dashboard/settings/page_client-reference-manifest.js', entity: 'client-reference-manifest', abridged: true, hint: 'name "*": every export · chunks as Turbopack writes them (--webpack: [chunkId, file, …])',
        rows: [
          { text: 'globalThis.__RSC_MANIFEST["/dashboard/settings/page"] = {' },
          { text: '  clientModules: {' },
          { text: '    "…/components/ProfileForm.tsx": { id: …, name: "*", chunks: ["static/chunks/app/dashboard/settings/page-5e6f.js"], async: false }', from: ['PF1'], fate: 'client-boundary', change: 'new', morph: '"…/components/ProfileForm.tsx"' },
          { fold: 1, label: '1 row: DashboardNav, the same shape (J0)', from: ['DN1'] },
          { text: '  }, ssrModuleMapping: {…}, …' },
          { text: '}' }
        ]
      }
    ],
    links: [
      { fate: 'client-boundary', entities: ['client-reference-manifest', 'flight-manifest-plugin'] },
      { fate: 'client-boundary', entities: ['src-profile-form'], from: ['PF1'] }
    ],
    motion: ['reference'], reduced: 'static'
  },
  {
    step: 'j1-12', mode: 'peek', form: 'manifest',
    summary: [
      'routes-manifest.json · functions-config-manifest.json (Proxy matchers) → router-server (the ladder, Proxy at step 3)',
      'pages-manifest.json · app-paths-manifest.json → render-server: which module to require',
      'build-manifest.json → <script> tags · prerender-manifest.json → the ISR branch',
      '*_client-reference-manifest.js → RSC runtime · server-reference-manifest.json → action handler'
    ],
    panes: [], links: [], motion: []
  },
  {
    step: 'j1-13', mode: 'peek', form: 'tsx',
    summary: ['○ settings ← SP5 ▤ "use cache" · ◐ billing ← IL4 cookies() in <Suspense> · ƒ /products/[id] ← PR3 getServerSideProps · ● /posts/[id] ← PO8 revalidate: 60'],
    panes: [{
      title: 'the lines that decide each strategy', abridged: true,
      rows: [
        { ...source(['SP5'])[0], note: '○ /dashboard/settings: only cached data' },
        { ...source(['IL4'])[0], note: '◐ /dashboard/billing: a request read inside <Suspense>' },
        { ...source(['PR3'])[0], note: 'ƒ /products/[id]: runs per request' },
        { ...source(['PO8'])[0], note: '● /posts/[id]: static, regenerated after 60 s' }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['route-analysis'] },
      { fate: 'cached', entities: ['src-settings-page'], from: ['SP5'] },
      { fate: 'suspended', entities: ['src-billing-page'] },
      { fate: 'cached', entities: ['prerender-manifest'], from: ['PO8'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j1-14', mode: 'open', form: 'files',
    panes: [{
      title: '.next/server/', entity: 'prerendered-outputs', abridged: true,
      rows: [
        { text: 'app/dashboard/settings.html', from: ['SP4'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the whole page' },
        { text: 'app/dashboard/settings.rsc', from: ['SP4'], fate: 'server-only', mark: 'static-shell', change: 'new', note: "j0-7's Flight rows" },
        { text: 'app/dashboard/settings.segments/_tree.segment.rsc', from: ['SP4'], fate: 'server-only', mark: 'static-shell', change: 'new', note: '+ one .segment.rsc per segment: prefetch files' },
        { text: 'app/dashboard/billing.html', from: ['BP6', 'BP7'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'the shell: <h1> + Loading invoices…' },
        { text: 'app/dashboard/billing.meta  "postponed": "…"', from: ['IL4'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'the hole, resumed per request (no billing.rsc)' },
        { text: 'pages/posts/7.html', from: ['PO6'], fate: 'server-only', mark: 'static-shell', change: 'new' },
        { text: 'pages/posts/7.json', from: ['PO7', 'PO8'], fate: 'server-only', mark: 'cached', change: 'new', note: 'the props; stale after 60 s' },
        { fold: 2, label: '2 .meta files: settings (status, headers) · posts/7 ({ routeCache } only)', lines: ['app/dashboard/settings.meta', 'pages/posts/7.meta'] }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['prerender'] },
      { fate: 'static-shell', entities: ['prerendered-outputs'] },
      { fate: 'suspended', entities: ['prerendered-outputs'] },
      { fate: 'cached', entities: ['server-cache'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j1-15', mode: 'peek', form: 'json',
    summary: ['server/app/dashboard/settings/page.js.nft.json · { version: 1, files: [ … ] }: every file this entry needs at runtime'],
    panes: [{
      title: 'server/app/dashboard/settings/page.js.nft.json', entity: 'tracing', abridged: true,
      rows: [
        { text: '{ "version": 1, "files": [' },
        { text: '    "../../../chunks/…",', note: 'the route\'s own server chunks' },
        { text: '    "../../../../../node_modules/next/dist/…",' },
        { text: '    "../../../../../node_modules/react/…",' },
        { text: '    … ] }', note: 'a small fraction of node_modules' }
      ]
    }],
    links: [], motion: []
  },
  {
    step: 'j1-16', mode: 'peek', form: 'files',
    summary: ["NC6 output: 'standalone' → .next/standalone/: server.js · node_modules (traced subset) · .next/server · public/ and .next/static copied by the deploy step"],
    panes: [{
      title: '.next/standalone/', entity: 'standalone', abridged: true,
      rows: [
        { ...source(['NC6'])[0], note: 'context: next.config.js' },
        { text: 'server.js', from: ['NC6'], fate: 'server-only', change: 'new', note: 'a generated minimal server' },
        { text: 'node_modules/', change: 'new', note: 'only the traced files' },
        { text: '.next/server/', change: 'new', note: 'server chunks and manifests' },
        { text: 'public/ · .next/static/', note: 'copied in by the deploy step' }
      ]
    }],
    links: [{ fate: 'server-only', entities: ['standalone'] }],
    motion: [], reduced: 'static'
  },
  {
    step: 'j1-17', mode: 'open', form: 'terminal',
    panes: [{
      title: 'next build · route summary', entity: 'next-build', abridged: true,
      rows: [
        { text: 'Route (app)                 Revalidate  Expire', change: 'new' },
        { text: '├ ◐ /dashboard/billing', from: ['IL4'], fate: 'server-only', mark: 'suspended', change: 'new', note: 'IL4: cookies() inside <Suspense>' },
        { text: '└ ○ /dashboard/settings             1h      1d', from: ['SP5'], fate: 'server-only', mark: 'static-shell', change: 'new', note: "SP5 ▤: cacheLife('hours')" },
        { text: 'Route (pages)               Revalidate  Expire', change: 'new' },
        { text: '├   /posts/[id]                  1m      1y', from: ['PO8'], fate: 'server-only', mark: 'cached', change: 'new', note: 'PO8: revalidate: 60, shown on the grouped row' },
        { text: '│ └ ● /posts/7', from: ['PO3'], fate: 'server-only', mark: 'static-shell', change: 'new', note: 'PO3: getStaticPaths lists 7 · times blank' },
        { text: '└ ƒ /products/[id]', from: ['PR3'], fate: 'server-only', change: 'new', note: 'PR3: getServerSideProps' },
        { text: 'ƒ Proxy (Middleware)', from: ['PX2'], fate: 'server-only', change: 'new', note: 'proxy.ts' },
        { fold: 3, label: '3 rows no specimen line decides: ○ /_not-found · /_app · ƒ /api/hello', lines: ['┌ ○ /_not-found  (app)', '┌   /_app  (pages)', '├ ƒ /api/hello  (pages)'] },
        {
          fold: 4, label: '4 lines of legend: ○ Static · ● SSG · ◐ Partial Prerender · ƒ Dynamic',
          lines: [
            '○  (Static)             prerendered as static content',
            '●  (SSG)                prerendered as static HTML (uses generateStaticParams)',
            '◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content',
            'ƒ  (Dynamic)            server-rendered on demand'
          ]
        }
      ]
    }],
    links: [
      { fate: 'server-only', entities: ['route-analysis'], from: ['PR3'] },
      { fate: 'server-only', entities: ['proxy'], from: ['PX2'] },
      { fate: 'static-shell', entities: ['prerendered-outputs'] },
      { fate: 'suspended', entities: ['prerendered-outputs'] },
      { fate: 'cached', entities: ['prerender-manifest'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  off('j1-18')
]
