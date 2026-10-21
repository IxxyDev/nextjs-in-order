import type { SpecimenFile } from '../../types'
import { SERVER_ONLY } from './fates'

/** J9 step 13 (edit 2, saved during next dev): AS2 with a new label */
export const FILE: SpecimenFile = {
  path: 'components/AccountSummary.tsx', component: 'AccountSummary', entity: 'src-account-summary',
  variant: 'J9: edit 2, a Server Component', abridged: 'the rest as in the app',
  lines: [
    { id: 'AE1', text: '  return <dl><dt>Email address</dt><dd>{profile.email}</dd><dt>Plan</dt><dd>{profile.plan}</dd></dl>', fate: SERVER_ONLY, journeys: ['j9'], note: 'edit 2: AS2 with a new label' }
  ]
}
