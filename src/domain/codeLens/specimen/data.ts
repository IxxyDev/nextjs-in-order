import type { SpecimenFile } from '../../types'
import { S, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'lib/data.ts', component: 'getProfile', abridged: 'db folded (4 lines)',
  lines: [
    { id: 'DA1', text: "import { cacheLife, cacheTag } from 'next/cache'", fate: S, mark: 'cached' },
    { id: 'DA2', text: 'export async function getProfile() {', fate: S, mark: 'cached' },
    { id: 'DA3', text: "  'use cache'", fate: S, mark: 'cached' },
    { id: 'DA4', text: "  cacheTag('profile'); cacheLife('hours')", fate: S, mark: 'cached', journeys: ['j7', 'j8'], note: 'J7/J8: the tag updateTag sweeps' },
    { id: 'DA5', text: "  return db.find('profile')", fate: S, mark: 'cached' },
    frame('DA6', '}'),
    { id: 'DA7', text: 'export async function getInvoices(session?: string) {', fate: S, mark: 'suspended', journeys: ['j8'], note: 'no "use cache": runs on every request' },
    { id: 'DA8', text: "  return db.findMany('invoices', { session })", fate: S, mark: 'suspended', journeys: ['j8'] },
    frame('DA9', '}')
  ]
}
