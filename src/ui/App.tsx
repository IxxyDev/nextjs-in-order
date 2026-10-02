// src/ui/App.tsx
import { useEffect, useState } from 'preact/hooks'
import { parseRoute, formatRoute } from '../domain/route'
import type { Route } from '../domain/types'
import { entryBySlug, JOURNEY_CATALOG, loadJourney, peekJourney } from '../domain/journeys'
import { clampStep } from '../domain/worldState'
import { JourneyView } from './JourneyView'
import { AtlasView } from './AtlasView'

const VERSION_NOTE = 'Articles: Next.js 15→16 era (2025) · verified against Next.js 16.3 (Sept 2026)'

/** shown in place of the loading message when a chunk fails; the catalogs retry a failed load on the next call */
function LoadFailed({ what, onRetry }: { what: string; onRetry: () => void }) {
  return <div class="loading" role="alert"><p>Couldn't load {what}.</p><button onClick={onRetry}>Retry</button></div>
}

function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))
  useEffect(() => {
    const onHash = () => setRoute(parseRoute(location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return [route, (r) => { location.hash = formatRoute(r) }]
}

export function App() {
  const [route, go] = useRoute()
  const slug = route.mode === 'journey' ? (entryBySlug(route.slug) ?? JOURNEY_CATALOG[0]).slug : undefined
  const journey = slug ? peekJourney(slug) : undefined
  const [, setLoaded] = useState(0)
  /** the key of the load that failed last, cleared when it is tried again */
  const [failed, setFailed] = useState<string>()
  const load = (key: string, run: () => Promise<unknown>) => {
    setFailed(undefined)
    run().then(() => setLoaded((n) => n + 1), () => setFailed(key))
  }
  const loadOr = (key: string, what: string, message: string, run: () => Promise<unknown>) =>
    failed === key ? <LoadFailed what={what} onRetry={() => load(key, run)} /> : <p class="loading" role="status">{message}</p>
  useEffect(() => {
    if (slug && !journey) load(`journey:${slug}`, () => loadJourney(slug))
  }, [slug])
  useEffect(() => {
    if (route.mode === 'journey' && journey && (journey.slug !== route.slug || clampStep(journey, route.step) !== route.step)) go({ mode: 'journey', slug: journey.slug, step: clampStep(journey, route.step) })
  }, [route, journey])
  return (
    <div class="app">
      <header class="app-header">
        <h1>Next.js <em>Under the Hood</em></h1>
        <nav aria-label="Modes">
          <label class="visually-hidden" for="journey-select">Journey</label>
          <select id="journey-select" value={slug ?? ''} onChange={(e) => { const slug = (e.currentTarget as HTMLSelectElement).value; if (slug) go({ mode: 'journey', slug, step: 0 }) }}>
            <option value="" disabled>Journeys…</option>
            {JOURNEY_CATALOG.map((j) => <option key={j.id} value={j.slug}>J{j.id.slice(1)} · {j.title}</option>)}
          </select>
          <a href={formatRoute({ mode: 'atlas' })} aria-current={route.mode === 'atlas' ? 'page' : undefined}>System Atlas</a>
        </nav>
        <span class="version-chip">{VERSION_NOTE}</span>
      </header>
      {route.mode === 'journey'
        ? journey ? <JourneyView journey={journey} step={clampStep(journey, route.step)} onStep={(n) => go({ mode: 'journey', slug: journey.slug, step: clampStep(journey, n) })} /> : loadOr(`journey:${slug}`, 'this journey', 'Loading journey…', () => loadJourney(slug!))
        : <AtlasView entity={route.mode === 'atlas' ? route.entity : undefined} onSelect={(id) => go({ mode: 'atlas', ...(id ? { entity: id } : {}) })} />}
    </div>
  )
}
