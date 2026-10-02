// src/domain/route.ts
import type { Camera, Route } from './types'

export const DEFAULT_ROUTE: Route = { mode: 'journey', slug: 'whole-lifecycle', step: 0 }
export const DEFAULT_COMPARE = 'initial-load'

/** a whole index in [0, length - 1]; anything not finite is 0 */
export function clampIndex(n: number, length: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(length - 1, Math.max(0, Math.floor(n)))
}

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
  if (parts[0] === 'compare') {
    const step = Math.max(0, (parseInt(parts[2] ?? '1', 10) || 1) - 1)
    return { mode: 'compare', slug: parts[1] ?? DEFAULT_COMPARE, step }
  }
  if (parts[0] === 'predict') {
    const n = Math.max(0, (parseInt(parts[1] ?? '1', 10) || 1) - 1)
    return { mode: 'predict', n, ...(cam ? { cam } : {}) }
  }
  return DEFAULT_ROUTE
}

export function formatRoute(route: Route): string {
  const cam = route.mode !== 'compare' && route.cam ? `cam=${route.cam.x},${route.cam.y},${route.cam.zoom}` : ''
  if (route.mode === 'atlas') {
    const q = [route.entity ? `entity=${encodeURIComponent(route.entity)}` : '', cam].filter(Boolean).join('&')
    return `#/atlas${q ? `?${q}` : ''}`
  }
  if (route.mode === 'predict') return `#/predict/${route.n + 1}${cam ? `?${cam}` : ''}`
  return `#/${route.mode}/${route.slug}/${route.step + 1}${cam ? `?${cam}` : ''}`
}

/** a camera as the URL keeps it: whole world units, zoom to two decimals */
export function roundCam(cam: Camera): Camera {
  return { x: Math.round(cam.x), y: Math.round(cam.y), zoom: Math.round(cam.zoom * 100) / 100 }
}

/** the same route with the camera set (rounded) or cleared; a compare hash is returned as it is */
export function withCam(hash: string, cam?: Camera): string {
  const route = parseRoute(hash)
  if (route.mode === 'compare') return hash
  return formatRoute({ ...route, cam: cam && roundCam(cam) })
}
