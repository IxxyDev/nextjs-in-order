// src/ui/Labels.tsx
import type { EntityState, TokenState } from '../domain/types'
import { ENTITIES, entityById } from '../domain/entities'
import { EDGES } from '../domain/edges'
import { REGIONS, CUSTOM_SERVER_RING as RING } from '../domain/regions'
import { camera, viewport, worldToScreen } from './camera'
import { placeLabels, type LabelCandidate, type ScreenRect } from './labelLayout'

/** below this zoom, only emphasized entities keep their label */
const LABEL_ZOOM = 0.7
/** below this zoom, dimmed entities lose their label even in a focused scene */
const DIMMED_LABEL_ZOOM = 1.2
/** badges (runtime, directive) appear only from this zoom */
const BADGE_ZOOM = 1.0

export interface LabelsProps {
  entityStates: Record<string, EntityState>
  activeEdges?: ReadonlySet<string>
  token?: TokenState
  selected?: string
  onSelect: (id: string) => void
}

const CHIP: Partial<Record<EntityState, string>> = {
  current: 'now', active: 'running', new: 'new', kept: 'kept', replaced: 'replaced', invalid: 'invalid', stale: 'stale', fresh: 'fresh', na: 'n/a'
}

export function Labels({ entityStates, activeEdges, token, selected, onSelect }: LabelsProps) {
  const cam = camera.value, vp = viewport.value
  const dense = cam.zoom < LABEL_ZOOM
  const ring = entityStates['custom-server']
  const ringAt = ring !== undefined && ring !== 'dimmed' && ring !== 'na' ? worldToScreen({ x: RING.x + RING.w - 10, y: RING.y + RING.h - 6 }, cam, vp) : undefined
  return (
    <div class="labels">
      {REGIONS.map((r) => {
        const p = worldToScreen({ x: r.x + 10, y: r.y + 6 }, cam, vp)
        if (p.x < -300 || p.x > vp.w || p.y < -30 || p.y > vp.h) return null
        return <div key={r.id} class="region-label" style={{ left: `${p.x}px`, top: `${p.y}px` }} aria-hidden="true">{r.title}</div>
      })}
      {ringAt && <div class="region-label ring-label" style={{ left: `${ringAt.x}px`, top: `${ringAt.y}px` }} aria-hidden="true">server.js · custom server ring</div>}
      {activeEdges && EDGES.filter((e) => activeEdges.has(e.id) && e.label).map((e) => {
        const a = entityById(e.from), b = entityById(e.to)
        const p = worldToScreen({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cam, vp)
        if (p.x < -200 || p.x > vp.w + 200 || p.y < -50 || p.y > vp.h + 50) return null
        return <div key={e.id} class="edge-label" style={{ left: `${p.x}px`, top: `${p.y}px` }} aria-hidden="true">{e.label}{e.crossing ? <span class="chip chip-crossing">{e.crossing}</span> : null}</div>
      })}
      {(() => {
        const candidates: LabelCandidate[] = []
        const glyphBoxes = new Map<string, ScreenRect>()
        for (const e of ENTITIES) {
          const g = worldToScreen({ x: e.x, y: e.y }, cam, vp)
          if (g.x < -200 || g.x > vp.w + 200 || g.y < -100 || g.y > vp.h + 100) continue
          const state = entityStates[e.id]
          const hiddenGlyph = state === 'dimmed' && cam.zoom < DIMMED_LABEL_ZOOM
          glyphBoxes.set(e.id, { x: g.x - 30 * cam.zoom, y: g.y - 28 * cam.zoom, w: 60 * cam.zoom, h: 56 * cam.zoom })
          const emphasized = (state && state !== 'dimmed') || selected === e.id || token?.at === e.id
          if (dense && !emphasized) continue
          if (hiddenGlyph && !emphasized) continue
          const chips: string[] = []
          if (state && CHIP[state]) chips.push(CHIP[state]!)
          if (e.badge && cam.zoom >= BADGE_ZOOM) chips.push(e.badge)
          const p = worldToScreen({ x: e.x, y: e.y + 30 }, cam, vp)
          candidates.push({ id: e.id, x: p.x, y: p.y, text: token?.at === e.id ? token.label : (e.short ?? e.name.split(' · ')[0]), chips, state, isToken: token?.at === e.id, isSelected: selected === e.id })
        }
        const shown = placeLabels(candidates, glyphBoxes)
        return candidates.filter((c) => shown.has(c.id)).map((c) => {
          const e = entityById(c.id)
          return (
            <button
              key={c.id}
              class={`label ${c.state === 'dimmed' ? 'is-dimmed' : ''}`}
              style={{ left: `${c.x}px`, top: `${c.y}px` }}
              aria-pressed={selected === c.id}
              aria-label={`${e.name}${c.state && c.state !== 'dimmed' ? `, ${CHIP[c.state]}` : ''}. Inspect`}
              onClick={() => onSelect(c.id)}
            >
              <span class="label-name">{c.text}</span>
              {c.chips.length > 0 && (
                <span class="label-row">
                  {c.state && CHIP[c.state] && <span class={`chip chip-${c.state}`}>{CHIP[c.state]}</span>}
                  {e.badge && cam.zoom >= BADGE_ZOOM && <span class="chip chip-badge">{e.badge}</span>}
                </span>
              )}
            </button>
          )
        })
      })()}
    </div>
  )
}
