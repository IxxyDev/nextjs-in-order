// src/ui/Labels.tsx
import type { EntityState, PickMark, RegionId, TokenState } from '../domain/types'
import { ENTITIES, entityById, shortNameById } from '../domain/entities'
import { EDGES } from '../domain/edges'
import { REGIONS, CUSTOM_SERVER_RING as RING } from '../domain/regions'
import { MAIN_RIG, reservedFor, worldToScreen, type CameraRig } from './camera'
import { intersects, placeLabels, type LabelCandidate, type ScreenRect } from './labelLayout'
import { lensLit, mapHover } from './lensLink'
import { STATE_LABEL } from '../domain/stateLabel'
import { MARK_CHIP } from '../domain/predict'

/** below this zoom, only emphasized entities keep their label (emphasized ones always try for one) */
const LABEL_ZOOM = 0.7
/** region titles: 11px mono uppercase, 0.14em tracking */
const REGION_CHAR_W = 8.2
const REGION_H = 16
const INSET = 6
/** below this zoom, dimmed entities lose their label even in a focused scene */
const DIMMED_LABEL_ZOOM = 1.0
/** badges (runtime, directive) appear only from this zoom */
const BADGE_ZOOM = 1.0

export interface LabelsProps {
  entityStates: Record<string, EntityState>
  activeEdges?: ReadonlySet<string>
  token?: TokenState
  selected?: string
  onSelect: (id: string) => void
  rig?: CameraRig
  /** compare mode: entities lit in this lane only */
  differs?: ReadonlySet<string>
  /** predict mode: marked entities keep their label; region titles become pick buttons */
  marks?: Record<string, PickMark>
  regionMarks?: Partial<Record<RegionId, PickMark>>
  onRegion?: (id: RegionId) => void
  /** what activating a label does, for its accessible name */
  verb?: string
}

const PRESSED = new Set<PickMark | undefined>(['picked', 'correct', 'extra'])

