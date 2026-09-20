import type { Journey } from '../types'

export const APP_INITIAL: Journey = {
  id: 'j5',
  slug: 'app-initial',
  title: 'App Router: the initial request',
  following: 'the route tree for /dashboard/settings, then a Flight row, then the DashboardNav reference',
  whatShouldClick: 'The RSC runtime produces Flight, not HTML. The SSR runtime consumes Flight. The browser receives Server Component output as data and Client Components as code.',
  steps: [
    {
      id: 'j5-1', kind: 'explain', title: 'Two React module variants in one process',
      story: 'render-server loads React twice: a react-server build that can run Server Components but cannot touch the DOM, and the ordinary react-dom/server build that renders HTML. They are stacked here because the second consumes what the first produces.',
      camera: { kind: 'region', id: 'render-server' },
      states: { 'rsc-runtime-entity': 'active', 'ssr-runtime-entity': 'active' }, edges: [],
      internals: ['react.react-server.js selected by the "react-server" export condition', 'react-server-dom-webpack/server on the RSC side, react-dom/server on the SSR side']
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
      internals: ['["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]', 'built by next-app-loader at build time; rebuilt by the watcher in dev']
    },
    {
      id: 'j5-4', kind: 'transform', title: 'Recursive traversal',
      story: 'Rendering walks the tree from the root inward. At every node it renders the layout or page, then descends into children and into every parallel slot such as @modal. Structure and content are kept separate on purpose: the structure is cheap to compare, the content is what gets replaced.',
      camera: { kind: 'entities', ids: ['loader-tree', 'src-root-layout', 'src-dashboard-layout', 'src-settings-page'] },
      token: { at: 'loader-tree', glyph: 'segment', label: 'root → dashboard → settings' },
      states: { 'loader-tree': 'current', 'src-root-layout': 'active', 'src-dashboard-layout': 'active', 'src-settings-page': 'active' }, edges: []
    },
    {
      id: 'j5-5', kind: 'explain', title: 'LayoutRouter at every boundary',
      story: 'Around each parent → child transition the renderer inserts a LayoutRouter, a small Client Component that owns one slot. It does nothing on the first load. On a later navigation it is the exact place where one segment can be swapped while everything around it keeps its React nodes.',
      camera: { kind: 'entities', ids: ['loader-tree', 'layout-router'] },
      states: { 'loader-tree': 'kept', 'layout-router': 'new' }, edges: ['e-loader-layout-router']
    },
    {
      id: 'j5-6', kind: 'transform', title: 'Server Components execute',
      story: 'The RSC runtime runs RootLayout, DashboardLayout and SettingsPage. SettingsPage awaits getProfile() from the database; AccountSummary renders to plain elements. None of this code will ever reach the browser: only its result will.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'db', 'src-settings-page', 'src-account-summary'] },
      token: { at: 'rsc-runtime-entity', glyph: 'component-server', label: 'SettingsPage (executing)' },
      states: { 'rsc-runtime-entity': 'current', db: 'active', 'src-settings-page': 'active', 'src-account-summary': 'active', 'src-root-layout': 'active', 'src-dashboard-layout': 'active' },
      edges: ['e-loader-rsc', 'e-db-rsc']
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
      story: 'The runtime looks DashboardNav up in page_client-reference-manifest.js and writes { id, chunks: ["app/dashboard/layout-3c4d"], name: "default" } together with the props it received. The boundary is now a pointer to code that lives on the shelf.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'client-reference-manifest', 'browser-chunks'] },
      token: { at: 'client-reference-manifest', glyph: 'reference', label: 'ref → app/dashboard/layout-3c4d' },
      states: { 'rsc-runtime-entity': 'active', 'client-reference-manifest': 'current', 'browser-chunks': 'kept', 'src-dashboard-nav': 'replaced' }, edges: ['e-crm-rsc'],
      internals: ['{ id: "(app-pages-browser)/./components/DashboardNav.tsx", chunks: ["app/dashboard/layout-3c4d"], name: "default" }']
    },
    {
      id: 'j5-9', kind: 'explain', title: 'Structure and content, separately',
      story: 'Two things come out of the render. FlightRouterState is the shape of the route without any content, and it travels in both directions later. Segment slices carry the content: [segment, tree patch, rendered content, head] per segment, so each one can be streamed and, on navigation, replaced alone.',
      camera: { kind: 'entities', ids: ['flight', 'segment-slices', 'router-state-tree'] },
      states: { flight: 'active', 'segment-slices': 'new', 'router-state-tree': 'new', 'loader-tree': 'kept' }, edges: ['e-flight-slices']
    },
    {
      id: 'j5-10', kind: 'transform', title: 'The Flight payload',
      story: 'Serialization produces numbered rows: the tree, the three segments of content, two client references with props and one Suspense boundary. Rows are text with single-letter keys; binary data goes as base64 rows. It is compact because it is inlined into HTML and re-sent on every navigation.',
      camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'flight'] },
      token: { at: 'flight', glyph: 'flight', label: 'Flight rows 0:…6:' },
      states: { 'rsc-runtime-entity': 'kept', flight: 'current', 'segment-slices': 'kept' }, edges: ['e-rsc-flight'],
      internals: ['0: tree (FlightRouterState)', '1–3: segment slices for "", dashboard, settings', '4: $L ref DashboardNav', '5: $L ref ProfileForm', '6: Suspense boundary placeholder', 'Content-Type on navigation: text/x-component']
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
      story: 'SettingsPage has a slow part behind a Suspense boundary. The first HTML chunk leaves with the fallback in place. When the data resolves, a later chunk carries the content and a tiny script that swaps it in. The user does not wait for the slowest part to see the page.',
      camera: { kind: 'entities', ids: ['html', 'suspense-hole', 'dom'] },
      token: { at: 'html', glyph: 'html', label: 'chunk 1 (shell) · chunk 2 (late)' },
      states: { html: 'current', 'suspense-hole': 'new', dom: 'new' }, edges: ['e-html-dom', 'e-html-suspense']
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
        { label: 'Server and Client Components', url: 'https://nextjs.org/docs/app/getting-started/server-and-client-components' },
        { label: 'Streaming', url: 'https://nextjs.org/docs/app/guides/streaming' }
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
