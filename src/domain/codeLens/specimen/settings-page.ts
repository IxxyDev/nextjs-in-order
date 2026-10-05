import type { SpecimenFile } from '../../types'
import { S, B, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'app/dashboard/settings/page.tsx', component: 'SettingsPage', entity: 'src-settings-page',
  lines: [
    { id: 'SP1', text: "import { getProfile } from '@/lib/data'", fate: S },
    { id: 'SP2', text: "import AccountSummary from '@/components/AccountSummary'", fate: S },
    { id: 'SP3', text: "import ProfileForm from '@/components/ProfileForm'", fate: B },
    { id: 'SP4', text: 'export default async function SettingsPage() {', fate: S, mark: 'static-shell', note: '○ route (J1 step 13)' },
    { id: 'SP5', text: '  const profile = await getProfile()', fate: S, mark: 'cached', note: 'the reason it can be ○' },
    frame('SP6', '  return ('),
    frame('SP7', '    <>'),
    { id: 'SP8', text: '      <AccountSummary profile={profile} />', fate: S, note: 'name vanishes; only <dl> rows remain' },
    { id: 'SP9', text: '      <ProfileForm name={profile.name} />', fate: B, note: 'becomes $L2 with props {"name":"Ada"}' },
    frame('SP10', '    </>'),
    frame('SP11', '  )'),
    frame('SP12', '}')
  ]
}
