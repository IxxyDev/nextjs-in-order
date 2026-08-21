# Next.js internals visualizer — design

## Purpose

An interactive scrollytelling site that teaches how a Next.js project actually
runs under the hood — source code, through the build, through a server boot,
through a request being handled and rendered, to hydration and client-side
navigation, plus the dev-mode variant of the same pipeline. Audience: people
who want to understand Next.js internals, not just use the framework. Content
is adapted from a 9-part source article series (`all_articles.txt`) into
short English narrative "beats," not a verbatim dump or translation.

Reference genre: 200ms.thenodebook.com — a single system followed through
its whole lifecycle, told with one persistent diagram rather than static
illustrations per section.

## Core visual metaphor

One horizontal timeline ("backbone") spans the whole page, always visible.
Its stations are the pipeline stages, in causal order:

```
Source -> Compile/Bundle -> Server boot -> Request -> Route match ->
Render (Pages/App fork) -> Ship (HTML/Flight) -> Hydrate ->
Client (nav/cache/mutations) -> Dev-mode loop
```

A marker travels along the backbone as the reader scrolls and changes shape
at each station (source text -> AST -> chunk -> HTTP response -> DOM node),
making the transformation itself the visual, not a label describing it.

When a station is "active" (in view), the camera effectively zooms into a
station-specific sub-visualization built for that stage's content — not a
single reused diagram template:

- **Compile/Bundle**: a live force-directed module graph that visibly
  clusters into chunks as bundling happens.
- **Ship/Hydrate**: real code/protocol text on screen that morphs character-
  by-character between representations (JSX source -> serialized Flight
  payload -> hydrated HTML).

Other stations get their own bespoke sub-visualization later; the backbone
metaphor is the one constant across all of them.

## Ten acts (full outline, only two built in the prototype)

0. Prologue — what Next.js is (compiler + bundler + two runtimes + a wire
   protocol), wide view, nothing highlighted.
1. **Compile & bundle** — SWC, Turbopack/Webpack, manifests. *(prototype)*
2. Server boot — router-server / render-server split, HTTP callback,
   middleware.
3. A request arrives — route matching, rendering-strategy decision
   (SSG/SSR/ISR/RSC).
4. Render, two paths — Pages Router (`getStaticProps`/`getServerSideProps`)
   vs App Router (RSC + Flight) as forked lanes.
5. **Ship & hydrate** — NEXT_DATA vs Flight payload -> HTML -> hydration.
   *(prototype)*
6. Client takes over — navigation, prefetch, Segment Cache, shallow routing.
7. Mutations — Server Actions.
8. Dev mode — same pipeline, file-watcher in the loop, Fast Refresh.
9. Optimization levers — PPR, `next/image`, `next/font`, bundle splitting,
   file tracing, shown as knobs on the pipeline already seen.

## Architecture

Static site. No UI framework — Vite is used only as a dev server/bundler for
TypeScript and asset hashing. One long HTML document, split into per-act
`<section>` elements.

**Scroll-progress engine** (single source of truth, drives everything else):
`IntersectionObserver` determines which act section is active;
`requestAnimationFrame` computes a 0–1 progress value for scroll position
within that act. The value is written onto a CSS custom property
(`--progress`) on the active section. This is a plain, universally-supported
mechanism — no dependency on `animation-timeline`/`view-timeline`, so there
is no separate fallback code path to maintain.

**Components (conceptual — plain TS modules, not a component framework):**

- `backbone.ts` — renders the persistent SVG timeline with all 10 station
  markers. Present from act 0, regardless of how many acts are fully built.
- `train-car.ts` — the marker moving along the backbone; its shape per
  station is a CSS class keyed to `data-act`, swapped as progress crosses
  station boundaries.
- Per-act sub-visualization modules (`module-graph.ts`, `code-morph.ts`,
  …) — each exports a `render(progress: number)` called on every rAF tick
  while its act is active. Acts without a built sub-visualization just show
  the backbone/train and narrative text.
- `narrative.ts` — mounts the English prose for each act; paragraphs carry
  `data-cue` attributes mapping text position to a progress value, so the
  same scroll position drives both text reveal and diagram state.
- `progress-rail.ts` — persistent thin minimap across the top showing
  position among all 10 acts.

**Content authoring:** each act's narrative is hand-written directly as an
HTML fragment (no MDX/CMS layer — the source set is fixed, so a content
pipeline would be overhead without payoff). `all_articles.txt` stays as
reference material only; it is not shipped or referenced at runtime.

## Robustness

- No JS: page remains readable — sections stack normally, backbone/train
  simply doesn't animate. Content is never hidden behind JS.
- `prefers-reduced-motion`: skip character/shape morphing, jump-cut between
  states instead of tweening.
- No native-CSS-only code path to maintain a parallel fallback for — the JS
  scroll-progress engine is the only mechanism, so behavior is identical
  across evergreen browsers by construction.

## Scope: prototype phase

Goal: validate the backbone/train/zoom mechanic end-to-end on two acts
before committing to all ten.

- Full 10-station backbone (cheap: static SVG layout).
- Act 1 (Compile & bundle) fully built: narrative text + `module-graph.ts`.
- Act 5 (Ship & hydrate) fully built: narrative text + `code-morph.ts`.
- Acts 0, 2–4, 6–9: station markers exist on the backbone but are otherwise
  empty placeholders (no narrative, no sub-viz) — explicitly out of scope
  until the prototype validates the technique.

## Verification

No automated test framework — this is a visual/content site, not app logic.
Verification is manual: `vite build` succeeds with no console errors; scroll
performance checked in Chrome DevTools' performance panel; both prototype
acts checked for correct behavior in Firefox and Safari (the actual point of
the JS-driven scroll-progress choice over native CSS scroll-timelines).
