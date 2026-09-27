import type { Journey } from '../types'
import { WHOLE_LIFECYCLE } from './whole-lifecycle'
import { APP_INITIAL } from './app-initial'
import { APP_NAVIGATION } from './app-navigation'
import { SERVER_ACTIONS } from './server-actions'

export const JOURNEYS: Journey[] = [WHOLE_LIFECYCLE, APP_INITIAL, APP_NAVIGATION, SERVER_ACTIONS]

export function journeyBySlug(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug)
}
