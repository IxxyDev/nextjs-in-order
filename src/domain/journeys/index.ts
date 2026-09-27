import type { Journey } from '../types'
import { WHOLE_LIFECYCLE } from './whole-lifecycle'
import { APP_INITIAL } from './app-initial'
import { APP_NAVIGATION } from './app-navigation'

export const JOURNEYS: Journey[] = [WHOLE_LIFECYCLE, APP_INITIAL, APP_NAVIGATION]

export function journeyBySlug(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}
