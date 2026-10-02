import type { CompareWorld, EntityState, LaneWorld, ResolvedPair } from './types'
import { ENTITIES } from './entities'
import { describeScene } from './textEquivalent'
import { clampIndex } from './route'

const lit = (s?: EntityState) => s !== undefined && s !== 'dimmed' && s !== 'na'

/** the same step index drives every lane; each lane is derived like a journey step */
export function deriveCompareState(pair: ResolvedPair, stepIndex: number): CompareWorld {
  const index = clampIndex(stepIndex, pair.steps.length)
  const step = pair.steps[index]
  const scenes = step.lanes.map((lane) => {
    const entityStates: Record<string, EntityState> = {}
    if (Object.keys(lane.states).length > 0) for (const e of ENTITIES) entityStates[e.id] = lane.states[e.id] ?? 'dimmed'
    return { lane, entityStates, activeEdges: new Set(lane.edges), token: lane.token, cameraTarget: lane.camera }
  })
  const lanes: LaneWorld[] = scenes.map((s, i) => ({
    ...s,
    differs: new Set(Object.keys(s.entityStates).filter((id) => lit(s.entityStates[id]) && scenes.some((o, j) => j !== i && !lit(o.entityStates[id]))))
  }))
  const at = pair.steps.length > 1 ? index / (pair.steps.length - 1) : 0
  const ruler = step.ruler ?? lanes.map(() => at)
  const text = [
    `Step ${index + 1} of ${pair.steps.length}: ${step.title}.`, step.story,
    ...lanes.map((l, i) => `${pair.lanes[i].title}: ${describeScene(l, l.lane.story)}${l.differs.size ? ` Only here: ${[...l.differs].map((id) => ENTITIES.find((e) => e.id === id)!.name.split(' · ')[0]).join(', ')}.` : ''}`)
  ].join(' ')
  return { pairId: pair.id, stepIndex: index, step, lanes, ruler, text }
}
