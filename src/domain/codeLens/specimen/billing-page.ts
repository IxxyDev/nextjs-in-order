import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'app/dashboard/billing/page.tsx', component: 'BillingPage', entity: 'src-billing-page',
  lines: [
    { id: 'BP1', text: "import { Suspense } from 'react'", fate: SERVER_ONLY, mark: 'static-shell' },
    { id: 'BP2', text: "import InvoiceList from '@/components/InvoiceList'", fate: SERVER_ONLY, mark: 'suspended' },
    { id: 'BP3', text: 'export default async function BillingPage() {', fate: SERVER_ONLY, mark: 'static-shell', note: '◐ route (J1 step 13)' },
    frame('BP4', '  return ('),
    frame('BP5', '    <>'),
    { id: 'BP6', text: '      <h1>Billing</h1>', fate: SERVER_ONLY, mark: 'static-shell' },
    { id: 'BP7', text: '      <Suspense fallback={<InvoicesSkeleton />}>', fate: SERVER_ONLY, mark: 'static-shell', note: 'the fallback is in the shell' },
    { id: 'BP8', text: '        <InvoiceList />', fate: SERVER_ONLY, mark: 'suspended', note: 'becomes "$L2", filled later' },
    frame('BP9', '      </Suspense>'),
    frame('BP10', '    </>'),
    frame('BP11', '  )'),
    frame('BP12', '}'),
    { id: 'BP13', text: 'function InvoicesSkeleton() { return <p>Loading invoices…</p> }', fate: SERVER_ONLY, mark: 'static-shell' }
  ]
}
