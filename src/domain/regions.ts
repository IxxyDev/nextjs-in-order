// src/domain/regions.ts
import type { Rect, Region, RegionId } from './types'

export const WORLD: Rect = { x: 0, y: 0, w: 2400, h: 2080 }

export const BANDS = {
  build: { y: 0, h: 680 },
  artifacts: { y: 680, h: 140 },
  server: { y: 820, h: 640 },
  network: { y: 1460, h: 60 },
  browser: { y: 1520, h: 560 }
} as const

export const REGIONS: Region[] = [
  { id: 'source', title: 'Source code', band: 'build', x: 20, y: 30, w: 450, h: 630 },
  { id: 'build', title: 'Build pipeline', band: 'build', x: 490, y: 30, w: 1250, h: 630 },
  { id: 'artifacts', title: '.next artifact shelf', band: 'build', x: 20, y: 685, w: 1980, h: 130 },
  { id: 'http-entry', title: 'HTTP entry', band: 'server', x: 20, y: 840, w: 300, h: 480 },
  { id: 'router-server', title: 'router-server', band: 'server', x: 340, y: 840, w: 560, h: 480 },
  { id: 'render-server', title: 'render-server', band: 'server', x: 920, y: 840, w: 1080, h: 480 },
  { id: 'rsc-runtime', title: 'RSC runtime · react-server', band: 'server', x: 1160, y: 890, w: 400, h: 180 },
  { id: 'ssr-runtime', title: 'SSR runtime · react-dom/server', band: 'server', x: 1160, y: 1100, w: 400, h: 180 },
  { id: 'data-caches', title: 'Data sources & server caches', band: 'server', x: 20, y: 1340, w: 1980, h: 110 },
  { id: 'network', title: 'network', band: 'server', x: 20, y: 1460, w: 1980, h: 60 },
  { id: 'browser', title: 'Browser · DOM + React client runtime', band: 'browser', x: 20, y: 1540, w: 960, h: 520 },
  { id: 'client-router', title: 'Client router · client cache', band: 'browser', x: 1000, y: 1540, w: 1000, h: 520 },
  { id: 'dev', title: 'Development · next dev', band: 'dev', x: 2040, y: 30, w: 340, h: 2030 }
]

const byId = new Map(REGIONS.map((r) => [r.id, r]))

export function regionById(id: RegionId): Region {
  const r = byId.get(id)
  if (!r) throw new Error(`unknown region ${id}`)
  return r
}
