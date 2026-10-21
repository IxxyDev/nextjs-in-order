import type { SpecimenFile } from '../../types'
import { ACTION, SERVER_ONLY, frame } from './fates'

/** J7 step 1/4: the second form of an action, inline in a Server Component; `secret` is captured (sealed), 'pro' is bound (plain) */
export const FILE: SpecimenFile = {
  path: 'app/dashboard/settings/page.tsx', component: 'SettingsPage', entity: 'src-settings-page',
  variant: 'J7: an inline action next to the page', abridged: 'the profile lines as in the app',
  lines: [
    { id: 'SA1', text: 'export default async function SettingsPage() {', fate: SERVER_ONLY, journeys: ['j7'] },
    { id: 'SA2', text: '  const secret = process.env.BILLING_KEY', fate: SERVER_ONLY, journeys: ['j7'], note: 'captured by the action: crosses sealed' },
    { id: 'SA3', text: '  async function upgrade(plan: string) {', fate: ACTION, journeys: ['j7'], note: 'gets its own action ID' },
    { id: 'SA4', text: "    'use server'", fate: ACTION, journeys: ['j7'] },
    { id: 'SA5', text: "    await db.update('plan', { plan, key: secret })", fate: SERVER_ONLY, journeys: ['j7'] },
    frame('SA6', '  }'),
    { id: 'SA7', text: "  return <form action={upgrade.bind(null, 'pro')}><button>Upgrade</button></form>", fate: ACTION, journeys: ['j7'], note: "'pro' crosses as plain JSON" },
    frame('SA8', '}')
  ]
}
