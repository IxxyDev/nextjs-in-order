# Next.js Internals Visualizer — Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working prototype of the scroll-driven "backbone/train/station-zoom" mechanic with two fully-built acts (Compile & Bundle, Ship & Hydrate) to validate the technique before building all ten acts.

**Architecture:** Static site, no UI framework. Vite bundles vanilla TypeScript. A single JS scroll-progress engine (`IntersectionObserver` + `requestAnimationFrame`) is the one source of truth driving a persistent SVG backbone/train diagram, a progress-rail minimap, and per-act sub-visualizations, all via plain DOM/attribute updates — no dependency on native CSS `animation-timeline`/`view-timeline`.

**Tech Stack:** Vite, TypeScript, Vitest (pure-logic unit tests only). No React/Solid/other UI framework, no CSS/animation libraries, no MDX.

**Spec:** `docs/design.md`

## Global Constraints

- No UI framework; Vite + vanilla TypeScript only.
- No native CSS `animation-timeline`/`view-timeline` dependency — all scroll-driven behavior goes through the JS engine in `scroll-progress.ts`, so there is one code path for all browsers.
- No MDX/CMS content pipeline — narrative fragments are hand-authored TS/HTML.
- Automated tests (Vitest) cover pure, DOM-free logic only; everything DOM/visual is manually verified as specified per task, per the spec's "no automated test framework for visual/content work" decision.
- Content is English, written as short narrative beats — not a translation of the full source articles, and `all_articles.txt` is not shipped or referenced at runtime.
- No git commits during this build.
- No AI-attribution comments, filenames, or references anywhere in the repository.
- The backbone renders all 10 stations from the start (cheap static SVG); only `compile-bundle` (Act 1) and `ship-hydrate` (Act 5) get full narrative + sub-visualization in this prototype phase. The other 8 stations are markers only — do not build their content or sub-visualizations in this plan.

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles.css`

**Interfaces:**
- Produces: the 10 `<section class="act" data-act="...">` elements later tasks query via `document.querySelectorAll<HTMLElement>('.act')`, and the fixed containers `#diagram-root` and `#rail-root` later tasks mount into.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nextjs-in-order",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2022'
  }
})
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Next.js, in order</title>
  <link rel="stylesheet" href="/src/styles.css" />
</head>
<body>
  <div id="rail-root" class="rail"></div>
  <div id="diagram-root" class="diagram-col"></div>
  <main class="narrative-col">
    <section class="act" data-act="prologue"></section>
    <section class="act" data-act="compile-bundle"></section>
    <section class="act" data-act="server-boot"></section>
    <section class="act" data-act="request"></section>
    <section class="act" data-act="render"></section>
    <section class="act" data-act="ship-hydrate"></section>
    <section class="act" data-act="client"></section>
    <section class="act" data-act="mutations"></section>
    <section class="act" data-act="dev-mode"></section>
    <section class="act" data-act="optimization"></section>
  </main>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 5: Create `src/styles.css`**

```css
:root {
  --progress: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, monospace;
  background: #0d1117;
  color: #c9d1d9;
}

.rail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  z-index: 20;
  display: flex;
}

.rail__station {
  flex: 1;
  border-right: 1px solid #161b22;
  background: #21262d;
}

.rail__station.is-active {
  background: #f78166;
}

.diagram-col {
  position: fixed;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #21262d;
}

.narrative-col {
  width: 50%;
  padding: 8vh 3rem;
}

.act {
  min-height: 100vh;
  padding: 4rem 0;
}

.act p {
  max-width: 40ch;
  line-height: 1.7;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 6: Create `src/main.ts` stub**

```ts
import './styles.css'

console.log('bootstrapping')
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: completes with no errors, creates `node_modules` and `package-lock.json`.

- [ ] **Step 8: Verify dev server boots**

Run: `npm run dev`
Expected: Vite prints a local URL; opening it shows an empty dark page with a thin top rail bar and no console errors.

- [ ] **Step 9: Verify production build succeeds**

Run: `npm run build`
Expected: completes with no errors, produces a `dist/` directory.

---

## Task 2: Scroll-progress engine

