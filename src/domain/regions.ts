import type { Band, Rect, Region, RegionId } from './types'

export const WORLD: Rect = { x: 0, y: 0, w: 2400, h: 2080 }

/** the world's horizontal layout rows, top to bottom; the time bands (Band) are built from them in BAND_RECTS */
export const ROWS = {
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

/** room the custom-server ring leaves around the regions it frames */
const RING_MARGIN = 6

/** the custom-server ring: a frame around HTTP entry + router-server */
export const CUSTOM_SERVER_RING: Rect = around([regionById('http-entry'), regionById('router-server')], RING_MARGIN)

function around(rects: Rect[], margin: number): Rect {
  const x = Math.min(...rects.map((r) => r.x)) - margin, y = Math.min(...rects.map((r) => r.y)) - margin
  const right = Math.max(...rects.map((r) => r.x + r.w)) + margin, bottom = Math.max(...rects.map((r) => r.y + r.h)) + margin
  return { x, y, w: right - x, h: bottom - y }
}

export const BAND_TITLES: Record<Band, string> = { build: 'Build', server: 'Server', browser: 'Browser', dev: 'Dev column' }

/** the time bands run from the world's left edge to here; the dev column takes the rest */
const DEV_X = 2020

/** the band backgrounds as World draws them: build takes in the shelf, server the network */
const BAND_RECTS: Record<Band, Rect> = {
  build: { x: 0, y: ROWS.build.y, w: DEV_X, h: ROWS.build.h + ROWS.artifacts.h },
  server: { x: 0, y: ROWS.server.y, w: DEV_X, h: ROWS.server.h + ROWS.network.h },
  browser: { x: 0, y: ROWS.browser.y, w: DEV_X, h: ROWS.browser.h },
  dev: { x: DEV_X, y: 0, w: WORLD.w - DEV_X, h: WORLD.h }
}

export const bandRect = (band: Band): Rect => BAND_RECTS[band]

const contains = (a: Rect, b: Rect) => a.x <= b.x && a.y <= b.y && a.x + a.w >= b.x + b.w && a.y + a.h >= b.y + b.h

/** the smallest region that holds the whole rect (a point is a rect of no size), other than the region `except` */
export function smallestRegionAround(rect: Rect, except?: RegionId): Region | undefined {
  return REGIONS.filter((r) => r.id !== except && contains(r, rect)).sort((a, b) => a.w * a.h - b.w * b.h)[0]
}

/** a region drawn inside another (the two runtimes inside render-server) has the smallest such one as parent */
const parent = new Map(REGIONS.map((r) => [r.id, smallestRegionAround(r, r.id)?.id]))

/** the region and the regions it sits in, outermost first */
export function regionChain(id: RegionId): RegionId[] {
  const up = parent.get(id)
  return up ? [...regionChain(up), id] : [id]
}
