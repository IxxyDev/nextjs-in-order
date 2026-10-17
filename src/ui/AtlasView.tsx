import { useEffect, useRef, useState } from 'preact/hooks'
import type { Camera, CameraTarget, EntityState } from '../domain/types'
import { ENTITIES, entityById } from '../domain/entities'
import { REGIONS } from '../domain/regions'
import { ENVS, PHASES, REACHES, isFiltering, matchesFilter, type AtlasFilter } from '../domain/atlasFilter'
import { breadcrumbFor } from '../domain/breadcrumb'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { Legend } from './Legend'
import { Inspector } from './Inspector'
import { Breadcrumb } from './Breadcrumb'
import { MAIN_RIG, goTo, viewport } from './camera'
import { reducedMotion } from './useReducedMotion'
import { useCameraGestures } from './useCameraGestures'
import { useUrlCamera } from './useUrlCamera'
import { TEXT } from './useStepControls'

/** a URL camera, or one the user moved, holds until the route changes; until then framing leaves it alone */
export function AtlasView({ entity, cam, onSelect }: { entity?: string; cam?: Camera; onSelect: (id?: string) => void }) {
  const [filter, setFilter] = useState<AtlasFilter>({})
  const vp = viewport.value
  const { isHeld, hold: onManual, release } = useUrlCamera(cam, entity ?? '')
  const stage = useRef<HTMLDivElement>(null)
  useCameraGestures(MAIN_RIG, stage, onManual)
  const target: CameraTarget = entity ? { kind: 'entities', ids: [entity] } : { kind: 'world' }
  useEffect(() => { if (!isHeld) goTo(target, reducedMotion.value) }, [entity, isHeld, vp.w, vp.h])
  /** Escape closes the inspector; with none open it returns the camera to the whole system */
  const latest = useRef({ entity, onSelect })
  latest.current = { entity, onSelect }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || (e.target as HTMLElement).closest?.(TEXT)) return
      if (latest.current.entity) { latest.current.onSelect(undefined); return }
      release()
      goTo({ kind: 'world' }, reducedMotion.value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const filtering = isFiltering(filter)
  const matching = new Set(ENTITIES.filter((e) => matchesFilter(e, filter)))
  const states: Record<string, EntityState> = filtering ? Object.fromEntries(ENTITIES.map((e) => [e.id, matching.has(e) ? 'active' : 'dimmed'])) : {}
  if (entity) states[entity] = 'current'
  const set = (k: keyof AtlasFilter) => (e: Event) => setFilter({ ...filter, [k]: (e.currentTarget as HTMLSelectElement).value || undefined })
  return (
    <div class="atlas">
      <div class="atlas-filters">
        <label>Phase <select value={filter.phase ?? ''} onChange={set('phase')}><option value="">all</option>{PHASES.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
        <label>Environment <select value={filter.env ?? ''} onChange={set('env')}><option value="">all</option>{ENVS.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
        <label>Region <select value={filter.region ?? ''} onChange={set('region')}><option value="">all</option>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.title.split(' · ')[0]}</option>)}</select></label>
        <label>Reaches the browser <select value={filter.reaches ?? ''} onChange={set('reaches')}><option value="">all</option>{REACHES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
        <button type="button" onClick={() => setFilter({})} disabled={!filtering}>Clear</button>
        <span aria-live="polite"><strong class="atlas-count">{matching.size} of {ENTITIES.length}</strong> entities. Click any to inspect. Press Escape to return to the whole system.</span>
      </div>
      <div class="history-strip">
        <button type="button" onClick={() => onSelect('next-build')} aria-label="Next.js history. Inspect next build">Next.js history</button>
        <ol tabIndex={0} aria-label="Next.js releases, oldest first">{entityById('next-build').history!.map((h) => <li key={h.version}><strong>{h.version}</strong> {h.text}</li>)}</ol>
      </div>
      <Breadcrumb crumbs={breadcrumbFor({ target, entity })} onGo={(t) => onManual(goTo(t, reducedMotion.value))} />
      <div class="stage" ref={stage}>
        <World entityStates={states} activeEdges={new Set()} selected={entity} onSelect={(id) => onSelect(id)} />
        <Labels entityStates={states} selected={entity} onSelect={(id) => onSelect(id)} />
        <Minimap onManual={onManual} />
        <Legend />
        {entity && <Inspector id={entity} onClose={() => onSelect(undefined)} />}
      </div>
    </div>
  )
}
