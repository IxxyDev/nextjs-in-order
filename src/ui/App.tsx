// src/ui/App.tsx
import { useEffect, useState } from 'preact/hooks'
import { parseRoute, formatRoute } from '../domain/route'
import type { Route } from '../domain/types'
import { journeyBySlug, JOURNEYS } from '../domain/journeys'
import { clampStep } from '../domain/worldState'
import { JourneyView } from './JourneyView'
import { AtlasView } from './AtlasView'

const VERSION_NOTE = 'Articles: Next.js 15→16 era (2025) · verified against Next.js 16.3 (Sept 2026)'

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
  const journey = route.mode === 'journey' ? (journeyBySlug(route.slug) ?? JOURNEYS[0]) : undefined
  useEffect(() => {
    if (route.mode === 'journey' && journey && (journey.slug !== route.slug || clampStep(journey, route.step) !== route.step)) go({ mode: 'journey', slug: journey.slug, step: clampStep(journey, route.step) })
  }, [route])
  return (
    <div class="app">
      <header class="app-header">
        <h1>Next.js <em>Under the Hood</em></h1>
        <nav aria-label="Modes">
          <label class="visually-hidden" for="journey-select">Journey</label>
          <select id="journey-select" value={route.mode === 'journey' && journey ? journey.slug : ''} onChange={(e) => { const slug = (e.currentTarget as HTMLSelectElement).value; if (slug) go({ mode: 'journey', slug, step: 0 }) }}>
            <option value="" disabled>Journeys…</option>
            {JOURNEYS.map((j) => <option key={j.id} value={j.slug}>J{j.id.slice(1)} · {j.title}</option>)}
          </select>
          <a href={formatRoute({ mode: 'atlas' })} aria-current={route.mode === 'atlas' ? 'page' : undefined}>System Atlas</a>
        </nav>
        <span class="version-chip">{VERSION_NOTE}</span>
      </header>
      {route.mode === 'journey' && journey
        ? <JourneyView journey={journey} step={clampStep(journey, route.step)} onStep={(n) => go({ mode: 'journey', slug: journey.slug, step: clampStep(journey, n) })} />
        : <AtlasView entity={route.mode === 'atlas' ? route.entity : undefined} onSelect={(id) => go({ mode: 'atlas', ...(id ? { entity: id } : {}) })} />}
    </div>
  )
}
