// src/ui/App.tsx
import { useEffect, useState } from 'preact/hooks'
import { DEFAULT_COMPARE, DEFAULT_JOURNEY, clampIndex, parseRoute, formatRoute } from '../domain/route'
import type { Route } from '../domain/types'
import { entryBySlug, JOURNEY_CATALOG, loadAllJourneys, loadJourney, peekJourney } from '../domain/journeys'
import { COMPARE_CATALOG, compareBySlug, loadCompare, peekCompare } from '../domain/compare'
import { loadQuiz, peekQuiz } from '../domain/predict'
import { progress, quizId } from '../domain/progress'
import { catalogCode } from '../domain/catalogCode'
import { JourneyView } from './JourneyView'
import { AtlasView } from './AtlasView'
import { CompareView } from './CompareView'
import { PredictView } from './PredictView'
import { MenuSelect } from './MenuSelect'
import { useLazy } from './useLazy'

const VERSION_NOTE = 'Articles: Next.js 15→16 era (2025) · verified against Next.js 16.3 (Sept 2026)'

/** the step count, then the progress mark once anything is answered: ✓ when every answer is right, else answered/total */
function journeyMeta(slug: string): string | undefined {
  const j = peekJourney(slug)
  if (!j) return undefined
  const steps = `${j.steps.length} steps`
  const { answered, correct, total } = progress.summaryForJourney(j)
  if (answered === 0) return steps
  return `${steps} · ${answered === total && correct === total ? '✓' : `${answered}/${total}`}`
}

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
  const slug = route.mode === 'journey' ? entryBySlug(route.slug)?.slug ?? DEFAULT_JOURNEY : undefined
  const journeyLoad = useLazy(slug, peekJourney, loadJourney)
  const journey = journeyLoad.value
  const pairSlug = route.mode === 'compare' ? compareBySlug(route.slug)?.slug ?? DEFAULT_COMPARE : undefined
  const pairLoad = useLazy(pairSlug, peekCompare, loadCompare)
  const pair = pairLoad.value
  const quizLoad = useLazy(route.mode === 'predict' ? 'quiz' : undefined, peekQuiz, loadQuiz)
  const quiz = quizLoad.value
  const [, setLoaded] = useState(0)
  const loadOr = ({ isFailed, retry }: { isFailed: boolean; retry: () => void }, what: string, message: string) =>
    isFailed ? <LoadFailed what={what} onRetry={retry} /> : <p class="loading" role="status">{message}</p>
  /** progress meta needs every journey; their chunks load on the first menu open, not on mount */
  const [wantAll, setWantAll] = useState(false)
  /** a failed chunk here only leaves some progress meta blank; the menu retries on its next open */
  useEffect(() => { if (wantAll) loadAllJourneys().then(() => setLoaded((n) => n + 1), () => setWantAll(false)) }, [wantAll])
  useEffect(() => {
    if (route.mode === 'predict' && quiz && clampIndex(route.n, quiz.length) !== route.n) go({ mode: 'predict', n: clampIndex(route.n, quiz.length), cam: route.cam })
  }, [route, quiz])
  useEffect(() => {
    if (route.mode === 'compare' && pair && (pair.slug !== route.slug || clampIndex(route.step, pair.steps.length) !== route.step)) go({ mode: 'compare', slug: pair.slug, step: clampIndex(route.step, pair.steps.length) })
  }, [route, pair])
  useEffect(() => {
    if (route.mode === 'journey' && journey && (journey.slug !== route.slug || clampIndex(route.step, journey.steps.length) !== route.step)) go({ mode: 'journey', slug: journey.slug, step: clampIndex(route.step, journey.steps.length), cam: route.cam })
  }, [route, journey])
  return (
    <div class="app">
      <header class="app-header">
        <h1>Next.js <em>Under the Hood</em></h1>
        <nav aria-label="Modes">
          <MenuSelect id="journey-select" label="Journey" placeholder="Journeys…" value={slug} options={JOURNEY_CATALOG.map((j) => ({ value: j.slug, code: catalogCode(j.id), title: j.title, meta: journeyMeta(j.slug) }))} onChange={(slug) => go({ mode: 'journey', slug, step: 0 })} onOpen={() => setWantAll(true)} />
          <MenuSelect id="compare-select" label="Compare" placeholder="Compare…" value={pairSlug} options={COMPARE_CATALOG.map((c) => ({ value: c.slug, code: catalogCode(c.id), title: c.title }))} onChange={(slug) => go({ mode: 'compare', slug, step: 0 })} />
          <a href={formatRoute({ mode: 'atlas' })} aria-current={route.mode === 'atlas' ? 'page' : undefined}>System Atlas</a>
          <a href={formatRoute({ mode: 'predict', n: 0 })} aria-current={route.mode === 'predict' ? 'page' : undefined}>Predict</a>
        </nav>
        <span class="version-chip">{VERSION_NOTE}</span>
      </header>
      {route.mode === 'predict'
        ? quiz ? <PredictView key={route.n} quiz={quiz} n={clampIndex(route.n, quiz.length)} cam={route.cam} onGo={(n) => go({ mode: 'predict', n: clampIndex(n, quiz.length) })} onAnswered={(id, correct) => progress.record(quizId(id), correct)} /> : loadOr(quizLoad, 'the questions', 'Loading questions…')
        : route.mode === 'compare'
        ? pair ? <CompareView key={pair.slug} pair={pair} step={clampIndex(route.step, pair.steps.length)} onStep={(n) => go({ mode: 'compare', slug: pair.slug, step: clampIndex(n, pair.steps.length) })} /> : loadOr(pairLoad, 'this comparison', 'Loading comparison…')
        : route.mode === 'journey'
        ? journey ? <JourneyView journey={journey} step={clampIndex(route.step, journey.steps.length)} cam={route.cam} onStep={(n) => go({ mode: 'journey', slug: journey.slug, step: clampIndex(n, journey.steps.length) })} /> : loadOr(journeyLoad, 'this journey', 'Loading journey…')
        : <AtlasView entity={route.mode === 'atlas' ? route.entity : undefined} cam={route.mode === 'atlas' ? route.cam : undefined} onSelect={(id) => go({ mode: 'atlas', ...(id ? { entity: id } : {}) })} />}
    </div>
  )
}
