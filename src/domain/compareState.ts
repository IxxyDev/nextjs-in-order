import type { CompareWorld, LaneWorld, ResolvedPair } from './types'
import { shortNameById } from './entities'
import { describeScene } from './textEquivalent'
import { clampIndex } from './route'
import { isLit, sceneStates } from './worldState'

/** the same step index drives every lane; each lane is derived like a journey step */
export function deriveCompareState(pair: ResolvedPair, stepIndex: number): CompareWorld {
  const index = clampIndex(stepIndex, pair.steps.length)
  const step = pair.steps[index]
  const scenes = step.lanes.map((lane) => ({ lane, entityStates: sceneStates(lane.states), activeEdges: new Set(lane.edges), token: lane.token, cameraTarget: lane.camera }))
  const lanes: LaneWorld[] = scenes.map((s, i) => ({
    ...s,
    differs: new Set(Object.keys(s.entityStates).filter((id) => isLit(s.entityStates[id]) && scenes.some((o, j) => j !== i && !isLit(o.entityStates[id]))))
  }))
  const at = pair.steps.length > 1 ? index / (pair.steps.length - 1) : 0
  const ruler = step.ruler ?? lanes.map(() => at)
  const text = [
    `Step ${index + 1} of ${pair.steps.length}: ${step.title}.`, step.story,
    ...lanes.map((l, i) => `${pair.lanes[i].title}: ${describeScene(l, l.lane.story)}${l.differs.size ? ` Only here: ${[...l.differs].map(shortNameById).join(', ')}.` : ''}`)
  ].join(' ')
  return { pairId: pair.id, stepIndex: index, step, lanes, ruler, text }
}
