import type { ComparePair } from '../types'
import { COMPARE_META } from './meta'

export const HYDRATION: ComparePair = {
  ...COMPARE_META.hydration,
  lanes: [{ title: 'Pages Router · full-tree hydration', short: 'Pages' }, { title: 'App Router · Client Components only', short: 'App' }],
  synchronized: 'light-up scope',
  steps: [
    {
      id: 'c5-1', title: 'Painted, not interactive',
      story: 'Both lanes start from painted HTML. The question is how much of it React has to run again to make it interactive.',
      ruler: [0.1, 0.1],
      lanes: [
        {
          story: 'The document is painted. The props wait in __NEXT_DATA__; no component has run in the tab.',
          camera: { kind: 'entities', ids: ['html', 'dom', 'next-data'] },
          token: { at: 'dom', glyph: 'dom', label: 'painted, not interactive' },
          states: { html: 'kept', dom: 'current', 'next-data': 'kept' }, edges: ['e-html-dom']
        },
        { ref: { journey: 'app-initial', step: 16 } }
      ]
    },
    {
      id: 'c5-2', title: 'The code hydration needs',
      story: 'Pages needs the code of every component on the page. App needs only the chunks named by client references.',
      ruler: [0.35, 0.3],
      lanes: [{ ref: { journey: 'pages-initial', step: 11 } }, { ref: { journey: 'app-initial', step: 18 } }]
    },
    {
      id: 'c5-3', title: 'Hydration',
      story: 'Pages hydrates from the root and runs every component again. App hydrates DashboardNav and ProfileForm; the rest stays as painted.',
      ruler: [0.7, 0.55],
      lanes: [{ ref: { journey: 'pages-initial', step: 12 } }, { ref: { journey: 'app-initial', step: 19 } }]
    },
    {
      id: 'c5-4', title: 'The light-up scope',
      story: 'Here is the scope side by side. In Pages the whole tree is browser code; in App the Server Component output is in the React tree as elements but never runs in the tab.',
      ruler: [0.75, 0.6],
      lanes: [
        {
          story: '_app, ThemeProvider, ProductPage and everything under it executed in the browser and own handlers and state.',
          camera: { kind: 'region', id: 'browser' },
          token: { at: 'pages-app', glyph: 'component-client', label: 'whole tree lit' },
          states: { 'pages-app': 'current', 'pages-product-page': 'current', 'react-client': 'active', dom: 'active', 'next-data': 'kept' }, edges: ['e-react-pages-app', 'e-pages-app-product']
        },
        {
          story: 'Only the islands executed. Layouts and AccountSummary are elements React reconciles around; their code never reached the tab.',
          camera: { kind: 'region', id: 'browser' },
          token: { at: 'client-components', glyph: 'component-client', label: 'two islands lit' },
          states: { 'client-components': 'current', 'react-client': 'active', dom: 'kept', 'next-f': 'kept' }, edges: ['e-react-client-components']
        }
      ]
    },
    {
      id: 'c5-5', title: 'When the renders disagree',
      story: 'A mismatch can only happen where code ran twice. In Pages that is anywhere on the page; in App only inside Client Components.',
      ruler: [0.8, 0.65],
      lanes: [
        { ref: { journey: 'pages-initial', step: 13 } },
        {
          story: 'Server Component output is not rendered again in the browser, so it cannot mismatch. Date.now() in DashboardNav still would.',
          camera: { kind: 'entities', ids: ['react-client', 'client-components', 'dom'] },
          token: { at: 'client-components', glyph: 'dom', label: 'server ≠ browser (islands only)' },
          states: { 'react-client': 'active', 'client-components': 'current', dom: 'kept' }, edges: ['e-react-client-components']
        }
      ]
    },
    {
      id: 'c5-6', title: 'After hydration',
      story: 'Pages hands the tab to next/router with a page and its props. App hands it to a client router holding a route tree it can patch.',
      ruler: [1, 0.8],
      lanes: [
        {
          story: 'next/router owns the tab. A navigation will swap the page under _app.',
          camera: { kind: 'entities', ids: ['pages-router', 'pages-app', 'pages-product-page'] },
          token: { at: 'pages-router', glyph: 'machine', label: 'next/router' },
          states: { 'pages-router': 'current', 'pages-app': 'kept', 'pages-product-page': 'kept' }, edges: ['e-pages-router-product']
        },
        { ref: { journey: 'app-initial', step: 20 } }
      ]
    }
  ]
}
