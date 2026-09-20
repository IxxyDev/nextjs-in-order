// src/ui/Glyph.tsx
import type { ComponentChildren } from 'preact'
import type { EntityState, GlyphKind } from '../domain/types'

export interface GlyphProps { kind: GlyphKind; state?: EntityState; selected?: boolean; children?: ComponentChildren }

function Doc({ fold, hatched }: { fold: boolean; hatched: boolean }) {
  return (
    <>
      <path class="shape" d={fold ? 'M-20 -26 H10 L20 -16 V26 H-20 Z' : 'M-20 -26 H20 V26 H-20 Z'} />
      {fold && <path class="shape" d="M10 -26 V-16 H20" fill="none" />}
      {hatched && <rect class="hatch" x={-19} y={-25} width={38} height={8} />}
      <line x1={-12} y1={-6} x2={12} y2={-6} stroke="currentColor" opacity={0.5} />
      <line x1={-12} y1={4} x2={8} y2={4} stroke="currentColor" opacity={0.5} />
    </>
  )
}

function Stack({ dashed }: { dashed: boolean }) {
  return (
    <>
      <rect x={-22} y={-14} width={56} height={40} rx={6} class="shape" opacity={0.35} />
      <rect x={-26} y={-18} width={56} height={40} rx={6} class="shape" opacity={0.6} />
      <rect x={-30} y={-22} width={56} height={40} rx={6} class="shape" stroke-dasharray={dashed ? '6 4' : undefined} />
    </>
  )
}

export function GlyphShape({ kind }: { kind: GlyphKind }) {
  switch (kind) {
    case 'source-module': return <Doc fold hatched={false} />
    case 'transformed-module': return <Doc fold={false} hatched />
    case 'server-chunk': return <Stack dashed={false} />
    case 'browser-chunk': return <Stack dashed />
    case 'manifest': return (
      <>
        <rect x={-28} y={-22} width={56} height={44} rx={4} class="shape" />
        {[-10, 0, 10].map((y) => <g key={y}><circle cx={-19} cy={y} r={2.5} fill="currentColor" /><line x1={-12} y1={y} x2={20} y2={y} stroke="currentColor" opacity={0.6} /></g>)}
      </>
    )
    case 'reference': return <path class="shape" d="M-16 -8 H8 L18 0 L8 8 H-16 Z" />
    case 'request': return <path class="shape" d="M-32 -12 H20 L32 0 L20 12 H-32 Z" />
    case 'response': return <path class="shape" d="M32 -12 H-20 L-32 0 L-20 12 H32 Z" />
    case 'html': return (
      <>
        <rect x={-20} y={-26} width={40} height={52} rx={3} class="shape" />
        <text x={-14} y={-10} class="glyph-mark">{'<>'}</text>
        {[2, 10, 18].map((y) => <line key={y} x1={-14} y1={y} x2={14} y2={y} stroke="currentColor" opacity={0.5} />)}
      </>
    )
    case 'flight': return (
      <>
        <path class="shape" d="M-22 -32 H22 V26 L16 32 L10 26 L4 32 L-2 26 L-8 32 L-14 26 L-22 32 Z" />
        {[-20, -8, 4].map((y, i) => <text key={y} x={-17} y={y + 6} class="glyph-mark">{i}:</text>)}
      </>
    )
    case 'json': return (<><rect x={-20} y={-22} width={40} height={44} rx={4} class="shape" /><text x={-10} y={6} class="glyph-mark">{'{ }'}</text></>)
    case 'cache': return (
      <>
        <rect x={-30} y={-24} width={60} height={48} rx={5} class="shape" />
        <rect x={-10} y={-30} width={20} height={6} rx={3} class="shape" />
        {[-12, 0, 12].map((y) => <g key={y}><rect x={-24} y={y - 4} width={16} height={8} rx={2} fill="currentColor" opacity={0.35} /><line x1={-4} y1={y} x2={22} y2={y} stroke="currentColor" opacity={0.5} /></g>)}
      </>
    )
    case 'segment': return (
      <>
        <rect x={-32} y={-26} width={64} height={52} rx={8} class="shape" />
        <rect x={-24} y={-14} width={48} height={34} rx={6} class="shape" opacity={0.7} />
        <rect x={-16} y={-2} width={32} height={16} rx={4} class="shape" opacity={0.5} />
      </>
    )
    case 'component-server': return <rect x={-24} y={-16} width={48} height={32} rx={6} class="shape" />
    case 'component-client': return (<><rect x={-24} y={-16} width={48} height={32} rx={6} class="shape" /><text x={12} y={-4} class="glyph-mark">⚡</text></>)
    case 'action': return (<><rect x={-24} y={-16} width={48} height={32} rx={6} class="shape" /><text x={-8} y={6} class="glyph-mark">⇄</text></>)
    case 'process': return (<><rect x={-32} y={-24} width={64} height={48} rx={6} class="shape" /><rect x={-32} y={-24} width={28} height={12} rx={3} fill="currentColor" opacity={0.5} /></>)
    case 'watcher': return (<><path class="shape" d="M-28 0 Q0 -22 28 0 Q0 22 -28 0 Z" /><circle cx={0} cy={0} r={7} fill="currentColor" /></>)
    case 'machine': return (<><rect x={-32} y={-24} width={64} height={48} rx={10} class="shape" /><circle cx={0} cy={0} r={10} class="shape" /><circle cx={0} cy={0} r={4} fill="currentColor" /></>)
    case 'data-source': return (<><path class="shape" d="M-22 -18 A22 8 0 0 1 22 -18 V18 A22 8 0 0 1 -22 18 Z" /><ellipse cx={0} cy={-18} rx={22} ry={8} class="shape" /></>)
    case 'runtime': return (<><rect x={-36} y={-22} width={72} height={44} rx={8} class="shape" /><rect x={-36} y={-22} width={72} height={10} rx={4} fill="currentColor" opacity={0.4} /></>)
    case 'dom': return (<><rect x={-30} y={-24} width={60} height={48} rx={4} class="shape" /><rect x={-24} y={-14} width={20} height={12} fill="currentColor" opacity={0.4} /><rect x={0} y={-14} width={20} height={30} fill="currentColor" opacity={0.25} /><rect x={-24} y={2} width={20} height={14} fill="currentColor" opacity={0.25} /></>)
  }
}

export function Glyph({ kind, state, selected, children }: GlyphProps) {
  const cls = ['glyph', `glyph-${kind}`, kind === 'browser-chunk' ? 'glyph-browser' : '', state ? `state-${state}` : '', selected ? 'is-selected' : '']
  return <g class={cls.filter(Boolean).join(' ')}>{children}<GlyphShape kind={kind} /></g>
}
