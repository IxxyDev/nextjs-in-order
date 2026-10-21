import type { SpecimenFile } from '../../types'
import { CLIENT_BOUNDARY, SERVER_ONLY } from './fates'

/** J11 step 6: ProfileForm behind next/dynamic; the import() call is a chunk boundary */
export const FILE: SpecimenFile = {
  path: 'app/dashboard/settings/page.tsx', component: 'SettingsPage', entity: 'src-settings-page',
  variant: 'J11: ProfileForm behind next/dynamic', abridged: 'the rest as in the app',
  lines: [
    { id: 'SD1', text: "import dynamic from 'next/dynamic'", fate: SERVER_ONLY, journeys: ['j11'] },
    { id: 'SD2', text: "const ProfileForm = dynamic(() => import('@/components/ProfileForm'), { loading: () => <p>Loading form…</p> })", fate: CLIENT_BOUNDARY, journeys: ['j11'], note: 'replaces SP3: its own chunk, fetched on first render' }
  ]
}
