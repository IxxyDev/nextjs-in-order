# Visual language

A fixed grammar for every scene. Every encoding combines **shape + label + (color)** and, where a
state is transient, **motion with a static equivalent**. Color is never the only differentiator.
All glyphs are simple enough to draw in SVG at 16–24 px and remain recognizable at 8 px in the
minimap.

## 1. The world canvas

One SVG canvas, world coordinates `0 0 2400 1500`. Regions never move between scenes; only the
camera and the highlighted subset change. Layout (not to scale):

```
        x: 0        400        800        1200       1600       2000     2400
y 0     ┌──────── BUILD TIME · once per deploy ────────────────────────┐ ┌─ DEV ─┐
        │ SOURCE     │ COMPILER    │ BUNDLER          │               │ │ next  │
        │ app/ pages/│ SWC (Rust)  │ graph · layers   │  ○ ● ƒ        │ │ dev   │
        │ components │ transforms  │ Webpack|Turbopack│  route        │ │ parent│
        │ actions.ts │             │ chunking         │  analysis     │ │ child │
y 380   ├════════ .next ARTIFACT SHELF: manifests · server chunks · browser chunks · prerenders · cache ═┤ │watcher│
y 480   ├──────── SERVER · request time ───────────────────────────────┤ │on-dmnd│
        │ HTTP entry │ ROUTER-SERVER          │ RENDER-SERVER          │ │entries│
        │ node http  │ ladder 1→8             │ ┌ RSC runtime  ┐       │ │       │
        │ (custom    │ early exits ↓          │ │ Flight       │       │ │ HMR   │
        │  server    │ static · public · image│ └──── tee ─────┘       │ │socket │
        │  ring)     │ proxy                  │ ┌ SSR runtime  ┐→ HTML │ │       │
        │            │                        │ └──────────────┘       │ │       │
y 900   │ DATA SOURCES & SERVER CACHES: db/api · incremental cache · data cache · image cache │ │       │
y 1000  ╞════════════════════ NETWORK BOUNDARY ════════════════════════╡ │  ⇅    │
y 1050  │ BROWSER                                                       │ │       │
        │ DOM + React client runtime  │ CLIENT ROUTER · Route Cache · Segment Cache · prefetch │
        │ paint → hydrate             │ FlightRouterState (client copy) · Fast Refresh (dev)  │
y 1500  └───────────────────────────────────────────────────────────────┘ └───────┘
```

Rules:

- **Time flows top → bottom** across the three horizontal bands (build, server request, browser).
  Within a band, **causality flows left → right**.
- The **artifact shelf** straddles the build/server boundary: produced above, consumed below.
- The **network boundary** is the only line that decides code vs data. Every edge crossing it is
  labeled with what crosses (`code`, `data`, `data + refs`).
- The **DEV column** is present in every scene, hatched and dimmed in production journeys, live in
  Journey 9. Its edges reach into Source (watch), Bundler (embedded), router-server (HMR owner) and
  the browser (socket).
- The **custom-server ring** is a rounded frame around HTTP entry + router-server. Drawn as a faint
  outline in every scene, solid in Journey 10.

## 2. Bands and boundaries

| Boundary | Encoding | Label |
|---|---|---|
| Build time / request time | thick dashed horizontal line, hatched 24 px gutter above it | `build time ↑ · once per deploy` / `request time ↓ · every request` |
| Network | double solid line with a 16 px gap; crossing edges get a "crossing" chip | `network` at both ends; chip reads `code` / `data` / `data + refs` |
| Region | rounded rectangle, 1 px border, low-chroma fill, title tab at top-left | region name in caps |
| Runtime layer inside a region (RSC over SSR) | two frames stacked with a 12 px isometric offset (`skewY(-8°)` on the back frame) | `RSC runtime · react-server` / `SSR runtime · react-dom/server` |
| Phase marker in the step panel | pill with a phase glyph: ⚙ build, ▶ request, ▢ browser, ⟳ dev | phase name |

Isometric offset is the only "3D" on the site. It is used exactly where depth encodes layering:
two React runtimes, cache layers, nested segments, artifacts behind the runtime.

## 3. Entity glyphs

Each glyph is an SVG symbol with a slot for a monospace label. Sizes are in world units (1 unit ≈
1 px at camera zoom 1).

