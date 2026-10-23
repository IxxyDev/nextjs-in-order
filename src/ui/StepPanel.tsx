import { useState } from 'preact/hooks'
import type { ComponentChildren, RefObject } from 'preact'
import type { Journey, WorldState, ChipState, MisconceptionCheck, PredictQuestion } from '../domain/types'
import { shortNameById } from '../domain/entities'
import { checkId, journeyId, progress } from '../domain/progress'
import { STATE_LABEL } from '../domain/stateLabel'
import { STEP_INTERNALS_KEY } from '../domain/sessionFlags'
import { Internals } from './Internals'

/** the changed / kept list (§3.1) */
const GROUPED: ChipState[] = ['new', 'replaced', 'kept', 'invalid', 'stale']

/** header and expanded: the tablet bottom sheet's handle row and state (on phones, the room toggle of an open code lens); lens: the code lens, on journeys that have one */
export function StepPanel({ journey, world, showText, header, expanded, lens, panelRef }: { journey: Journey; world: WorldState; showText: boolean; header?: ComponentChildren; expanded?: boolean; lens?: ComponentChildren; panelRef?: RefObject<HTMLElement> }) {
  const { step } = world
  const whatShouldClick = <div class="click" aria-label="What should click">{journey.whatShouldClick}</div>
  const groups = GROUPED.map((state) => ({ state, ids: Object.entries(world.entityStates).filter(([, s]) => s === state).map(([id]) => id) })).filter((g) => g.ids.length)
  return (
    <section class={`panel ${expanded ? 'is-expanded' : ''}`} aria-labelledby="step-title" ref={panelRef}>
      {header}
      <div class="eyebrow">{journey.title} · step {world.stepIndex + 1} of {journey.steps.length}</div>
      <h2 id="step-title">{step.title}</h2>
      {world.token && <div class="following">Following: {world.token.label}</div>}
      <p class="story">{step.story}</p>
      {step.checks && <><Checks key={step.id} stepId={step.id} checks={step.checks} />{whatShouldClick}</>}
      {groups.length > 0 && (
        <dl>{groups.map((g) => <><dt key={`t-${g.state}`}>{STATE_LABEL[g.state]}</dt><dd key={`d-${g.state}`}>{g.ids.map(shortNameById).join(', ')}</dd></>)}</dl>
      )}
      {lens}
      {step.question && <StepQuestion key={step.id} progressId={journeyId(journey.slug, step.id)} question={step.question} whatShouldClick={whatShouldClick} />}
      {!step.checks && !step.question && whatShouldClick}
      <Internals flagKey={STEP_INTERNALS_KEY} internals={step.internals} sources={step.sources} />
      {showText && <p class="text-equivalent">{world.text}</p>}
      <p class="visually-hidden" aria-live="polite">{world.text}</p>
    </section>
  )
}

interface StepQuestionProps {
  progressId: string
  question: PredictQuestion
  /** What should click: it spells out the answer, so it waits for a pick, on this visit or an earlier one */
  whatShouldClick: ComponentChildren
}

function StepQuestion({ progressId, question, whatShouldClick }: StepQuestionProps) {
  const [picked, setPicked] = useState<number>()
  const pick = (i: number) => { setPicked(i); progress.record(progressId, i === question.answer) }
  const isPicked = picked !== undefined
  return (
    <>
      <div class="predict">
        <p><strong>Predict:</strong> {question.text}{!isPicked && <Earlier progressId={progressId} />}</p>
        <ul class="plain">{question.options.map((o, i) => (
          <li key={o}><button aria-pressed={picked === i} onClick={() => pick(i)}>{o}</button>{isPicked && i === question.answer && <span class="ok"> ✓</span>}</li>
        ))}</ul>
        {isPicked && <p class="why">{picked === question.answer ? 'Right. ' : 'Not quite. '}{question.why}</p>}
      </div>
      {(isPicked || progress.get(progressId)) && whatShouldClick}
    </>
  )
}

interface ChecksProps {
  stepId: string
  checks: MisconceptionCheck[]
}

/** a check step shows these and What should click right after the story, before the code lens: j0-10's lens is open (code-lens.md rule 7) and would push them a screen down */
function Checks({ stepId, checks }: ChecksProps) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const answer = (i: number, value: boolean) => { setAnswers({ ...answers, [i]: value }); progress.record(checkId(stepId, i), value === checks[i].isTrue) }
  return (
    <div>
      <p><strong>Check yourself</strong></p>
      {checks.map((c, i) => (
        <div class="check" key={c.statement}>
          <p>{c.statement}{answers[i] === undefined && <Earlier progressId={checkId(stepId, i)} />}</p>
          <button onClick={() => answer(i, true)} aria-pressed={answers[i] === true}>True</button>
          <button onClick={() => answer(i, false)} aria-pressed={answers[i] === false}>False</button>
          {answers[i] !== undefined && <p class="why"><span class={answers[i] === c.isTrue ? 'ok' : 'bad'}>{answers[i] === c.isTrue ? 'Correct.' : 'Incorrect.'}</span> {c.why}</p>}
        </div>
      ))}
    </div>
  )
}

/** the answer kept from an earlier visit, shown until this visit answers */
function Earlier({ progressId }: { progressId: string }) {
  const a = progress.get(progressId)
  return a ? <span class={a.correct ? 'ok' : 'bad'}> answered {a.correct ? '✓' : '✗'} earlier</span> : null
}
