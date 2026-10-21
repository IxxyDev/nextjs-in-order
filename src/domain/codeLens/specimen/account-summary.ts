import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'components/AccountSummary.tsx', component: 'AccountSummary', entity: 'src-account-summary',
  lines: [
    { id: 'AS1', text: 'export default function AccountSummary({ profile }: { profile: { email: string; plan: string } }) {', fate: SERVER_ONLY },
    { id: 'AS2', text: '  return <dl><dt>Email</dt><dd>{profile.email}</dd><dt>Plan</dt><dd>{profile.plan}</dd></dl>', fate: SERVER_ONLY },
    frame('AS3', '}')
  ]
}
