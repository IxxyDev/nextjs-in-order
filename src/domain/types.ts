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

/** one dated change; version is the release that brought it, entries run oldest first */
export interface HistoryEntry { version: string; text: string }

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
  history?: HistoryEntry[]
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
/** a state with a word on its chip: every state but dimmed, the backdrop */
export type ChipState = Exclude<EntityState, 'dimmed'>

export interface TokenState {
  /** entity whose position the token takes */
  at: string
  glyph: GlyphKind
  label: string
}

export type CameraTarget =
  | { kind: 'world' }
  | { kind: 'band'; id: Band }
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

/** the part of a step that places things on the world: camera, token, states, edges */
export interface LaneScene {
  camera: CameraTarget
  token?: TokenState
  states: Record<string, EntityState>
  edges: string[]
}

/** a journey step reused in a compare lane; step is 1-based, as in the URL */
export interface StepRef { journey: string; step: number }

export type LaneStep =
  | { ref: StepRef; story?: string; rows?: string[] }
  | (LaneScene & { story: string; rows?: string[] })

export interface CompareLane { title: string; short: string }

export interface CompareStep {
  id: string
  title: string
  story: string
  /** relative time (0 = request starts, 1 = done) at which each lane reaches this step; lower is ahead */
  ruler?: number[]
  lanes: LaneStep[]
}

export interface ComparePair {
  id: string
  slug: string
  title: string
  lanes: CompareLane[]
  synchronized: string
  steps: CompareStep[]
}

export interface ResolvedLane extends LaneScene {
  story: string
  rows?: string[]
  /** where a reused step came from, e.g. J5 step 8 */
  source?: { slug: string; step: number; label: string }
}

export interface ResolvedCompareStep extends Omit<CompareStep, 'lanes'> { lanes: ResolvedLane[] }

export interface ResolvedPair extends Omit<ComparePair, 'steps'> { steps: ResolvedCompareStep[] }

export interface LaneWorld {
  lane: ResolvedLane
  entityStates: Record<string, EntityState>
  activeEdges: ReadonlySet<string>
  token?: TokenState
  cameraTarget: CameraTarget
  /** entities lit in this lane and dimmed or absent in another */
  differs: ReadonlySet<string>
}

export interface CompareWorld {
  pairId: string
  stepIndex: number
  step: ResolvedCompareStep
  lanes: LaneWorld[]
  ruler: number[]
  text: string
}

/** how an entity or region is marked on the map in predict mode */
export type PickMark = 'candidate' | 'picked' | 'correct' | 'missed' | 'extra' | 'answer'

interface QuizBase {
  id: string
  /** reviewer: one of the brief's ten reviewer questions; scenario: one per journey theme */
  source: 'reviewer' | 'scenario'
  /** scenario questions: the slug of the journey whose theme they test */
  journey?: string
  title: string
  prompt: string
  /** the answer explained from the architecture, shown with the feedback */
  why: string
  /** journey steps that show the answer; step is 1-based, as in the URL */
  replays: StepRef[]
}

/** entities and regions are picked on the map and scored as an exact set; a choice is one outcome */
export type QuizQuestion = QuizBase & (
  | { type: 'entities'; candidates: string[]; answer: string[] }
  | { type: 'regions'; candidates: RegionId[]; answer: RegionId[] }
  | { type: 'choice'; options: string[]; answer: number; highlight: string[] }
)

export interface QuizResult { correct: boolean; hits: string[]; missed: string[]; extra: string[] }

export type Route =
  | { mode: 'journey'; slug: string; step: number; cam?: Camera }
  | { mode: 'atlas'; entity?: string; cam?: Camera }
  /** no cam: a comparison has one camera per lane, so a single URL camera has nothing to restore */
  | { mode: 'compare'; slug: string; step: number }
  /** n is 0-based; the URL is 1-based */
  | { mode: 'predict'; n: number; cam?: Camera }

// ---------- code lens (docs/code-lens.md) ----------

/** where a line ends up, drawn as a hue: exactly one per non-frame line */
export type HueFate = 'server-only' | 'client-boundary' | 'split' | 'action-id'
/** when its output exists, drawn as a gutter mark: zero or one per line */
export type MarkFate = 'static-shell' | 'suspended' | 'cached' | 'shared-layout'
export type FateId = HueFate | MarkFate

