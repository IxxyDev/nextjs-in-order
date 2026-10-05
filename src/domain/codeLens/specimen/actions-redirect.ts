import type { SpecimenFile } from '../../types'
import { S } from './fates'

/** J7 step 16: the action ends in redirect() instead of returning { ok: true } (AC7) */
export const FILE: SpecimenFile = {
  path: 'app/actions.ts', component: 'updateProfile', entity: 'src-actions',
  variant: 'J7: redirect() after the update', abridged: 'the rest as in the app',
  lines: [
    { id: 'AR1', text: "import { redirect } from 'next/navigation'", fate: S, journeys: ['j7'] },
    { id: 'AR2', text: "  redirect('/dashboard/billing')", fate: S, journeys: ['j7'], note: 'replaces AC7: throws, the response carries x-action-redirect instead of f' }
  ]
}
