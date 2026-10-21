import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'components/InvoiceList.tsx', component: 'InvoiceList', entity: 'src-billing-page',
  lines: [
    { id: 'IL1', text: "import { cookies } from 'next/headers'", fate: SERVER_ONLY, mark: 'suspended' },
    { id: 'IL2', text: "import { getInvoices } from '@/lib/data'", fate: SERVER_ONLY, mark: 'suspended' },
    { id: 'IL3', text: 'export default async function InvoiceList() {', fate: SERVER_ONLY, mark: 'suspended' },
    { id: 'IL4', text: "  const session = (await cookies()).get('session')?.value", fate: SERVER_ONLY, mark: 'suspended', note: 'the read that makes it dynamic' },
    { id: 'IL5', text: '  const invoices = await getInvoices(session)', fate: SERVER_ONLY, mark: 'suspended' },
    { id: 'IL6', text: '  return <ul>{invoices.map((inv) => <li key={inv.id}>{inv.total}</li>)}</ul>', fate: SERVER_ONLY, mark: 'suspended' },
    frame('IL7', '}')
  ]
}
