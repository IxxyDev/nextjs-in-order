import type { Journey } from '../types'
import { WHOLE_LIFECYCLE } from './whole-lifecycle'
import { APP_INITIAL } from './app-initial'

export const JOURNEYS: Journey[] = [WHOLE_LIFECYCLE, APP_INITIAL]

export function journeyBySlug(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}
