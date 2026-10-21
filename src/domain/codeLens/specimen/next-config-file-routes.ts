import type { SpecimenFile } from '../../types'
import { SERVER_ONLY } from './fates'

/** J10 step 12: file routes hidden from the server; only a next.config rewrite reaches a page (resolve-routes.ts, v16.3.8) */
export const FILE: SpecimenFile = {
  path: 'next.config.js', component: 'nextConfig',
  variant: 'J10: file routes hidden from the server', abridged: 'the rest as in the app',
  lines: [
    { id: 'NV1', text: '  useFileSystemPublicRoutes: false,', fate: SERVER_ONLY, journeys: ['j10'], note: 'not access control: a client navigation still reaches them' }
  ]
}
