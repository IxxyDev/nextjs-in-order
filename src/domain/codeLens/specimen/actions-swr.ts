import type { SpecimenFile } from '../../types'
import { S } from './fates'

/** J7 step 13 / J8 step 18: the stale-while-revalidate alternative to updateTag (AC2, AC6) */
export const FILE: SpecimenFile = {
  path: 'app/actions.ts', component: 'updateProfile', entity: 'src-actions',
  variant: 'J7, J8: revalidateTag instead of updateTag', abridged: 'the rest as in the app',
  lines: [
    { id: 'AV1', text: "import { revalidateTag } from 'next/cache'", fate: S, journeys: ['j7', 'j8'] },
    { id: 'AV2', text: "  revalidateTag('profile', 'max')", fate: S, journeys: ['j7', 'j8'], note: 'marks stale only: no f in the response' }
  ]
}
