import type { ComparePair } from '../types'
import { COMPARE_META } from './meta'

export const RUNTIMES: ComparePair = {
  ...COMPARE_META.runtimes,
  lanes: [{ title: 'RSC runtime · react-server', short: 'RSC' }, { title: 'SSR runtime · react-dom/server', short: 'SSR' }],
  synchronized: 'same Flight stream, different output',
  steps: [
    {
      id: 'c3-1', title: 'Two Reacts in one process',
      story: 'render-server loads two React builds for one App Router request. They are two runtimes in the same Node process, not two servers.',
      ruler: [0, 0],
      lanes: [
        {
          story: 'The react-server build runs Server Components. It has no useState, no effects and no DOM.',
          camera: { kind: 'region', id: 'rsc-runtime' },
          states: { 'rsc-runtime-entity': 'current' }, edges: []
        },
        {
          story: 'The ordinary react-dom/server build renders elements to HTML, including Client Components.',
          camera: { kind: 'region', id: 'ssr-runtime' },
          states: { 'ssr-runtime-entity': 'current' }, edges: []
        }
      ]
    },
    {
      id: 'c3-2', title: 'What each one can import',
      story: 'The difference was fixed at build time by layers. The same import "react" resolves to a different file in the rsc layer than in the ssr layer.',
      ruler: [0.05, 0.05],
      lanes: [
        { ref: { journey: 'app-initial', step: 2 }, story: 'Server Components were bundled into the rsc layer with the react-server condition on, so SettingsPage imports a React without hooks.' },
        {
          story: 'Client Components were bundled into the ssr layer too, with the full React, so DashboardNav can be rendered to HTML on the server.',
          camera: { kind: 'entities', ids: ['layers', 'bundler', 'src-dashboard-nav'] },
          states: { layers: 'current', bundler: 'kept', 'src-dashboard-nav': 'active', 'ssr-runtime-entity': 'active' }, edges: ['e-bundler-layers']
        }
      ]
    },
    {
      id: 'c3-3', title: 'Server Components',
      story: 'Only one runtime executes Server Components. The other never sees their code, only their output.',
      ruler: [0.2, 0.2],
      lanes: [
        { ref: { journey: 'app-initial', step: 6 } },
        {
          story: 'The SSR runtime does not run SettingsPage or AccountSummary. It waits for the Flight rows that already contain their result.',
          camera: { kind: 'entities', ids: ['ssr-runtime-entity', 'flight-tee'] },
          states: { 'ssr-runtime-entity': 'kept', 'flight-tee': 'kept', 'src-settings-page': 'na' }, edges: []
        }
      ]
    },
    {
      id: 'c3-4', title: 'A Client Component',
      story: 'At <DashboardNav /> the runtimes diverge most: one writes a pointer, the other renders the real component.',
      ruler: [0.3, 0.55],
      lanes: [
        { ref: { journey: 'app-initial', step: 8 } },
        { ref: { journey: 'app-initial', step: 12 }, story: 'Where the rows contain the DashboardNav reference, the SSR runtime loads the real module from the ssr layer and renders it, so the nav is in the HTML.' }
      ]
    },
    {
      id: 'c3-5', title: 'The same stream',
      story: 'The RSC runtime\'s output is the SSR runtime\'s input. The tee hands one copy to SSR and inlines the other into the HTML.',
      ruler: [0.4, 0.45],
      lanes: [{ ref: { journey: 'app-initial', step: 10 } }, { ref: { journey: 'app-initial', step: 11 } }]
    },
    {
      id: 'c3-6', title: 'Different output',
      story: 'The RSC runtime produces Flight, data that the browser can reconcile. The SSR runtime produces HTML, which the browser can paint.',
      ruler: [0.5, 0.6],
      lanes: [
        {
          story: 'Flight leaves through the tee as self.__next_f script chunks: the same rows, delivered inside the document.',
          camera: { kind: 'entities', ids: ['flight', 'flight-tee', 'next-f'] },
          token: { at: 'flight', glyph: 'flight', label: 'Flight rows' },
          states: { flight: 'current', 'flight-tee': 'active', 'next-f': 'new' }, edges: ['e-flight-tee', 'e-tee-nextf']
        },
        {
          story: 'HTML leaves as the document. The browser can paint it before any JavaScript runs.',
          camera: { kind: 'entities', ids: ['ssr-runtime-entity', 'html', 'dom'] },
          token: { at: 'html', glyph: 'html', label: 'HTML document' },
          states: { 'ssr-runtime-entity': 'active', html: 'current', dom: 'new' }, edges: ['e-ssr-html', 'e-html-dom']
        }
      ]
    },
    {
      id: 'c3-7', title: 'In the browser',
      story: 'Each output has its own reader. React rebuilds the element tree from Flight; the browser paints the HTML. Hydration joins them.',
      ruler: [0.8, 0.7],
      lanes: [{ ref: { journey: 'app-initial', step: 17 } }, { ref: { journey: 'app-initial', step: 16 } }]
    }
  ]
}
