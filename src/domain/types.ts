// src/domain/types.ts
export type Phase = 'build' | 'startup' | 'request' | 'browser' | 'dev'
export type Env =
  | 'rust' | 'node' | 'node-worker' | 'edge' | 'browser' | 'browser-worker' | 'storage' | 'network'
export type Role =
  | 'compiler' | 'bundler' | 'manifest' | 'module' | 'route-description' | 'runtime' | 'protocol'
  | 'cache' | 'router' | 'renderer' | 'artifact' | 'process' | 'transport' | 'data-source' | 'boundary'
export type Reaches = 'code' | 'data' | 'data+refs' | 'no'
export type Band = 'build' | 'server' | 'browser' | 'dev'
export type RegionId =
  | 'source' | 'build' | 'artifacts' | 'http-entry' | 'router-server' | 'render-server'
  | 'rsc-runtime' | 'ssr-runtime' | 'network' | 'browser' | 'client-router' | 'data-caches' | 'dev'
export type GlyphKind =
  | 'source-module' | 'transformed-module' | 'server-chunk' | 'browser-chunk' | 'manifest'
  | 'reference' | 'request' | 'response' | 'html' | 'flight' | 'json' | 'cache' | 'segment'
  | 'component-server' | 'component-client' | 'action' | 'process' | 'watcher' | 'machine'
  | 'data-source' | 'runtime' | 'dom'

export interface Rect { x: number; y: number; w: number; h: number }

export interface Region extends Rect {
  id: RegionId
  title: string
  band: Band
}

export interface SourceLink { label: string; url: string }

export interface VersionNote {
  article: string
  current: string
  why: string
}

export interface Entity {
  id: string
  name: string
  /** short label for the canvas; defaults to the part of name before ' · ' */
  short?: string
  region: RegionId
  glyph: GlyphKind
  /** world coordinates of the glyph center */
  x: number
  y: number
  phase: Phase[]
  env: Env[]
  role: Role
  what: string
  consumes: string[]
  produces: string[]
  exists: string
  /** ids of manifests / protocols / caches that connect it to others */
  connects: string[]
  reaches: Reaches
  internals?: string[]
  sources?: SourceLink[]
  versionNote?: VersionNote
  /** optional badge text such as '"use client"' or 'Node' */
  badge?: string
}

export type EdgeKind = 'transform' | 'data' | 'lookup' | 'control' | 'tee' | 'supervision' | 'dev'

export interface Edge {
  id: string
  from: string
  to: string
  kind: EdgeKind
  label?: string
  crossing?: Exclude<Reaches, 'no'>
}

export type EntityState =
  | 'current' | 'active' | 'kept' | 'replaced' | 'new' | 'invalid' | 'stale' | 'fresh' | 'dimmed' | 'na'

export interface TokenState {
  /** entity whose position the token takes */
  at: string
  glyph: GlyphKind
  label: string
}

export type CameraTarget =
  | { kind: 'world' }
  | { kind: 'region'; id: RegionId }
  | { kind: 'entities'; ids: string[] }

export type StepKind = 'explain' | 'move' | 'transform' | 'predict' | 'reveal' | 'check'

export interface PredictQuestion {
  text: string
  options: string[]
  answer: number
  why: string
}

export interface MisconceptionCheck {
  statement: string
  isTrue: boolean
  why: string
}

export interface Step {
  id: string
  kind: StepKind
  title: string
  /** Level 1 story, one causal sentence or two */
  story: string
  camera: CameraTarget
  token?: TokenState
  /** entity id -> state; entities not listed are 'dimmed' when the step lists anything, else neutral */
  states: Record<string, EntityState>
  edges: string[]
  question?: PredictQuestion
  checks?: MisconceptionCheck[]
  internals?: string[]
  sources?: SourceLink[]
}

export interface Journey {
  id: string
  slug: string
  title: string
  following: string
  whatShouldClick: string
  steps: Step[]
}

export interface Camera { x: number; y: number; zoom: number }

export interface WorldState {
  journeyId: string
  stepIndex: number
  step: Step
  entityStates: Record<string, EntityState>
  activeEdges: ReadonlySet<string>
  token?: TokenState
  cameraTarget: CameraTarget
  text: string
}

export type Route =
  | { mode: 'journey'; slug: string; step: number; cam?: Camera }
  | { mode: 'atlas'; entity?: string; cam?: Camera }
