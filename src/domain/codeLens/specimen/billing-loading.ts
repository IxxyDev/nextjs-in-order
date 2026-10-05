import type { SpecimenFile } from '../../types'
import { S, frame } from './fates'

/** J8 step 17: the route-level boundary the cookies-up page (BV) needs so the shell can keep the layouts */
export const FILE: SpecimenFile = {
  path: 'app/dashboard/billing/loading.tsx', component: 'Loading', entity: 'src-billing-page',
  variant: 'J8: a boundary above the cookies-up page',
  lines: [
    { id: 'BL1', text: 'export default function Loading() {', fate: S, mark: 'static-shell', journeys: ['j8'], note: 'Next wraps the page in <Suspense fallback={<Loading />}>' },
    { id: 'BL2', text: '  return <p>Loading billing…</p>', fate: S, mark: 'static-shell', journeys: ['j8'], note: 'the fallback: prerendered into the shell' },
    frame('BL3', '}')
  ]
}
