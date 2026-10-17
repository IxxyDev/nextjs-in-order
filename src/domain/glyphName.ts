import type { GlyphKind } from './types'

/** what each glyph shape stands for (docs/visual-language.md §3), in the canvas legend; a Record, so a new kind cannot go unnamed */
export const GLYPH_NAME: Record<GlyphKind, string> = {
  'source-module': 'Source module', 'transformed-module': 'Transformed module', 'server-chunk': 'Server chunk', 'browser-chunk': 'Browser chunk',
  manifest: 'Manifest', reference: 'Reference', request: 'HTTP request', response: 'HTTP response', html: 'HTML', flight: 'Flight payload',
  json: 'JSON data', cache: 'Cache', segment: 'Route segment', 'component-server': 'Server Component', 'component-client': 'Client Component',
  action: 'Server Action', process: 'Process', watcher: 'Watcher', machine: 'Machine', 'data-source': 'Data source',
  runtime: 'Runtime', dom: 'DOM'
}
