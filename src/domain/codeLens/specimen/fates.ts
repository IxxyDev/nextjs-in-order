import type { Fate, HueFate, SpecimenLine } from '../../types'

/** docs/code-lens.md §3: four hues for where a line ends up, four gutter marks for when */
export const FATES: Fate[] = [
  { id: 'server-only', channel: 'hue', label: 'server-only', glyph: '⊘', chip: 'data', token: '--fate-server' },
  { id: 'client-boundary', channel: 'hue', label: 'client boundary', glyph: '⚡', chip: 'data + refs', token: '--fate-client', swatch: 'outline' },
  { id: 'split', channel: 'hue', label: 'split', glyph: '⚡', chip: 'code', token: '--fate-client', swatch: 'filled' },
  { id: 'action-id', channel: 'hue', label: 'action ID', glyph: '⇄', chip: 'ID only', token: '--fate-action' },
  { id: 'static-shell', channel: 'mark', label: 'static shell', glyph: '○', chip: 'prerendered' },
  { id: 'suspended', channel: 'mark', label: 'suspended', glyph: '⌛', chip: 'streamed later' },
  { id: 'cached', channel: 'mark', label: 'cached', glyph: '▤', chip: '"use cache"' },
  { id: 'shared-layout', channel: 'mark', label: 'shared layout', glyph: '🔒', chip: 'kept on navigation' }
]

/** the hue fates the specimen files give their lines, one per line */
export const SERVER_ONLY: HueFate = 'server-only', CLIENT_BOUNDARY: HueFate = 'client-boundary', SPLIT: HueFate = 'split', ACTION: HueFate = 'action-id'
/** `return (`, `)`, `}`: inherits its block's fate, never carries a chip */
export const frame = (id: string, text: string): SpecimenLine => ({ id, text, frame: true })
