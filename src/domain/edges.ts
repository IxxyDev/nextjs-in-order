// src/domain/edges.ts
import type { Edge } from './types'

export const EDGES: Edge[] = [
  // build
  { id: 'e-src-swc', from: 'src-dashboard-nav', to: 'swc', kind: 'transform', label: 'compile' },
  { id: 'e-swc-bundler', from: 'swc', to: 'bundler', kind: 'data', label: 'transformed module' },
  { id: 'e-bundler-layers', from: 'bundler', to: 'layers', kind: 'control', label: 'assign layer' },
  { id: 'e-bundler-browser-chunks', from: 'bundler', to: 'browser-chunks', kind: 'transform', label: 'pack' },
  { id: 'e-bundler-server-chunks', from: 'bundler', to: 'server-chunks', kind: 'transform', label: 'pack' },
  { id: 'e-bundler-crm', from: 'bundler', to: 'client-reference-manifest', kind: 'transform', label: 'write references' },
  { id: 'e-route-analysis-prerender', from: 'route-analysis', to: 'prerender', kind: 'control', label: 'static routes' },
  { id: 'e-prerender-outputs', from: 'prerender', to: 'prerendered-outputs', kind: 'transform', label: 'html · rsc · shell' },
  { id: 'e-outputs-server-cache', from: 'prerendered-outputs', to: 'server-cache', kind: 'data', label: 'seed' },
  // request
  { id: 'e-http-ladder', from: 'node-http', to: 'routing-ladder', kind: 'control', label: 'request' },
  { id: 'e-custom-ladder', from: 'custom-server', to: 'routing-ladder', kind: 'control', label: 'handle()' },
  { id: 'e-manifest-ladder', from: 'routes-manifest', to: 'routing-ladder', kind: 'lookup', label: 'loaded at startup' },
  { id: 'e-ladder-proxy', from: 'routing-ladder', to: 'proxy', kind: 'control', label: 'step 3' },
  { id: 'e-ladder-exits', from: 'routing-ladder', to: 'early-exits', kind: 'control', label: 'step 5' },
  { id: 'e-ladder-loader', from: 'routing-ladder', to: 'loader-tree', kind: 'control', label: 'handoff' },
  { id: 'e-server-chunks-loader', from: 'server-chunks', to: 'loader-tree', kind: 'lookup', label: 'require' },
  { id: 'e-server-cache-html', from: 'server-cache', to: 'html', kind: 'data', label: 'cached HTML + RSC' },
  { id: 'e-loader-rsc', from: 'loader-tree', to: 'rsc-runtime-entity', kind: 'data', label: 'segments' },
  { id: 'e-db-rsc', from: 'db', to: 'rsc-runtime-entity', kind: 'data', label: 'data' },
  { id: 'e-crm-rsc', from: 'client-reference-manifest', to: 'rsc-runtime-entity', kind: 'lookup', label: 'ref lookup' },
  { id: 'e-rsc-flight', from: 'rsc-runtime-entity', to: 'flight', kind: 'transform', label: 'serialize' },
  { id: 'e-flight-tee', from: 'flight', to: 'flight-tee', kind: 'tee', label: 'tee' },
  { id: 'e-tee-ssr', from: 'flight-tee', to: 'ssr-runtime-entity', kind: 'data', label: 'copy 1' },
  { id: 'e-tee-nextf', from: 'flight-tee', to: 'next-f', kind: 'data', label: 'copy 2 · inline', crossing: 'data+refs' },
  { id: 'e-ssr-html', from: 'ssr-runtime-entity', to: 'html', kind: 'transform', label: 'render HTML' },
  { id: 'e-html-dom', from: 'html', to: 'dom', kind: 'data', label: 'document', crossing: 'data' },
  { id: 'e-chunks-client', from: 'browser-chunks', to: 'client-components', kind: 'data', label: 'script', crossing: 'code' },
  { id: 'e-nextf-react', from: 'next-f', to: 'react-client', kind: 'transform', label: 'reconstruct' },
  { id: 'e-react-client-components', from: 'react-client', to: 'client-components', kind: 'control', label: 'hydrate' },
  { id: 'e-react-router', from: 'react-client', to: 'app-router', kind: 'data', label: 'seed router state' },
  { id: 'e-router-tree', from: 'app-router', to: 'router-state-tree', kind: 'data', label: 'owns' },
  { id: 'e-tree-loader', from: 'router-state-tree', to: 'loader-tree', kind: 'data', label: 'Next-Router-State-Tree', crossing: 'data' },
  { id: 'e-flight-router-patch', from: 'flight', to: 'app-router', kind: 'data', label: 'Flight patch', crossing: 'data' },
  { id: 'e-scheduler-segment-cache', from: 'prefetch-scheduler', to: 'segment-cache', kind: 'control', label: 'fill' },
  { id: 'e-client-action', from: 'client-components', to: 'action-handler', kind: 'data', label: 'POST Next-Action', crossing: 'data' },
  { id: 'e-action-db', from: 'action-handler', to: 'db', kind: 'data', label: 'mutate' },
  { id: 'e-action-data-cache', from: 'action-handler', to: 'data-cache', kind: 'control', label: 'updateTag' },
  { id: 'e-loader-layout-router', from: 'loader-tree', to: 'layout-router', kind: 'control', label: 'wraps each child' },
  { id: 'e-flight-slices', from: 'flight', to: 'segment-slices', kind: 'data', label: 'sliced per segment' },
  { id: 'e-html-suspense', from: 'html', to: 'suspense-hole', kind: 'data', label: 'late chunk', crossing: 'data' },
  { id: 'e-suspense-client', from: 'suspense-hole', to: 'react-client', kind: 'control', label: 'selective hydration' },
  // dev
  { id: 'e-dev-parent-child', from: 'dev-parent', to: 'dev-child', kind: 'supervision', label: 'restart on config change' },
  { id: 'e-dev-child-bundler', from: 'dev-child', to: 'bundler', kind: 'dev', label: 'embedded' },
  { id: 'e-dev-watcher-ladder', from: 'dev-watcher', to: 'routing-ladder', kind: 'dev', label: 'live route map' },
  { id: 'e-dev-hmr-refresh', from: 'dev-hmr', to: 'dev-fast-refresh', kind: 'dev', label: 'client change' },
  { id: 'e-dev-hmr-router', from: 'dev-hmr', to: 'app-router', kind: 'dev', label: 'server change → hmrRefresh()', crossing: 'data' },

  // ---------- Navigation (J6) ----------
  { id: 'e-client-scheduler', from: 'client-components', to: 'prefetch-scheduler', kind: 'control', label: '<Link> in viewport / hover' },
  { id: 'e-scheduler-ladder', from: 'prefetch-scheduler', to: 'routing-ladder', kind: 'data', label: 'GET + RSC: 1 + Next-Router-Prefetch: 1', crossing: 'data' },
  { id: 'e-scheduler-route-cache', from: 'prefetch-scheduler', to: 'route-cache', kind: 'control', label: '/_tree response' },
  { id: 'e-router-ladder', from: 'app-router', to: 'routing-ladder', kind: 'data', label: 'GET + RSC: 1 + Next-Router-State-Tree', crossing: 'data' },
  { id: 'e-route-cache-router', from: 'route-cache', to: 'app-router', kind: 'data', label: 'tree on click' },
  { id: 'e-segment-cache-router', from: 'segment-cache', to: 'app-router', kind: 'data', label: 'cached segments' },
  { id: 'e-flight-segment-cache', from: 'flight', to: 'segment-cache', kind: 'data', label: 'prefetched segments', crossing: 'data' },

  // ---------- Server Actions (J7) ----------
  { id: 'e-actions-swc', from: 'src-actions', to: 'swc', kind: 'transform', label: '"use server"' },
  { id: 'e-bundler-srm', from: 'bundler', to: 'server-reference-manifest', kind: 'transform', label: 'action IDs' },
  { id: 'e-form-swc', from: 'src-profile-form', to: 'swc', kind: 'transform', label: 'import → reference' },
  { id: 'e-ladder-action', from: 'routing-ladder', to: 'action-handler', kind: 'control', label: 'POST + Next-Action' },
  { id: 'e-srm-action', from: 'server-reference-manifest', to: 'action-handler', kind: 'lookup', label: 'ID → module' },
  { id: 'e-action-rsc', from: 'action-handler', to: 'rsc-runtime-entity', kind: 'control', label: 're-render if invalidated' },
  { id: 'e-action-flight', from: 'action-handler', to: 'flight', kind: 'transform', label: 'a + f' },
  { id: 'e-data-cache-rsc', from: 'data-cache', to: 'rsc-runtime-entity', kind: 'data', label: 'cache reads' },
  { id: 'e-action-server-cache', from: 'action-handler', to: 'server-cache', kind: 'control', label: 'updateTag / revalidatePath' }
]

const byId = new Map(EDGES.map((e) => [e.id, e]))

export function edgeById(id: string): Edge {
  const e = byId.get(id)
  if (!e) throw new Error(`unknown edge ${id}`)
  return e
}