**Files:**
- Create: `src/scroll-progress.ts`
- Test: `src/scroll-progress.test.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `HTMLElement[]` of `.act` sections from `index.html` (Task 1).
- Produces: `computeActProgress(rect, viewportHeight): number`, `computeOverallProgress(actIndex, actCount, actProgress): number`, `initScrollProgress(sections, onUpdate): () => void`, and the `ScrollProgressUpdate` type `{ actId: string, actIndex: number, actProgress: number, overallProgress: number }` — later tasks (3, 4, 5, 6) consume `ScrollProgressUpdate` from the `onUpdate` callback.

- [ ] **Step 1: Write the failing tests for the pure progress math**

```ts
// src/scroll-progress.test.ts
import { describe, it, expect } from 'vitest'
import { computeActProgress, computeOverallProgress } from './scroll-progress'

describe('computeActProgress', () => {
  it('is 0 when the section top is at the bottom of the viewport', () => {
    expect(computeActProgress({ top: 800, height: 1200 }, 800)).toBe(0)
  })

  it('is 1 when the section bottom has exited the top of the viewport', () => {
    expect(computeActProgress({ top: -1200, height: 1200 }, 800)).toBe(1)
  })

  it('is 0.5 at the section midpoint', () => {
    const height = 1200
    const viewportHeight = 800
    const midTop = viewportHeight - (viewportHeight + height) / 2
    expect(computeActProgress({ top: midTop, height }, viewportHeight)).toBeCloseTo(0.5)
  })

  it('clamps outside the 0-1 range', () => {
    expect(computeActProgress({ top: 5000, height: 1200 }, 800)).toBe(0)
    expect(computeActProgress({ top: -5000, height: 1200 }, 800)).toBe(1)
  })
})

