// src/ui/App.tsx
import { useEffect, useState } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
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

export function App() {
  const [route, go] = useRoute()
  const [, setLoaded] = useState(0)
  /** progress meta needs every journey; their chunks load on the first menu open, not on mount */
  const [wantAll, setWantAll] = useState(false)
  /** a failed chunk here only leaves some progress meta blank; the menu retries on its next open */
  useEffect(() => { if (wantAll) loadAllJourneys().then(() => setLoaded((n) => n + 1), () => setWantAll(false)) }, [wantAll])
  const Page = pageMap[route.mode] as FunctionComponent<PageProps<Route['mode']>>
  return (
    <div class="app">
      <header class="app-header">
        <h1>Next.js <em>Under the Hood</em></h1>
        <nav aria-label="Modes">
          <MenuSelect id="journey-select" label="Journey" placeholder="Journeys…" value={route.mode === 'journey' ? route.slug : undefined} options={JOURNEY_CATALOG.map((j) => ({ value: j.slug, code: catalogCode(j.id), title: j.title, meta: journeyMeta(j.slug) }))} onChange={(slug) => go({ mode: 'journey', slug, step: 0 })} onOpen={() => setWantAll(true)} />
          <MenuSelect id="compare-select" label="Compare" placeholder="Compare…" value={route.mode === 'compare' ? route.slug : undefined} options={COMPARE_CATALOG.map((c) => ({ value: c.slug, code: catalogCode(c.id), title: c.title }))} onChange={(slug) => go({ mode: 'compare', slug, step: 0 })} />
          <a href={formatRoute({ mode: 'atlas' })} aria-current={route.mode === 'atlas' ? 'page' : undefined}>System Atlas</a>
          <a href={formatRoute({ mode: 'predict', n: 0 })} aria-current={route.mode === 'predict' ? 'page' : undefined}>Predict</a>
        </nav>
        <span class="version-chip">{VERSION_NOTE}</span>
      </header>
      <Page route={route} go={go} />
    </div>
  )
}

function JourneyPage({ route, go }: PageProps<'journey'>) {
  const load = useLazy(entryBySlug(route.slug)?.slug ?? DEFAULT_JOURNEY, peekJourney, loadJourney)
  const journey = load.value
  const step = journey ? clampIndex(route.step, journey.steps.length) : 0
  useCanonicalRoute(route, journey && { ...route, slug: journey.slug, step }, go)
  if (!journey) return <LoadStatus isFailed={load.isFailed} retry={load.retry} what="this journey" message="Loading journey…" />
  return <JourneyView journey={journey} step={step} cam={route.cam} onStep={(n) => go({ mode: 'journey', slug: journey.slug, step: clampIndex(n, journey.steps.length) })} />
}

function ComparePage({ route, go }: PageProps<'compare'>) {
  const load = useLazy(compareBySlug(route.slug)?.slug ?? DEFAULT_COMPARE, peekCompare, loadCompare)
  const pair = load.value
  const step = pair ? clampIndex(route.step, pair.steps.length) : 0
  useCanonicalRoute(route, pair && { ...route, slug: pair.slug, step }, go)
  if (!pair) return <LoadStatus isFailed={load.isFailed} retry={load.retry} what="this comparison" message="Loading comparison…" />
  return <CompareView key={pair.slug} pair={pair} step={step} onStep={(n) => go({ mode: 'compare', slug: pair.slug, step: clampIndex(n, pair.steps.length) })} />
}

function PredictPage({ route, go }: PageProps<'predict'>) {
  const load = useLazy('quiz', peekQuiz, loadQuiz)
  const quiz = load.value
  const n = quiz ? clampIndex(route.n, quiz.length) : 0
  useCanonicalRoute(route, quiz && { ...route, n }, go)
  if (!quiz) return <LoadStatus isFailed={load.isFailed} retry={load.retry} what="the questions" message="Loading questions…" />
  return <PredictView key={quiz[n].id} quiz={quiz} n={n} cam={route.cam} onGo={(next) => go({ mode: 'predict', n: clampIndex(next, quiz.length) })} onAnswered={(id, correct) => progress.record(quizId(id), correct)} />
}

function AtlasPage({ route, go }: PageProps<'atlas'>) {
  return <AtlasView entity={route.entity} cam={route.cam} onSelect={(id) => go({ mode: 'atlas', ...(id ? { entity: id } : {}) })} />
}

const pageMap: { [M in Route['mode']]: FunctionComponent<PageProps<M>> } = {
  journey: JourneyPage,
  compare: ComparePage,
  predict: PredictPage,
  atlas: AtlasPage
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

/** once the entry has loaded, a route naming an unknown slug or an out-of-range step or question gives way to its canonical form */
function useCanonicalRoute(route: Route, canonical: Route | undefined, go: (r: Route) => void) {
  const canonicalHash = canonical && formatRoute(canonical)
  useEffect(() => { if (canonical && canonicalHash !== formatRoute(route)) go(canonical) }, [route, canonicalHash])
}

/** the step count, then the progress mark once anything is answered: ✓ when every answer is right, else answered/total */
function journeyMeta(slug: string): string | undefined {
  const j = peekJourney(slug)
  if (!j) return undefined
  const steps = `${j.steps.length} steps`
  const { answered, correct, total } = progress.summaryForJourney(j)
  if (answered === 0) return steps
  return `${steps} · ${answered === total && correct === total ? '✓' : `${answered}/${total}`}`
}

/** the loading message, or once the chunk fails the failure with Retry; the catalogs retry a failed load on the next call */
function LoadStatus({ isFailed, retry, what, message }: { isFailed: boolean; retry: () => void; what: string; message: string }) {
  if (isFailed) return <div class="loading" role="alert"><p>Couldn't load {what}.</p><button onClick={retry}>Retry</button></div>
  return <p class="loading" role="status">{message}</p>
}

interface PageProps<M extends Route['mode']> {
  route: Extract<Route, { mode: M }>
  go: (r: Route) => void
}
