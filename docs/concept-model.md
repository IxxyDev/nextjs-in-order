# Concept model: Next.js as a system

This document reconstructs the system described by the nine-part "Next.js изнутри" article
series (`all_articles.txt`, May–Aug 2025) as an explicit ontology. It is the domain model that
every scene, journey, comparison and inspector panel on the site is generated from. Nothing
visual is decided here; see `visual-language.md` for encodings and `experience-architecture.md`
for the learning sequence.

Scope note that the product must display: the articles describe Next.js in the 15 → 16
transition. The site labels every claim as **article snapshot**, **current behavior**, or both.
Section 7 lists the claims where the two differ and the verification sources.

---

## 1. Phases (the time axis)

Every entity exists in exactly one primary phase. Scenes never mix phases without a visible
boundary.

| Phase | Trigger | Ends when | What exists only here |
|---|---|---|---|
| **Build** | `next build` | `.next/` is complete | compiler, bundler, module graph, route analysis, prerendering, tracing |
| **Server startup** | `next start` / `app.prepare()` | request handler is ready (socket may already be listening) | manifest loading, route table, cache handler init |
| **Request** | one HTTP request hits the Node callback | response stream closes | routing ladder, proxy run, render, action execution, cache read/write |
| **Browser runtime** | HTML bytes arrive | tab closes | paint, hydration, client router, client caches, prefetch, navigation, Fast Refresh client |
| **Development** | `next dev` | process exits | watcher, on-demand compilation, HMR channel, restart supervisor. Build and Request phases interleave inside it |

Build-time work is done once per deploy. Request-time work is done per request. Browser-time work
is done per tab. Dev-time collapses the first three into one long-lived process.

## 2. Execution environments

| Environment | Runs | Notes for the model |
|---|---|---|
| **Rust / native** | SWC transforms, Turbopack graph (`turbo-tasks`), `sharp` | Reached from Node through N-API; never sees the browser |
| **Node.js main process** | router-server, render-server, RSC runtime, SSR runtime, Route Handlers, API Routes, Server Actions, incremental cache, image optimizer, Proxy (current default) | Long-lived in `next start`; also the custom server host |
| **Node.js worker threads / child processes** | SWC worker pool (scheduled by the native binding), dev static-params workers, dev child process | Exist to parallelize or to isolate state |
| **Edge runtime** | `NextWebServer` code paths, Middleware (article era), routes with `runtime = 'edge'` | Web-API only: no fs, no native modules, size limits |
| **Browser main thread** | React client runtime, App/Pages client router, Route Cache, Segment Cache, Fast Refresh runtime, HMR client | Receives **data** from Server Components and **code** only for Client Components |
| **Browser worker** | `next/script strategy="worker"` (Partytown) | The only browser-side off-main-thread entity in the series |
| **Persistent storage** | `.next/` output, `.next/cache/images`, build filesystem cache, Turbopack persistent cache, incremental cache backing store | Survives process restarts; the bridge between build phase and request phase |
| **Network** | HTTP request/response streams, WebSocket for HMR | The one boundary that decides "code or data" |

## 3. Entity catalog

Column key. **Phase**: B build, S startup, R request, W browser, D dev. **Env**: as in §2.
**Reaches browser**: `code` (JavaScript executes there), `data` (serialized result only), `no`.

### 3.1 Source code (region: Source)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime | Consumers | Invalidation | Reaches browser |
|---|---|---|---|---|---|---|---|---|---|
| `app/` segment folder | B | fs | route description | folder nesting, special files | loader-tree node | until edited | route discovery, `next-app-loader`, dev watcher | file change (dev), rebuild (prod) | no (structure only, as FlightRouterState) |
| `layout.tsx` / `page.tsx` (Server Component) | B, R | Node (RSC layer) | module | props, data sources | React elements → Flight | per request (execution) | RSC runtime | edit → server module cache cleared (dev) | data only |
| `loading.tsx` / `error.tsx` / `not-found.tsx` / `template.tsx` | B, R | Node (RSC) or browser (`error.tsx` is a Client Component) | module | – | Suspense/error boundaries in the segment tree | per request | loader tree | edit | `error.tsx`: code; `loading.tsx`: data |
| `"use client"` module (`DashboardNav.tsx`, `ProfileForm.tsx`) | B, R, W | Node (SSR layer) **and** browser | module | props from Flight | DOM (via SSR to HTML, via hydration to live) | per request + tab | SSR runtime, browser React | Fast Refresh (dev) | **code** |
| `"use server"` function (`actions.ts: updateProfile`) | B, R | Node | module + protocol endpoint | serialized args, encrypted closure values | return value, revalidation calls | per invocation | action handler | redeploy changes ID | reference only (ID string) |
| `pages/*.tsx` page | B, R, W | Node + browser | module | props from data function | HTML, `__NEXT_DATA__` | per request + tab | pages renderer, browser React | rebuild | **code** (whole tree) |
| `_app.tsx` | B, R, W | Node + browser | module | `Component`, `pageProps` | wrapped page | per request; preserved across client navigations | pages renderer, client router | rebuild | code |
| `_document.tsx` | B, R | Node only | module | rendered app HTML, chunk list | HTML shell (`<html>`, `<Main/>`, `<NextScript/>`) | per request; never on client navigation | pages renderer | rebuild | no |
| `getStaticProps` / `getStaticPaths` | B (and R for ISR / fallback) | Node | data function | params | props JSON, path list | build; regenerated on ISR | prerender, ISR regeneration | `revalidate` expiry, on-demand revalidate | data (`/_next/data/*.json`) |
| `getServerSideProps` | R | Node | data function | `req`, `res`, `params`, `query` | props JSON | per request | pages renderer, `/_next/data` endpoint | none (never cached by framework) | data only, code stripped from browser chunk |
| `getInitialProps` | R **and** W | Node on first load, browser on client navigation | data function | context | props | per navigation | pages renderer, client router | – | **code** (executes in browser) |
| `route.ts` (Route Handler) | B, R | Node or Edge | module | `Request` | `Response` | per request | render-server (method table wrapper) | rebuild | no |
| `pages/api/*.ts` (API Route) | B, R | Node | module | `(req, res)` with helpers | manual response | per request | render-server (API wrapper) | rebuild | no |
| `proxy.ts` / `middleware.ts` | B, R | article: Edge; current: Node by default | request interceptor | request, matcher config | decision encoded in response headers (redirect / rewrite / headers / next) | per matched request | router-server ladder step 3 | rebuild; dev watcher | no |
| `next.config.js` | B, S, D | Node | configuration | – | headers/redirects/rewrites, `output`, `images`, `cacheComponents`, `modularizeImports`, `useFileSystemPublicRoutes` | process lifetime | build orchestrator, router-server, dev supervisor (restart on change) | change → dev child restart | partly (public runtime config) |
| `server.js` (custom server) | S, R | Node | outer HTTP owner | `req`, `res` | calls `handle(req, res, parsedUrl?)` | process lifetime | Node HTTP server | **not watched, not compiled** by Next | no |
| `.babelrc` (presence) | B | – | compiler switch | – | selects Babel instead of SWC | build | build orchestrator | remove file | no |

