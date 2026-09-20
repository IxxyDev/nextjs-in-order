// src/domain/journeys/whole-lifecycle.ts
import type { Journey } from '../types'

export const WHOLE_LIFECYCLE: Journey = {
  id: 'j0',
  slug: 'whole-lifecycle',
  title: 'The whole lifecycle',
  following: 'DashboardNav.tsx as a module, then GET /dashboard/settings as a request',
  whatShouldClick: 'A document is built once. After that the client patches a tree.',
  steps: [
    {
      id: 'j0-1', kind: 'explain', title: 'Three bands of time',
      story: 'Everything Next.js does happens in one of three bands: once per deploy at build time, once per request on the server, and once per tab in the browser. The double line is the network. Every arrow that crosses it carries either code or data, never both by accident.',
      camera: { kind: 'world' }, states: {}, edges: []
    },
    {
      id: 'j0-2', kind: 'move', title: 'A module with a directive',
      story: 'We follow components/DashboardNav.tsx. Its first line is "use client". That one string will decide where its code runs and what the browser downloads.',
      camera: { kind: 'region', id: 'source' },
      token: { at: 'src-dashboard-nav', glyph: 'source-module', label: 'DashboardNav.tsx' },
      states: { 'src-dashboard-nav': 'current', 'src-dashboard-layout': 'active' }, edges: []
    },
    {
      id: 'j0-3', kind: 'transform', title: 'The compiler sees one file',
      story: 'SWC strips the types and turns JSX into calls. It also notices the directive and marks the module as a client boundary. It does not know who imports this file; that is not its job.',
      camera: { kind: 'entities', ids: ['src-dashboard-nav', 'swc'] },
      token: { at: 'swc', glyph: 'transformed-module', label: 'DashboardNav.js' },
      states: { 'src-dashboard-nav': 'kept', swc: 'active' }, edges: ['e-src-swc'],
      internals: ['serverComponents transform in @next/swc', 'output has no types and no JSX; the directive survives as metadata']
    },
    {
      id: 'j0-4', kind: 'transform', title: 'The bundler sees the graph',
      story: 'The bundler walks every import. Because of the boundary, DashboardNav lands in the browser layer and gets packed into app/dashboard/layout-3c4d.js, and one row is written into the client-reference manifest so the server can point at that chunk later.',
      camera: { kind: 'entities', ids: ['bundler', 'layers', 'browser-chunks', 'client-reference-manifest'] },
      token: { at: 'browser-chunks', glyph: 'browser-chunk', label: 'app/dashboard/layout-3c4d.js' },
      states: { bundler: 'active', layers: 'active', 'browser-chunks': 'new', 'client-reference-manifest': 'new', swc: 'kept' },
      edges: ['e-swc-bundler', 'e-bundler-layers', 'e-bundler-browser-chunks', 'e-bundler-crm']
    },
    {
      id: 'j0-5', kind: 'explain', title: 'The shelf between build and runtime',
      story: 'The build ends with artifacts on a shelf: manifests, server chunks, browser chunks and prerendered outputs. Nothing above this line runs again until the next deploy. Everything below reads from it.',
      camera: { kind: 'region', id: 'artifacts' },
      states: {
        'routes-manifest': 'fresh', 'build-manifest': 'fresh', 'prerender-manifest': 'fresh', 'middleware-manifest': 'fresh',
        'client-reference-manifest': 'fresh', 'server-reference-manifest': 'fresh', 'server-chunks': 'fresh',
        'browser-chunks': 'fresh', 'prerendered-outputs': 'fresh', 'next-cache-dir': 'fresh'
      },
      edges: ['e-manifest-ladder', 'e-outputs-server-cache']
    },
    {
      id: 'j0-6', kind: 'move', title: 'A request meets the ladder',
      story: 'Now we follow GET /dashboard/settings. The Node HTTP callback hands it to router-server, which runs eight ordered steps: config headers, redirects, Proxy, rewrites, filesystem check, more rewrites, dynamic routes, fallback rewrites. This request matches a page, so it is handed to render-server. A request for a static chunk would have left at step five.',
      camera: { kind: 'region', id: 'router-server' },
      token: { at: 'routing-ladder', glyph: 'request', label: 'GET /dashboard/settings' },
      states: { 'node-http': 'active', 'routing-ladder': 'current', proxy: 'active', 'early-exits': 'kept', 'routes-manifest': 'kept' },
      edges: ['e-http-ladder', 'e-ladder-proxy', 'e-ladder-exits', 'e-ladder-loader']
    },
    {
      id: 'j0-7', kind: 'transform', title: 'Two runtimes, one stream',
      story: 'render-server walks the loader tree. The RSC runtime executes the Server Components and writes Flight rows; when it reaches DashboardNav it writes a reference to the chunk from step 4 instead of running it. The stream is teed: one copy feeds the SSR runtime, which turns it into HTML; the other is kept to inline into the page.',
      camera: { kind: 'region', id: 'render-server' },
      token: { at: 'flight', glyph: 'flight', label: 'Flight rows' },
      states: {
        'loader-tree': 'active', 'rsc-runtime-entity': 'active', 'client-reference-manifest': 'kept', flight: 'current',
        'flight-tee': 'active', 'ssr-runtime-entity': 'active', html: 'new'
      },
      edges: ['e-ladder-loader', 'e-loader-rsc', 'e-crm-rsc', 'e-rsc-flight', 'e-flight-tee', 'e-tee-ssr', 'e-ssr-html']
    },
    {
      id: 'j0-8', kind: 'move', title: 'What crosses the network',
      story: 'The document crosses as data: HTML plus inline Flight chunks that carry references. The browser then fetches the chunks those references name. That is the only code that crosses: Client Components. AccountSummary and the layouts arrive only as rendered rows.',
      camera: { kind: 'entities', ids: ['html', 'next-f', 'dom', 'browser-chunks', 'client-components'] },
      token: { at: 'dom', glyph: 'html', label: 'document' },
      states: { html: 'kept', dom: 'new', 'next-f': 'new', 'browser-chunks': 'active', 'client-components': 'new', 'flight-tee': 'kept' },
      edges: ['e-html-dom', 'e-tee-nextf', 'e-chunks-client']
    },
    {
      id: 'j0-9', kind: 'transform', title: 'Paint first, hydrate the islands',
      story: 'The page is visible before any script runs. React then rebuilds the tree from the inline Flight, loads the referenced chunks and hydrates only DashboardNav and ProfileForm. Server Component output stays exactly as painted, and the client router is seeded with the route tree.',
      camera: { kind: 'region', id: 'browser' },
      token: { at: 'client-components', glyph: 'component-client', label: 'DashboardNav (hydrated)' },
      states: { dom: 'kept', 'next-f': 'active', 'react-client': 'active', 'client-components': 'current', 'app-router': 'new', 'router-state-tree': 'new' },
      edges: ['e-nextf-react', 'e-react-client-components', 'e-react-router', 'e-router-tree']
    },
    {
      id: 'j0-10', kind: 'check', title: 'The central claim',
      story: 'Now the user clicks to /dashboard/billing. The client sends its route tree; the server renders only the segment that differs and returns a Flight patch, not a document. One LayoutRouter slot swaps; the root layout, the dashboard layout and DashboardNav keep their state. The initial request constructs a document. Subsequent App Router interactions usually patch the existing React route tree.',
      camera: { kind: 'entities', ids: ['app-router', 'router-state-tree', 'loader-tree', 'flight', 'client-components'] },
      token: { at: 'app-router', glyph: 'flight', label: 'Flight patch · billing' },
      states: {
        'app-router': 'current', 'router-state-tree': 'active', 'loader-tree': 'active', 'rsc-runtime-entity': 'active', flight: 'active',
        'client-components': 'kept', 'src-root-layout': 'kept', 'src-dashboard-layout': 'kept', 'src-settings-page': 'replaced', 'src-billing-page': 'new'
      },
      edges: ['e-tree-loader', 'e-loader-rsc', 'e-rsc-flight', 'e-flight-router-patch'],
      checks: [
        { statement: 'Server Components run in the browser after hydration.', isTrue: false, why: 'Only Client Components are hydrated; Server Components arrive as rendered Flight rows and their source never crosses the network.' },
        { statement: 'A client navigation downloads a new HTML document.', isTrue: false, why: 'Navigation sends Next-Router-State-Tree and receives a Flight patch for the divergent subtree; the document stays.' },
        { statement: 'The client-reference manifest is sent to the browser.', isTrue: false, why: 'The manifest stays on the server; only the references it produces travel inside Flight.' }
      ]
    }
  ]
}
