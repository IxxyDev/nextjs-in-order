import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

/** J8 step 16/17: cookies() moved from InvoiceList up into BillingPage, above the Suspense boundary */
export const FILE: SpecimenFile = {
  path: 'app/dashboard/billing/page.tsx', component: 'BillingPage', entity: 'src-billing-page',
  variant: 'J8: cookies() read above the boundary', abridged: 'imports and InvoicesSkeleton as in the app',
  lines: [
    { id: 'BV1', text: 'export default async function BillingPage() {', fate: SERVER_ONLY, mark: 'suspended', journeys: ['j8'], note: 'the whole page is now in the hole' },
    { id: 'BV2', text: "  const session = (await cookies()).get('session')?.value", fate: SERVER_ONLY, mark: 'suspended', journeys: ['j8'], note: 'moved up from IL4' },
    frame('BV3', '  return ('),
    { id: 'BV4', text: '    <Suspense fallback={<InvoicesSkeleton />}>', fate: SERVER_ONLY, mark: 'suspended', journeys: ['j8'], note: 'no longer in the shell' },
    { id: 'BV5', text: '      <InvoiceList session={session} />', fate: SERVER_ONLY, mark: 'suspended', journeys: ['j8'] },
    frame('BV6', '    </Suspense>'),
    frame('BV7', '  )'),
    frame('BV8', '}')
  ]
}
