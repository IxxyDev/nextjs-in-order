// src/domain/validate.ts
import type { ComparePair, Journey, LaneScene, QuizQuestion, StepRef } from './types'
import { ENTITIES } from './entities'
import { EDGES } from './edges'
import { REGIONS } from './regions'

const entityIds = new Set(ENTITIES.map((e) => e.id))
const edgeIds = new Set(EDGES.map((e) => e.id))
const regionIds: ReadonlySet<string> = new Set(REGIONS.map((r) => r.id))

function refError(ref: StepRef, journey: (slug: string) => Journey | undefined): string | undefined {
  const j = journey(ref.journey)
  if (!j) return `unknown journey ${ref.journey}`
  if (!Number.isInteger(ref.step) || ref.step < 1 || ref.step > j.steps.length) return `${ref.journey} has no step ${ref.step}`
}

function sceneErrors(where: string, scene: LaneScene, errors: string[]): void {
  for (const id of Object.keys(scene.states)) if (!entityIds.has(id)) errors.push(`${where}: unknown entity ${id}`)
  for (const id of scene.edges) if (!edgeIds.has(id)) errors.push(`${where}: unknown edge ${id}`)
  if (scene.token && !entityIds.has(scene.token.at)) errors.push(`${where}: token at unknown entity ${scene.token.at}`)
  if (scene.camera.kind === 'region' && !regionIds.has(scene.camera.id)) errors.push(`${where}: unknown region ${scene.camera.id}`)
  if (scene.camera.kind === 'entities') for (const id of scene.camera.ids) if (!entityIds.has(id)) errors.push(`${where}: camera on unknown entity ${id}`)
}

export function validateJourney(journey: Journey): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  journey.steps.forEach((step, i) => {
    const where = `${journey.slug} step ${i + 1} (${step.id})`
    if (seen.has(step.id)) errors.push(`${where}: duplicate step id`)
    seen.add(step.id)
    sceneErrors(where, step, errors)
    if (step.kind === 'predict' && !step.question) errors.push(`${where}: predict step without a question`)
    if (step.kind === 'check' && !(step.checks && step.checks.length)) errors.push(`${where}: check step without checks`)
    if (step.story.trim().length === 0) errors.push(`${where}: empty story`)
  })
  return errors
}

/** every inline lane references existing ids and every reused step resolves to a journey step */
export function validateCompare(pair: ComparePair, journey: (slug: string) => Journey | undefined): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  if (pair.lanes.length < 2) errors.push(`${pair.slug}: fewer than two lanes`)
  pair.steps.forEach((step, i) => {
    const where = `${pair.slug} step ${i + 1} (${step.id})`
    if (seen.has(step.id)) errors.push(`${where}: duplicate step id`)
    seen.add(step.id)
    if (!step.id.startsWith(`${pair.id}-`)) errors.push(`${where}: id does not start with ${pair.id}-`)
    if (step.story.trim().length === 0) errors.push(`${where}: empty story`)
    if (step.lanes.length !== pair.lanes.length) errors.push(`${where}: ${step.lanes.length} lanes, pair has ${pair.lanes.length}`)
    if (step.ruler && (step.ruler.length !== pair.lanes.length || step.ruler.some((t) => !(t >= 0 && t <= 1)))) errors.push(`${where}: ruler needs one value in [0, 1] per lane`)
    step.lanes.forEach((lane, l) => {
      const at = `${where} lane ${l + 1}`
      if ('ref' in lane) {
        const e = refError(lane.ref, journey)
        if (e) errors.push(`${at}: ${e}`)
      } else {
        sceneErrors(at, lane, errors)
        if (lane.story.trim().length === 0) errors.push(`${at}: empty story`)
      }
    })
  })
  return errors
}

/** every pick and highlight names an existing entity or region, answers are non-empty and every replay resolves */
export function validateQuiz(questions: QuizQuestion[], journey: (slug: string) => Journey | undefined): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const q of questions) {
    const where = `quiz ${q.id}`
    if (seen.has(q.id)) errors.push(`${where}: duplicate id`)
    seen.add(q.id)
    if (!q.title.trim() || !q.prompt.trim() || !q.why.trim()) errors.push(`${where}: empty text`)
    if (q.source === 'scenario' && !(q.journey && journey(q.journey))) errors.push(`${where}: scenario without a known journey`)
    if (q.type === 'choice') {
      if (q.options.length < 2 || q.options.length > 4) errors.push(`${where}: needs 2–4 options`)
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) errors.push(`${where}: answer out of range`)
      if (!q.highlight.length) errors.push(`${where}: nothing to highlight`)
      for (const id of q.highlight) if (!entityIds.has(id)) errors.push(`${where}: unknown entity ${id}`)
    } else {
      const known = q.type === 'entities' ? entityIds : regionIds
      const candidates: string[] = q.candidates, answer: string[] = q.answer
      for (const id of candidates) if (!known.has(id)) errors.push(`${where}: unknown ${q.type === 'entities' ? 'entity' : 'region'} ${id}`)
      if (new Set(candidates).size !== candidates.length) errors.push(`${where}: duplicate candidates`)
      if (!answer.length) errors.push(`${where}: empty answer`)
      for (const id of answer) if (!candidates.includes(id)) errors.push(`${where}: answer ${id} is not a candidate`)
      if (candidates.length <= answer.length) errors.push(`${where}: no distractors`)
    }
    if (!q.replays.length) errors.push(`${where}: no replay`)
    for (const r of q.replays) {
      const e = refError(r, journey)
      if (e) errors.push(`${where}: ${e}`)
    }
  }
  return errors
}
