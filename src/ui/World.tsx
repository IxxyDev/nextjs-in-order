// src/ui/World.tsx
import { useEffect, useRef } from 'preact/hooks'
import type { EntityState, TokenState } from '../domain/types'
import { REGIONS, BANDS, WORLD } from '../domain/regions'
import { ENTITIES, entityById } from '../domain/entities'
import { EDGES } from '../domain/edges'
import { camera, viewport, transformFor } from './camera'
import { Glyph } from './Glyph'
import { reducedMotion } from './useReducedMotion'

export interface WorldProps {
  entityStates: Record<string, EntityState>
  activeEdges: ReadonlySet<string>
  token?: TokenState
  selected?: string
  onSelect: (id: string) => void
}

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = to.x - from.x, dy = to.y - from.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    const c = Math.max(60, Math.abs(dx) / 2)
    return `M${from.x} ${from.y} C${from.x + Math.sign(dx || 1) * c} ${from.y} ${to.x - Math.sign(dx || 1) * c} ${to.y} ${to.x} ${to.y}`
  }
  const c = Math.max(60, Math.abs(dy) / 2)
  return `M${from.x} ${from.y} C${from.x} ${from.y + Math.sign(dy) * c} ${to.x} ${to.y - Math.sign(dy) * c} ${to.x} ${to.y}`
}

export function World({ entityStates, activeEdges, token, selected, onSelect }: WorldProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(([entry]) => { viewport.value = { w: entry.contentRect.width, h: entry.contentRect.height } })
    ro.observe(el)
    viewport.value = { w: el.clientWidth, h: el.clientHeight }
    return () => ro.disconnect()
  }, [])
  const cam = camera.value
  const vp = viewport.value
  const tokenEntity = token ? entityById(token.at) : undefined
  /** a step that lists states focuses the scene: unrelated edges are hidden */
  const focused = Object.keys(entityStates).length > 0
  return (
    <div class="canvas-wrap" ref={ref}>
      <svg class="world" role="img" aria-label="System map of Next.js" viewBox={`0 0 ${vp.w} ${vp.h}`}>
        <defs>
          <pattern id="hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1={0} y1={0} x2={0} y2={6} stroke="currentColor" stroke-width={2} opacity={0.5} /></pattern>
          <marker id="arrow" markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink-muted)" /></marker>
        </defs>
        <g transform={transformFor(cam, vp)}>
          <rect class="band band-build" x={0} y={BANDS.build.y} width={2020} height={BANDS.build.h + BANDS.artifacts.h} />
          <rect class="band band-server" x={0} y={BANDS.server.y} width={2020} height={BANDS.server.h + BANDS.network.h} />
          <rect class="band band-browser" x={0} y={BANDS.browser.y} width={2020} height={BANDS.browser.h} />
          <rect class="band band-dev" x={2020} y={0} width={WORLD.w - 2020} height={WORLD.h} />
          {([['build time · once per deploy', BANDS.build.y, BANDS.build.h + BANDS.artifacts.h], ['server · request time', BANDS.server.y, BANDS.server.h], ['browser · per tab', BANDS.browser.y, BANDS.browser.h]] as const).map(([t, y, h]) => (
            <text key={t} class="band-title" transform={`translate(12 ${y + h / 2}) rotate(-90)`} text-anchor="middle">{t}</text>
          ))}
          <line class="boundary-build" x1={0} y1={BANDS.server.y} x2={2020} y2={BANDS.server.y} />
          <line class="boundary-network" x1={0} y1={BANDS.network.y + 24} x2={2020} y2={BANDS.network.y + 24} />
          <line class="boundary-network" x1={0} y1={BANDS.network.y + 42} x2={2020} y2={BANDS.network.y + 42} />
          {REGIONS.map((r) => (
            <g key={r.id}>
              <rect class={`region ${r.id.endsWith('-runtime') ? 'region-runtime' : ''}`} x={r.x} y={r.y} width={r.w} height={r.h} />
            </g>
          ))}
          {EDGES.map((e) => {
            const active = activeEdges.has(e.id)
            const sa = entityStates[e.from], sb = entityStates[e.to]
            const lit = (st?: EntityState) => st !== undefined && st !== 'dimmed'
            const visible = active || !focused || (lit(sa) && lit(sb))
            if (!visible) return null
            const a = entityById(e.from), b = entityById(e.to)
            return <path key={e.id} class={`edge edge-${e.kind} ${active ? 'is-active' : ''}`} d={edgePath(a, b)} marker-end={active ? 'url(#arrow)' : undefined} />
          })}
          {ENTITIES.map((e) => (
            <g key={e.id} transform={`translate(${e.x} ${e.y})`} onClick={() => onSelect(e.id)}>
              <Glyph kind={e.glyph} state={entityStates[e.id]} selected={selected === e.id}><title>{e.name}</title></Glyph>
            </g>
          ))}
          {tokenEntity && token && (
            <g class={`token ${reducedMotion.value ? '' : 'token-move'}`} style={{ transform: `translate(${tokenEntity.x}px, ${tokenEntity.y}px)` }}>
              <circle class="token-ring" r={44} />
              <Glyph kind={token.glyph} state="current" />
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
