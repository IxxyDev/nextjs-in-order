import type { ComparePair } from '../types'

export const INITIAL_LOAD: ComparePair = {
  id: 'c1',
  slug: 'initial-load',
  title: 'Initial load: Pages vs App',
  lanes: [{ title: 'Pages Router · /products/42', short: 'Pages' }, { title: 'App Router · /dashboard/settings', short: 'App' }],
  synchronized: 'request → response → paint → hydrate',
  steps: [
    {
      id: 'c1-1', title: 'The request is matched',
      story: 'Both requests climb the same routing ladder. Pages lands on a page module from the pages manifest; App lands on a loader tree that describes every segment of the route.',
      ruler: [0.05, 0.05],
      lanes: [{ ref: { journey: 'pages-initial', step: 2 } }, { ref: { journey: 'app-initial', step: 3 } }]
    },
    {
      id: 'c1-2', title: 'Data is fetched on the server',
      story: 'Pages runs one data function for the whole page before anything renders. App runs Server Components, and each one fetches what it needs while rendering.',
      ruler: [0.2, 0.2],
      lanes: [{ ref: { journey: 'pages-initial', step: 3 } }, { ref: { journey: 'app-initial', step: 6 } }]
    },
    {
      id: 'c1-3', title: 'What the renderer produces',
      story: 'Pages renders the whole tree straight to HTML. App first produces Flight, a description of the tree with references where Client Components go; HTML comes from Flight in a second runtime.',
      ruler: [0.45, 0.3],
      lanes: [{ ref: { journey: 'pages-initial', step: 7 } }, { ref: { journey: 'app-initial', step: 10 } }]
    },
    {
      id: 'c1-4', title: 'The first bytes leave',
      story: 'Pages can only start the document once getServerSideProps has finished and the tree is rendered. App streams: what is ready leaves first, and a Suspense boundary like billing\'s fills in later. Settings, a ○ route, goes further: its document was rendered at build.',
      ruler: [0.55, 0.35],
      lanes: [{ ref: { journey: 'pages-initial', step: 8 } }, { ref: { journey: 'app-initial', step: 14 } }]
    },
    {
      id: 'c1-5', title: 'What crosses the network',
      story: 'Both send HTML with the hydration data inside it. Pages then sends every component of the page as code; App sends code only for the Client Components.',
      ruler: [0.65, 0.5],
      lanes: [{ ref: { journey: 'pages-initial', step: 11 } }, { ref: { journey: 'app-initial', step: 15 } }]
    },
    {
      id: 'c1-6', title: 'Paint',
      story: 'In both lanes the browser paints the HTML before React runs. Nothing responds to clicks yet.',
      ruler: [0.7, 0.55],
      lanes: [
        {
          story: 'The browser paints the document as it arrives. __NEXT_DATA__ waits in a script tag; no component has run in the tab yet.',
          camera: { kind: 'entities', ids: ['html', 'dom', 'next-data'] },
          token: { at: 'dom', glyph: 'dom', label: 'painted, not interactive' },
          states: { html: 'kept', dom: 'current', 'next-data': 'kept' }, edges: ['e-html-dom']
        },
        { ref: { journey: 'app-initial', step: 16 } }
      ]
    },
    {
      id: 'c1-7', title: 'Hydration',
      story: 'Pages hydrates from the root: _app and the whole page run again in the browser. App hydrates only the Client Components; the Server Component output stays as painted.',
      ruler: [0.9, 0.75],
      lanes: [{ ref: { journey: 'pages-initial', step: 12 } }, { ref: { journey: 'app-initial', step: 19 } }]
    },
    {
      id: 'c1-8', title: 'Who owns the page now',
      story: 'Pages hands the tab to next/router, which knows pages and their props. App seeds the client router with a route tree shaped like the server\'s loader tree, ready to be patched segment by segment.',
      ruler: [1, 0.85],
      lanes: [
        {
          story: 'next/router now owns the tab. It knows the current page, its props and the build manifest; the next navigation swaps the page component under _app.',
          camera: { kind: 'entities', ids: ['pages-router', 'pages-app', 'pages-product-page'] },
          token: { at: 'pages-router', glyph: 'machine', label: 'next/router · /products/42' },
          states: { 'pages-router': 'current', 'pages-app': 'kept', 'pages-product-page': 'kept', 'react-client': 'active' }, edges: ['e-pages-router-product']
        },
        { ref: { journey: 'app-initial', step: 20 } }
      ]
    }
  ]
}
