import type { ComponentChildren } from 'preact'
import { entityById, shortNameById } from '../domain/entities'
import { regionById } from '../domain/regions'
import { lazyAllJourneys } from '../domain/journeys'
import { appearancesOf } from '../domain/appearances'
import { formatRoute } from '../domain/route'
import { INSPECTOR_INTERNALS_KEY } from '../domain/sessionFlags'
import { Internals } from './Internals'
import { useLazy } from './useLazy'

export function Inspector({ id, onClose }: { id: string; onClose: () => void }) {
  const e = entityById(id)
  /** journeys already loaded are used at once; otherwise the catalog loads each chunk once and keeps it */
  const { value: journeys, isFailed, retry } = useLazy(lazyAllJourneys)
  const appearances = journeys ? appearancesOf(journeys, id) : []
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
        <dt>Connected through</dt><dd>{e.connects.length ? e.connects.map(shortNameById).join(', ') : '—'}</dd>
        {e.history && <><dt>History</dt><dd><ol class="history">{e.history.map((h) => <li key={h.version}><strong>{h.version}</strong> {h.text}</li>)}</ol></dd></>}
        <dt>Crosses to the browser</dt><dd>{e.reaches === 'no' ? 'no' : e.reaches === 'code' ? 'yes, as code' : `yes, as ${e.reaches}`}</dd>
        <dt>Appears in</dt>
        <dd>{isFailed ? <span role="alert">Couldn't load the journeys. <button onClick={retry}>Retry</button></span> : !journeys ? '…' : appearances.length ? appearances.map(({ journey: j, step: i }) => <a key={`${j.id}-${i}`} href={formatRoute({ mode: 'journey', slug: j.slug, step: i })}>{j.title} · step {i + 1}</a>).reduce<ComponentChildren[]>((acc, el, k) => (k ? [...acc, ', ', el] : [el]), []) : '—'}</dd>
      </dl>
      {e.versionNote && (
        <div class="version-note">
          <strong>Article snapshot:</strong> {e.versionNote.article}<br />
          <strong>Current Next.js:</strong> {e.versionNote.current}<br />
          <strong>Why it matters:</strong> {e.versionNote.why}
        </div>
      )}
      <Internals flagKey={INSPECTOR_INTERNALS_KEY} internals={e.internals} sources={e.sources} />
    </aside>
  )
}
