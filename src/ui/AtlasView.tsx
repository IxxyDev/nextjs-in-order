// src/ui/AtlasView.tsx
import { useEffect, useState } from 'preact/hooks'
import type { EntityState, Phase, Reaches } from '../domain/types'
import { ENTITIES } from '../domain/entities'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { Inspector } from './Inspector'
import { goTo, viewport } from './camera'
import { reducedMotion } from './useReducedMotion'

const PHASES: Phase[] = ['build', 'startup', 'request', 'browser', 'dev']
const REACHES: Reaches[] = ['code', 'data', 'data+refs', 'no']

export function AtlasView({ entity, onSelect }: { entity?: string; onSelect: (id?: string) => void }) {
  const [phase, setPhase] = useState<Phase | ''>('')
  const [reaches, setReaches] = useState<Reaches | ''>('')
  const vp = viewport.value
  useEffect(() => { goTo(entity ? { kind: 'entities', ids: [entity] } : { kind: 'world' }, reducedMotion.value) }, [entity, vp.w, vp.h])
  const states: Record<string, EntityState> = {}
  if (phase || reaches) for (const e of ENTITIES) {
    const ok = (!phase || e.phase.includes(phase)) && (!reaches || e.reaches === reaches)
    states[e.id] = ok ? 'active' : 'dimmed'
  }
  if (entity) states[entity] = 'current'
  return (
    <div class="atlas">
      <div class="atlas-filters">
        <label>Phase <select value={phase} onChange={(e) => setPhase((e.currentTarget as HTMLSelectElement).value as Phase | '')}><option value="">all</option>{PHASES.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>
        <label>Reaches the browser <select value={reaches} onChange={(e) => setReaches((e.currentTarget as HTMLSelectElement).value as Reaches | '')}><option value="">all</option>{REACHES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
        <span>{ENTITIES.length} entities. Click any to inspect. Press Escape to return to the whole system.</span>
      </div>
      <div class="stage">
        <World entityStates={states} activeEdges={new Set()} selected={entity} onSelect={(id) => onSelect(id)} />
        <Labels entityStates={states} selected={entity} onSelect={(id) => onSelect(id)} />
        <Minimap />
        {entity && <Inspector id={entity} onClose={() => onSelect(undefined)} />}
      </div>
    </div>
  )
}
