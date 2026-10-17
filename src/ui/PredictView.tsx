import { useEffect, useRef, useState } from 'preact/hooks'
import type { Camera, CameraTarget, EntityState, PickMark, QuizQuestion, RegionId } from '../domain/types'
import { ENTITIES, entityById, shortNameById } from '../domain/entities'
import { regionById } from '../domain/regions'
import { entryBySlug } from '../domain/journeys'
import { MARK_CHIP, answerIds, markFor, scoreQuestion } from '../domain/predict'
import { formatRoute } from '../domain/route'
import { progress, quizId } from '../domain/progress'
import { breadcrumbFor } from '../domain/breadcrumb'
import { catalogCode } from '../domain/catalogCode'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { Legend } from './Legend'
import { Breadcrumb } from './Breadcrumb'
import { MAIN_RIG, goTo, restoreCamera, viewport, writeCamToUrl } from './camera'
import { reducedMotion } from './useReducedMotion'
import { useCameraGestures } from './useCameraGestures'

const HINT = {
  entities: 'Pick every entity that applies, on the map or in the list. Picks are scored as an exact set.',
  regions: 'Pick every region that applies: click a region or its title, or use the list.',
  choice: 'Choose one outcome.'
}

function cameraFor(q: QuizQuestion): CameraTarget {
  if (q.type === 'entities') return { kind: 'entities', ids: q.candidates }
  if (q.type === 'choice') return { kind: 'entities', ids: q.highlight }
  return { kind: 'world' }
}

