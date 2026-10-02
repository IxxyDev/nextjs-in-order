import type { ComparePair } from '../types'

export const RESPONSES: ComparePair = {
  id: 'c4',
  slug: 'responses',
  title: 'Initial response vs navigation response',
  lanes: [{ title: 'Initial response · HTML + inline Flight', short: 'Initial' }, { title: 'Navigation response · Flight patch only', short: 'Nav' }],
  synchronized: 'byte-level rows shown side by side',
  steps: [
    {
      id: 'c4-1', title: 'Who asks',
      story: 'The same renderer answers both requests. The request headers decide whether it returns a document or only Flight.',
      ruler: [0, 0],
      lanes: [
        {
          story: 'The browser asks for a document. Nothing in the request says it has a router or a tree.',
          rows: ['GET /dashboard/settings', 'Accept: text/html'],
          camera: { kind: 'entities', ids: ['node-http', 'routing-ladder', 'loader-tree'] },
          token: { at: 'routing-ladder', glyph: 'request', label: 'GET /dashboard/settings' },
          states: { 'node-http': 'active', 'routing-ladder': 'current', 'loader-tree': 'active' }, edges: ['e-http-ladder', 'e-ladder-loader']
        },
        { ref: { journey: 'app-navigation', step: 6 }, rows: ['GET /dashboard/billing?_rsc=…', 'RSC: 1', 'Next-Router-State-Tree: <FlightRouterState>', 'Next-Url: /dashboard/settings'] }
      ]
    },
    {
      id: 'c4-2', title: 'What renders',
      story: 'The initial request renders every segment. The navigation request compares the client\'s tree with the target and renders only below the divergence.',
      ruler: [0.2, 0.15],
      lanes: [{ ref: { journey: 'app-initial', step: 6 } }, { ref: { journey: 'app-navigation', step: 9 } }]
    },
    {
      id: 'c4-3', title: 'The rows',
      story: 'Both bodies are Flight rows with the same format. The initial payload starts at the root; the patch starts at the billing segment.',
      ruler: [0.35, 0.3],
      lanes: [
        { ref: { journey: 'app-initial', step: 10 }, rows: ['1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]', '2:I[…,["static/chunks/app/dashboard/settings/page-5e6f.js"],"default"]', '0:{"b":"<buildId>","f":[["",{…},…]]}  ← from the root'] },
        { ref: { journey: 'app-navigation', step: 10 }, rows: ['0:{"b":"<buildId>","f":[["dashboard","billing",…]]}  ← from the divergent segment', 'no rows for the root or dashboard layouts'] }
      ]
    },
    {
      id: 'c4-4', title: 'The envelope',
      story: 'The initial response wraps Flight in HTML as script chunks. The navigation response is Flight alone.',
      ruler: [0.5, 0.4],
      lanes: [
        { ref: { journey: 'app-initial', step: 13 }, rows: ['Content-Type: text/html', '<!DOCTYPE html><html>…painted markup…', '<script>self.__next_f.push([1,"0:{…}"])</script>'] },
        {
          story: 'The body is the patch itself. There is no HTML, no shell and no inline script.',
          rows: ['Content-Type: text/x-component', '0:{…}'],
          camera: { kind: 'entities', ids: ['flight', 'app-router'] },
          token: { at: 'flight', glyph: 'flight', label: 'text/x-component' },
          states: { flight: 'current', 'app-router': 'active' }, edges: ['e-flight-router-patch']
        }
      ]
    },
    {
      id: 'c4-5', title: 'Who reads it',
      story: 'In the initial lane the client runtime rebuilds the stream from __next_f. In the navigation lane the client router merges the patch into the tree it holds.',
      ruler: [0.75, 0.6],
      lanes: [{ ref: { journey: 'app-initial', step: 17 } }, { ref: { journey: 'app-navigation', step: 11 } }]
    },
    {
      id: 'c4-6', title: 'Where it ends up',
      story: 'The initial response ends in a hydrated document. The navigation response ends in one replaced segment and a new history entry.',
      ruler: [1, 0.8],
      lanes: [{ ref: { journey: 'app-initial', step: 19 } }, { ref: { journey: 'app-navigation', step: 12 } }]
    }
  ]
}
