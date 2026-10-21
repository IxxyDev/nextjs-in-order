import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

/** server.js (J10): plain Node code that Next.js never compiles; it owns the socket and calls handle */
export const FILE: SpecimenFile = {
  path: 'server.js', component: 'server.js', entity: 'custom-server',
  lines: [
    { id: 'SV1', text: "const { createServer } = require('node:http')", fate: SERVER_ONLY, journeys: ['j10'] },
    { id: 'SV2', text: "const { parse } = require('node:url')", fate: SERVER_ONLY, journeys: ['j10'] },
    { id: 'SV3', text: "const next = require('next')", fate: SERVER_ONLY, journeys: ['j10'] },
    { id: 'SV4', text: "const app = next({ dev: process.env.NODE_ENV !== 'production' })", fate: SERVER_ONLY, journeys: ['j9', 'j10'] },
    { id: 'SV5', text: 'const handle = app.getRequestHandler()', fate: SERVER_ONLY, journeys: ['j10'], note: 'the handler router-server uses for every request' },
    { id: 'SV6', text: 'app.prepare().then(() => {', fate: SERVER_ONLY, journeys: ['j10'], note: 'loads the tables next start would load' },
    { id: 'SV7', text: '  createServer((req, res) => {', fate: SERVER_ONLY, journeys: ['j10'], note: 'our server owns the socket' },
    { id: 'SV8', text: '    const parsedUrl = parse(req.url, true)', fate: SERVER_ONLY, journeys: ['j10'] },
    { id: 'SV9', text: "    if (parsedUrl.pathname === '/healthz') { res.statusCode = 200; return res.end('ok') }", fate: SERVER_ONLY, journeys: ['j10'], note: 'never calls handle: invisible to Next.js' },
    { id: 'SV10', text: "    if (parsedUrl.pathname === '/legacy/settings') return handle(req, res, { ...parsedUrl, pathname: '/dashboard/settings' })", fate: SERVER_ONLY, journeys: ['j10'] },
    { id: 'SV11', text: '    handle(req, res, parsedUrl)', fate: SERVER_ONLY, journeys: ['j10'], note: 'enters the same ladder as next start' },
    { id: 'SV12', text: '  }).listen(3000)', fate: SERVER_ONLY, journeys: ['j10'] },
    frame('SV13', '})')
  ]
}