| Entity class | Shape | Distinguishing mark | Label style |
|---|---|---|---|
| Source module | 40×52 document rect with a folded top-right corner | badge tag under the name: `server` (none), `"use client"` (filled tag), `"use server"` (outlined tag) | `DashboardNav.tsx` |
| Transformed module | same document, corner square (fold gone), 8 px hatched header strip | suffix changes to `.js`; a small ✂ mark where types/JSX were removed | `DashboardNav.js` |
| Server chunk | 56×40 rounded rect with two offset "pages" behind it (stack) | solid 2 px border; hexagon badge `Node` or bolt badge `Edge` | `app/dashboard/settings/page.js` |
| Browser chunk | same stack, **dashed** border | window badge `browser`; hashed name | `chunks/app/dashboard/settings/page-3f9a.js` |
| Manifest | 56×44 ledger: rect with three ruled rows, left column of key dots | connector pins on the right edge; kind label on the tab | `client-reference-manifest` |
| Reference | 20×12 tag/pointer (arrow-shaped chip) | points from a placeholder to a manifest row or chunk | `ref #DashboardNav` |
| HTTP request | 64×24 capsule with a right-pointing nose | method text inside; header chips hang below (`RSC: 1`) | `GET /dashboard/settings` |
| HTTP response | capsule with a left-pointing nose and a payload glyph docked inside | status text; payload glyph = HTML / Flight / JSON / file | `200 text/html` |
| HTML | 40×52 page with `<>` corner mark and 5 ruled lines | placeholders drawn as dotted boxes inside | `document` |
| Flight / RSC payload | 44×64 vertical ribbon of numbered rows `0:` `1:` `2:` … with a sawtooth bottom edge while streaming | rows are colored by kind: tree row, content row, reference row, binary row (base64 stipple) | `Flight` |
| JSON data | 40×44 rect with `{ }` mark | – | `__NEXT_DATA__` |
| JavaScript execution | ring (stroke 3 px) around the executing entity with a ▶ glyph at 12 o'clock | ring rotates while executing (static: ring + ▶ only) | – |
| Cache | 60×48 drawer: rect with a handle and 3 key→value slots | each slot has a state chip (fresh / stale / invalid / empty) | `incremental cache` |
| Route segment | rounded frame with a label tab; children frames nested 12 px inside | slot `[ ]` bracket where the next segment goes | `dashboard` |
| Layout | route segment frame with a thicker tab | – | `layout.tsx` |
| Page leaf | segment frame filled | – | `page.tsx` |
| LayoutRouter | small bracket pair `⟦ ⟧` at the frame edge between parent and child | – | `LayoutRouter` |
| Suspense boundary | dashed rounded frame with a `⌛` corner glyph; empty = "hole" | filled when content arrives | `Suspense` |
| Component (server) | 32×24 rounded rect, outline | badge none | `AccountSummary` |
| Component (client) | same, with a filled `⚡` corner mark | – | `DashboardNav` |
| Server Action | 32×24 rect with a `⇄` mark | shows its ID chip `a1f3…` when inspected | `updateProfile` |
| Process | 64×48 rounded rect with a `PID` tab | parent/child linked with a supervisory dashed edge | `child` |
| Watcher | eye glyph over a folder stack | – | `watcher` |
| WebSocket | zigzag edge (not straight) with `ws` chip | – | `/_next/hmr` |
| Data source | cylinder | – | `db` |
| Person/user | none. The site never draws a user; the request is the actor | – | – |

Runtime badges (always shape + text): hexagon `Node`, bolt `Edge`, window `browser`, gear `Rust`,
cloud `CDN` (only in caching notes).

## 4. Edges

| Edge kind | Line | Head | Label chip |
|---|---|---|---|
| Transformation (A becomes B) | solid | filled triangle | verb: `transform`, `bundle`, `render`, `serialize` |
| Data flow (A is sent to B unchanged) | solid, thinner | open triangle | noun: `Flight`, `HTML`, `props` |
| Reference / lookup | dotted | small circle at the target | `lookup`, `ref` |
| Control / decision | dashed | filled triangle | `if matched`, `else` |
| Network crossing | edge continues through the boundary gap; a crossing chip sits on the line | – | `code` / `data` / `data + refs` |
| Tee / split | one line splits into two identical lines with a `⑂` mark | – | `tee` |
| Supervision (process) | dashed with a `⟳` chip | – | `restart on config change` |
| Dev-only edge | dashed + violet chip `dev` | – | – |

Edges are drawn as orthogonal polylines with 8 px corner radius so paths stay readable under zoom.

## 5. State encodings

Applied as overlays on any glyph, always with a text chip so the state survives without color.

| State | Overlay | Chip |
|---|---|---|
| Current (the object being followed) | 2 px accent stroke + soft outer glow; the token has a ring | `now` |
| Active (executing or being read) | JS execution ring or read pulse (static: ring) | `running` / `reading` |
| Preserved (kept as-is through a transition) | grey 1.5 px stroke + 🔒 lock glyph at the corner | `kept` |
| Replaced | old fades to 30 % with a strikethrough on its label; new slides into the same slot | `replaced` on old, `new` on new |
| Invalidated | diagonal hatch overlay + ✕ glyph | `invalid` |
| Stale (servable but expired) | dotted stroke + clock glyph | `stale` |
| Fresh (cached and valid) | solid stroke + ✓ glyph in the cache slot | `fresh` |
| Empty / miss | slot drawn as dotted outline | `miss` |
| Dimmed (exists but irrelevant to the step) | 35 % opacity, no chip | – |
| Not available in this mode (e.g. Fast Refresh in prod) | hatched fill + `n/a` chip | `n/a` |

The changed-vs-preserved panel in each step lists every entity with the `kept`, `new`, `replaced`
or `invalid` chip so the information also exists as text.

## 6. Color tokens

