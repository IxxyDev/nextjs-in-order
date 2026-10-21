import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, frame } from './fates'

/** next.config.js: read at build and at startup; nothing in it reaches a browser chunk, its effects cross as headers and manifests */
export const FILE: SpecimenFile = {
  path: 'next.config.js', component: 'nextConfig',
  lines: [
    frame('NC1', 'module.exports = {'),
    { id: 'NC2', text: '  cacheComponents: true,', fate: SERVER_ONLY, journeys: ['j1', 'j8', 'j11'], note: 'PPR for billing; nothing is cached without "use cache"' },
    { id: 'NC3', text: "  async headers() { return [{ source: '/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] }] },", fate: SERVER_ONLY, journeys: ['j2', 'j9', 'j10'], note: 'ladder step 1' },
    { id: 'NC4', text: "  async redirects() { return [{ source: '/old-settings', destination: '/dashboard/settings', permanent: true }] },", fate: SERVER_ONLY, journeys: ['j2', 'j9'], note: 'ladder step 2: 308' },
    { id: 'NC5', text: "  experimental: { optimizePackageImports: ['ui-kit'] },", fate: SERVER_ONLY, journeys: ['j1', 'j11'], note: 'barrel imports rewritten at compile' },
    { id: 'NC6', text: "  output: 'standalone',", fate: SERVER_ONLY, journeys: ['j1', 'j10', 'j11'], note: 'traced files copied into .next/standalone' },
    frame('NC7', '}')
  ]
}
