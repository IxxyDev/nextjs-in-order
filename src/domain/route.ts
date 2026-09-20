// src/domain/route.ts
import type { Camera, Route } from './types'

export const DEFAULT_ROUTE: Route = { mode: 'journey', slug: 'whole-lifecycle', step: 0 }

function parseCam(value: string | null): Camera | undefined {
  if (!value) return undefined
  const [x, y, zoom] = value.split(',').map(Number)
  if ([x, y, zoom].some((n) => !Number.isFinite(n))) return undefined
  return { x, y, zoom }
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [path, query = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const params = new URLSearchParams(query)
  const cam = parseCam(params.get('cam'))
  if (parts[0] === 'atlas') {
    const entity = params.get('entity') ?? undefined
    return { mode: 'atlas', ...(entity ? { entity } : {}), ...(cam ? { cam } : {}) }
  }
  if (parts[0] === 'journey' && parts[1]) {
    const step = Math.max(0, (parseInt(parts[2] ?? '1', 10) || 1) - 1)
    return { mode: 'journey', slug: parts[1], step, ...(cam ? { cam } : {}) }
  }
  return DEFAULT_ROUTE
}

export function formatRoute(route: Route): string {
  const cam = route.cam ? `cam=${route.cam.x},${route.cam.y},${route.cam.zoom}` : ''
  if (route.mode === 'atlas') {
    const q = [route.entity ? `entity=${encodeURIComponent(route.entity)}` : '', cam].filter(Boolean).join('&')
    return `#/atlas${q ? `?${q}` : ''}`
  }
  return `#/journey/${route.slug}/${route.step + 1}${cam ? `?${cam}` : ''}`
}
