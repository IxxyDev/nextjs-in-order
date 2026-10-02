// src/ui/Inspector.tsx
import { useEffect, useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { entityById } from '../domain/entities'
import { regionById } from '../domain/regions'
import { JOURNEY_CATALOG, loadAllJourneys, peekJourney } from '../domain/journeys'
import type { Journey } from '../domain/types'
import { formatRoute } from '../domain/route'

export function Inspector({ id, onClose }: { id: string; onClose: () => void }) {
  const e = entityById(id)
  const [internals, setInternals] = useState(false)
  /** journeys already loaded are used at once; otherwise the catalog loads each chunk once and keeps it */
  const [journeys, setJourneys] = useState<Journey[] | undefined>(() => { const js = JOURNEY_CATALOG.map((e) => peekJourney(e.slug)); return js.every(Boolean) ? js as Journey[] : undefined })
  const [failed, setFailed] = useState(false)
  const live = useRef(true)
  const load = () => {
    setFailed(false)
    loadAllJourneys().then((js) => { if (live.current) setJourneys(js) }, () => { if (live.current) setFailed(true) })
  }
  useEffect(() => {
    if (!journeys) load()
    return () => { live.current = false }
  }, [])
  const appearances = journeys ? journeys.flatMap((j) => j.steps.map((s, i) => ({ j, s, i })).filter(({ s }) => s.states[id] || s.token?.at === id)) : []
  return (
    <aside class="inspector" aria-label={`Inspector: ${e.name}`}>
      <button class="close" onClick={onClose} aria-label="Close inspector">✕</button>
      <h3>{e.name}</h3>
      <p>{e.what}</p>
      <dl>
        <dt>Region</dt><dd>{regionById(e.region).title}</dd>
        <dt>Runs in</dt><dd>{e.env.join(', ')}</dd>
        <dt>Exists during</dt><dd>{e.exists} ({e.phase.join(', ')})</dd>
        <dt>Consumes</dt><dd>{e.consumes.join('; ') || '—'}</dd>
        <dt>Produces</dt><dd>{e.produces.join('; ') || '—'}</dd>
        <dt>Connected through</dt><dd>{e.connects.length ? e.connects.map((c) => entityById(c).name.split(' · ')[0]).join(', ') : '—'}</dd>
        <dt>Crosses to the browser</dt><dd>{e.reaches === 'no' ? 'no' : e.reaches === 'code' ? 'yes, as code' : `yes, as ${e.reaches}`}</dd>
        <dt>Appears in</dt>
        <dd>{failed ? <span role="alert">Couldn't load the journeys. <button onClick={load}>Retry</button></span> : !journeys ? '…' : appearances.length ? appearances.map(({ j, i }) => <a key={`${j.id}-${i}`} href={formatRoute({ mode: 'journey', slug: j.slug, step: i })}>{j.title} · step {i + 1}</a>).reduce<ComponentChildren[]>((acc, el, k) => (k ? [...acc, ', ', el] : [el]), []) : '—'}</dd>
      </dl>
      {e.versionNote && (
        <div class="version-note">
          <strong>Article snapshot:</strong> {e.versionNote.article}<br />
          <strong>Current Next.js:</strong> {e.versionNote.current}<br />
          <strong>Why it matters:</strong> {e.versionNote.why}
        </div>
      )}
      {(e.internals?.length || e.sources?.length) && (
        <button aria-expanded={internals} onClick={() => setInternals(!internals)}>{internals ? 'Hide internals' : 'Show internals'}</button>
      )}
      {internals && (
        <div>
          {e.internals && <ul>{e.internals.map((line) => <li key={line}><code>{line}</code></li>)}</ul>}
          {e.sources && <ul>{e.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>}
        </div>
      )}
    </aside>
  )
}
