// src/domain/validate.ts
import type { CodeLens, ComparePair, Entity, Fate, Journey, LaneScene, LensRow, QuizQuestion, SpecimenFile, Step, StepRef } from './types'
import { ENTITIES, entityById } from './entities'
import { EDGES } from './edges'
import { REGIONS, regionById } from './regions'
import { JOURNEY_CATALOG } from './journeys'

const entityIds = new Set(ENTITIES.map((e) => e.id))
const edgeIds = new Set(EDGES.map((e) => e.id))
const regionIds: ReadonlySet<string> = new Set(REGIONS.map((r) => r.id))
/** a specimen line's journeys list only the journeys after J0 (code-lens.md §4), and the catalog opens with J0 */
const journeyIdsAfterJ0 = new Set(JOURNEY_CATALOG.slice(1).map((j) => j.id))
/** docs/code-lens.md §9: an open pane shows at most this many non-folded lines; the rest fold */
const MAX_OPEN_LINES = 8

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

/** the release number in a history label ('1 · 2016' → [1], '9.3' → [9, 3], '≤11' → [11]) */
const release = (version: string) => (version.match(/\d+(?:\.\d+)*/)?.[0] ?? '').split('.').filter(Boolean).map(Number)
const after = (a: number[], b: number[]) => { for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0); return false }

