import type { ComparePair } from '../types'
import { COMPARE_META } from './meta'

export const CACHES: ComparePair = {
  ...COMPARE_META.caches,
  lanes: [{ title: 'Server incremental cache', short: 'Server' }, { title: 'Browser Segment Cache', short: 'Browser' }],
  synchronized: 'populate → hit → invalidate',
  steps: [
    {
      id: 'c9-1', title: 'Where it lives',
      story: 'The two caches sit on opposite sides of the network line. One stores rendered routes for every visitor; the other stores segments for one tab.',
      lanes: [{ ref: { journey: 'caching', step: 4 } }, { ref: { journey: 'caching', step: 10 } }]
    },
    {
      id: 'c9-2', title: 'Populate',
      story: 'The server cache is filled by a render on a miss, or by the build. The Segment Cache is filled by prefetches and navigation responses.',
      lanes: [{ ref: { journey: 'caching', step: 8 } }, { ref: { journey: 'app-navigation', step: 4 } }]
    },
    {
      id: 'c9-3', title: 'Hit',
      story: 'A fresh server hit skips rendering. A full browser hit skips the network and the server entirely.',
      lanes: [{ ref: { journey: 'caching', step: 5 } }, { ref: { journey: 'app-navigation', step: 13 } }]
    },
    {
      id: 'c9-4', title: 'Stale',
      story: 'Both tolerate age. The server serves stale and regenerates behind; the browser keeps segments until their stale time, or until router.refresh().',
      lanes: [{ ref: { journey: 'caching', step: 7 } }, { ref: { journey: 'app-navigation', step: 15 } }]
    },
    {
      id: 'c9-5', title: 'Invalidate',
      story: 'One Server Action can reach both. updateTag expires the server entry now; the action response carries the rerendered route, which replaces the segments in the tab.',
      lanes: [
        { ref: { journey: 'caching', step: 18 } },
        {
          story: 'The action response includes the f payload, so the client router drops the stale segments and merges the fresh ones. Other tabs keep their copies and refetch on navigation.',
          camera: { kind: 'entities', ids: ['action-handler', 'flight', 'segment-cache', 'route-cache', 'app-router'] },
          token: { at: 'segment-cache', glyph: 'segment', label: 'segments replaced by f' },
          states: { 'action-handler': 'active', flight: 'active', 'segment-cache': 'invalid', 'route-cache': 'invalid', 'app-router': 'current' },
          edges: ['e-action-flight', 'e-flight-segment-cache', 'e-segment-cache-router']
        }
      ]
    },
    {
      id: 'c9-6', title: 'Shared by whom',
      story: 'The server cache is shared by every visitor of the instance, so it must hold only output that is the same for all of them. The Segment Cache belongs to one tab.',
      lanes: [
        {
          story: 'One entry per route key, read by every request that reaches this server.',
          camera: { kind: 'entities', ids: ['server-cache', 'next-cache-dir', 'html'] },
          token: { at: 'server-cache', glyph: 'cache', label: 'all visitors' },
          states: { 'server-cache': 'current', 'next-cache-dir': 'kept', html: 'active' }, edges: ['e-server-cache-dir', 'e-server-cache-html']
        },
        {
          story: 'Lives in tab memory and disappears with the tab. Another tab of the same user starts empty.',
          camera: { kind: 'entities', ids: ['segment-cache', 'route-cache', 'app-router'] },
          token: { at: 'segment-cache', glyph: 'cache', label: 'this tab only' },
          states: { 'segment-cache': 'current', 'route-cache': 'kept', 'app-router': 'active' }, edges: ['e-segment-cache-router', 'e-route-cache-router']
        }
      ]
    }
  ]
}
