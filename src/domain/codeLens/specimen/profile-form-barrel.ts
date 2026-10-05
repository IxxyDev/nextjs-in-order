import type { SpecimenFile } from '../../types'
import { X } from './fates'

/** J1 step 5 / J11 step 5: a named import from a barrel package listed in optimizePackageImports (NC5) */
export const FILE: SpecimenFile = {
  path: 'components/ProfileForm.tsx', component: 'ProfileForm', entity: 'src-profile-form',
  variant: 'J1, J11: a button from a barrel package', abridged: 'the rest as in the app',
  lines: [
    { id: 'PB1', text: "import { Button } from 'ui-kit'", fate: X, journeys: ['j1', 'j11'], note: 'rewritten to the one file that defines Button' }
  ]
}
