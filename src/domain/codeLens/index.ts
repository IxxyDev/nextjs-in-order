// src/domain/codeLens/index.ts
import type { CodeLens, Fate, LensStep, SpecimenFile } from '../types'
import { JOURNEY_CATALOG } from '../journeys'
import { createLazyCatalog } from '../lazyCatalog'

/** what a journey's lens needs: its steps plus the specimen and fate legend they refer to */
export interface LensBundle { lens: CodeLens; specimen: SpecimenFile[]; fates: Fate[] }

/**
 * one lazy chunk per journey, keyed by slug: ./<slug>.ts exports STEPS (empty until that lens is written).
 * Literal import() paths so the bundler splits each one out of the index chunk.
 */
const STEPS: Record<string, () => Promise<{ STEPS: LensStep[] }>> = {
  'whole-lifecycle': () => import('./whole-lifecycle'),
  'production-build': () => import('./production-build'),
  'request-routing': () => import('./request-routing'),
  'pages-initial': () => import('./pages-initial'),
  'pages-navigation': () => import('./pages-navigation'),
  'app-initial': () => import('./app-initial'),
  'app-navigation': () => import('./app-navigation'),
  'server-actions': () => import('./server-actions'),
  caching: () => import('./caching'),
  'dev-mode': () => import('./dev-mode'),
  'custom-server': () => import('./custom-server'),
  optimizations: () => import('./optimizations')
}

const entries = JOURNEY_CATALOG.filter((j) => STEPS[j.slug]).map((j) => ({
  slug: j.slug,
  load: () => Promise.all([STEPS[j.slug](), import('./specimen')])
    .then(([m, s]): LensBundle => ({ lens: { journey: j.id, steps: m.STEPS }, specimen: s.SPECIMEN, fates: s.FATES }))
}))
const catalog = createLazyCatalog<LensBundle>(entries)

/** journeys registered for a lens; one whose STEPS is still empty renders none */
export const hasLens = (slug: string) => entries.some((e) => e.slug === slug)
export const peekLens = catalog.peek
export const loadLens = catalog.load
export const loadAllLenses = catalog.loadAll
