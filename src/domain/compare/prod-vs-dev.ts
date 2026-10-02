import type { ComparePair } from '../types'

export const PROD_VS_DEV: ComparePair = {
  id: 'c7',
  slug: 'prod-vs-dev',
  title: 'next start vs next dev',
  lanes: [{ title: 'next start · production', short: 'start' }, { title: 'next dev · development', short: 'dev' }],
  synchronized: 'manifests vs watcher, chunks vs on-demand, prefetch, caching, Strict Mode',
  steps: [
    {
      id: 'c7-1', title: 'Processes',
      story: 'next start serves a finished .next folder from one server process. next dev runs a supervisor and a child that holds the server and the bundler.',
      lanes: [
        {
          story: 'One Node process opens the HTTP server and reads the build output. Nothing is compiled from here on.',
          camera: { kind: 'entities', ids: ['node-http', 'routing-ladder', 'server-chunks'] },
          states: { 'node-http': 'current', 'routing-ladder': 'active', 'server-chunks': 'kept' }, edges: ['e-http-ladder']
        },
        { ref: { journey: 'dev-mode', step: 1 } }
      ]
    },
    {
      id: 'c7-2', title: 'The route map',
      story: 'Production routes from manifests written once by the build. Dev routes from a map the file watcher keeps live.',
      lanes: [
        {
          story: 'routes-manifest.json fixes every route, rewrite and redirect at build time. Adding a file needs a new build.',
          camera: { kind: 'entities', ids: ['routes-manifest', 'routing-ladder', 'pages-manifest'] },
          token: { at: 'routes-manifest', glyph: 'manifest', label: 'routes-manifest.json' },
          states: { 'routes-manifest': 'current', 'routing-ladder': 'active', 'pages-manifest': 'kept' }, edges: ['e-manifest-ladder']
        },
        { ref: { journey: 'dev-mode', step: 3 } }
      ]
    },
    {
      id: 'c7-3', title: 'Code for a route',
      story: 'In production every route is already a chunk on disk. In dev a route is compiled the first time it is asked for.',
      lanes: [
        {
          story: 'The loader tree points at compiled server chunks. Loading them is a require, not a compile.',
          camera: { kind: 'entities', ids: ['server-chunks', 'loader-tree'] },
          token: { at: 'server-chunks', glyph: 'server-chunk', label: '.next/server/app/dashboard/…' },
          states: { 'server-chunks': 'current', 'loader-tree': 'active' }, edges: ['e-server-chunks-loader']
        },
        { ref: { journey: 'dev-mode', step: 4 } }
      ]
    },
    {
      id: 'c7-4', title: 'Prefetch',
      story: 'Production prefetches links in the viewport. Dev turns viewport prefetch off; only hover prefetches, so navigation timings differ.',
      lanes: [
        { ref: { journey: 'app-navigation', step: 3 } },
        {
          story: 'A link scrolling into view fetches nothing. Hovering still does. Each first visit to a route waits for its compile.',
          camera: { kind: 'entities', ids: ['client-components', 'prefetch-scheduler', 'segment-cache'] },
          states: { 'client-components': 'active', 'prefetch-scheduler': 'na', 'segment-cache': 'na' }, edges: []
        }
      ]
    },
    {
      id: 'c7-5', title: 'Caching',
      story: 'Production serves a fresh prerendered route without rendering. Dev renders on every request so edits show up; caching is mostly off.',
      lanes: [
        { ref: { journey: 'caching', step: 5 } },
        {
          story: 'The request reaches the RSC runtime every time. The prerendered entry a production server would serve does not exist.',
          camera: { kind: 'entities', ids: ['rsc-runtime-entity', 'server-cache', 'db'] },
          token: { at: 'rsc-runtime-entity', glyph: 'component-server', label: 'rendered on every request' },
          states: { 'rsc-runtime-entity': 'current', db: 'active', 'server-cache': 'na' }, edges: ['e-loader-rsc', 'e-db-rsc']
        }
      ]
    },
    {
      id: 'c7-6', title: 'An edit',
      story: 'A source change means nothing to a running production server. In dev the watcher notices it and HMR delivers it to the tab.',
      lanes: [
        {
          story: 'Nothing watches the source. The change ships only with the next build and deploy.',
          camera: { kind: 'entities', ids: ['src-dashboard-nav', 'next-build'] },
          states: { 'src-dashboard-nav': 'active', 'next-build': 'kept' }, edges: []
        },
        { ref: { journey: 'dev-mode', step: 9 } }
      ]
    },
    {
      id: 'c7-7', title: 'Strict Mode',
      story: 'With Strict Mode on, React renders components twice and runs effects twice in development only, to surface impure code.',
      lanes: [
        {
          story: 'Production React renders each Client Component once per update and runs its effects once.',
          camera: { kind: 'entities', ids: ['react-client', 'client-components'] },
          token: { at: 'client-components', glyph: 'component-client', label: 'one render' },
          states: { 'react-client': 'active', 'client-components': 'current' }, edges: ['e-react-client-components']
        },
        {
          story: 'Development React renders each Client Component twice and mounts, unmounts and remounts effects. The page is slower and logs appear twice.',
          camera: { kind: 'entities', ids: ['react-client', 'client-components', 'dev-hmr-client'] },
          token: { at: 'client-components', glyph: 'component-client', label: 'render × 2 · effects × 2' },
          states: { 'react-client': 'active', 'client-components': 'current', 'dev-hmr-client': 'kept' }, edges: ['e-react-client-components']
        }
      ]
    },
    {
      id: 'c7-8', title: 'What the numbers mean',
      story: 'Timings, bundle sizes and request counts from next dev describe dev. Measure performance on next build + next start.',
      lanes: [
        {
          story: 'Minified chunks, production React, prefetch and caches on: this is what users get.',
          camera: { kind: 'world' },
          states: { 'browser-chunks': 'active', 'server-cache': 'active', 'segment-cache': 'active', 'routes-manifest': 'active' }, edges: []
        },
        { ref: { journey: 'dev-mode', step: 18 } }
      ]
    }
  ]
}
