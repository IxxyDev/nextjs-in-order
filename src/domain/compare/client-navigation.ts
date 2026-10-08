import type { ComparePair } from '../types'
import { COMPARE_META } from './meta'

export const CLIENT_NAVIGATION: ComparePair = {
  ...COMPARE_META.clientNavigation,
  lanes: [{ title: 'Pages Router · /products/42 → /posts/7', short: 'Pages' }, { title: 'App Router · settings → billing', short: 'App' }],
  synchronized: 'prefetch → request → payload → merge',
  steps: [
    {
      id: 'c2-1', title: 'A link comes into view',
      story: 'Both routers prefetch links in the viewport. Pages fetches the page chunk, plus the JSON for a static target. App schedules a prefetch task for the route.',
      ruler: [0.05, 0.05],
      lanes: [{ ref: { journey: 'pages-navigation', step: 1 } }, { ref: { journey: 'app-navigation', step: 1 } }]
    },
    {
      id: 'c2-2', title: 'Prefetch',
      story: 'Pages prefetches whole-page artifacts: code and props. App prefetches the route tree first, then segments, and keeps them in two client caches.',
      ruler: [0.15, 0.15],
      lanes: [{ ref: { journey: 'pages-navigation', step: 2 } }, { ref: { journey: 'app-navigation', step: 3 } }]
    },
    {
      id: 'c2-3', title: 'What is fetched ahead',
      story: 'Pages needs the code of the target page. App asks only for the segments it does not hold yet; the shared dashboard layout is already in the Segment Cache.',
      ruler: [0.25, 0.25],
      lanes: [{ ref: { journey: 'pages-navigation', step: 7 } }, { ref: { journey: 'app-navigation', step: 4 } }]
    },
    {
      id: 'c2-4', title: 'Click',
      story: 'The click becomes a client navigation in both lanes. No document is requested.',
      ruler: [0.35, 0.35],
      lanes: [
        {
          story: 'The click hands /posts/7 to next/router. The chunk and the JSON were prefetched, so they may already be in memory.',
          camera: { kind: 'entities', ids: ['pages-router', 'pages-product-page', 'pages-prefetch'] },
          token: { at: 'pages-router', glyph: 'request', label: 'click → /posts/7' },
          states: { 'pages-router': 'current', 'pages-product-page': 'active', 'pages-prefetch': 'kept' }, edges: []
        },
        { ref: { journey: 'app-navigation', step: 6 } }
      ]
    },
    {
      id: 'c2-5', title: 'What the server does',
      story: 'For a static Pages target the server only reads stored JSON. App renders on the server, but only the segment that differs: BillingPage.',
      ruler: [0.5, 0.5],
      lanes: [{ ref: { journey: 'pages-navigation', step: 5 } }, { ref: { journey: 'app-navigation', step: 9 } }]
    },
    {
      id: 'c2-6', title: 'The payload',
      story: 'Pages receives props as JSON and renders the page from its own code. App receives a Flight patch: rendered output for the subtree below the shared layout.',
      ruler: [0.65, 0.65],
      lanes: [
        {
          story: 'The answer is { pageProps } for /posts/7 as JSON. The browser has to render the page itself from the chunk it loaded.',
          camera: { kind: 'entities', ids: ['pages-data-endpoint', 'pages-router', 'server-cache'] },
          token: { at: 'pages-data-endpoint', glyph: 'json', label: 'posts/7.json → { pageProps }' },
          states: { 'pages-data-endpoint': 'current', 'pages-router': 'active', 'server-cache': 'kept' }, edges: ['e-server-cache-endpoint', 'e-endpoint-router']
        },
        { ref: { journey: 'app-navigation', step: 10 } }
      ]
    },
    {
      id: 'c2-7', title: 'Merge',
      story: 'Pages swaps the page component under _app; everything below _app is replaced. App merges the patch at one LayoutRouter; the layouts above it keep their React nodes and state.',
      ruler: [0.85, 0.85],
      lanes: [{ ref: { journey: 'pages-navigation', step: 8 } }, { ref: { journey: 'app-navigation', step: 11 } }]
    },
    {
      id: 'c2-8', title: 'History',
      story: 'Both push the URL onto browser history. Back replays the mechanism of each lane: Pages fetches data and swaps again, App reads the cached tree and segments.',
      ruler: [1, 1],
      lanes: [{ ref: { journey: 'pages-navigation', step: 9 } }, { ref: { journey: 'app-navigation', step: 12 } }]
    }
  ]
}