export interface Fate {
  id: FateId
  channel: 'hue' | 'mark'
  label: string
  /** '⊘', '⚡', '⇄', '○', '⌛', '▤', '🔒' */
  glyph: string
  /** text chip, so color is never the only signal: the network chip for hues, the timing for marks */
  chip: string
  /** CSS color token, hue channel only */
  token?: string
  /** client-boundary and split share a hue; the reference is drawn outlined, the code filled */
  swatch?: 'outline' | 'filled'
}

export interface SpecimenLine {
  /** 'DN6': file prefix + line number */
  id: string
  text: string
  /** absent only on frame lines */
  fate?: HueFate
  mark?: MarkFate
  /** `return (`, `)`, `}`: inherits its block's fate, never carries a chip */
  frame?: true
  /** journeys other than J0 whose lens shows the line, e.g. ['j7'] (docs/code-lens.md §4) */
  journeys?: string[]
  note?: string
}

export interface SpecimenFile {
  path: string
  component: string
  /** source entity on the map, when the file has one */
  entity?: string
  /** lines left out of the specimen, e.g. 'db folded (4 lines)' */
  abridged?: string
  /** a what-if version of `path` that a journey contrasts with the app (not part of the app), e.g. 'J8: cookies() read above the boundary' */
  variant?: string
  lines: SpecimenLine[]
}

export type LensMode = 'off' | 'peek' | 'open'
/** docs/code-lens.md §10: http = request/response lines, json = a JSON body or file, files = a listing of emitted files, terminal = CLI output */
export type ArtifactForm = 'tsx' | 'js' | 'js-reference' | 'manifest' | 'flight' | 'html' | 'dom' | 'flight-patch' | 'http' | 'json' | 'css' | 'files' | 'terminal'
export type LineChange = 'new' | 'same' | 'gone'
export type LensMotion = 'fade-in' | 'transform' | 'split' | 'connect' | 'reference' | 'wrap' | 'fade-to-zero' | 'light-up' | 'swap' | 'fill'

/** one shown line of a derived artifact */
export interface CodeLine {
  text: string
  /** specimen line ids it comes from: drives hover ↔ entity and morph alignment */
  from?: string[]
  fate?: HueFate
  mark?: MarkFate
  /** absent on context lines such as a request header */
  change?: LineChange
  /** the identifier that keeps its highlight while the text around it changes form */
  morph?: string
  /** a token struck with ✂ at this step, e.g. '<boolean>' */
  cut?: string
  note?: string
}

/** lines left out of a pane, shown as one calm row that opens to show them when it can */
export interface FoldRow {
  /** how many lines or rows are left out */
  fold: number
  /** the whole row after its ⋯ or ▸, count included: '10 lines of DashboardNav (stay in the browser chunk)' */
  label: string
  /** specimen lines it stands for; it opens to show them as written in the source */
  from?: string[]
  /** the left-out text itself, when it is not specimen source; opening shows these instead of `from` */
  lines?: string[]
  change?: LineChange
}

export type LensRow = CodeLine | FoldRow

export interface LensPane {
  /** set only on a step that declares split: which side of the server/browser divide the pane shows */
  side?: 'server' | 'browser'
  /** file label in the pane header */
  title: string
  /** pane header link */
  entity?: string
  /** a short pill in the one-line pane header, e.g. '×2' */
  badge?: string
  /** a compact hint under the header that says what the badge means */
  hint?: string
  /** cut from a real artifact; real-world ids left out are written … */
  abridged: boolean
  rows: LensRow[]
}

/** a lit fate and the entities it links to at this step; `from` narrows the link to those specimen lines */
export interface LensLink {
  fate: FateId
  entities: string[]
  from?: string[]
}

export interface LensStep {
  /** journey step id, e.g. 'j0-4' */
  step: string
  /** set in data, not inferred from the step kind */
  mode: LensMode
  /** absent when the lens is off */
  form?: ArtifactForm
  /** one column becomes two: a server pane and a browser pane */
  split?: true
  /** shown dimmed: the artifacts did not change form on this step */
  dimmed?: true
  /** header or footnote chip */
  chip?: string
  /** the one-line ledger of a peek strip */
  summary?: string[]
  /** ledger under the panes, e.g. '0 B of JS in the browser' */
  footer?: string[]
  /** the panes when open, or what expanding a peek shows */
  panes: LensPane[]
  links: LensLink[]
  motion: LensMotion[]
  reduced?: 'side-by-side' | 'three-pane' | 'static'
}

export interface CodeLens {
  journey: string
  steps: LensStep[]
}
