import type { SpecimenFile } from '../../types'
import { S, frame } from './fates'

/** Proxy (Middleware before 16.0): runs in router-server at ladder step 3, on Node by default (concept-model V1, V2) */
export const FILE: SpecimenFile = {
  path: 'proxy.ts', component: 'proxy', entity: 'proxy',
  lines: [
    { id: 'PX1', text: "import { NextResponse, type NextRequest } from 'next/server'", fate: S, journeys: ['j2', 'j10'] },
    { id: 'PX2', text: 'export function proxy(request: NextRequest) {', fate: S, journeys: ['j1', 'j2', 'j10'], note: 'Node by default since 16.0; Middleware ran on Edge' },
    { id: 'PX3', text: "  if (!request.cookies.has('session')) {", fate: S, journeys: ['j2', 'j10'] },
    { id: 'PX4', text: "    return NextResponse.redirect(new URL('/login', request.url))", fate: S, journeys: ['j2', 'j10'], note: 'the decision travels back to router-server as headers' },
    frame('PX5', '  }'),
    { id: 'PX6', text: '  return NextResponse.next()', fate: S, journeys: ['j2', 'j10'], note: 'x-middleware-next: the ladder climbs on' },
    frame('PX7', '}'),
    { id: 'PX8', text: "export const config = { matcher: ['/dashboard/:path*'] }", fate: S, journeys: ['j2', 'j10'], note: 'becomes a regex in functions-config-manifest.json' }
  ]
}
