// src/ui/StepPanel.tsx
import { useState } from 'preact/hooks'
import type { ComponentChildren, RefObject } from 'preact'
import type { Journey, WorldState, EntityState } from '../domain/types'
import { entityById } from '../domain/entities'
import { checkId, journeyId, progress } from '../domain/progress'
import { STEP_INTERNALS_KEY, sessionFlags } from '../domain/sessionFlags'

const GROUPS: { state: EntityState; label: string }[] = [
  { state: 'new', label: 'New' }, { state: 'replaced', label: 'Replaced' }, { state: 'kept', label: 'Kept' },
  { state: 'invalid', label: 'Invalidated' }, { state: 'stale', label: 'Stale' }
]

/** header and expanded: the tablet bottom sheet's handle row and state (on phones, the room toggle of an open code lens); lens: the code lens, on journeys that have one */
export function StepPanel({ journey, world, showText, header, expanded, lens, panelRef }: { journey: Journey; world: WorldState; showText: boolean; header?: ComponentChildren; expanded?: boolean; lens?: ComponentChildren; panelRef?: RefObject<HTMLElement> }) {
  const { step } = world
  /** §4: collapsed by default at every width (so also at 1024–1199px, §9); the open state holds for the session */
  const [internals, setInternals] = useState(() => sessionFlags.get(STEP_INTERNALS_KEY) ?? false)
  const setOpen = (open: boolean) => { setInternals(open); sessionFlags.set(STEP_INTERNALS_KEY, open) }
  /** the summary toggles through state at once (the toggle event comes a task later, after a quick reload could already have run); onToggle catches any other opening */
  const onSummary = (e: Event) => { e.preventDefault(); setOpen(!internals) }
  const onToggle = (e: Event) => { const open = (e.currentTarget as HTMLDetailsElement).open; if (open !== internals) setOpen(open) }
  const [local, setLocal] = useState<{ id: string; picked: number | null; answers: Record<number, boolean> }>({ id: step.id, picked: null, answers: {} })
  const { picked, answers } = local.id === step.id ? local : { picked: null, answers: {} as Record<number, boolean> }
  const pick = (i: number) => { setLocal({ id: step.id, picked: i, answers }); progress.record(journeyId(journey.slug, step.id), i === step.question!.answer) }
  const answer = (i: number, v: boolean) => { setLocal({ id: step.id, picked, answers: { ...answers, [i]: v } }); progress.record(checkId(step.id, i), v === step.checks![i].isTrue) }
  const earlier = (id: string, shown: boolean) => { const a = shown ? undefined : progress.get(id); return a && <span class={a.correct ? 'ok' : 'bad'}> answered {a.correct ? '✓' : '✗'} earlier</span> }
  /** the takeaway spells out the predict answer, so on a predict step it waits for a pick */
  const canShowClick = !step.question || picked !== null
  const groups = GROUPS.map((g) => ({ ...g, ids: Object.entries(world.entityStates).filter(([, s]) => s === g.state).map(([id]) => id) })).filter((g) => g.ids.length)
  return (
    <section class={`panel ${expanded ? 'is-expanded' : ''}`} aria-labelledby="step-title" ref={panelRef}>
      {header}
      <div class="eyebrow">{journey.title} · step {world.stepIndex + 1} of {journey.steps.length}</div>
      <h2 id="step-title">{step.title}</h2>
      {world.token && <div class="following">Following: {world.token.label}</div>}
      <p class="story">{step.story}</p>
      {groups.length > 0 && (
        <dl>{groups.map((g) => <><dt key={`t-${g.state}`}>{g.label}</dt><dd key={`d-${g.state}`}>{g.ids.map((id) => entityById(id).name.split(' · ')[0]).join(', ')}</dd></>)}</dl>
      )}
      {lens}
      {step.question && (
        <div class="predict">
          <p><strong>Predict:</strong> {step.question.text}{earlier(journeyId(journey.slug, step.id), picked !== null)}</p>
          <ul class="plain">{step.question.options.map((o, i) => (
            <li key={o}><button aria-pressed={picked === i} onClick={() => pick(i)}>{o}</button>{picked !== null && i === step.question!.answer && <span class="ok"> ✓</span>}</li>
          ))}</ul>
          {picked !== null && <p class="why">{picked === step.question.answer ? 'Right. ' : 'Not quite. '}{step.question.why}</p>}
        </div>
      )}
      {step.checks && (
        <div>
          <p><strong>Check yourself</strong></p>
          {step.checks.map((c, i) => (
            <div class="check" key={c.statement}>
              <p>{c.statement}{earlier(checkId(step.id, i), answers[i] !== undefined)}</p>
              <button onClick={() => answer(i, true)} aria-pressed={answers[i] === true}>True</button>
              <button onClick={() => answer(i, false)} aria-pressed={answers[i] === false}>False</button>
              {answers[i] !== undefined && <p class="why"><span class={answers[i] === c.isTrue ? 'ok' : 'bad'}>{answers[i] === c.isTrue ? 'Correct.' : 'Incorrect.'}</span> {c.why}</p>}
            </div>
          ))}
        </div>
      )}
      {canShowClick && <div class="click" aria-label="What should click">{journey.whatShouldClick}</div>}
      {(step.internals?.length || step.sources?.length) && (
        <details open={internals} onToggle={onToggle}>
          <summary onClick={onSummary}>Internals</summary>
          {step.internals && <ul>{step.internals.map((l) => <li key={l}><code>{l}</code></li>)}</ul>}
          {step.sources && <ul>{step.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>}
        </details>
      )}
      {showText && <p class="text-equivalent">{world.text}</p>}
      <p class="visually-hidden" aria-live="polite">{world.text}</p>
    </section>
  )
}
