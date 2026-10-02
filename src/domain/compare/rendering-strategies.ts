import type { ComparePair } from '../types'

export const RENDERING_STRATEGIES: ComparePair = {
  id: 'c8',
  slug: 'rendering-strategies',
  title: 'Static, ISR and PPR',
  lanes: [{ title: 'Static', short: 'Static' }, { title: 'ISR · revalidate', short: 'ISR' }, { title: 'PPR · shell + holes', short: 'PPR' }],
  synchronized: 'what leaves at build, what at request',
  steps: [
    {
      id: 'c8-1', title: 'The strategy',
      story: 'Three routes, three answers to one question: how much of the page can be decided before anyone asks for it?',
      ruler: [0, 0, 0],
      lanes: [{ ref: { journey: 'optimizations', step: 1 } }, { ref: { journey: 'optimizations', step: 2 } }, { ref: { journey: 'optimizations', step: 3 } }]
    },
    {
      id: 'c8-2', title: 'At build',
      story: 'Static and ISR routes are rendered whole at build. A PPR route is rendered until the first dynamic hole; the rest is postponed.',
      ruler: [0.1, 0.1, 0.1],
      lanes: [
        {
          story: 'The whole page is rendered once and written as HTML and RSC. It will never be rendered again on this deploy.',
          camera: { kind: 'entities', ids: ['prerender', 'prerendered-outputs', 'prerender-manifest'] },
          token: { at: 'prerendered-outputs', glyph: 'html', label: 'page.html · page.rsc' },
          states: { prerender: 'active', 'prerendered-outputs': 'new', 'prerender-manifest': 'new' }, edges: ['e-prerender-outputs']
        },
        {
          story: 'The page is rendered and written the same way, and prerender-manifest records its revalidate period.',
          camera: { kind: 'entities', ids: ['prerender', 'prerendered-outputs', 'prerender-manifest'] },
          token: { at: 'prerender-manifest', glyph: 'manifest', label: 'revalidate: 60' },
          states: { prerender: 'active', 'prerendered-outputs': 'new', 'prerender-manifest': 'current' }, edges: ['e-prerender-outputs', 'e-analysis-prerender-manifest']
        },
        { ref: { journey: 'caching', step: 13 } }
      ]
    },
    {
      id: 'c8-3', title: 'A request arrives',
      story: 'All three answer from stored output first. Static serves it as is; ISR checks its age; PPR sends the shell and keeps the connection open.',
      ruler: [0.15, 0.15, 0.15],
      lanes: [
        { ref: { journey: 'caching', step: 5 } },
        { ref: { journey: 'caching', step: 7 } },
        { ref: { journey: 'caching', step: 14 } }
      ]
    },
    {
      id: 'c8-4', title: 'Work at request time',
      story: 'Static does none. ISR may regenerate in the background after responding. PPR renders the postponed holes for this request and streams them in.',
      ruler: [0.15, 0.4, 0.6],
      lanes: [
        {
          story: 'No renderer runs. The response was finished at build time.',
          camera: { kind: 'entities', ids: ['server-cache', 'rsc-runtime-entity'] },
          states: { 'server-cache': 'kept', 'rsc-runtime-entity': 'na' }, edges: []
        },
        {
          story: 'If the entry was stale, a background render rebuilds it while the visitor already has the old page.',
          camera: { kind: 'entities', ids: ['isr-regeneration', 'server-cache', 'pages-renderer'] },
          token: { at: 'isr-regeneration', glyph: 'process', label: 'regenerating behind' },
          states: { 'isr-regeneration': 'current', 'server-cache': 'stale', 'pages-renderer': 'active' }, edges: ['e-pages-regen', 'e-regen-server-cache']
        },
        { ref: { journey: 'caching', step: 15 } }
      ]
    },
    {
      id: 'c8-5', title: 'The next visitor',
      story: 'Static sends the same bytes until the next deploy. ISR sends the regenerated page. PPR sends the same shell and renders the holes again.',
      ruler: [0.15, 0.15, 0.6],
      lanes: [
        {
          story: 'Same bytes as everyone else, straight from the stored output.',
          camera: { kind: 'entities', ids: ['server-cache', 'html'] },
          states: { 'server-cache': 'kept', html: 'current' }, edges: ['e-server-cache-html']
        },
        {
          story: 'The regenerated entry is fresh, so it is served without rendering until it ages again.',
          camera: { kind: 'entities', ids: ['server-cache', 'html'] },
          states: { 'server-cache': 'fresh', html: 'current' }, edges: ['e-server-cache-html']
        },
        {
          story: 'The shell comes from the cache again; the dynamic parts are rendered for this visitor and nobody else.',
          camera: { kind: 'entities', ids: ['ppr-shell', 'server-cache', 'rsc-runtime-entity', 'suspense-hole'] },
          token: { at: 'suspense-hole', glyph: 'flight', label: 'hole rendered per request' },
          states: { 'ppr-shell': 'kept', 'server-cache': 'kept', 'rsc-runtime-entity': 'active', 'suspense-hole': 'current' }, edges: ['e-ppr-server-cache', 'e-ppr-resume']
        }
      ]
    }
  ]
}
