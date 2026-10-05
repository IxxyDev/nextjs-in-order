import type { SpecimenFile } from '../../types'
import { S } from './fates'

/** J10 step 9: an older server.js that renders a page by name with the deprecated app.render */
export const FILE: SpecimenFile = {
  path: 'server.js', component: 'server.js', entity: 'custom-server',
  variant: 'J10: the deprecated app.render', abridged: 'the rest as in the app',
  lines: [
    { id: 'SR1', text: "    if (parsedUrl.pathname === '/render/settings') return app.render(req, res, '/dashboard/settings', parsedUrl.query)", fate: S, journeys: ['j10'], note: 'warns, rebuilds req.url, then the same requestHandler' }
  ]
}