/** a history, when present, is non-empty, every entry has text and a release number, and releases strictly increase */
export function validateEntities(entities: Entity[]): string[] {
  const errors: string[] = []
  for (const e of entities) {
    if (!e.history) continue
    if (!e.history.length) errors.push(`${e.id}: empty history`)
    e.history.forEach((h, i) => {
      if (!h.text.trim()) errors.push(`${e.id} history ${i + 1}: empty text`)
      if (!release(h.version).length) errors.push(`${e.id} history ${i + 1}: no release number in "${h.version}"`)
      else if (i > 0 && !after(release(h.version), release(e.history![i - 1].version))) errors.push(`${e.id} history ${i + 1}: ${h.version} does not come after ${e.history![i - 1].version}`)
    })
  }
  return errors
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

/** an entity is on stage at a step when the step gives it a state or the camera frames it */
function onStage(step: Step, id: string): boolean {
  if (id in step.states) return true
  const c = step.camera
  if (c.kind === 'world') return true
  if (c.kind === 'entities') return c.ids.includes(id)
  const region = entityById(id).region
  return c.kind === 'region' ? region === c.id : regionById(region).band === c.id
}

/** docs/code-lens.md §4: the specimen every lens shares; line ids are unique and every line has a known fate */
export function validateSpecimen(specimen: SpecimenFile[], fates: Fate[]): string[] {
  const errors: string[] = []
  const fateIds = new Set<string>(fates.map((f) => f.id))
  const lineIds = new Set<string>()
  const fate = (where: string, id: string | undefined) => { if (id !== undefined && !fateIds.has(id)) errors.push(`${where}: undefined fate ${id}`) }
  for (const file of specimen) {
    for (const l of file.lines) {
      const where = `specimen ${l.id}`
      if (lineIds.has(l.id)) errors.push(`${where}: duplicate line id`)
      lineIds.add(l.id)
      if (!l.frame && !l.fate) errors.push(`${where}: no fate on a non-frame line`)
      fate(where, l.fate)
      fate(where, l.mark)
      for (const j of l.journeys ?? []) if (!journeyIdsAfterJ0.has(j)) errors.push(`${where}: ${j} is not a journey after J0`)
    }
    if (file.entity && !entityIds.has(file.entity)) errors.push(`specimen ${file.path}: unknown entity ${file.entity}`)
  }
  return errors
}

/** docs/code-lens.md §9: a lens covers every step of its journey and every id it names resolves */
export function validateCodeLens(lens: CodeLens, journey: Journey, specimen: SpecimenFile[], fates: Fate[]): string[] {
  const errors: string[] = []
  const fateIds = new Set<string>(fates.map((f) => f.id))
  const lineIds = new Set(specimen.flatMap((f) => f.lines.map((l) => l.id)))
  const fate = (where: string, id: string | undefined) => { if (id !== undefined && !fateIds.has(id)) errors.push(`${where}: undefined fate ${id}`) }
  if (lens.journey !== journey.id) errors.push(`lens ${lens.journey}: journey is ${journey.id}`)
  const steps = new Map(journey.steps.map((s) => [s.id, s]))
  const covered = new Set<string>()
  let previousForm: string | undefined
  for (const ls of lens.steps) {
    const where = `lens ${ls.step}`
    const step = steps.get(ls.step)
    if (!step) { errors.push(`${where}: no such step in ${journey.slug}`); continue }
    if (covered.has(ls.step)) errors.push(`${where}: duplicate step`)
    covered.add(ls.step)
    if (ls.mode === 'off' && (ls.panes.length || ls.links.length)) errors.push(`${where}: off but has panes or links`)
    if (ls.mode !== 'off' && !ls.form) errors.push(`${where}: ${ls.mode} without a form`)
    if (ls.mode === 'peek' && !ls.summary?.length) errors.push(`${where}: peek without a summary`)
    /** experience-architecture.md §3.1: the question stays alone; a check step opens only where its form changes, which the open rule below checks */
    if (step.kind === 'predict' && ls.mode !== 'off') errors.push(`${where}: predict step with a lens`)
    if (step.kind === 'check' && ls.mode === 'peek') errors.push(`${where}: check step peeks, off unless its form changes`)
    /** rule 7: an open step must show a new form. An off step has no form, so it resets the comparison on purpose:
     * the reader saw no code there, and the next open may repeat the form last seen before it */
    if (ls.mode === 'open' && ls.form === previousForm) errors.push(`${where}: open but the form did not change`)
    previousForm = ls.form
    let shown = 0
    ls.panes.forEach((pane, p) => {
      const at = `${where} pane ${p + 1}`
      if (pane.side && !ls.split) errors.push(`${at}: ${pane.side} side on a step that is not split`)
      if (pane.entity && !entityIds.has(pane.entity)) errors.push(`${at}: unknown entity ${pane.entity}`)
      let lines = 0
      for (const row of pane.rows) {
        for (const id of row.from ?? []) if (!lineIds.has(id)) errors.push(`${at}: unknown specimen line ${id}`)
        if ('fold' in row) continue
        lines++
        fate(at, row.fate)
        fate(at, row.mark)
      }
      if (ls.mode === 'open' && MAX_OPEN_LINES < lines) errors.push(`${at}: ${lines} lines shown, at most ${MAX_OPEN_LINES}`)
      shown += lines
    })
    if (ls.split && (ls.panes.length !== 2 || ls.panes[0].side !== 'server' || ls.panes[1].side !== 'browser')) errors.push(`${where}: split needs a server pane then a browser pane`)
    if (ls.mode === 'open' && shown === 0) errors.push(`${where}: open with no lines`)
    for (const link of ls.links) {
      fate(where, link.fate)
      for (const id of link.from ?? []) if (!lineIds.has(id)) errors.push(`${where}: unknown specimen line ${id}`)
      /** a narrowed link fires only from a shown line of its fate (hue or mark) that comes from one of its lines */
      const fires = (r: LensRow) => !('fold' in r) && (r.fate === link.fate || r.mark === link.fate) && link.from!.some((id) => r.from?.includes(id))
      if (link.from && !ls.panes.some((p) => p.rows.some(fires))) errors.push(`${where}: ${link.fate} link from ${link.from.join(', ')} matches no row`)
      for (const id of link.entities) {
        if (!entityIds.has(id)) errors.push(`${where}: unknown entity ${id}`)
        else if (!onStage(step, id)) errors.push(`${where}: ${link.fate} links ${id}, which is not in the step's states or camera`)
      }
    }
  }
  for (const s of journey.steps) if (!covered.has(s.id)) errors.push(`lens ${s.id}: missing`)
  return errors
}