export function Labels({ entityStates, activeEdges, token, selected, onSelect, rig = MAIN_RIG, differs, marks, regionMarks, onRegion, verb = 'Inspect' }: LabelsProps) {
  const cam = rig.camera.value, vp = rig.viewport.value
  const dense = cam.zoom < LABEL_ZOOM
  const ring = entityStates['custom-server']
  const ringAt = ring !== undefined && ring !== 'dimmed' && ring !== 'na' ? worldToScreen({ x: RING.x + RING.w - 10, y: RING.y + RING.h - 6 }, cam, vp) : undefined
  const reserved = reservedFor(rig)

  const candidates: LabelCandidate[] = []
  const glyphBoxes = new Map<string, ScreenRect>()
  const soft = new Set<string>()
  for (const e of ENTITIES) {
    const g = worldToScreen({ x: e.x, y: e.y }, cam, vp)
    if (g.x < -200 || g.x > vp.w + 200 || g.y < -100 || g.y > vp.h + 100) continue
    const state = entityStates[e.id]
    const hiddenGlyph = state === 'dimmed' && cam.zoom < DIMMED_LABEL_ZOOM
    glyphBoxes.set(e.id, { x: g.x - 30 * cam.zoom, y: g.y - 28 * cam.zoom, w: 60 * cam.zoom, h: 56 * cam.zoom })
    const mark = marks?.[e.id]
    const emphasized = (state && state !== 'dimmed') || selected === e.id || token?.at === e.id || mark !== undefined
    if (!emphasized) soft.add(e.id)
    if (dense && !emphasized) continue
    if (hiddenGlyph && !emphasized) continue
    const chips: string[] = []
    if (state && STATE_LABEL[state]) chips.push(STATE_LABEL[state])
    if (e.badge && cam.zoom >= BADGE_ZOOM) chips.push(e.badge)
    if (differs?.has(e.id)) chips.push('differs')
    if (mark && MARK_CHIP[mark]) chips.push(MARK_CHIP[mark]!)
    const p = worldToScreen({ x: e.x, y: e.y + 30 }, cam, vp)
    candidates.push({ id: e.id, x: p.x, y: p.y, inline: dense, text: token?.at === e.id ? token.label : shortNameById(e.id), chips, state, isToken: token?.at === e.id, isSelected: selected === e.id || PRESSED.has(mark) })
  }
  /** edge chips take part in the same layout, so they slide off entity labels instead of covering them */
  if (activeEdges) for (const e of EDGES) {
    if (!activeEdges.has(e.id) || !e.label) continue
    const a = entityById(e.from), b = entityById(e.to)
    const p = worldToScreen({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, cam, vp)
    if (p.x < -200 || p.x > vp.w + 200 || p.y < -50 || p.y > vp.h + 50) continue
    candidates.push({ id: `edge:${e.id}`, x: p.x, y: p.y - 10, text: e.label, chips: e.crossing ? [e.crossing] : [], isToken: false, isSelected: false, isEdge: true })
  }
  const shown = placeLabels(candidates, glyphBoxes, { reserved, bounds: vp, soft })
  const boxes = [...shown.values()].map((s) => s.box)
  /** region titles are context: a plain title gives way to any label or zone it would sit under */
  const clearOf = (x: number, y: number, text: string, anchorRight = false) => {
    const w = text.length * REGION_CHAR_W
    const box = { x: anchorRight ? x - w : x, y: anchorRight ? y - REGION_H : y, w, h: REGION_H }
    if ([...boxes, ...reserved].some((r) => intersects(box, r))) return false
    boxes.push(box)
    return true
  }
  const ringText = 'server.js · custom server ring'
  const lit = lensLit.value
  const hover = (id: string | undefined) => () => { if (id || mapHover.peek()) mapHover.value = id }

  return (
    <div class="labels">
      {REGIONS.map((r) => {
        const at = worldToScreen({ x: r.x + 10, y: r.y + 6 }, cam, vp)
        if (at.y < -30 || at.y > vp.h) return null
        /** a title sticks to the canvas edge while its region is on screen; a plain one hides once it no longer fits (pick buttons stay) */
        const w = r.title.length * REGION_CHAR_W, right = worldToScreen({ x: r.x + r.w, y: r.y }, cam, vp).x - 10
        const p = { x: Math.max(at.x, INSET), y: at.y }
        if (onRegion) {
          const m = regionMarks?.[r.id]
          return <button key={r.id} type="button" class={`region-label is-pickable ${m ? `mark-${m}` : ''}`} style={{ left: `${p.x}px`, top: `${p.y}px` }} aria-pressed={PRESSED.has(m)} aria-label={`${r.title}${m && MARK_CHIP[m] ? `, ${MARK_CHIP[m]}` : ''}. ${verb}`} onClick={(e) => { if (e.detail < 2) onRegion(r.id) }}>{r.title}</button>
        }
        if (p.x + w > vp.w - INSET || right < p.x + 40 || !clearOf(p.x, p.y, r.title)) return null
        return <div key={r.id} class="region-label" style={{ left: `${p.x}px`, top: `${p.y}px` }} aria-hidden="true">{r.title}</div>
      })}
      {ringAt && clearOf(ringAt.x, ringAt.y, ringText, true) && <div class="region-label ring-label" style={{ left: `${ringAt.x}px`, top: `${ringAt.y}px` }} aria-hidden="true">{ringText}</div>}
      {candidates.filter((c) => c.isEdge && shown.has(c.id)).map((c) => {
        const at = shown.get(c.id)!
        return <div key={c.id} class="edge-label" style={{ left: `${at.x}px`, top: `${at.y + at.box.h / 2}px` }} aria-hidden="true">{c.text}{c.chips[0] ? <span class="chip chip-crossing">{c.chips[0]}</span> : null}</div>
      })}
      {candidates.filter((c) => !c.isEdge && shown.has(c.id)).map((c) => {
        const e = entityById(c.id)
        const m = marks?.[c.id]
        const at = shown.get(c.id)!
        return (
          <button
            key={c.id}
            class={`label ${c.state === 'dimmed' ? 'is-dimmed' : ''} ${c.inline ? 'is-inline' : ''} ${lit.ids.has(c.id) ? `is-linked ${lit.hue ? `fate-${lit.hue}` : ''}` : ''}`}
            style={{ left: `${at.x}px`, top: `${at.y}px` }}
            data-entity={c.id}
            onMouseEnter={hover(c.id)} onMouseLeave={hover(undefined)} onFocus={hover(c.id)} onBlur={hover(undefined)}
            aria-pressed={selected === c.id || PRESSED.has(m)}
            aria-label={`${e.name}${c.state && c.state !== 'dimmed' ? `, ${STATE_LABEL[c.state]}` : ''}${differs?.has(c.id) ? ', differs' : ''}${m && MARK_CHIP[m] ? `, ${MARK_CHIP[m]}` : ''}. ${verb}`}
            onClick={() => onSelect(c.id)}
          >
            <span class="label-name">{c.text}</span>
            {c.chips.length > 0 && (
              <span class="label-row">
                {c.state && STATE_LABEL[c.state] && <span class={`chip chip-${c.state}`}>{STATE_LABEL[c.state]}</span>}
                {e.badge && cam.zoom >= BADGE_ZOOM && <span class="chip chip-badge">{e.badge}</span>}
                {differs?.has(c.id) && <span class="chip chip-differs">differs</span>}
                {m && MARK_CHIP[m] && <span class={`chip chip-mark-${m}`}>{MARK_CHIP[m]}</span>}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