export function PredictView({ quiz, n, cam, onGo, onAnswered }: { quiz: QuizQuestion[]; n: number; cam?: Camera; onGo: (n: number) => void; onAnswered: (questionId: string, correct: boolean) => void }) {
  const q = quiz[n]
  const [{ picks, checked }, set] = useState({ picks: [] as string[], checked: false })
  const result = checked ? scoreQuestion(q, picks) : undefined

  const vp = viewport.value
  /** a URL camera, or one the user moved, holds until the route changes; until then framing leaves it alone */
  const camKey = cam && `${cam.x},${cam.y},${cam.zoom}`
  useEffect(() => { if (cam) restoreCamera(cam) }, [camKey])
  const stage = useRef<HTMLDivElement>(null)
  const manual = useRef(false)
  const onManual = (c: Camera) => { manual.current = true; writeCamToUrl(c) }
  useCameraGestures(MAIN_RIG, stage, onManual)
  useEffect(() => { if (!cam && !manual.current) goTo(cameraFor(q), reducedMotion.value) }, [q.id, camKey, vp.w, vp.h])

  const toggle = (id: string) => {
    if (q.type === 'choice') { set({ picks: [id], checked: false }); return }
    set({ picks: picks.includes(id) ? picks.filter((p) => p !== id) : [...picks, id], checked: false })
  }
  const check = () => {
    if (!picks.length) return
    set({ picks, checked: true })
    onAnswered(q.id, scoreQuestion(q, picks).correct)
  }

  const earlier = progress.get(quizId(q.id))
  const sum = progress.summaryForQuiz(quiz.map((x) => x.id))
  const reset = () => { if (window.confirm('Reset all saved progress? This clears your answered and correct counts.')) progress.reset() }

  const answer = new Set(answerIds(q))
  const picked = new Set(picks)
  const candidates: string[] = q.type === 'choice' ? [] : q.candidates
  const listed = [...candidates, ...picks.filter((p) => !candidates.includes(p))]

  const entityStates: Record<string, EntityState> = {}
  const marks: Record<string, PickMark> = {}
  const regionMarks: Partial<Record<RegionId, PickMark>> = {}
  if (q.type === 'entities') {
    for (const e of ENTITIES) {
      const m = markFor(e.id, picked.has(e.id), checked, answer, candidates.includes(e.id))
      if (m) marks[e.id] = m
      else entityStates[e.id] = 'dimmed'
    }
  } else if (q.type === 'regions') {
    for (const e of ENTITIES) entityStates[e.id] = 'dimmed'
    for (const id of new Set([...candidates, ...picks]) as Set<RegionId>) {
      const m = markFor(id, picked.has(id), checked, answer)
      if (m) regionMarks[id] = m
    }
  } else if (checked) {
    for (const e of ENTITIES) if (!q.highlight.includes(e.id)) entityStates[e.id] = 'dimmed'
    for (const id of q.highlight) marks[id] = 'answer'
  }

  const onSelect = (id: string) => {
    if (q.type === 'entities') toggle(id)
    else if (q.type === 'regions') toggle(entityById(id).region)
  }
  const name = (id: string) => (q.type === 'regions' ? regionById(id as RegionId).title : shortNameById(id))
  const listMark = (id: string) => (q.type === 'regions' ? regionMarks[id as RegionId] : marks[id])

  return (
    <div class="journey predict-mode">
      <Breadcrumb crumbs={breadcrumbFor({ target: cameraFor(q) })} onGo={(t) => onManual(goTo(t, reducedMotion.value))} />
      <div class="stage" ref={stage}>
        <World entityStates={entityStates} activeEdges={new Set()} marks={marks} regionMarks={regionMarks} onSelect={onSelect} onRegion={q.type === 'regions' ? toggle : undefined} />
        <Labels entityStates={entityStates} marks={marks} regionMarks={regionMarks} onSelect={onSelect} onRegion={q.type === 'regions' ? toggle : undefined} verb={q.type === 'choice' ? 'No pick in this question' : 'Toggle pick'} />
        <Minimap onManual={onManual} />
        <Legend />
      </div>
      <section class="panel quiz" aria-labelledby="quiz-title">
        <div class="eyebrow">Predict the machine · question {n + 1} of {quiz.length} · {q.source === 'reviewer' ? 'reviewer question' : `scenario · ${catalogCode(entryBySlug(q.journey!)!.id)}`}</div>
        <h2 id="quiz-title">{q.title}</h2>
        <p class="story">{q.prompt}</p>
        <p class="quiz-hint">{HINT[q.type]}</p>
        {earlier && <p class="quiz-earlier"><span class={earlier.correct ? 'ok' : 'bad'}>answered {earlier.correct ? '✓' : '✗'} earlier</span></p>}
        <ul class="plain picks" aria-label={q.type === 'choice' ? 'Outcomes' : 'Picks'}>
          {q.type === 'choice'
            ? q.options.map((o, i) => {
              const id = String(i), mine = picked.has(id)
              const m = markFor(id, mine, checked, answer)
              return <li key={o}><button aria-pressed={mine} onClick={() => toggle(id)}>{o}{m && checked && <span class={`chip chip-mark-${m}`}>{MARK_CHIP[m]}</span>}</button></li>
            })
            : listed.map((id) => {
              const m = listMark(id)
              return <li key={id}><button aria-pressed={picked.has(id)} onClick={() => toggle(id)}>{name(id)}{m && MARK_CHIP[m] && <span class={`chip chip-mark-${m}`}>{MARK_CHIP[m]}</span>}</button></li>
            })}
        </ul>
        <div class="quiz-actions">
          <button onClick={check} disabled={!picks.length}>Check</button>
          <button onClick={() => set({ picks: [], checked: false })} disabled={!picks.length && !checked}>Clear picks</button>
        </div>
        <div aria-live="polite">
          {result && (
            <div class={`feedback ${result.correct ? 'is-correct' : 'is-wrong'}`}>
              <p><strong class={result.correct ? 'ok' : 'bad'}>{result.correct ? 'Correct.' : 'Not quite.'}</strong>{' '}
                {q.type === 'choice'
                  ? !result.correct && <>The answer is: {q.options[q.answer]}</>
                  : <>You found {result.hits.length} of {q.answer.length}.
                    {result.missed.length > 0 && <> Missed: {result.missed.map(name).join(', ')}.</>}
                    {result.extra.length > 0 && <> Extra: {result.extra.map(name).join(', ')}.</>}</>}
              </p>
              <p class="why">{q.why}</p>
              <ul class="plain replays">
                {q.replays.map((r) => {
                  const e = entryBySlug(r.journey)!
                  return <li key={`${r.journey}-${r.step}`}><a href={formatRoute({ mode: 'journey', slug: r.journey, step: r.step - 1 })}>Replay: {catalogCode(e.id)} step {r.step}</a> <span class="replay-title">{e.title}</span></li>
                })}
              </ul>
            </div>
          )}
        </div>
        <button class="quiz-reset" onClick={reset}>Reset progress</button>
      </section>
      <div class="transport" role="toolbar" aria-label="Question controls">
        <button onClick={() => onGo(n - 1)} disabled={n === 0} aria-label="Previous question">◀ Prev</button>
        <span class="quiz-counter" aria-live="polite">{n + 1} / {quiz.length}</span>
        <span class="quiz-progress">answered {sum.answered}/{sum.total} · correct {sum.correct}</span>
        <button onClick={() => onGo(n + 1)} disabled={n === quiz.length - 1} aria-label="Next question">Next ▶</button>
      </div>
    </div>
  )
}