### 3.2 Build pipeline (region: Build)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime | Consumers | Invalidation | Reaches browser |
|---|---|---|---|---|---|---|---|---|---|
| `next build` orchestrator | B | Node | pipeline | source tree, config | `.next/` | one run | – | – | no |
| `buildId` | B | Node | identifier | – | string used in `/_next/data/{buildId}`, `__NEXT_DATA__`, static asset paths | one deploy | router-server, pages client router, prerender manifest | every build | data |
| Route discovery | B, D | Node | route description builder | `app/`, `pages/` walk | route map → `routes-manifest`, loader trees | build (prod) / continuous (dev watcher) | bundler entrypoints, router-server | file add/remove | no |
| **SWC compiler** | B, D | Rust via N-API (per-platform package, WASM fallback) | compiler (single file in → single file out) | one `.ts/.tsx/.js` module | transformed module | per file | bundler loaders | file change | no |
| SWC Next-specific transforms | B, D | Rust | compiler passes | module + layer config | strips types, JSX → runtime calls, downlevel, minify, `console.*` removal, `data-testid` strip, CSS-in-JS, `modularizeImports`, `optimizePackageImports`, `serverComponents` (marks `"use client"` boundary), `serverActions` (assigns action IDs), `react-refresh` registration (dev, client layer only) | per file | bundler | – | no |
| SWC worker scheduler | B, D | Node `worker_threads` (Next is the thread factory; native binding calls `registerWorkerScheduler`) | parallelism | transform jobs | transformed modules | build | SWC | – | no |
| Babel (fallback) | B | Node (JS) | compiler | module | transformed module, **without** SWC transforms | build | bundler | – | no |
| **Bundler** (Webpack) | B, D | Node (JS) | bundler (whole-app view) | entrypoints, module graph, layers | chunks, manifests | build | `.next/` | changed modules (dev) | no |
| Webpack target compilers ×3 | B | Node | bundler instances | same source, different externals/output | client build, Node server build, edge build; results stitched | build | – | – | no |
| Webpack layers (`rsc`, `ssr`, `app-pages-browser`, `action-browser`, `api-node`, `api-edge`, `middleware`, `instrument`, `edge-asset`, `pages-dir-browser/edge/node`, `shared`) | B | Node | bundler label on a module | module + how it was reached | resolution conditions + loader config for that module | build | resolver, loaders | – | no |
| `react-server` conditional export | B | Node resolver | module-resolution rule (from React's `package.json`) | import of `react`/`react-dom` from a module in the `rsc` layer | `react.react-server.js` (no `useState`/`useEffect`) instead of `index.js` | build | RSC layer modules | – | no |
| `next-swc-loader` | B, D | Node → Rust | loader | module | transformed module (per-layer SWC options) | per module | Webpack | – | no |
| `next-flight-loader` | B, D | Node | loader | RSC-layer module | module with client/server boundary markers | per module | Webpack | – | no |
| `next-app-loader` | B, D | Node | loader | segment folder conventions | route module wrapping the loader tree | per route | Webpack | – | no |
| `next-font-loader` | B, D | Node (network for Google fonts) | loader | `next/font/local` or `next/font/google` call | `@font-face` CSS, downloaded font files, fallback `size-adjust` metrics | per font module | Webpack | – | data (CSS) + static assets |
| CSS loaders (`postcss-loader`, `lightningcss-loader`, `mini-css-extract`) | B, D | Node | loaders | CSS / CSS modules | extracted `.css` chunks | per module | Webpack | – | data (CSS) |
| `flight-client-entry-plugin` | B | Node | plugin | module graph | for each server entry, a matching **client entry** at every `"use client"` boundary | build | Webpack client compiler | – | no |
| `flight-manifest-plugin` | B | Node | plugin | client entries + chunk graph | `*_client-reference-manifest.js` | build | RSC runtime | – | no |
| Manifest plugins | B | Node | plugins | route map, chunk graph | `routes-manifest`, `pages-manifest`, `build-manifest`, `prerender-manifest`, `middleware-manifest`, `server-reference-manifest` | build | router-server, render-server | – | see 3.3 |
| `optimization.splitChunks` policy | B | Node | chunking rule | client module graph | framework chunk (React, ReactDOM, Next), lib chunks (any `node_modules` package > ~160 KB), Webpack runtime chunk, per-route chunks, `import()` chunks | build | browser | – | **code** |
| **Turbopack** | B, D | Rust via N-API (`Project` object created by Next) | bundler | entrypoints requested by Next | same manifests and chunks as Webpack | build / dev session | `.next/`, dev server | `turbo-tasks` invalidation | no |
| `turbo-tasks` primitives | B, D | Rust | incremental computation graph | functions (units of execution and invalidation), tasks (a call with args), values, `Vc` (cell pointer) | memoized results; dirty propagation bottom-up; only affected subgraph recomputes | session; persistent cache across runs | Turbopack crates | file change | no |
| Turbopack crates (`turbopack-core`, `-ecmascript`, `-css`, `-resolve`, `-node`) | B, D | Rust | bundler internals | modules | module graph, chunks, resolutions | – | – | – | no |
| Unified graph | B, D | Rust | bundler property | all targets at once | one graph for client, server, edge | – | – | – | no |
| Route analysis | B | Node | rendering-strategy detection | route modules, exports (`getStaticProps` etc.), dynamic API usage (`cookies()`, `headers()`, `searchParams`), `generateStaticParams`, `"use cache"` | strategy per route: static ○, SSG ●, dynamic ƒ, ISR revalidate, PPR shell + postponed state | build | prerender step, `prerender-manifest`, build summary | – | no |
| Prerender step | B | Node (with RSC + SSR runtimes) | renderer at build time | static routes | `.html`, `.json` (pages), `.rsc` + `.prefetch.rsc` (app), PPR static shell + postponed state | build | incremental cache initial entries | ISR regeneration | data (as responses) |
| File tracing | B | Node | dependency analysis | server entries | minimal file list per entry (`.nft.json`) | build | standalone assembly | – | no |
| Standalone assembly | B | Node | deployment artifact builder | traced file list | `.next/standalone/` with its own `server.js` | build | deploy | – | no |
| Build summary (○ ● ƒ tree) | B | Node | report | route analysis | console output | build | developer | – | no |

### 3.3 `.next` artifacts (region: Artifacts shelf, between Build and Server)

| Entity | Phase | Env | Role | Inputs | Outputs / contents | Lifetime | Consumers | Invalidation | Reaches browser |
|---|---|---|---|---|---|---|---|---|---|
| `routes-manifest.json` | B → S | fs | manifest | route map, config | static/dynamic routes with regexes and priority, redirects, rewrites (beforeFiles/afterFiles/fallback), headers, dataRoutes, `rsc` header names | deploy | router-server startup | rebuild | no |
| `server/pages-manifest.json` | B → S | fs | manifest | pages routes | route → compiled server module path (or `.html` for static) | deploy | render-server (pages) | rebuild | no |
| `build-manifest.json` | B → S | fs | manifest | client chunk graph | route → list of browser chunk files; `lowPriorityFiles` (`_buildManifest.js`, `_ssgManifest.js`) | deploy | `<NextScript/>`, pages client router | rebuild | data (a browser copy is shipped) |
| `prerender-manifest.json` | B → S | fs | manifest | prerender step | SSG routes with `initialRevalidateSeconds`, `initialExpireSeconds`, `srcRoute`, `dataRoute`, `fallback` mode, `dynamicRoutes` regexes | deploy | render-server (ISR branch), router-server | rebuild | no |
| `server/middleware-manifest.json` | B → S | fs | manifest | proxy matcher config | regexes, header/cookie conditions | deploy | router-server ladder step 3 | rebuild | no |
| `*_client-reference-manifest.js` | B → R | fs / Node | manifest (**client references**) | `flight-manifest-plugin` | client module id → browser chunk files + export names | deploy | RSC runtime when it meets a `"use client"` boundary | rebuild | no (the *references* travel inside Flight) |
| `server-reference-manifest` | B → R | fs / Node | manifest (**server references**) | `serverActions` transform | action ID → server module + export | deploy | action handler | rebuild (old IDs rejected) | no (IDs travel in `Next-Action`) |
| Server chunks (`.next/server/{app,pages}/…`) | B → R | Node (loaded with `require`) | deployment artifact | server target build | executable route modules | deploy; dev: evicted from `require` cache on server change | render-server | rebuild / dev server edit | no |
| Edge chunks | B → R | Edge | deployment artifact | edge target build | proxy bundle, edge routes | deploy | Edge runtime | rebuild | no |
| Browser chunks (`.next/static/chunks/…`) | B → W | browser | deployment artifact | client target build | framework, lib, runtime, route, dynamic chunks, CSS | deploy (content-hashed, long cache) | browser via `<script>`/`<link>` and client references | rebuild | **code** |
| Prerendered HTML / JSON / RSC | B → R | fs → incremental cache | build artifact | prerender step | per route: `.html`, `.json` (pages props), `.rsc` (Flight), `.prefetch.rsc`, `.meta`, PPR shell + postponed state | until ISR regenerates | render-server cache lookup | `revalidate`, `revalidateTag/Path`, on-demand | data |
| `.next/cache/` | B, R | fs | persistent cache dir | – | build filesystem cache (Turbopack persistent cache, Webpack cache), `images/` optimizer cache, incremental cache default store | across builds / process restarts | bundler, image optimizer, incremental cache | manual delete, key change | no |
| `.next/types` | D | fs | generated route types | watcher route map | TypeScript types for routes | dev session | tsc / editor | route change | no |
| `.next/standalone/` | B | fs | deployment artifact | tracing | minimal `node_modules` subset + compiled server + `server.js` entry | deploy | `node server.js` | rebuild | no |
| `public/` | – | fs | static assets | – | files served as-is | deploy | router-server early exit | – | data |

### 3.4 Server entry and router-server (region: Router)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime | Consumers | Invalidation | Reaches browser |
|---|---|---|---|---|---|---|---|---|---|
| Node HTTP server + single `(req, res)` callback | S, R | Node | runtime entry | socket | calls the request handler | process | – | – | no |
| Early listen + readiness wait | S | Node | startup behavior | – | queued early requests, processed after init | startup | – | – | no |
| `next(options)` | S | Node | custom-server API | `dev`, `dir`, `hostname`, `port`, `httpServer`, bundler choice, config overrides | app instance (nothing started) | process | custom server | – | no |
| `app.prepare()` | S | Node | custom-server API | – | promise; initializes router-server (+ bundler in dev) | startup | custom server | – | no |
| `app.getRequestHandler()` → `handle(req, res, parsedUrl?)` | R | Node | **router-server request handler** | raw request, optional modified `parsedUrl` (rebuilds `req.url` from it) | routed response | per request | custom server | – | no |
| `app.render()` / `renderToHTML()` / `render404()` / `renderError()` (deprecated) | R | Node | legacy API | pathname, query | article: historically bypassed router-server; now normalizes and calls the **same** `requestHandler` | per request | legacy custom servers (NestJS bridge) | deprecated | no |
| **router-server** | S, R | Node | router | raw request, manifests loaded at startup (buildId, page lists, route handlers, `public/` listing, proxy matchers) | one of: early response, handoff to render-server, continue ladder | process | – | – | no |
| Routing ladder | R | Node | ordered decision sequence | request | 1 config headers → 2 config redirects → 3 Proxy → 4 `beforeFiles` rewrites → 5 filesystem check (static file / exact route) → 6 `afterFiles` rewrites → 7 dynamic routes → 8 `fallback` rewrites | per request | – | – | no |
| Filesystem check exits | R | Node | early exits before React | path | `/_next/static/*` → chunk file; `public/*` → file; `/_next/image` → image optimizer; matched page or handler → render-server | per request | – | – | data / code (chunk files) |
| Minimal mode | R | Node | routing mode for serverless platforms | platform-routed request | ladder mostly skipped; request driven to render | – | – | – | no |
| Proxy runner | R | article: Edge; current: Node default | ladder step 3 | request matching `middleware-manifest` regexes | decision encoded in response headers (redirect / rewrite / set headers / next), read back by router-server | per matched request | router-server | – | no |
| render-server handoff | R | Node | call | resolved path + params as metadata | response, or "cannot render" → ladder continues at next step | per request | router-server | – | – |
| Image optimizer (`/_next/image?url&w&q`) | R | Node (`sharp`) | transformer | `url`, `w`, `q`, `Accept` | resized, re-encoded image; disk cache in `.next/cache/images` keyed by url+width+quality(+format) | per request; cache persists | browser `<img srcset>` | cache TTL, delete | data |
| HMR upgrade handler (`/_next/hmr`) | D | Node (router-server) | WebSocket owner | `upgrade` event, origin check against config | socket handed to bundler | dev session | HMR client | – | – |

### 3.5 render-server (region: Render)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime | Consumers | Invalidation | Reaches browser |
|---|---|---|---|---|---|---|---|---|---|
| `BaseServer` → `NextNodeServer` / `NextWebServer` | R | Node / Edge | renderer host | resolved route | HTML or Flight or handler response | process | router-server | – | no |
| Route module resolution | R | Node | lookup | resolved path | server module via `pages-manifest` / app manifests | per request | renderers | – | no |
| **Pages renderer** | R | Node | renderer | page module, data function result | HTML stream + `__NEXT_DATA__` | per request | router-server | – | data |
| Data function dispatch | R | Node | branch | page exports | SSG file read / ISR SWR branch / `getServerSideProps` run / `getInitialProps` run / static HTML | per request | pages renderer | – | – |
| `_app` wrap → `renderToReadableStream` | R | Node (SSR runtime) | render | `Component`, `pageProps` | app HTML (streamed as generated; props are complete before render starts) | per request | `_document` | – | data |
| `_document` shell + `<Main/>` + `<NextScript/>` | R | Node | HTML assembly | app HTML, `build-manifest` chunk list | full document with `<script>` tags | per request | browser | – | data |
| `__NEXT_DATA__` | R → W | Node → browser | serialized props | `pageProps`, `page`, `query`, `buildId` | `<script id="__NEXT_DATA__" type="application/json">`; duplicate of rendered data; warning above 128 KB | per document | pages hydration | – | data |
| `/_next/data/{buildId}/…json` endpoint | R | Node (or static file for SSG) | data-only response | client navigation request | `{ pageProps }` | per navigation | pages client router | buildId change | data |
| **App renderer** (`renderToHTMLOrFlight`) | R | Node | renderer | loader tree, request headers | HTML with inline Flight **or** Flight only (`RSC: 1`) | per request | router-server | – | data |
| Loader tree | B → R | Node | route description | segment folders | recursive `[segment, parallelRoutes, modules]` nodes; `children` and `@slot` keys | deploy | app renderer | rebuild / dev route change | structure only (as FlightRouterState) |
| Recursive segment render | R | Node (RSC layer) | algorithm | loader tree | per segment: render layout/page, descend into `children` and every parallel slot, wrap each child transition in a `LayoutRouter` | per request | Flight | – | data |
| `LayoutRouter` boundary | R, W | Node (SSR) + browser (Client Component) | slot | segment key | the place where the client router can swap one subtree without touching siblings | per tree position | client router | – | code |
| `FlightRouterState` | R ↔ W | Node ↔ browser | protocol structure (route **shape** without content) | loader tree / client tree | nested segment names with per-segment marks (refetch, head-only) | per navigation | server diff, client router | navigation | data (both directions) |
| Segment content slice | R → W | Node → browser | protocol structure | one segment's render | `[segment, tree patch, content, head]` | per response | client router merge | – | data |
| Client reference | R → W | Node → browser | placeholder in Flight | `"use client"` boundary + client-reference manifest lookup | `{ id, chunks, name }` + props instead of executed component | per Flight | SSR runtime (resolves to real component on server) and browser (loads chunk) | rebuild | data pointing to **code** |
| Flight / RSC payload | R → W | Node → browser | protocol (streamable rows; single-letter keys; text rows and base64 binary rows) | RSC render | rows: rendered Server Component output, client references with props, structure, Suspense boundaries | per response | SSR runtime (copy 1), browser (copy 2 inline or direct) | – | data |
| Stream tee | R | Node | split | one Flight stream | two identical streams | per request | SSR runtime, inline serializer | – | – |
| `self.__next_f` inline chunks | R → W | Node → browser | transport for Flight inside HTML | Flight copy 2 | many small `<script>self.__next_f.push([type, payload])</script>`: init, text chunk, base64 binary chunk | per document | browser reconstruction | – | data |
| Route Handler wrapper | R | Node / Edge | method table | `route.ts` exports | `GET`/`POST`/… dispatch | per request | render-server | – | no |
| API Route wrapper | R | Node | helper injector | `(req, res)` | body parsing, cookies, `res.json()` | per request | render-server | – | no |
| **Server Action handler** | R | Node | protocol endpoint | `POST` with `Next-Action: <id>`, serialized args body, encrypted closure values | Flight response: `a` (return value) and `f` (updated route Flight, present when the action called `updateTag` / `revalidatePath` / `refresh()`, wrote cookies, or redirected; **not** for `revalidateTag(tag, profile)`, which is stale-while-revalidate) | per action; dispatched sequentially per client | client router | unknown ID → rejected before execution | data |
| Closure encryption | B, R | Node | security mechanism | captured variables of inline `"use server"` functions | ciphertext bound to action ID (deploy-wide key); decrypted server-side only | per deploy | action handler | redeploy | data (opaque) |
| `.bind()` arguments | R | Node ↔ browser | explicit args | values passed by the developer | **plain JSON** in page source and POST body | – | action handler | – | data (readable) |
| No-JS form path | R | browser → Node | progressive enhancement | native `<form>` POST | full page rerender response | per submit | browser | – | data |
| **Incremental cache** | B, R | Node + persistent store | server render cache | key = route path + params (+ variant) | value = rendered HTML + RSC payload + meta (`revalidate`, tags); branches: miss → render and store; fresh → serve without render; stale → serve and regenerate in background | until expiry / invalidation | render-server before render | `revalidate` seconds, `revalidatePath`, `revalidateTag`, on-demand | data |
| Static shell + postponed state (PPR) | B → R | Node | build artifact pair | build render that stopped at Suspense boundaries | shell HTML (outside boundaries) + serialized resume point (inside) | deploy / ISR | request: shell served immediately, resume fills holes in the same stream | rebuild / revalidate | data |
| Data Cache / `"use cache"` entries | R | Node + store | function/component result cache | cached function args | result with `cacheLife()` profile and `cacheTag()` tags | per profile | render | tag/path revalidation, expiry | data |
| Request memoization | R | Node | per-request dedupe | identical `fetch`/cached calls in one render | one execution | one request | render | request end | no |

### 3.6 React runtimes (region: Render, two stacked layers)

| Entity | Phase | Env | Role | Inputs | Outputs | Reaches browser |
|---|---|---|---|---|---|---|
| **RSC runtime** (`react-server` build: `react.react-server.js`, `react-server-dom-*`) | B, R | Node, `rsc` layer | renderer to **Flight** | loader tree, Server Component modules, client-reference manifest | Flight stream. Executes async Server Components; cannot render DOM; no `useState`/`useEffect`; replaces Client Components with references | data |
| **SSR runtime** (`react-dom/server`) | B, R | Node, `ssr` layer | renderer to **HTML** | Flight copy 1 (deserialized to elements), Client Component modules | HTML stream with Suspense placeholders filled later. Does **not** re-execute Server Component source | data |
| **Client runtime** (`react-dom/client`) | W | browser | hydrator / reconciler | Flight copy 2 (reconstructed) + existing DOM, Client Component chunks | hydrated Client Components; Server Component output stays static DOM but *is* represented in the React tree as elements | code |

### 3.7 Network boundary (region: Network)

| Message | Direction | Headers / markers | Body | Consumer |
|---|---|---|---|---|
| Initial document request | browser → server | ordinary `GET`, `Accept: text/html` | – | router-server ladder |
| Document response | server → browser | `Content-Type: text/html`, streamed | HTML shell, Suspense placeholders, `<script>` chunk tags, `self.__next_f` pushes (app) or `__NEXT_DATA__` (pages) | browser paint, hydration |
| App navigation | browser → server | `RSC: 1`, `Next-Router-State-Tree: <url-encoded JSON FlightRouterState>`, `Next-Url`, query `?_rsc=<hash>` (CDN cache separation) | – | app renderer diff |
| Navigation response | server → browser | `Content-Type: text/x-component` | Flight patch: only the divergent subtree | client router merge |
| Prefetch (tree) | browser → server | `RSC: 1`, `Next-Router-Prefetch: 1`, `Next-Router-Segment-Prefetch: /_tree` | – | server prefetch renderer |
| Prefetch (segment) | browser → server | same + `Next-Router-Segment-Prefetch: <segment path>` | – | one segment per request, HTTP/2 multiplexed |
| Server Action | browser → server | `POST`, `Next-Action: <id>`, `Content-Type: multipart/form-data` or RSC-serialized | serialized args (+ encrypted closure values) | action handler |
| Action response | server → browser | `text/x-component` | Flight with `a` (result) and optional `f` (route rerender) | client router |
| Pages data | browser → server | `GET /_next/data/{buildId}/<page>.json` | – | `getServerSideProps` run or static JSON |
| Static chunk / asset | browser → server | `GET /_next/static/...`, `public/` path | – | router-server early exit |
| Image | browser → server | `GET /_next/image?url&w&q`, `Accept: image/avif,image/webp,…` | – | image optimizer |
| HMR | browser ↔ server | WebSocket `/_next/hmr`, origin-checked | build lifecycle, route map changes, change classification (client / server-only / middleware / server components / static params), reload command; client pings with `pathname` (pages) or router tree (app) | dev only |

### 3.8 Browser DOM and React runtime (region: Browser)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime | Consumers | Invalidation | Code/data |
|---|---|---|---|---|---|---|---|---|---|
| HTML document | W | browser | visible page before JS | document response | painted DOM | tab | user, hydration | navigation (full) | data |
| Streamed Suspense fill | W | browser | progressive completion | later HTML chunks + inline scripts | replaced placeholders | during stream | user | – | data |
| Browser chunk loading | W | browser | code delivery | `<script>` tags from `build-manifest` (pages) / client references (app) / `import()` (dynamic) | executable modules | tab | React | new deploy (hashes change) | code |
| `__NEXT_DATA__` read (pages) | W | browser | hydration input | inline JSON | `pageProps`, `page`, `query`, `buildId` | tab | `hydrateRoot` | – | data |
| `self.__next_f` reconstruction (app) | W | browser | Flight transport reader | pushed chunks (already present + still arriving) | Flight stream → React element tree with client references | tab | `hydrateRoot` | – | data |
| Full-tree hydration (pages) | W | browser | attach React to DOM | page component + same props | event handlers bound; **every** component executes; mismatch → warning + subtree re-render | once per document | – | – | code |
| Client-Component-only hydration (app) | W | browser | attach React to DOM | reconstructed tree | only Client Components execute; Server Component output stays as delivered | once per document | – | – | code (client only) |
| Hydration mismatch | W | browser | failure mode | `Date.now()`, `Math.random()`, `window` access, extensions mutating DOM | warning, subtree re-render, flicker | – | – | – | – |
| `router.isReady` | W | browser | pages nuance | ASO page hydrated with empty `query` | second render with real `query` | once | page code | – | – |
| Suspense boundary (client view) | W | browser | placeholder | streamed chunk | swapped content, selective hydration | tab | – | – | – |
| `next/dynamic` (Loadable) | B, W | browser | lazy boundary | `dynamic(() => import(...))`, `ssr: false`, `loading` | separate chunk at the `import()` boundary; 200 ms loading delay (article); `ssr: false` skips server render | tab | – | – | code |
| `next/image` client | W | browser | layout reservation | `width`/`height` or static import, `deviceSizes` | reserved box, `srcset` pointing at `/_next/image` | tab | browser | – | code + data |
| `next/font` output | B → W | browser | CSS | loader output | `@font-face`, self-hosted files, fallback metrics (`size-adjust`) | tab | browser | – | data |
| `next/script` strategies | W | browser main / worker | scheduling | `beforeInteractive` (before hydration), `afterInteractive` (default, after hydration), `lazyOnload` (idle), `worker` (Partytown) | third-party script executed at the chosen time | tab | – | – | code |

### 3.9 Client router and client caches (region: Client router)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime | Invalidation | Code/data |
|---|---|---|---|---|---|---|---|---|
| Pages client router | W | browser | navigation | `<Link>`, `router.push()` | data fetch (`/_next/data`, static JSON, or in-browser `getInitialProps`), page chunk load, `_app` preserved, `Component` swapped, History API push | tab | – | code |
| Pages prefetch | W | browser | pre-loading | `<Link>` in viewport (deduped via `Set`) / hover (not deduped) | SSG: chunk + JSON; SSR: chunk only; `prefetch={false}` disables viewport only (article) | tab | – | – |
| Shallow routing | W | browser | URL-only navigation | `router.push(url, as, { shallow: true })` | updated `router.query`, no data functions; same page only | – | – | – |
| **App client router** (`AppRouter`) | W | browser | navigation + tree owner | `<Link>`, `useRouter().push()`, action results, `router.refresh()` | client `FlightRouterState`, Flight requests, tree merge, History API | tab | – | code |
| Route Cache | W | browser | cache of route **trees** | prefetch `/_tree` responses | segment structure per URL | tab (+ staleness rules) | navigation, refresh | data |
| Segment Cache | W | browser | cache of segment **content** | segment prefetch responses, navigation responses | one entry per segment path; shared segments (root layout) reused across routes | tab | `router.refresh()`, action rerender, staleness | data |
| Prefetch scheduler | W | browser | task queue | visible / hovered links | priorities, dedupe against cache and in-flight, cancellation (mouse leaves), parallel small requests | tab | – | – |
| Navigation diff | W + R | browser + Node | comparison | client tree vs target loader tree | shared prefix skipped; divergent subtree requested and rendered | per navigation | – | – |
| Patch merge | W | browser | reconciliation | Flight patch | affected `LayoutRouter` slot takes new content; other slots keep nodes → state, DOM identity, scroll preserved | per navigation | – | – |
| Cache-hit navigation | W | browser | fast path | target fully in Segment Cache | no network, no server render | – | – | – |
| Action result merge | W | browser | reconciliation | `a`, `f` | return value to caller; `f` applied like a navigation patch | per action | – | – |
| Fast Refresh runtime (`react-refresh`) | D, W | browser | hot component swap | HMR client-change message, component IDs + hook signatures registered by SWC | same signature → implementation swapped, state kept; changed hooks → remount; non-component exports → bubble up, possibly full reload | dev | – | code |
| Server-change handling | D, W | browser | refresh | HMR server-components-change message | `router.refresh()` inside `startTransition` → new Flight merged; if page in error state → full reload | dev | – | – |

### 3.10 Development-only machinery (region: Dev)

| Entity | Phase | Env | Role | Inputs | Outputs | Lifetime |
|---|---|---|---|---|---|---|
| Parent process | D | Node | supervisor | child exit code | restarts child with same options when `next.config.js` changes | session |
| Child process | D | Node | everything else | – | HTTP server, router-server, render-server, embedded bundler | until config change |
| File watcher | D | Node | route map builder (replaces manifests) | `app/`, `pages/`, proxy/middleware candidates, instrumentation, `.env*`, `tsconfig.json`/`jsconfig.json` | page lists, handler lists, layouts/slots, matchers, metadata files, conflict detection (same path in `app/` and `pages/`), `.next/types`, route-change message to browser | session |
| On-demand entries (Webpack) | D | Node memory | lazy compilation | requested page | entry record with status (added / building / built), last-active time, dispose flag; every build includes all live entries; only changed modules invalidated, but chunk graph / codegen / hashing run for the whole compilation | session |
| Entry eviction | D | Node | cost control | timer every 6 s | marks built entries idle > 60 s; next compilation drops them; browser pings (`pathname` for pages, full router tree for app) keep entries alive | session |
| Turbopack in dev | D | Rust | demand-driven graph | requests | only requested tasks computed; nothing to evict | session |
| Static-params workers | D | Node child | isolation | `getStaticPaths` / `generateStaticParams` call | fresh worker per call, then killed, reproducing build conditions | per call |
| HMR channel | D | Node (router-server) ↔ browser | WebSocket | – | messages: building / built / sync, page added / removed, change classification, reload | session |
| Server module cache clearing | D | Node | invalidation | server change | `require` cache entries for compiled server chunks removed | per change |
| Dev/prod differences (always-on) | D | – | list | – | caching mostly off; viewport prefetch off (hover on); no minification; dev chunking; source maps; development React; Strict Mode double render | – |

## 4. Causal chains

Each chain is a sequence of edges in the entity graph. Journeys are walks along these chains.

### 4.1 `"use client"`
```
"use client" directive in DashboardNav.tsx
→ SWC serverComponents transform marks the module as a client boundary
→ bundler assigns the module to the ssr layer AND creates a browser entry (flight-client-entry-plugin)
   (in the rsc layer the import resolves to a reference stub instead of the implementation)
→ flight-manifest-plugin records id → chunks in the client-reference manifest
→ at request time the RSC runtime meets the boundary, looks up the manifest, emits a client reference + props into Flight
→ SSR runtime resolves the reference to the real module and renders it to HTML (server side)
→ the browser reads the reference, loads exactly those chunks
→ React hydrates only this subtree; Server Component parents are static DOM
```

### 4.2 `"use server"`
```
"use server" in actions.ts
→ SWC serverActions transform assigns a stable hashed action ID
→ bundler writes id → module/export into the server-reference manifest; the module stays server-only
→ in client code the import becomes a proxy that POSTs with Next-Action: <id>
→ inline actions: captured closure variables encrypted with the deploy key, bound to the ID
→ request: router-server ladder → render-server action handler → manifest lookup (unknown ID → reject)
→ decode args, decrypt closures, run the function (auth / validation are the developer's job here)
→ data source mutated
→ optional cache update: updateTag / revalidatePath expire now; revalidateTag(tag, profile) marks stale-while-revalidate; refresh() asks for a rerender only; redirect()
→ if expired / refreshed / redirected: current route re-rendered in the same request → Flight in field f; return value in field a
→ revalidateTag with an SWR profile: f empty, the next read regenerates in the background
→ client router merges f like a navigation patch; caller receives a
→ no JavaScript: plain form POST, server responds with a full page
```

### 4.3 Route strategy
```
page exports (getStaticProps / getServerSideProps / getInitialProps / none)
or dynamic API usage (cookies(), headers(), searchParams) / "use cache" / generateStaticParams
→ route analysis at build classifies the route (○ static, ● SSG, ƒ dynamic, ISR revalidate, PPR shell)
→ static routes prerendered → .html / .json / .rsc + prerender-manifest entry + initial incremental cache entry
→ request time: render-server checks the incremental cache first
   miss → render and store; fresh → serve, no React; stale → serve stale, regenerate in background
→ _app.getInitialProps present → Automatic Static Optimization disabled for every page without getStaticProps
```

### 4.4 Segment structure
```
folders under app/ + special files
→ loader tree [segment, parallelRoutes, modules]
→ recursive render wraps each child transition in a LayoutRouter (a Client Component slot)
→ Flight carries structure (FlightRouterState) separately from content (segment slices)
→ navigation: client sends its FlightRouterState; server walks both trees, skips the shared prefix
→ only the divergent subtree is rendered and returned
→ the affected LayoutRouter slot swaps content; every other slot keeps its React nodes
→ therefore root layout, dashboard layout and DashboardNav state survive settings → billing
```

### 4.5 Manifests
```
build writes routes-manifest, pages-manifest, build-manifest, prerender-manifest, middleware-manifest,
client-reference manifest, server-reference manifest
→ next start: router-server loads the routing manifests into memory (dev: watcher builds the same tables live)
→ filesystem-check step answers from these tables: static chunk, public file, image, page, handler
→ render-server uses pages-manifest / app manifests to require the route module
→ RSC runtime uses the client-reference manifest; action handler uses the server-reference manifest
→ Turbopack and Webpack both emit the same manifest formats, so the server never knows the bundler
```

### 4.6 Cache invalidation
```
updateTag("profile") inside updateProfile()
→ "use cache" / server cache entries carrying that tag expired immediately (separate from the mutation itself)
→ same action: route re-rendered now (field f) and the next read waits for fresh data
→ browser client cache entries for that route replaced by the merged patch; other tabs refetch on navigation

revalidateTag("profile", "max") instead
→ entries marked stale; the action response carries no f
→ next request for a tagged route: served stale while a background regeneration replaces the entry

revalidatePath("/dashboard/settings") = revalidateTag with a path-derived tag
```

### 4.7 PPR
```
build render starts at the route root
→ reaches a Suspense boundary whose subtree reads a dynamic API
→ everything outside the boundary → static shell (HTML + Flight rows), stored like a static route
→ inside → postponed state (serialized resume point)
→ request: shell served immediately from cache
→ render resumes from the postponed state with the real request
→ dynamic rows stream into the same response and fill the hole
Trap: reading cookies()/headers()/searchParams above the nearest Suspense boundary moves the boundary up,
so the "dynamic hole" becomes the whole page
```

### 4.8 Dev edit, client side
```
save DashboardNav.tsx
→ watcher / bundler recompiles the module (Webpack entry or turbo-tasks invalidation)
→ HMR message: client change
→ HMR client applies the module update
→ react-refresh finds mounted components by registered ID
→ hook signature unchanged → implementation swapped, state kept; changed → remount; non-component exports → bubble up
```

### 4.9 Dev edit, server side
```
save AccountSummary.tsx (Server Component)
→ recompile; server chunk on disk replaced; Node require cache cleared for it
→ HMR message: server components change
→ browser: router.refresh() inside startTransition → new Flight for the current tree → merged
   (page in error state → full reload instead)
No Fast Refresh: the component never existed in the browser, only its rendered output did
```

### 4.10 Custom server
```
our HTTP server owns the socket
→ handle(req, res, parsedUrl?) → router-server ladder (headers, redirects, Proxy, rewrites, fs check) → render-server
→ requests we answer without calling handle are invisible to Next: no Proxy, no manifests, nothing
→ parsedUrl lets us rewrite pathname/query before Next routes (custom routing without bypassing the ladder)
→ app.render() today normalizes and calls the same requestHandler (deprecated wrapper, no bypass any more)
→ Pages and App routes share one handle; the router choice happens inside render-server
→ standalone tracing ignores server.js → module-not-found at runtime; export has no server at all
→ useFileSystemPublicRoutes: false hides file routes on the server only; client-side navigation can still reach them
→ dev: HMR needs the upgrade event forwarded; server.js is outside the watcher
```

## 5. Concepts the series distinguishes (and the site must never collapse)

| Pair | A | B | How the site shows the difference |
|---|---|---|---|
| Compilation vs bundling | one file in, one file out; no knowledge of imports (SWC / Babel) | whole-graph: entrypoints, imports, chunks, targets, tree shaking (Webpack / Turbopack) | two separate machines in the Build region; a module is *transformed* in one and *placed* by the other |
| Module vs chunk | a source file after transformation | a file the bundler emits containing many modules for one target | chunk is a container that modules are packed into; the module keeps its identity inside |
| Source code vs build artifact | what the developer wrote | what `.next/` contains: chunks, manifests, prerenders | artifacts sit on the shelf between Build and Server; source never crosses to the right |
| Route matching vs rendering | router-server deciding which exit a request takes | render-server executing a route module | two separate regions; many requests exit before Render |
| RSC rendering vs SSR rendering | Server Components → Flight (no DOM) | Flight (+ Client Components) → HTML | two stacked runtimes in Render; the arrow between them carries Flight, never source |
| Flight payload vs HTML | serialized element tree with references; streamable rows | markup for the browser to paint | different glyphs; Flight is teed, HTML is derived from one copy |
| Visible HTML vs hydrated interactivity | painted, not interactive | React attached, handlers bound | two browser states with a visible gap; hydration lights up only parts |
| Server Component vs server-side rendering | a component that runs only on the server and ships its result | the act of producing HTML on the server (applies to Client Components too) | Client Components also pass through SSR; Server Components never reach the browser as code |
| Initial document load vs client navigation | builds a document: HTML + inline Flight + chunks | patches a tree: Flight only, shared prefix skipped | the central claim of Journey 0; Compare mode pair |
| Server incremental cache vs browser Route/Segment Cache | server: rendered HTML/RSC per route key, shared by all users | browser: trees and segments per tab | cache map places them on opposite sides of the network line |
| HMR transport vs React Fast Refresh | bundler-level module update over WebSocket; knows nothing about React | React-level component swap with state rules | HMR is the channel; Fast Refresh is what happens at the end of it, client layer only |
| Stale-while-revalidate vs PPR | a whole cached response served stale while regenerating | one response split at build into static shell + postponed dynamic part | ISR is about *when* a whole route is regenerated; PPR is about *which part* is dynamic |
| Custom server vs replacing Next internals | owning the outer `(req, res)` and calling `handle` | (does not exist) | the wrapper ring around router-server; nothing inside changes |

## 6. Cache map

| Cache | Lives in | Key | Value | Lifetime | Populated by | Invalidated by | Bypassed when |
|---|---|---|---|---|---|---|---|
| Request memoization | Node, one request | function + args | result | the request | first call | request end | different args |
| Data Cache / `"use cache"` entries | Node in-memory per instance by default; `"use cache: remote"` → shared cache handler; `"use cache: private"` → browser only | cache scope + serialized args + captured values (+ build id) | function/component result serialized as RSC payload, tags, `cacheLife` profile | profile (stale / revalidate / expire) | first render with `"use cache"` | `updateTag` (immediate), `revalidateTag(tag, profile)` (SWR), `revalidatePath`, expiry, redeploy | no `"use cache"` (Cache Components default: not cached) |
| Server cache for prerendered HTML + RSC (article: "incremental cache"; older docs: "Full Route Cache") | Node + persistent store (`.next/cache` or handler) | route path + params | HTML + RSC payload + meta (revalidate, tags, PPR shell/postponed) | until revalidate / expire | build prerender, first dynamic-static render, ISR regeneration | `revalidate` seconds, `revalidatePath/Tag`, on-demand, redeploy | dynamic routes (`cookies()`, `headers()`, `no-store`), draft mode |
| Build filesystem cache | `.next/cache` | module / task inputs | transformed modules, turbo-tasks results | across builds | bundler | input change, cache clear | `--no-cache`, CI without cache |
| Image optimizer cache | `.next/cache/images` | url + width + quality + format | transformed image | TTL | first `/_next/image` request | expiry, delete | remote patterns not allowed |
| Route Cache (browser; docs: "Client Cache") | tab memory | URL → tree | route structure | tab / `staleTimes` or `cacheLife.stale` | `/_tree` prefetch, navigation | `router.refresh()`, action `f`, `revalidateTag`/`updateTag`/`revalidatePath`, cookie writes, expiry | `prefetch={false}` reduces it |
| Segment Cache (browser; docs: "Client Cache") | tab memory | segment path | segment content slice (or App Shell per route with `partialPrefetching`) | tab / staleness | segment prefetch, navigation responses | same as above | non-static segments without Cache Components (only static shell prefetched); dev mode (prefetch off) |
| Pages prefetch `Set` (browser) | tab memory | URL | "already fetched" flag | tab | viewport prefetch | never (hover ignores it) | hover prefetch |
| `.next/types` | fs | route list | types | dev session | watcher | route change | prod |

## 7. Contradictions, ambiguities and version-sensitive claims

Each row keeps the article snapshot so the series stays understandable, then states current behavior
and why the difference matters. Verification sources are listed in `coverage-matrix.md`.

Verified against **Next.js 16.3.x** (16.3 released 2026-08-03; docs version 16.3.5, fetched 2026-09-19).
Articles were written May–Aug 2025 during the 15.x → 16 transition.

| # | Topic | Article snapshot | Current Next.js (16.3) | Why the difference matters for the model | Source |
|---|---|---|---|---|---|
| V1 | Middleware runtime | A1 and A5: "Middleware always executes on the Edge Runtime", justified by it sitting on the hot path before routing | `middleware.ts` is deprecated and renamed `proxy.ts` (16.0). **Proxy defaults to the Node.js runtime** and the `runtime` option is not allowed in a proxy file. Middleware could use Node since 15.2 (experimental) / 15.5 (stable). `middleware.ts` still works for Edge use cases but is deprecated | The ladder step is the same; the runtime badge on it must show *Edge (article)* vs *Node (now)*. The article's rationale (Edge for the hot path) explains the history, not the present | S1, S2, S3 |
| V2 | Name "Middleware" vs "Proxy" | A5, A6: "middleware (being renamed to proxy in fresh versions)" | Renamed in 16.0; codemod `middleware-to-proxy`; config flags renamed (`skipProxyUrlNormalize`) | The site uses **Proxy** as the primary label with "formerly Middleware" | S1, S2 |
| V3 | Ladder order | A5: headers → redirects → middleware → beforeFiles → fs → afterFiles → dynamic → fallback | Identical eight-step order in the Proxy docs ("Execution order"). Server Actions are POSTs to the page route, so Proxy coverage follows the page matcher | Journey 2 order is verified as-is; J7 must show the action POST entering the same ladder | S1 |
| V4 | Turbopack status | A1: "Turbopack became the default bundler"; A7: "in version 16 it became default, Webpack via flag"; Rspack experimental | Turbopack is the default for `next dev` **and** `next build` since 16.0 (dev stable in 15.0, build beta 15.5). Opt out with `--webpack`. A custom `webpack()` config makes `next build` fail unless `--webpack` or `--turbopack` is chosen. Persistent filesystem cache enabled by default for dev and build (16.3) | J1 step 9 and C6 present Webpack as the historical/opt-in path and Turbopack as the default; the "three compilers vs unified graph" contrast remains valid | S4, S5, S6 |
| V5 | Babel fallback | A7: presence of a Babel config switches the build to Babel and disables SWC transforms | With Turbopack (16+), a Babel config enables Babel for user code **while SWC is still used for Next's internal transforms and downleveling**. With Webpack, SWC is disabled as the article says | J1 step 3 toggle shows both bundler cases | S4 |
| V6 | Caching defaults | A1: "In 14 fetch was cached implicitly; in 16 with Cache Components nothing is cached by default" | Confirmed. `cacheComponents: true` (16.0) makes data fetching dynamic by default, caching only with `"use cache"` + `cacheLife` + `cacheTag`. Even in the non-Cache-Components model of 16, `fetch` is **not** cached by default (`force-cache` opts in). `cacheComponents` requires the Node.js runtime; `runtime = 'edge'` is deprecated for it. Default `cacheLife` profile: stale 5 min (client), revalidate 15 min (server), never expires. `unstable_cache` still exists but is documented as replaced by `"use cache"` | J8 step 3 shows three eras: implicit fetch cache (≤14), explicit opt-in without Cache Components (15/16 default), Cache Components. Variants `"use cache: private"` and `"use cache: remote"` exist (L3) | S7, S8, S9 |
| V7 | PPR vs Cache Components | A1, A9: PPR as its own feature: build render stops at Suspense, static shell + postponed state | `cacheComponents` **implements PPR as the default behavior**; `experimental.ppr` and `experimental_ppr` were removed in 16.0. Docs describe the same shell + streamed holes; "postponed state" is not a documented term any more but the resume mechanism is unchanged conceptually | J8 steps 13–17 keep the article's mechanism and label "postponed state" as an implementation term; the flag is `cacheComponents` | S7, S9, S10 |
| V8 | Dynamic API trap | A9: reading `cookies()` / `searchParams` at the page level makes the whole page dynamic | Confirmed and generalized: any runtime API or uncached async read outside `<Suspense>` blocks the shell; the dev overlay reports a "blocking-route" insight. Docs recommend awaiting `params` inside a boundary | J8 step 16–17 unchanged; add the dev-overlay insight as L3 | S8 |
| V9 | Client cache names | A4: Route Cache (trees) + Segment Cache (segments), replacing an older model that prefetched to the first `loading` boundary | 16.0 rewrote prefetching: **layout deduplication** and **incremental prefetching** (only missing parts), cancellation on viewport exit, hover priority, re-prefetch on invalidation. Docs now say "Client Cache"; `staleTimes` or `cacheLife.stale` control duration. 16.3 adds prefetch inlining (small payloads bundled) | J6 uses the article's Route/Segment split as the mental model, labels the docs term "client cache", and notes 16.3 inlining as a version chip | S11, S12, S13 |
| V10 | Segment prefetch headers | A4: `Next-Router-Segment-Prefetch: /_tree` then per-segment paths, `Next-Router-Prefetch: 1`, `RSC: 1` | Source constants on canary: `rsc`, `next-router-state-tree`, `next-router-prefetch`, `next-router-segment-prefetch`, `next-url`, `next-action`, `_rsc` query, plus `x-nextjs-stale-time`, `x-nextjs-postponed`, `x-action-revalidated` | Header chips in J6/J7 are verified; L3 lists the extra response headers. Inside Proxy, `rsc`, `next-router-state-tree` and `next-router-prefetch` are stripped from `request.headers` so HTML and RSC requests cannot be routed differently by accident | S14, S1 |
| V11 | Per-segment prefetch only for static routes without Cache Components | A4 | Docs: default (`auto`) prefetches the full route for static routes and only down to `loading.js` for dynamic ones; with `partialPrefetching: true` (16.3, requires `cacheComponents`) the default becomes a per-route **App Shell** | J6 step 5 shows the article rule and the 16.3 App Shell rule side by side | S12, S15 |
| V12 | `<Link prefetch>` | A4: prop can weaken or disable | Values `auto`/`null` (default), `true` (full route; with Partial Prefetching also URL-dependent cached content), `false` (never, not even on hover). App Router hover does not re-prefetch unless expired | Verified | S12 |
| V13 | Pages Router hover prefetch | A2: hover re-requests JSON every time; `prefetch={false}` disables viewport only | Docs: `prefetch={false}` "will not happen when entering the viewport, but will happen on hover"; the only escape is `<a>` or migrating to App Router | The article's model is current for Pages Router. The per-hover repeat is an implementation observation (not documented); J4 step 2 labels it "observed in source, article" | S16 |
| V14 | Server Action response `a` / `f` | A4: `text/x-component` with the return value (`a`) and the re-rendered route (`f`) present only if the action invalidated or redirected | Docs: "a single response carries data and UI"; re-render included when the action calls `updateTag`, `revalidatePath`, `refresh()`, mutates cookies, or redirects. **`revalidateTag` with an SWR profile does not trigger the in-response re-render.** Actions are dispatched sequentially per client. Docs note a current quirk: `revalidatePath` inside a Server Function also refreshes previously visited pages | J7 step 12–13 must branch: `updateTag`/`revalidatePath` → `f` present; `revalidateTag(tag, 'max')` → `f` absent, later reads refresh. The example app uses `updateTag("profile")` for the immediate path and shows `revalidateTag` as the SWR alternative | S17, S18, S19 |
| V15 | `revalidateTag` signature | A4: `revalidateTag()` | 16.0: second argument (`'max'`, profile, or `{ expire }`) required; single-argument form deprecated and behaves like `{ expire: 0 }`. New `updateTag()` (actions only, read-your-writes) and `refresh()` (refetch uncached data) | Cache map lists all three invalidators; J8 step 18 distinguishes SWR (`revalidateTag`) from immediate (`updateTag`) | S18, S19, S10 |
| V16 | Unknown action IDs | A4: rejected before execution | Confirmed; error "Failed to find Server Action"; IDs rotate at most every 14 days even without source changes; header `x-nextjs-action-not-found` | J7 step 8 | S17, S14 |
| V17 | Closure encryption | A4: build-time key per deploy | Confirmed; `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for multi-instance; action references also encrypted; unused actions dead-code-eliminated; CSRF `Origin`/`Host` check; 1 MB body limit | J7 step 4 (L3 adds CSRF and size limit) | S17, S20 |
| V18 | RSC payload "binary" | A1, A3: "special binary stream / binary format" | Docs glossary calls it "compact binary representation"; the wire format is line-oriented **text rows** with optional base64 binary rows (`self.__next_f` types `[0]`, `[1, text]`, `[2, formState]`, `[3, base64]`) | Site says "RSC payload / Flight stream: textual rows, with base64 rows for binary data"; never "binary" alone | S21, S22 |
| V19 | `self.__next_f` chunk types | A3: init / text / base64 | Source: bootstrap `[0]`, data `[1, text]`, **form state `[2, …]`** (not in article), binary `[3, base64]` | J5 step 13 shows four types | S22 |
| V20 | Server class names | A1: `BaseServer`, `NextNodeServer`, `NextWebServer`; A5: router-server / render-server; A6: `NextCustomServer` | Canary source has `base-server.ts`, `next-server.ts`, `next.ts` (`NextCustomServer`), `lib/router-server.ts`, `lib/render-server.ts`, `lib/start-server.ts`, `lib/dev-bundler-service.ts`, `app-render/`, `dev/on-demand-entry-handler.ts`. `web-server.ts` (`NextWebServer`) is **gone**: present at v15.0.0, absent at v15.5.0 and v16.0.0 (exact 15.x release unverified). router-server and render-server still talk over `server/lib/server-ipc/` (`_ipcPort` / `_ipcKey`). `minimalMode` is still a `BaseServer` option (`NEXT_PRIVATE_MINIMAL_MODE`) | L3 names are safe; `NextWebServer` is shown as "article name, removed in 15.x" with the Edge deprecation note | S23, S24 |
| V21 | Deprecated `app.render()` | A6: now normalizes and calls the same `requestHandler` | Source: `render()` calls `this.requestHandler`; `renderToHTML`, `render404`, `renderError` delegate to `this.server`; all four warn via `warnDeprecatedCustomServerMethod` ("Use `app.getRequestHandler()` with an adjusted parsed URL instead"). Custom server options include `turbopack`, `webpack`, `httpServer`, `minimalMode`, `customServer` | J10 step 9: `render()` verified; the other three go to the inner server directly (L3 nuance) | S25, S26 |
| V22 | Custom server constraints | A6: incompatible with `standalone` and `export`; `server.js` not compiled; `useFileSystemPublicRoutes` server-only | Docs: standalone "does not trace custom server files… cannot be used together"; `server.js` "does not run through the Next.js Compiler"; set response headers before `handle` because Next starts streaming inside it; `useFileSystemPublicRoutes` "disables filename routes from SSR; client-side routing may still access those paths" | J10 steps 11–12 verified; add the headers-before-handle caveat as L3 | S26, S27 |
| V23 | Dev entry eviction timings | A8: sweep every 6 s, dispose after 60 s idle | Source: `setInterval(..., pingIntervalTime + 1000)` where `pingIntervalTime = clamp(maxInactiveAge, 1000, 5000)`; statuses ADDED / BUILDING / BUILT; pings via `handlePing` (pages pathname) and `handleAppDirPing` (router tree). The 60 s figure is `maxInactiveAge`, a configurable default | J9 step 5 shows "~6 s sweep, 60 s idle (defaults)" | S28 |
| V24 | Dev origin check | A8: origin list from config | `allowedDevOrigins`; cross-origin dev requests blocked by default; hostname-only matching with `*` / `**` wildcards | J9 step 8 | S29 |
| V25 | Dev output directory | not in articles | 16.0: `next dev` writes to `.next/dev`, allowing concurrent dev and build; lockfile prevents duplicate instances | Dev column shows `.next/dev` | S10 |
| V26 | `next/dynamic` delay | A9: Loadable waits 200 ms before showing loading; `ssr: false` | Source `loadable.shared-runtime.tsx` still has `delay: 200`. Docs: in App Router `next/dynamic` is "a composite of `React.lazy()` and Suspense"; `ssr: false` only inside Client Components (error in Server Components) | J11 step 6 shows the 200 ms as Pages-era Loadable behavior and the App Router Suspense model | S30, S31 |
| V27 | `next/font/google` failure | A9: dev warns + fallback, build fails | Source `font/src/google/loader.ts`: dev logs "Failed to download … Using fallback font instead" and emits fallback `@font-face`; otherwise `throw err` | Verified | S32 |
| V28 | `next/script` worker | A9: `worker` via Partytown | Docs: `worker` is experimental, requires `experimental.nextScriptWorkers`, **Pages Router only**, not supported by Turbopack yet | J11 step 11 marks `worker` as `n/a` for App Router | S33, S4 |
| V29 | Image optimizer defaults | A9: cache in `.next/cache/images` keyed by url + width + quality | 16.0 changed defaults: `minimumCacheTTL` 4 h, `qualities` `[75]`, `imageSizes` without 16, `maximumRedirects` 3, local IP blocked, `localPatterns.search` required for query strings | Cache map key adds format; J11 step 7 L3 lists the 16 defaults | S10 |
| V30 | React version / runtimes | A1: RSC stable in React 19 | 16 uses React 19.2 canary features (View Transitions, `<Activity>`); with `cacheComponents`, navigation keeps previous routes mounted via `<Activity mode="hidden">`, preserving state across back/forward | J6 step 11 adds the Activity note as a version chip; state preservation reasoning stays the same | S10, S7 |
| V31 | Cache terminology | A1/A9: "incremental cache", Data Cache; brief mentions "Full Route Cache", "Router Cache" | Current docs use: Request Memoization (`fetch` GET memoized), Data Cache via `"use cache"`, prerendered HTML + RSC stored in the "Next.js server cache" (self-hosting), "Client Cache" (browser). "Full Route Cache" and "Router Cache" are retired names | Cache map uses current names with retired names in parentheses | S8, S34, S35 |
| V32 | Two React runtimes / `react-server` condition | A3, A7 | Unchanged mechanism (React conditional exports); verified by React's package exports and Next's layer config; no version note needed beyond "16.3 renders with native Node streams instead of web streams" | J5 step 12 L3 mentions the 16.3 stream change | S13 |
| V33 | Minimal mode | A5 | `minimalMode` is still an option of the custom server factory; router-server remains the owner | J2 step 13 | S25 |

Article claims verified as unchanged (no version chip needed): loader tree shape and `LayoutRouter` boundaries; stream tee and SSR consuming Flight; Client-Component-only hydration; `__NEXT_DATA__` and full-tree hydration in Pages Router; `/_next/data/{buildId}` routes; ISR stale-while-revalidate; `getStaticPaths` fallback modes; `getInitialProps` browser execution; custom server wrapper model; HMR over WebSocket in router-server; Fast Refresh only for the client layer; Webpack layers and `flight-*` plugins (still present for the `--webpack` path); Turbopack `turbo-tasks` model.

