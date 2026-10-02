import type { ComparePair } from '../types'

export const BUNDLERS: ComparePair = {
  id: 'c6',
  slug: 'bundlers',
  title: 'Bundlers: Webpack vs Turbopack',
  lanes: [{ title: 'Webpack · --webpack · three compilers stitched', short: 'Webpack' }, { title: 'Turbopack · default since 16 · one unified graph', short: 'Turbopack' }],
  synchronized: 'same source, target layers',
  steps: [
    {
      id: 'c6-1', title: 'The same source',
      story: 'Both bundlers start from the same files and the same compiler step. SWC transforms one file at a time; the bundler decides where it goes.',
      lanes: [
        { ref: { journey: 'production-build', step: 3 }, story: 'With Webpack, SWC runs through a loader. A Babel config switches user code to Babel and disables SWC transforms.' },
        { ref: { journey: 'production-build', step: 3 }, story: 'Turbopack embeds SWC. A Babel config enables Babel for user code, while SWC still does Next\'s internal transforms.' }
      ]
    },
    {
      id: 'c6-2', title: 'One graph or three',
      story: 'This is the core difference. Webpack builds the same source three times, once per target, and stitches the results. Turbopack keeps every target in one graph.',
      lanes: [
        {
          story: 'Three compilers run: client, server (Node) and edge. Their outputs are joined afterwards through manifests that the plugins write.',
          camera: { kind: 'entities', ids: ['swc', 'bundler', 'layers', 'flight-client-entry-plugin'] },
          token: { at: 'bundler', glyph: 'machine', label: 'client · server · edge compilers' },
          states: { bundler: 'current', swc: 'kept', layers: 'active', 'flight-client-entry-plugin': 'active' }, edges: ['e-swc-bundler', 'e-bundler-layers', 'e-bundler-client-entry']
        },
        {
          story: 'One graph holds client, server and edge modules at once. turbo-tasks memoizes each function call, and a change recomputes only the affected subgraph.',
          camera: { kind: 'entities', ids: ['swc', 'bundler', 'layers'] },
          token: { at: 'bundler', glyph: 'machine', label: 'one graph · all targets' },
          states: { bundler: 'current', swc: 'kept', layers: 'active' }, edges: ['e-swc-bundler', 'e-bundler-layers']
        }
      ]
    },
    {
      id: 'c6-3', title: 'Target layers',
      story: 'Both label every module with a layer: rsc, ssr, app-pages-browser. Only in rsc is the react-server condition on.',
      lanes: [
        { ref: { journey: 'production-build', step: 8 }, story: 'In Webpack a layer is a property of a module inside one compiler; the rsc and ssr layers live in the server compiler, the browser layer in the client compiler.' },
        { ref: { journey: 'production-build', step: 8 }, story: 'In Turbopack a layer is a transition inside the one graph: crossing "use client" moves the import to another layer without leaving the graph.' }
      ]
    },
    {
      id: 'c6-4', title: 'At the client boundary',
      story: 'Where a Server Component imports a "use client" module, a browser entry and a client reference are needed. Webpack does this with plugins between compilers; Turbopack does it inside the graph.',
      lanes: [
        {
          story: 'flight-client-entry-plugin injects browser entries into the client compiler; splitChunks groups them; flight-manifest-plugin writes the client-reference manifest.',
          camera: { kind: 'entities', ids: ['flight-client-entry-plugin', 'split-chunks', 'flight-manifest-plugin', 'client-reference-manifest'] },
          token: { at: 'flight-client-entry-plugin', glyph: 'browser-chunk', label: 'entry for ProfileForm' },
          states: { bundler: 'kept', 'flight-client-entry-plugin': 'current', 'split-chunks': 'active', 'flight-manifest-plugin': 'active', 'client-reference-manifest': 'new', 'src-profile-form': 'active' },
          edges: ['e-bundler-client-entry', 'e-client-entry-split', 'e-split-flight-manifest', 'e-flight-manifest-crm']
        },
        {
          story: 'The graph follows the import into the browser layer itself and emits the chunk and the manifest entry directly. There is no plugin hand-off.',
          camera: { kind: 'entities', ids: ['bundler', 'browser-chunks', 'client-reference-manifest', 'src-profile-form'] },
          token: { at: 'bundler', glyph: 'browser-chunk', label: 'ProfileForm → browser layer' },
          states: { bundler: 'current', 'browser-chunks': 'new', 'client-reference-manifest': 'new', 'src-profile-form': 'active' },
          edges: ['e-bundler-browser-chunks', 'e-bundler-crm']
        }
      ]
    },
    {
      id: 'c6-5', title: 'The same output',
      story: 'Both write the same kinds of artifacts in the same formats, so the server at request time never knows which bundler ran.',
      lanes: [
        {
          story: 'Chunks come out of three compilers; manifests are written by the plugins that saw each compiler.',
          camera: { kind: 'region', id: 'artifacts' },
          states: { 'browser-chunks': 'new', 'server-chunks': 'new', 'client-reference-manifest': 'new', 'build-manifest': 'new', 'split-chunks': 'active' },
          edges: ['e-split-browser-chunks', 'e-bundler-server-chunks', 'e-flight-manifest-crm']
        },
        {
          story: 'Chunks and manifests come out of one graph, with the same names and shapes.',
          camera: { kind: 'region', id: 'artifacts' },
          states: { 'browser-chunks': 'new', 'server-chunks': 'new', 'client-reference-manifest': 'new', 'build-manifest': 'new', bundler: 'active' },
          edges: ['e-bundler-browser-chunks', 'e-bundler-server-chunks', 'e-bundler-crm']
        }
      ]
    },
    {
      id: 'c6-6', title: 'Between runs',
      story: 'Both keep a cache in .next/cache. Turbopack\'s persistent cache is on by default for dev and build since 16.3.',
      lanes: [
        {
          story: 'Webpack\'s filesystem cache stores module results between builds.',
          camera: { kind: 'entities', ids: ['bundler', 'next-cache-dir'] },
          states: { bundler: 'active', 'next-cache-dir': 'kept' }, edges: ['e-bundler-cache-dir']
        },
        {
          story: 'Turbopack persists its task graph results, so a later run recomputes only what changed since the last one.',
          camera: { kind: 'entities', ids: ['bundler', 'next-cache-dir'] },
          states: { bundler: 'active', 'next-cache-dir': 'current' }, edges: ['e-bundler-cache-dir']
        }
      ]
    },
    {
      id: 'c6-7', title: 'In development',
      story: 'The graph model shows most in next dev. Webpack keeps on-demand entries and evicts idle ones; Turbopack computes only requested tasks and has nothing to evict.',
      lanes: [{ ref: { journey: 'dev-mode', step: 5 } }, { ref: { journey: 'dev-mode', step: 6 } }]
    }
  ]
}
