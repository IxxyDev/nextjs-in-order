import type { Journey } from '../types'
import { JOURNEY_META } from './meta'
import { SOURCES } from '../sources'

export const APP_INITIAL: Journey = {
  ...JOURNEY_META.appInitial,
  following: 'the route tree for /dashboard/settings, then a Flight row, then the DashboardNav reference',
  whatShouldClick: 'The RSC runtime produces Flight, not HTML. The SSR runtime consumes Flight. The browser receives Server Component output as data and Client Components as code.',
  steps: [
    {
      id: 'j5-1', kind: 'explain', title: 'Two React module variants in one process',
      story: 'render-server loads React twice: a react-server build that can run Server Components but cannot touch the DOM, and the ordinary react-dom/server build that renders HTML. They are stacked here because the second consumes what the first produces.',
      camera: { kind: 'region', id: 'render-server' },
      states: { 'rsc-runtime-entity': 'active', 'ssr-runtime-entity': 'active' }, edges: [],
      internals: ['react.react-server.js selected by the "react-server" export condition', 'react-server-dom-webpack/server on the RSC side, react-dom/server on the SSR side', 'App Router: added in Next.js 13, stable in 13.4; a parallel architecture next to Pages Router with its own rendering model, not an upgrade of it', 'built on React Server Components, stable since React 19']
    },
    {
      id: 'j5-2', kind: 'explain', title: 'How the bundler chose the variant',
      story: 'At build time the bundler put every Server Component in the rsc layer and enabled the react-server condition there. So import "react" inside app/dashboard/settings/page.tsx resolved to a build without useState. The same import in a Client Component resolved to the full React. Nothing at request time decides this; it was decided by a resolver rule.',
      camera: { kind: 'entities', ids: ['layers', 'bundler', 'src-settings-page'] },
      states: { layers: 'current', bundler: 'kept', 'src-settings-page': 'active', 'src-dashboard-nav': 'active' }, edges: ['e-bundler-layers']
    },
    {
      id: 'j5-3', kind: 'move', title: 'The loader tree',
      story: 'app/ folders became a recursive description: each node is [segment, parallelRoutes, modules]. For /dashboard/settings the tree is "" → dashboard → settings → __PAGE__, and each node carries lazy references to its layout, page, loading and error files.',
      camera: { kind: 'entities', ids: ['loader-tree', 'server-chunks'] },
      token: { at: 'loader-tree', glyph: 'segment', label: 'loader tree · /dashboard/settings' },
      states: { 'loader-tree': 'current', 'server-chunks': 'kept', 'routing-ladder': 'kept' }, edges: ['e-ladder-loader', 'e-server-chunks-loader'],
      internals: ['["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]', 'built by next-app-loader at build time; rebuilt by the watcher in dev', 'modules: lazy references to the file conventions { layout, page, loading, error, "not-found", template, … }', 'parallelRoutes keys: children for the nested segment, @modal or @sidebar for each named slot']
    },
    {
      id: 'j5-4', kind: 'transform', title: 'Recursive traversal',
      story: 'Rendering walks the tree from the root inward. At every node it renders the layout or page, then descends into children and into every parallel slot such as @modal. Structure and content are kept separate on purpose: the structure is cheap to compare, the content is what gets replaced.',
      camera: { kind: 'entities', ids: ['loader-tree', 'src-root-layout', 'src-dashboard-layout', 'src-settings-page'] },
      token: { at: 'loader-tree', glyph: 'segment', label: 'root → dashboard → settings' },
      states: { 'loader-tree': 'current', 'src-root-layout': 'active', 'src-dashboard-layout': 'active', 'src-settings-page': 'active' }, edges: [],
      internals: ['loading.tsx becomes the fallback of a <Suspense> the renderer wraps around the segment automatically', 'error.tsx becomes an error boundary', 'every key in parallelRoutes is walked: children, then each named slot such as @modal or @sidebar']
    },
    {
      id: 'j5-5', kind: 'explain', title: 'LayoutRouter at every boundary',
      story: 'Around each parent → child transition the renderer inserts a LayoutRouter, a small Client Component that owns one slot. It does nothing on the first load. On a later navigation it is the exact place where one segment can be swapped while everything around it keeps its React nodes.',
      camera: { kind: 'entities', ids: ['loader-tree', 'layout-router'] },
      states: { 'loader-tree': 'kept', 'layout-router': 'new' }, edges: ['e-loader-layout-router']
    },
    {
      id: 'j5-6', kind: 'transform', title: 'Server Components execute',
      story: 'The RSC runtime runs RootLayout, DashboardLayout and SettingsPage. Settings is a ○ route, so this run happened once at build and requests get its stored result; a dynamic page runs exactly this per request. getProfile() reads the database through "use cache"; AccountSummary renders to plain elements. None of this code reaches the browser: only its result does.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'db', 'src-settings-page', 'src-account-summary'] },
      token: { at: 'rsc-runtime-entity', glyph: 'component-server', label: 'SettingsPage (executing)' },
      states: { 'rsc-runtime-entity': 'current', db: 'active', 'src-settings-page': 'active', 'src-account-summary': 'active', 'src-root-layout': 'active', 'src-dashboard-layout': 'active' },
      edges: ['e-loader-rsc', 'e-db-rsc'],
      internals: ['○ /dashboard/settings: prerender ran this render at build (J1 step 14); a production GET is served settings.html + settings.rsc from the server cache', 'the same render runs per request for a dynamic route, in next dev, and after updateTag("profile") expires the entry']
    },
    {
      id: 'j5-7', kind: 'predict', title: 'The runtime reaches <DashboardNav />',
      story: 'DashboardLayout renders <DashboardNav />, a "use client" module. The RSC runtime cannot execute it: in the rsc layer that import resolved to a stub, not the implementation.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'src-dashboard-nav', 'client-reference-manifest'] },
      token: { at: 'rsc-runtime-entity', glyph: 'component-client', label: '<DashboardNav /> reached' },
      states: { 'rsc-runtime-entity': 'current', 'src-dashboard-nav': 'active', 'client-reference-manifest': 'kept' }, edges: [],
      question: {
        text: 'What does the RSC runtime write into the stream for <DashboardNav />?',
        options: ['The rendered HTML of the nav', 'The component source so the browser can run it', 'A reference: module id, chunk names, export name, plus the props', 'Nothing; Client Components are skipped on the server'],
        answer: 2,
        why: 'The runtime looks the module up in the client-reference manifest and emits a client reference with props. The SSR runtime will resolve it on the server for HTML, and the browser will load the named chunk for hydration.'
      }
    },
    {
      id: 'j5-8', kind: 'reveal', title: 'A client reference, not a component',
      story: 'The runtime looks DashboardNav\'s module path up in page_client-reference-manifest.js, finds its id and chunk, and writes a reference row, I[id, ["static/chunks/app/dashboard/layout-3c4d.js"], "default"], together with the props it received. The boundary is now a pointer to code that lives on the shelf.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'client-reference-manifest', 'browser-chunks'] },
      token: { at: 'client-reference-manifest', glyph: 'reference', label: 'ref → app/dashboard/layout-3c4d' },
      states: { 'rsc-runtime-entity': 'active', 'client-reference-manifest': 'current', 'browser-chunks': 'kept', 'src-dashboard-nav': 'replaced' }, edges: ['e-crm-rsc'],
      internals: ['manifest row: "…/components/DashboardNav.tsx": { id: …, name: "*", chunks: ["static/chunks/app/dashboard/layout-3c4d.js"], async: false }', 'Flight row: 1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]: the export name appears only here']
    },
    {
      id: 'j5-9', kind: 'explain', title: 'Structure and content, separately',
      story: 'Two things come out of the render. FlightRouterState is the shape of the route without any content, and it travels in both directions later. Segment slices carry the content: [segment, tree patch, rendered content, head] per segment, so each one can be streamed and, on navigation, replaced alone.',
      camera: { kind: 'entities', ids: ['flight', 'segment-slices', 'router-state-tree'] },
      states: { flight: 'active', 'segment-slices': 'new', 'router-state-tree': 'new', 'loader-tree': 'kept' }, edges: ['e-flight-slices']
    },
    {
      id: 'j5-10', kind: 'transform', title: 'The Flight payload',
      story: 'Serialization produces numbered rows: two client references (1:, 2:) and a root row 0: holding the tree and the three segments, where the client components appear as $L1 and $L2 with props. Rows are text with single-letter keys; binary data goes as base64 rows. It is compact because it is inlined into HTML and re-sent on every navigation.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'flight'] },
      token: { at: 'flight', glyph: 'flight', label: 'Flight rows 0:…2:' },
      states: { 'rsc-runtime-entity': 'kept', flight: 'current', 'segment-slices': 'kept' }, edges: ['e-rsc-flight'],
      internals: ['1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]: DashboardNav reference, used as $L1', '2:I[…,["static/chunks/app/dashboard/settings/page-5e6f.js"],"default"]: ProfileForm reference, used as $L2 with {"name":"Ada"}', '0: root row: tree (FlightRouterState: "" → dashboard → settings → __PAGE__) plus the segment slices inline; SettingsPage\'s content sits in the __PAGE__ segment below settings', 'no Suspense row: SettingsPage has no boundary (billing\'s page adds a "$Sreact.suspense" row and a $L hole)', 'Content-Type on navigation: text/x-component']
    },
    {
      id: 'j5-11', kind: 'transform', title: 'Tee',
      story: 'The stream is split into two identical streams. One is about to become HTML. The other will be written into the same HTML as data. Nothing is rendered twice: both copies are the same bytes.',
      camera: { kind: 'entities', ids: ['flight', 'flight-tee', 'ssr-runtime-entity', 'next-f'] },
      token: { at: 'flight-tee', glyph: 'flight', label: 'Flight × 2' },
      states: { flight: 'kept', 'flight-tee': 'current', 'ssr-runtime-entity': 'active', 'next-f': 'new' }, edges: ['e-flight-tee', 'e-tee-ssr', 'e-tee-nextf']
    },
    {
      id: 'j5-12', kind: 'transform', title: 'The SSR runtime consumes copy one',
      story: 'react-dom/server deserializes the rows back into elements. Where it meets the DashboardNav reference it loads the real module from the ssr layer and renders it, so the nav is in the HTML. It never runs SettingsPage again: that output is already in the rows.',
      camera: { kind: 'entities', ids: ['ssr-runtime-entity', 'html', 'src-dashboard-nav'] },
      token: { at: 'ssr-runtime-entity', glyph: 'html', label: 'HTML being written' },
      states: { 'ssr-runtime-entity': 'current', html: 'new', 'src-dashboard-nav': 'active', 'src-settings-page': 'kept', 'rsc-runtime-entity': 'kept' }, edges: ['e-tee-ssr', 'e-ssr-html'],
      internals: ['renderToHTMLOrFlight decides HTML vs Flight from the RSC request header', '16.3: native Node streams replace web streams in this layer']
    },
    {
      id: 'j5-13', kind: 'transform', title: 'Copy two is inlined as self.__next_f',
      story: 'The second copy is cut into small <script> tags interleaved into the HTML stream: [0] bootstrap, [1, text], [2, form state], [3, base64]. Each one pushes onto a global array. HTML and hydration data travel as one response.',
      camera: { kind: 'entities', ids: ['flight-tee', 'html', 'next-f'] },
      token: { at: 'html', glyph: 'json', label: 'self.__next_f.push([1, "…"])' },
      states: { 'flight-tee': 'kept', html: 'current', 'next-f': 'new' }, edges: ['e-tee-nextf'],
      internals: ['<script>self.__next_f.push([1,"0:[\\"$\\",\\"html\\"…"])</script>', 'use-flight-response.tsx in next/src/server/app-render']
    },
    {
      id: 'j5-14', kind: 'move', title: 'Streaming around a Suspense boundary',
      story: 'Settings has no Suspense boundary, so its document is complete in one pass. /dashboard/billing has one around InvoiceList: the first HTML chunk leaves with the skeleton in place, and when the invoices resolve a later chunk carries the content and a tiny script that swaps it in. Nobody waits for the slowest part.',
      camera: { kind: 'entities', ids: ['html', 'suspense-hole', 'dom'] },
      token: { at: 'html', glyph: 'html', label: 'chunk 1 (shell) · chunk 2 (late)' },
      states: { html: 'current', 'suspense-hole': 'new', dom: 'new', 'src-billing-page': 'active' }, edges: ['e-html-dom', 'e-html-suspense']
    },
    {
      id: 'j5-15', kind: 'move', title: 'What crosses the network',
      story: 'The document crosses as data plus references. Then the browser fetches the chunks the references name: framework, main-app and app/dashboard/layout-3c4d.js for DashboardNav, settings/page-5e6f.js for ProfileForm. That is the only code in this whole story that crosses the line.',
      camera: { kind: 'entities', ids: ['html', 'dom', 'browser-chunks', 'client-components'] },
      token: { at: 'dom', glyph: 'html', label: 'document arrived' },
      states: { html: 'kept', dom: 'current', 'browser-chunks': 'active', 'client-components': 'new', 'next-f': 'new' }, edges: ['e-html-dom', 'e-chunks-client']
    },
    {
      id: 'j5-16', kind: 'explain', title: 'Paint before interactivity',
      story: 'The browser paints the HTML as it arrives. Text, layout and images are visible. Buttons do nothing yet, forms submit natively. Nothing in React has run.',
      camera: { kind: 'entities', ids: ['dom', 'react-client'] },
      token: { at: 'dom', glyph: 'dom', label: 'painted, not interactive' },
      states: { dom: 'current', 'react-client': 'dimmed', 'client-components': 'dimmed' }, edges: []
    },
    {
      id: 'j5-17', kind: 'transform', title: 'Reconstructing the stream',
      story: 'When the client runtime starts, some __next_f chunks are already in the array and some are still arriving. It replays what is there, then hooks the push method to receive the rest. The result is the same element tree the server had, with references where Client Components go.',
      camera: { kind: 'entities', ids: ['next-f', 'react-client'] },
      token: { at: 'react-client', glyph: 'flight', label: 'Flight rebuilt in the browser' },
      states: { 'next-f': 'active', 'react-client': 'current', dom: 'kept' }, edges: ['e-nextf-react']
    },
    {
      id: 'j5-18', kind: 'move', title: 'Loading the referenced chunks',
      story: 'For every client reference the runtime needs the module: app/dashboard/layout-3c4d.js and settings/page-5e6f.js. They were already requested from the script tags; hydration waits only for these, not for anything Server Components needed.',
      camera: { kind: 'entities', ids: ['browser-chunks', 'react-client', 'client-components'] },
      token: { at: 'client-components', glyph: 'browser-chunk', label: 'layout-3c4d.js · page-5e6f.js' },
      states: { 'browser-chunks': 'active', 'react-client': 'active', 'client-components': 'current' }, edges: ['e-chunks-client']
    },
    {
      id: 'j5-19', kind: 'transform', title: 'Only the islands hydrate',
      story: 'hydrateRoot walks the tree. DashboardNav and ProfileForm get their state and event handlers. AccountSummary and the layouts stay exactly as painted, yet they are in the React tree as elements, so React can reconcile around them later. Suspense content that arrived late hydrates when its code is ready.',
      camera: { kind: 'region', id: 'browser' },
      token: { at: 'client-components', glyph: 'component-client', label: 'DashboardNav · ProfileForm (hydrated)' },
      states: { 'react-client': 'active', 'client-components': 'current', dom: 'kept', 'suspense-hole': 'active', 'next-f': 'kept' }, edges: ['e-react-client-components', 'e-suspense-client']
    },
    {
      id: 'j5-20', kind: 'explain', title: 'The client now owns a tree',
      story: 'The same Flight seeded the client router with FlightRouterState. From here on the browser holds a route tree that matches the server\'s loader tree in shape. A document was constructed; everything after this will patch that tree.',
      camera: { kind: 'entities', ids: ['react-client', 'app-router', 'router-state-tree'] },
      token: { at: 'router-state-tree', glyph: 'segment', label: 'FlightRouterState (client)' },
      states: { 'react-client': 'kept', 'app-router': 'new', 'router-state-tree': 'current', 'loader-tree': 'kept' }, edges: ['e-react-router', 'e-router-tree']
    },
    {
      id: 'j5-21', kind: 'explain', title: 'Internals',
      story: 'Names worth knowing when you open the source: renderToHTMLOrFlight, react-server-dom-webpack, the rsc request header, text/x-component, page_client-reference-manifest.js. None of them are needed to predict behavior; all of them are where the behavior lives.',
      camera: { kind: 'region', id: 'render-server' },
      states: { 'rsc-runtime-entity': 'active', 'ssr-runtime-entity': 'active', flight: 'active', 'client-reference-manifest': 'active' }, edges: [],
      internals: ['next/src/server/app-render/app-render.tsx: renderToHTMLOrFlight', 'react-server-dom-webpack/server.node: renderToReadableStream (Flight)', 'react-dom/server: renderToReadableStream (HTML) consuming createFromReadableStream', 'headers: rsc, next-router-state-tree, next-url; query _rsc'],
      sources: [
        SOURCES.serverAndClientComponents,
        SOURCES.streaming
      ]
    },
    {
      id: 'j5-22', kind: 'check', title: 'Check yourself',
      story: 'Three statements about what you just watched.',
      camera: { kind: 'world' },
      states: { 'rsc-runtime-entity': 'active', 'ssr-runtime-entity': 'active', flight: 'active', html: 'active', 'client-components': 'active' }, edges: ['e-rsc-flight', 'e-tee-ssr', 'e-tee-nextf', 'e-chunks-client'],
      checks: [
        { statement: 'The SSR runtime re-executes SettingsPage to produce HTML.', isTrue: false, why: 'It deserializes the Flight copy and renders those elements; only Client Components run again on the server, because their implementation exists in the ssr layer.' },
        { statement: 'Flight is HTML in a different encoding.', isTrue: false, why: 'Flight is a serialized element tree with references and structure; HTML is derived from one copy of it. The browser needs Flight to know where Client Components go.' },
        { statement: 'The browser receives the source of AccountSummary.', isTrue: false, why: 'AccountSummary is a Server Component; only its rendered rows cross the network. Its module is not in any browser chunk.' }
      ]
    }
  ]
}
