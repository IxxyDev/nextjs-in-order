import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

/** pages/api/hello.ts: an API Route; render-server calls it like a page, but no React runs */
export const FILE: SpecimenFile = {
  path: 'pages/api/hello.ts', component: 'handler', entity: 'route-handler',
  lines: [
    { id: 'AH1', text: "import type { NextApiRequest, NextApiResponse } from 'next'", fate: SERVER_ONLY, journeys: ['j2'] },
    { id: 'AH2', text: 'export default function handler(req: NextApiRequest, res: NextApiResponse) {', fate: SERVER_ONLY, journeys: ['j1', 'j2'], note: 'no React, no HTML' },
    { id: 'AH3', text: '  res.json({ ok: true })', fate: SERVER_ONLY, journeys: ['j2'], note: 'crosses as JSON' },
    frame('AH4', '}')
  ]
}