describe('computeOverallProgress', () => {
  it('splits progress evenly across acts', () => {
    expect(computeOverallProgress(0, 10, 0)).toBeCloseTo(0)
    expect(computeOverallProgress(0, 10, 1)).toBeCloseTo(0.1)
    expect(computeOverallProgress(5, 10, 0.5)).toBeCloseTo(0.55)
    expect(computeOverallProgress(9, 10, 1)).toBeCloseTo(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/scroll-progress.test.ts`
Expected: FAIL — `scroll-progress.ts` does not exist / exports not found.

- [ ] **Step 3: Implement the pure progress functions**

```ts
// src/scroll-progress.ts
export interface ActRect {
  top: number
  height: number
}

/** Progress 0-1 through an act's section as it crosses the viewport, top to bottom. */
export function computeActProgress(rect: ActRect, viewportHeight: number): number {
  const raw = (viewportHeight - rect.top) / (rect.height + viewportHeight)
  return Math.min(1, Math.max(0, raw))
}

/** Maps a completed-act index plus in-act progress to overall progress across N acts. */
export function computeOverallProgress(actIndex: number, actCount: number, actProgress: number): number {
  return (actIndex + actProgress) / actCount
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scroll-progress.test.ts`
Expected: PASS, all 6 tests green.

- [ ] **Step 5: Add the DOM-facing engine (no test — verified manually in Step 6)**

```ts
// append to src/scroll-progress.ts
export interface ScrollProgressUpdate {
  actId: string
  actIndex: number
  actProgress: number
  overallProgress: number
}

export function initScrollProgress(
  sections: HTMLElement[],
  onUpdate: (update: ScrollProgressUpdate) => void
): () => void {
  const actCount = sections.length
  let activeIndex = 0
  let ticking = false

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeIndex = sections.indexOf(entry.target as HTMLElement)
        }
      }
    },
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
  )
  sections.forEach((section) => observer.observe(section))

  function tick(): void {
    ticking = false
    const rect = sections[activeIndex].getBoundingClientRect()
    const actProgress = computeActProgress(rect, window.innerHeight)
    const overallProgress = computeOverallProgress(activeIndex, actCount, actProgress)
    document.documentElement.style.setProperty('--progress', overallProgress.toFixed(4))
    onUpdate({
      actId: sections[activeIndex].dataset.act ?? '',
      actIndex: activeIndex,
      actProgress,
      overallProgress
    })
  }

  function onScroll(): void {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(tick)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  tick()

  return () => {
    window.removeEventListener('scroll', onScroll)
    observer.disconnect()
  }
}
```

- [ ] **Step 6: Wire it into `main.ts` and verify manually**

```ts
// src/main.ts
import './styles.css'
import { initScrollProgress } from './scroll-progress'

const sections = Array.from(document.querySelectorAll<HTMLElement>('.act'))
initScrollProgress(sections, (update) => {
  console.log(update.actId, update.overallProgress.toFixed(2))
})
```

Run: `npm run dev`, open the page, scroll down.
Expected: console logs the active `actId` and a smoothly increasing `overallProgress` from `prologue` (~0) to `optimization` (~1) with no errors.

---

## Task 3: Backbone diagram and train car

**Files:**
- Create: `src/backbone.ts`
- Create: `src/train-car.ts`
- Test: `src/train-car.test.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `ScrollProgressUpdate.overallProgress` from Task 2.
- Produces: `Station` type, `STATIONS: Station[]` (10 entries, ids matching `data-act` values from `index.html`), `stationX(index): number`, `renderBackbone(container): SVGSVGElement` — consumed by Task 4 (`STATIONS`) and Task 5/6 wiring (`renderBackbone`'s returned SVG, via `updateTrainCar`). Also produces `stationIndexForProgress(overallProgress, stationCount): number` and `updateTrainCar(svg, overallProgress): void`.

- [ ] **Step 1: Write the failing test for station indexing**

```ts
// src/train-car.test.ts
import { describe, it, expect } from 'vitest'
import { stationIndexForProgress } from './train-car'

describe('stationIndexForProgress', () => {
  it('is 0 at progress 0', () => {
    expect(stationIndexForProgress(0, 10)).toBe(0)
  })

  it('is the last index at progress 1', () => {
    expect(stationIndexForProgress(1, 10)).toBe(9)
  })

  it('advances one station per 1/10th of progress', () => {
    expect(stationIndexForProgress(0.35, 10)).toBe(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/train-car.test.ts`
Expected: FAIL — `train-car.ts` does not exist.

- [ ] **Step 3: Implement `src/backbone.ts`**

```ts
export interface Station {
  id: string
  label: string
}

export const STATIONS: Station[] = [
  { id: 'prologue', label: 'Source' },
  { id: 'compile-bundle', label: 'Compile/Bundle' },
  { id: 'server-boot', label: 'Server boot' },
  { id: 'request', label: 'Request' },
  { id: 'render', label: 'Render' },
  { id: 'ship-hydrate', label: 'Ship/Hydrate' },
  { id: 'client', label: 'Client' },
  { id: 'mutations', label: 'Mutations' },
  { id: 'dev-mode', label: 'Dev mode' },
  { id: 'optimization', label: 'Optimize' }
]

const SVG_NS = 'http://www.w3.org/2000/svg'
const WIDTH = 400
const MARGIN = 30
const Y = 100

export function stationX(index: number): number {
  const usable = WIDTH - MARGIN * 2
  return MARGIN + (usable * index) / (STATIONS.length - 1)
}

export function renderBackbone(container: HTMLElement): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  svg.setAttribute('viewBox', `0 0 ${WIDTH} 200`)
  svg.classList.add('backbone')

  const line = document.createElementNS(SVG_NS, 'line')
  line.setAttribute('x1', String(stationX(0)))
  line.setAttribute('x2', String(stationX(STATIONS.length - 1)))
  line.setAttribute('y1', String(Y))
  line.setAttribute('y2', String(Y))
  line.setAttribute('class', 'backbone__line')
  svg.appendChild(line)

  STATIONS.forEach((station, i) => {
    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cx', String(stationX(i)))
    dot.setAttribute('cy', String(Y))
    dot.setAttribute('r', '5')
    dot.setAttribute('class', 'backbone__station')
    ;(dot as unknown as HTMLElement).dataset.act = station.id
    svg.appendChild(dot)

    const text = document.createElementNS(SVG_NS, 'text')
    text.setAttribute('x', String(stationX(i)))
    text.setAttribute('y', String(Y + 20))
    text.setAttribute('class', 'backbone__label')
    text.textContent = station.label
    svg.appendChild(text)
  })

  const car = document.createElementNS(SVG_NS, 'circle')
  car.setAttribute('cy', String(Y))
  car.setAttribute('r', '8')
  car.setAttribute('class', 'train-car')
  car.setAttribute('id', 'train-car')
  svg.appendChild(car)

  container.appendChild(svg)
  return svg
}
```

- [ ] **Step 4: Implement `src/train-car.ts`**

```ts
import { STATIONS, stationX } from './backbone'

export function stationIndexForProgress(overallProgress: number, stationCount: number): number {
  return Math.min(stationCount - 1, Math.floor(overallProgress * stationCount))
}

export function updateTrainCar(svg: SVGSVGElement, overallProgress: number): void {
  const car = svg.querySelector<SVGCircleElement>('#train-car')
  if (!car) return

  const index = stationIndexForProgress(overallProgress, STATIONS.length)
  const withinStation = overallProgress * STATIONS.length - index
  const nextIndex = Math.min(STATIONS.length - 1, index + 1)
  const x = stationX(index) + (stationX(nextIndex) - stationX(index)) * withinStation
  car.setAttribute('cx', String(x))

  svg.querySelectorAll<SVGCircleElement>('.backbone__station').forEach((el) => {
    el.classList.toggle('is-active', (el as unknown as HTMLElement).dataset.act === STATIONS[index].id)
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/train-car.test.ts`
Expected: PASS, all 3 tests green.

- [ ] **Step 6: Add backbone/train-car CSS**

```css
/* append to src/styles.css */
.backbone__line {
  stroke: #30363d;
  stroke-width: 2;
}

.backbone__station {
  fill: #21262d;
  stroke: #484f58;
}

.backbone__station.is-active {
  fill: #f78166;
}

.backbone__label {
  fill: #8b949e;
  font-size: 8px;
  text-anchor: middle;
}

.train-car {
  fill: #58a6ff;
}
```

- [ ] **Step 7: Wire into `main.ts`**

```ts
// src/main.ts
import './styles.css'
import { initScrollProgress } from './scroll-progress'
import { renderBackbone } from './backbone'
import { updateTrainCar } from './train-car'

const sections = Array.from(document.querySelectorAll<HTMLElement>('.act'))
const diagramRoot = document.getElementById('diagram-root')!

const backboneSvg = renderBackbone(diagramRoot)

initScrollProgress(sections, (update) => {
  updateTrainCar(backboneSvg, update.overallProgress)
})
```

- [ ] **Step 8: Verify manually**

Run: `npm run dev`, open the page, scroll from top to bottom.
Expected: the backbone with 10 stations is visible in the right half of the page; the blue train-car dot moves smoothly left to right as you scroll; the active station dot turns orange as the car passes it.

---

## Task 4: Progress rail minimap

**Files:**
- Create: `src/progress-rail.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `STATIONS` from `backbone.ts` (Task 3), `ScrollProgressUpdate.actId` from Task 2.
- Produces: `renderProgressRail(container): void`, `updateProgressRail(container, activeActId): void`.

- [ ] **Step 1: Implement `src/progress-rail.ts`**

```ts
import { STATIONS } from './backbone'

export function renderProgressRail(container: HTMLElement): void {
  container.innerHTML = ''
  STATIONS.forEach((station) => {
    const el = document.createElement('div')
    el.className = 'rail__station'
    el.dataset.act = station.id
    el.title = station.label
    container.appendChild(el)
  })
}

export function updateProgressRail(container: HTMLElement, activeActId: string): void {
  container.querySelectorAll<HTMLElement>('.rail__station').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.act === activeActId)
  })
}
```

- [ ] **Step 2: Wire into `main.ts`**

```ts
// src/main.ts
import './styles.css'
import { initScrollProgress } from './scroll-progress'
import { renderBackbone } from './backbone'
import { updateTrainCar } from './train-car'
import { renderProgressRail, updateProgressRail } from './progress-rail'

const sections = Array.from(document.querySelectorAll<HTMLElement>('.act'))
const diagramRoot = document.getElementById('diagram-root')!
const railRoot = document.getElementById('rail-root')!

const backboneSvg = renderBackbone(diagramRoot)
renderProgressRail(railRoot)

initScrollProgress(sections, (update) => {
  updateTrainCar(backboneSvg, update.overallProgress)
  updateProgressRail(railRoot, update.actId)
})
```

- [ ] **Step 3: Verify manually**

Run: `npm run dev`, open the page, scroll from top to bottom.
Expected: the thin top rail has 10 segments; the segment matching the currently active act turns orange as you scroll past its section, in sync with the backbone's active station.

---

## Task 5: Act 1 — Compile & Bundle (content + module graph)

**Files:**
- Create: `src/content/act-1.ts`
- Create: `src/acts/module-graph.ts`
- Test: `src/acts/module-graph.test.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `ScrollProgressUpdate` (`actId`, `actProgress`) from Task 2, the `#diagram-root` station-stage area established in Task 3.
- Produces: `mountAct1(section): void`, `MODULES: ModuleNode[]`, `nodePosition(node, progress): {x:number,y:number}`, `initModuleGraph(container): (progress: number) => void`.

- [ ] **Step 1: Write the failing test for node positioning**

```ts
// src/acts/module-graph.test.ts
import { describe, it, expect } from 'vitest'
import { MODULES, nodePosition } from './module-graph'

describe('nodePosition', () => {
  it('starts at the scatter position when progress is 0', () => {
    const node = MODULES[0]
    expect(nodePosition(node, 0)).toEqual({ x: node.scatterX, y: node.scatterY })
  })

  it('reaches its cluster center when progress is 1', () => {
    const node = MODULES.find((m) => m.clusterId === 'vendor')!
    const pos = nodePosition(node, 1)
    expect(pos.x).toBeCloseTo(175)
    expect(pos.y).toBeCloseTo(160)
  })

  it('is halfway between scatter and cluster center at progress 0.5', () => {
    const node = MODULES[0]
    const pos = nodePosition(node, 0.5)
    expect(pos.x).toBeCloseTo((node.scatterX + 100) / 2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/acts/module-graph.test.ts`
Expected: FAIL — `module-graph.ts` does not exist.

- [ ] **Step 3: Implement the data and pure positioning function**

```ts
// src/acts/module-graph.ts
export interface ModuleNode {
  id: string
  scatterX: number
  scatterY: number
  clusterId: 'app-shell' | 'page' | 'vendor'
}

const CLUSTER_CENTERS: Record<ModuleNode['clusterId'], { x: number; y: number }> = {
  'app-shell': { x: 100, y: 60 },
  page: { x: 250, y: 60 },
  vendor: { x: 175, y: 160 }
}

export const MODULES: ModuleNode[] = [
  { id: 'pages/_app.tsx', scatterX: 40, scatterY: 20, clusterId: 'app-shell' },
  { id: 'components/Header.tsx', scatterX: 300, scatterY: 30, clusterId: 'app-shell' },
  { id: 'styles/globals.css', scatterX: 20, scatterY: 180, clusterId: 'app-shell' },
  { id: 'pages/index.tsx', scatterX: 260, scatterY: 190, clusterId: 'page' },
  { id: 'lib/api.ts', scatterX: 340, scatterY: 100, clusterId: 'page' },
  { id: 'lib/utils.ts', scatterX: 60, scatterY: 100, clusterId: 'page' },
  { id: 'node_modules/react', scatterX: 180, scatterY: 10, clusterId: 'vendor' },
  { id: 'node_modules/react-dom', scatterX: 150, scatterY: 200, clusterId: 'vendor' },
  { id: 'next/dynamic', scatterX: 200, scatterY: 200, clusterId: 'vendor' }
]

export function nodePosition(node: ModuleNode, progress: number): { x: number; y: number } {
  const target = CLUSTER_CENTERS[node.clusterId]
  const t = Math.min(1, Math.max(0, progress))
  return {
    x: node.scatterX + (target.x - node.scatterX) * t,
    y: node.scatterY + (target.y - node.scatterY) * t
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/acts/module-graph.test.ts`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Add the DOM mount function (no test — verified manually)**

```ts
// append to src/acts/module-graph.ts
const SVG_NS = 'http://www.w3.org/2000/svg'

export function initModuleGraph(container: HTMLElement): (progress: number) => void {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  svg.setAttribute('viewBox', '0 0 400 220')
  svg.classList.add('module-graph')
  container.appendChild(svg)

  const circles = new Map<string, SVGCircleElement>()
  MODULES.forEach((node) => {
    const circle = document.createElementNS(SVG_NS, 'circle')
    circle.setAttribute('r', '6')
    circle.setAttribute('class', `module-graph__node module-graph__node--${node.clusterId}`)
    svg.appendChild(circle)
    circles.set(node.id, circle)
  })

  return function render(progress: number): void {
    MODULES.forEach((node) => {
      const { x, y } = nodePosition(node, progress)
      const circle = circles.get(node.id)
      if (!circle) return
      circle.setAttribute('cx', String(x))
      circle.setAttribute('cy', String(y))
    })
  }
}
```

- [ ] **Step 6: Write the narrative content**

```ts
// src/content/act-1.ts
export function mountAct1(section: HTMLElement): void {
  section.innerHTML = `
    <p data-cue="0">Before Next.js can run anything, it has to turn your source into something a JS engine can execute. That splits into two jobs: a <strong>compiler</strong> that parses and transforms each file, and a <strong>bundler</strong> that decides how files get grouped into the chunks that actually ship.</p>
    <p data-cue="0.3">The compiler is SWC, a Rust binary Next.js adopted in place of Babel. It parses TypeScript and JSX, strips types, transpiles syntax — fast enough to run on every file, on every save.</p>
    <p data-cue="0.6">Bundling is a separate job. Given a graph of modules and their imports, Next.js has run two bundlers: Webpack, the long-time default for production builds, and Turbopack, a Rust-based bundler built to recompute only the part of the graph that actually changed.</p>
    <p data-cue="0.9">Watch the graph: each node is a module, and as bundling proceeds they pull into the chunk they'll ship in. Fewer, larger chunks mean fewer requests; more, smaller chunks mean less unrelated code loaded per page.</p>
  `
}
```

- [ ] **Step 7: Add module-graph CSS**

```css
/* append to src/styles.css */
.station-stage {
  position: relative;
  width: 100%;
  height: 100%;
}

.station-stage > * {
  display: none;
  width: 100%;
  height: 100%;
}

.station-stage[data-act="compile-bundle"] .module-graph {
  display: block;
}

.module-graph__node {
  fill: #8b949e;
}

.module-graph__node--app-shell {
  fill: #3fb950;
}

.module-graph__node--page {
  fill: #d29922;
}

.module-graph__node--vendor {
  fill: #f78166;
}
```

- [ ] **Step 8: Wire into `main.ts`**

```ts
// src/main.ts
import './styles.css'
import { initScrollProgress } from './scroll-progress'
import { renderBackbone } from './backbone'
import { updateTrainCar } from './train-car'
import { renderProgressRail, updateProgressRail } from './progress-rail'
import { mountAct1 } from './content/act-1'
import { initModuleGraph } from './acts/module-graph'

const sections = Array.from(document.querySelectorAll<HTMLElement>('.act'))
const diagramRoot = document.getElementById('diagram-root')!
const railRoot = document.getElementById('rail-root')!

const stationStage = document.createElement('div')
stationStage.className = 'station-stage'
diagramRoot.appendChild(stationStage)

const backboneSvg = renderBackbone(diagramRoot)
renderProgressRail(railRoot)

const act1Section = sections.find((s) => s.dataset.act === 'compile-bundle')!
mountAct1(act1Section)
const renderModuleGraph = initModuleGraph(stationStage)

initScrollProgress(sections, (update) => {
  updateTrainCar(backboneSvg, update.overallProgress)
  updateProgressRail(railRoot, update.actId)
  stationStage.dataset.act = update.actId
  if (update.actId === 'compile-bundle') renderModuleGraph(update.actProgress)
})
```

- [ ] **Step 9: Verify manually**

Run: `npm run dev`, scroll to the "Compile/Bundle" act.
Expected: four paragraphs of narrative are visible on the left; on the right, the module-graph nodes start scattered and visibly pull into three colored clusters (green app-shell, yellow page, orange vendor) as you scroll through the act.

---

## Task 6: Act 5 — Ship & Hydrate (content + code morph)

**Files:**
- Create: `src/content/act-5.ts`
- Create: `src/acts/code-morph.ts`
- Test: `src/acts/code-morph.test.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `ScrollProgressUpdate` (`actId`, `actProgress`) from Task 2, the `station-stage` element from Task 5's wiring.
- Produces: `mountAct5(section): void`, `STAGES`, `revealedLength(progress, stageIndex): number`, `initCodeMorph(container): (progress: number) => void`.

- [ ] **Step 1: Write the failing test for the reveal function**

```ts
// src/acts/code-morph.test.ts
import { describe, it, expect } from 'vitest'
import { STAGES, revealedLength } from './code-morph'

describe('revealedLength', () => {
  it('reveals nothing before a stage starts', () => {
    expect(revealedLength(0, 1)).toBe(0)
  })

  it('reveals everything once a stage has fully passed', () => {
    expect(revealedLength(1, 0)).toBe(STAGES[0].text.length)
  })

  it('reveals partial text mid-stage', () => {
    const len = revealedLength(1 / 6, 0)
    expect(len).toBeGreaterThan(0)
    expect(len).toBeLessThan(STAGES[0].text.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/acts/code-morph.test.ts`
Expected: FAIL — `code-morph.ts` does not exist.

- [ ] **Step 3: Implement the stage data and pure reveal function**

```ts
// src/acts/code-morph.ts
export const STAGES = [
  { label: 'source (JSX)', text: 'function Page() {\n  return <h1>hi</h1>\n}' },
  { label: 'Flight payload', text: '1:["$","h1",null,{"children":"hi"}]' },
  { label: 'hydrated DOM', text: '<h1 data-reactroot="">hi</h1>' }
]

export function revealedLength(progress: number, stageIndex: number): number {
  const stageCount = STAGES.length
  const stageStart = stageIndex / stageCount
  const stageEnd = (stageIndex + 1) / stageCount
  const stageText = STAGES[stageIndex].text
  if (progress <= stageStart) return 0
  if (progress >= stageEnd) return stageText.length
  const localProgress = (progress - stageStart) / (stageEnd - stageStart)
  return Math.round(stageText.length * localProgress)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/acts/code-morph.test.ts`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Add the DOM mount function (no test — verified manually)**

```ts
// append to src/acts/code-morph.ts
export function initCodeMorph(container: HTMLElement): (progress: number) => void {
  const root = document.createElement('div')
  root.className = 'code-morph'

  const pres = STAGES.map((stage) => {
    const wrap = document.createElement('div')
    wrap.className = 'code-morph__stage'
    const heading = document.createElement('div')
    heading.className = 'code-morph__label'
    heading.textContent = stage.label
    const pre = document.createElement('pre')
    wrap.append(heading, pre)
    root.appendChild(wrap)
    return pre
  })

  container.appendChild(root)

  return function render(progress: number): void {
    STAGES.forEach((stage, i) => {
      pres[i].textContent = stage.text.slice(0, revealedLength(progress, i))
    })
  }
}
```

- [ ] **Step 6: Write the narrative content**

```ts
// src/content/act-5.ts
export function mountAct5(section: HTMLElement): void {
  section.innerHTML = `
    <p data-cue="0">Once rendering finishes, Next.js has to get the result to the browser — and the two routers do this differently. Pages Router renders to HTML and embeds the page's props as a JSON blob called <code>NEXT_DATA</code>, so the client can reconstruct state without re-fetching. App Router does something else entirely.</p>
    <p data-cue="0.3">React Server Components don't serialize to JSON — they serialize to Flight, a line-oriented wire format that describes a tree, not a document. Each line is a numbered chunk: <code>1:["$","h1",null,{"children":"hi"}]</code> describes an element, and later lines can reference earlier ones by number.</p>
    <p data-cue="0.6">The server streams Flight rows as they're ready — that's how Next.js can start sending output before slower parts of the tree have finished rendering. On the initial load, it also renders that same tree straight to HTML, so the page is visible before any JS runs.</p>
    <p data-cue="0.9">Once the JS bundle loads, the client React runtime reads the embedded Flight payload — not the HTML — and hydrates: attaching event handlers to the DOM Next.js already painted, without re-rendering from scratch.</p>
  `
}
```

- [ ] **Step 7: Add code-morph CSS**

```css
/* append to src/styles.css */
.station-stage[data-act="ship-hydrate"] .code-morph {
  display: block;
}

.code-morph__stage {
  margin-bottom: 1rem;
}

.code-morph__label {
  color: #8b949e;
  font-size: 11px;
  margin-bottom: 0.25rem;
}

.code-morph pre {
  color: #c9d1d9;
  white-space: pre-wrap;
  min-height: 1.5em;
}
```

- [ ] **Step 8: Wire into `main.ts`**

```ts
// src/main.ts
import './styles.css'
import { initScrollProgress } from './scroll-progress'
import { renderBackbone } from './backbone'
import { updateTrainCar } from './train-car'
import { renderProgressRail, updateProgressRail } from './progress-rail'
import { mountAct1 } from './content/act-1'
import { initModuleGraph } from './acts/module-graph'
import { mountAct5 } from './content/act-5'
import { initCodeMorph } from './acts/code-morph'

const sections = Array.from(document.querySelectorAll<HTMLElement>('.act'))
const diagramRoot = document.getElementById('diagram-root')!
const railRoot = document.getElementById('rail-root')!

const stationStage = document.createElement('div')
stationStage.className = 'station-stage'
diagramRoot.appendChild(stationStage)

const backboneSvg = renderBackbone(diagramRoot)
renderProgressRail(railRoot)

const act1Section = sections.find((s) => s.dataset.act === 'compile-bundle')!
mountAct1(act1Section)
const renderModuleGraph = initModuleGraph(stationStage)

const act5Section = sections.find((s) => s.dataset.act === 'ship-hydrate')!
mountAct5(act5Section)
const renderCodeMorph = initCodeMorph(stationStage)

initScrollProgress(sections, (update) => {
  updateTrainCar(backboneSvg, update.overallProgress)
  updateProgressRail(railRoot, update.actId)
  stationStage.dataset.act = update.actId
  if (update.actId === 'compile-bundle') renderModuleGraph(update.actProgress)
  if (update.actId === 'ship-hydrate') renderCodeMorph(update.actProgress)
})
```

- [ ] **Step 9: Verify manually**

Run: `npm run dev`, scroll to the "Ship/Hydrate" act.
Expected: four paragraphs of narrative are visible on the left; on the right, the three code blocks (source, Flight payload, hydrated DOM) type themselves out in order, each finishing before the next begins.

---

## Task 7: Robustness pass

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: nothing new — this task audits and hardens the output of Tasks 1–6.
- Produces: nothing new — no exports added.

- [ ] **Step 1: Confirm the reduced-motion guard is in place**

Open `src/styles.css` and confirm the block added in Task 1 Step 5 is present:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

No further change needed here: the backbone, train car, module graph, and code morph all update DOM attributes/text directly from scroll position on every frame rather than via independent CSS transitions, so there is nothing that auto-plays or needs to be suppressed beyond this guard.

- [ ] **Step 2: Verify reduced motion manually**

On macOS: System Settings → Accessibility → Display → enable "Reduce motion". Reload the dev server page and scroll through both built acts.
Expected: the diagram still updates in sync with scroll (it is driven directly by scroll position, not an independent animation), and no unrelated transition/animation fires.

- [ ] **Step 3: Verify no-JS readability manually**

Open the page in Chrome DevTools → Command Menu → "Disable JavaScript", then reload.
Expected: the page still renders as stacked, readable sections (backbone/train/rail will be empty/absent, which is fine); no content is hidden behind an opacity or visibility rule that depends on JS to reveal it. If any such rule is found in `src/styles.css`, remove it.

- [ ] **Step 4: Cross-browser manual check**

Run: `npm run build && npm run preview`, open the printed local URL in Chrome, Firefox, and Safari.
Expected: in all three, scrolling produces identical behavior — train car moves, rail highlights, module graph clusters in Act 1, code morph reveals in Act 5. Behavior should not differ between browsers, since nothing depends on native `animation-timeline`/`view-timeline` support.

- [ ] **Step 5: Final build and test verification**

Run: `npm run build`
Expected: completes with no errors or warnings.

Run: `npm run test`
Expected: all Vitest suites pass (`scroll-progress.test.ts`, `train-car.test.ts`, `module-graph.test.ts`, `code-morph.test.ts`).
