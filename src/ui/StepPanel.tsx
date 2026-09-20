// src/ui/StepPanel.tsx
import { useState } from 'preact/hooks'
import type { Journey, WorldState, EntityState } from '../domain/types'
import { entityById } from '../domain/entities'

const GROUPS: { state: EntityState; label: string }[] = [
  { state: 'new', label: 'New' }, { state: 'replaced', label: 'Replaced' }, { state: 'kept', label: 'Kept' },
  { state: 'invalid', label: 'Invalidated' }, { state: 'stale', label: 'Stale' }
]

export function StepPanel({ journey, world, showText }: { journey: Journey; world: WorldState; showText: boolean }) {
  const { step } = world
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const groups = GROUPS.map((g) => ({ ...g, ids: Object.entries(world.entityStates).filter(([, s]) => s === g.state).map(([id]) => id) })).filter((g) => g.ids.length)
  return (
    <section class="panel" aria-labelledby="step-title">
      <div class="eyebrow">{journey.title} · step {world.stepIndex + 1} of {journey.steps.length}</div>
      <h2 id="step-title">{step.title}</h2>
      {world.token && <div class="following">Following: {world.token.label}</div>}
      <p class="story">{step.story}</p>
      {groups.length > 0 && (
        <dl>{groups.map((g) => <><dt key={`t-${g.state}`}>{g.label}</dt><dd key={`d-${g.state}`}>{g.ids.map((id) => entityById(id).name.split(' · ')[0]).join(', ')}</dd></>)}</dl>
      )}
      {step.question && (
        <div class="predict">
          <p><strong>Predict:</strong> {step.question.text}</p>
          <ul class="plain">{step.question.options.map((o, i) => (
            <li key={o}><button aria-pressed={picked === i} onClick={() => setPicked(i)}>{o}</button>{picked !== null && i === step.question!.answer && <span class="ok"> ✓</span>}</li>
          ))}</ul>
          {picked !== null && <p class="why">{picked === step.question.answer ? 'Right. ' : 'Not quite. '}{step.question.why}</p>}
        </div>
      )}
      {step.checks && (
        <div>
          <p><strong>Check yourself</strong></p>
          {step.checks.map((c, i) => (
            <div class="check" key={c.statement}>
              <p>{c.statement}</p>
              <button onClick={() => setAnswers({ ...answers, [i]: true })} aria-pressed={answers[i] === true}>True</button>
              <button onClick={() => setAnswers({ ...answers, [i]: false })} aria-pressed={answers[i] === false}>False</button>
              {answers[i] !== undefined && <p class="why"><span class={answers[i] === c.isTrue ? 'ok' : 'bad'}>{answers[i] === c.isTrue ? 'Correct.' : 'Incorrect.'}</span> {c.why}</p>}
            </div>
          ))}
        </div>
      )}
      <div class="click" aria-label="What should click">{journey.whatShouldClick}</div>
      {(step.internals?.length || step.sources?.length) && (
        <details>
          <summary>Internals</summary>
          {step.internals && <ul>{step.internals.map((l) => <li key={l}><code>{l}</code></li>)}</ul>}
          {step.sources && <ul>{step.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>}
        </details>
      )}
      {showText && <p class="text-equivalent">{world.text}</p>}
      <p class="visually-hidden" aria-live="polite">{world.text}</p>
    </section>
  )
}