Colors are semantic tokens defined once. Each token has light and dark values; hue never carries a
meaning that shape and label do not also carry.

| Token | Used for | Light | Dark |
|---|---|---|---|
| `--band-build` | build band fill | `#fbf6ea` | `#1e1a12` |
| `--band-server` | server band fill | `#eef3fb` | `#12171f` |
| `--band-browser` | browser band fill | `#eefaf1` | `#12201a` |
| `--band-dev` | dev column fill | `#f5eefb` | `#1b1420` |
| `--ink` | strokes, labels | `#1f2328` | `#e6edf3` |
| `--ink-muted` | dimmed strokes, secondary labels | `#6e7781` | `#8b949e` |
| `--accent-now` | followed object, current step | `#d4610b` | `#f0883e` |
| `--accent-code` | Client Component / browser code crossing | `#0969da` | `#58a6ff` |
| `--accent-data` | Flight / data crossing | `#8250df` | `#a371f7` |
| `--accent-html` | HTML | `#1a7f37` | `#3fb950` |
| `--accent-cache` | caches | `#0e7c86` | `#39c5bb` |
| `--state-invalid` | invalidated hatch | `#cf222e` | `#f85149` |
| `--state-stale` | stale dotted | `#9a6700` | `#d29922` |
| `--state-kept` | preserved | `#6e7781` | `#8b949e` |

Contrast target: all chips ≥ 4.5:1 against their band fill in both themes.

## 7. Typography

- Prose: system UI sans, 16 px base, line-height 1.55, max 62 ch.
- Identifiers, headers, file names, protocol rows: monospace, 13 px in panels, 11 px on the canvas.
- Canvas labels are rendered in an HTML overlay positioned from world coordinates, **not** as SVG
  text inside the zoomed group, so they keep a constant screen size at every zoom level and never
  blur during camera motion. Labels that would overlap at the current zoom collapse to their glyph
  with a tooltip-free, click-to-inspect fallback (the label is still in the step's text
  equivalent).

## 8. Motion vocabulary

Motion is used only for the conceptual events the brief lists. Every verb has a static equivalent
used under `prefers-reduced-motion` and in the text equivalent.

| Verb | Animation (≤ 600 ms, ease-out) | Static equivalent |
|---|---|---|
| travel | token moves along an edge path | token drawn at the destination, edge highlighted, "from → to" in the panel |
| transform | token cross-fades between glyphs inside a machine while the execution ring turns | before/after glyphs side by side with ✂ / ⚙ marks |
| split (tee) | token duplicates; the two copies travel different edges | two tokens drawn at both destinations, `⑂` mark |
| pack | modules slide into a chunk container | chunk drawn with its module list |
| connect | a reference chip draws a dotted line to a manifest row, then to the chunk | the dotted path drawn complete |
| gate | request capsule pauses at a ladder step; the step lights; a decision chip appears (`matched` / `pass`) | ladder with the taken branch bold, skipped steps dimmed |
| exit | capsule leaves the ladder sideways to an early-exit target | exit edge bold |
| assemble | nested segment frames appear from root inward | full nesting shown with numbered order |
| reference | a Client Component glyph collapses into a reference chip | component shown with its reference chip beside it |
| fill | a Suspense hole receives content: dashed frame becomes solid | before/after frames |
| light-up | hydration glow expands only over client glyphs | client glyphs marked `hydrated`, server glyphs marked `static` |
| diff | two trees overlaid; shared prefix gets lock glyphs; divergent tail highlighted | same, without the overlay animation |
| swap | old segment slides out, new slides in; siblings and parents keep lock glyphs | replaced/kept chips |
| invalidate | hatch overlay sweeps across a cache slot | hatched slot |
| resume | postponed-state glyph unfolds into the hole | before/after |
| stale-serve | response leaves immediately; a second, dimmer execution ring keeps turning in the background | two parallel arrows: `served (stale)` and `regenerating` |
| refresh (dev) | client-edit: light-up on one component; server-edit: a new Flight travels and merges | before/after with chips |
| wrap | the custom-server ring draws itself around HTTP entry + router-server | ring shown |

Camera moves (pan/zoom) are 500 ms, preserve orientation (no rotation), and are pausable: while
autoplay is paused nothing moves. Continuous decorative motion does not exist.

## 9. Compare mode encoding

Two synchronized canvases side by side (desktop) or stacked (mobile), each a full world instance
with its own camera. The same step index drives both. Differences are emphasized by a `differs`
chip on the entities that exist in one lane only, and a shared vertical time ruler shows which lane
is ahead (e.g. Pages Router waits for all data before streaming; App Router streams by boundary).

## 10. Token (followed object) glyphs

The token is the object the journey follows. It keeps a persistent orange ring and changes its
inner glyph at each transformation:

`.tsx` document → transformed `.js` → module-in-graph node → chunk → manifest row → request
capsule → matched-route chip → loader tree → Flight ribbon → HTML page → DOM node → hydrated node
→ segment slice → action envelope → invalidation signal ✕ → changed-module document.

Each token state has a name shown in the step header, e.g. "Following: Flight row 3 (segment
`settings`)".
