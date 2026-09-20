# Experience architecture

Product: **Next.js Under the Hood**, one English-language page. The user follows concrete objects
through one persistent world map and leaves able to predict what Next.js will do and why.

Domain facts come from `concept-model.md`; encodings from `visual-language.md`; traceability from
`coverage-matrix.md`.

## 1. The stable global mental model

The world map (see `visual-language.md` §1) is the only diagram on the site. It is visible or one
gesture away in every mode. Its twelve regions never move:

1. Source code · 2. Build pipeline (compiler | bundler | route analysis) · 3. `.next` artifact
shelf · 4. HTTP entry (with the custom-server ring) · 5. router-server · 6. render-server ·
7. React RSC runtime · 8. React SSR runtime · 9. Network boundary · 10. Browser DOM + React
runtime · 11. Client router + client caches · 12. Data sources + server caches, plus the
Development column.

The user learns three axes once: **down = later in time** (build → request → browser),
**right = downstream** within a band, **the double line = the network**, where the only question
is "does code or data cross?".

### The central claim

Journey 0 ends on it and every later journey refers back to it:

> The initial request constructs a document. Subsequent App Router interactions usually patch the
> existing React route tree.

## 2. The example application

One application is used everywhere. Names, paths, chunk names, IDs and headers below are the only
ones that appear on the site.

```
app/
  layout.tsx                 RootLayout      Server Component: <html>, <body>, globals.css
  dashboard/
    layout.tsx               DashboardLayout Server Component: <DashboardNav /> + {children}
    settings/
      page.tsx               SettingsPage    async Server Component: await getProfile()
                                             renders <AccountSummary /> + <ProfileForm />
    billing/
      page.tsx               BillingPage     async Server Component
                                             <Suspense fallback={<InvoicesSkeleton/>}><InvoiceList /></Suspense>
  actions.ts                 "use server"    updateProfile(formData) → db.update(); updateTag("profile")
                                             (revalidateTag("profile", "max") shown as the SWR alternative)
components/
  DashboardNav.tsx           "use client"    useState(open), usePathname()
  ProfileForm.tsx            "use client"    useActionState(updateProfile)
  AccountSummary.tsx         Server Component: shows profile fields
  InvoiceList.tsx            Server Component: reads cookies() → dynamic
lib/
  data.ts                    getProfile()  "use cache" + cacheTag("profile") + cacheLife("hours")
                             getInvoices() uncached
proxy.ts                     matcher: ["/dashboard/:path*"]; redirects to /login without session cookie
next.config.js               redirects: /old-settings → /dashboard/settings (308)
                             headers: X-Frame-Options on /:path*
                             images.deviceSizes default; cacheComponents: true
public/logo.svg
pages/
  _app.tsx                   wraps every page with <ThemeProvider>
  _document.tsx              <Html><Head/><body><Main/><NextScript/></body></Html>
  products/[id].tsx          getServerSideProps → { product }
  posts/[id].tsx             getStaticProps (revalidate: 60) + getStaticPaths (fallback: 'blocking')
  api/hello.ts               (req, res) => res.json({ ok: true })
```

Stable scenarios:

| Scenario | Used by |
|---|---|
| Initial load `GET /dashboard/settings` | J0, J2, J5, J8, Compare |
| Client navigation `/dashboard/settings → /dashboard/billing` | J6, J8 (PPR on billing), Compare |
| Mutation `updateProfile()` → `updateTag("profile")` (immediate) vs `revalidateTag("profile", "max")` (stale-while-revalidate) | J7, J8 |
| Pages comparison `GET /products/42` (SSR) and `/posts/7` (SSG + ISR) | J3, J4, Compare |
| Dev edit: `DashboardNav.tsx`, then `AccountSummary.tsx` | J9 |
| Custom server: `server.js` intercepts `/healthz`, rewrites `/legacy/settings` | J10 |
| Static asset `GET /_next/static/chunks/framework-a1b2c3.js`, image `GET /_next/image?url=/logo.svg&w=640&q=75` | J2, J11 |

Stable artifact values:

| Artifact | Value shown |
|---|---|
| `buildId` | `k7Qm2xLp9` |
| Browser chunks | `static/chunks/framework-a1b2c3.js`, `static/chunks/main-app-d4e5f6.js`, `static/chunks/webpack-9c0d.js`, `static/chunks/app/layout-1a2b.js`, `static/chunks/app/dashboard/layout-3c4d.js` (contains `DashboardNav`), `static/chunks/app/dashboard/settings/page-5e6f.js` (contains `ProfileForm`), `static/chunks/app/dashboard/billing/page-7a8b.js` |
| Server chunks | `.next/server/app/layout.js`, `.next/server/app/dashboard/layout.js`, `.next/server/app/dashboard/settings/page.js`, `.next/server/app/dashboard/billing/page.js`, `.next/server/app/dashboard/settings/page_client-reference-manifest.js` |
| Client reference for `DashboardNav` | `{ id: "(app-pages-browser)/./components/DashboardNav.tsx", chunks: ["app/dashboard/layout-3c4d"], name: "default" }` |
| Action ID | `7f3a9c1e2b44…` (truncated on canvas, full in inspector) |
| Cache keys | server cache (prerendered HTML + RSC): `/dashboard/settings`; `"use cache"` entry `getProfile()` with tag `profile`; image: `/logo.svg|640|75|webp` |
| Navigation headers | `RSC: 1`, `Next-Router-State-Tree: %5B%22%22%2C%7B%22children%22…`, `Next-Url: /dashboard/settings`, `?_rsc=1a2b3` |
| Prefetch headers | `Next-Router-Prefetch: 1`, `Next-Router-Segment-Prefetch: /_tree` then `/dashboard/billing` |
| Action request | `POST /dashboard/settings`, `Next-Action: 7f3a9c1e2b44…` |
| Pages data URL | `/_next/data/k7Qm2xLp9/products/42.json` |
| FlightRouterState (client, before nav) | `["", { children: ["dashboard", { children: ["settings", { children: ["__PAGE__", {}] }] }] }]` |

## 3. Modes

### 3.1 Guided journeys

A journey is an ordered list of steps over the world. The UI is the same for every journey:

- **Canvas** (world) with camera. Control: `Follow` (camera on the token with context) /
  `Whole system` toggle; `Fit region` on double-click.
- **Step panel**: journey title, step `n / N`, **Following:** token name, **Story** (Level 1,
  ≤ 60 words), **Changed / kept** list (when relevant), **What should click** (one sentence,
  persistent per journey, highlighted when the step is the one that delivers it).
- **Transport**: Previous / Next, Play / Pause (autoplay advances every 6 s, pauses on any
  interaction), a scrubber with step ticks, keyboard `←/→`, `space`, `Home/End`, `Esc` (whole
  system). Deterministic: step *n* always produces the same world state regardless of path.
- **Inspect** (Level 2): click any entity on the canvas → inspector drawer (see 3.2 fields).
- **Internals** (Level 3): toggle inside the inspector; also a per-step "Internals" disclosure
  with file names, manifest shapes, header values and source links.
- **Prediction** step: a step of kind `predict` shows a question with 2–4 options *before* the
  critical transition; the next step reveals and explains. Answering is optional.
- **Check** steps: 2–3 misconception statements at the end (true/false with a one-line why).
- **Text equivalent**: every step has `text` (story) + `stateDescription` (generated from the
  world state: which entities are current, kept, replaced, invalid) exposed in an `aria-live`
  region and in a "Read as text" view.

### 3.2 System Atlas

Free exploration of the world at any zoom. Clicking an entity opens the inspector:

```
Name                      client-reference manifest
What it is                Map from client module id to browser chunks and export names
Runs / lives in           .next/server/…/page_client-reference-manifest.js (fs), loaded in Node
Exists during             build → request time
Consumes                  client entries created by flight-client-entry-plugin
Produces                  the {id, chunks, name} triple placed into Flight at a "use client" boundary
Connected through         Flight (protocol) · browser chunks (artifacts)
Crosses the browser line  no; only the references it produces do (data + refs)
Appears in journeys       J1 step 12 · J5 step 8 · J6 step 11
Source names (L3)         flight-manifest-plugin, react-server-dom-webpack client manifest shape
Article snapshot / now    (only for version-sensitive entities)
Sources                   links
```

Filters: phase, environment, region, "reaches browser: code / data / no". Hovering never reveals
anything that clicking does not.

### 3.3 Compare mode

Two synchronized world instances (`visual-language.md` §9). Pairs, each with its own step list:

| Pair | Left | Right | What is synchronized |
|---|---|---|---|
| C1 Initial load | Pages `/products/42` | App `/dashboard/settings` | request → response → paint → hydrate |
| C2 Client navigation | Pages `/products/42 → /posts/7` | App `settings → billing` | prefetch → request → payload → merge |
| C3 Runtimes | RSC runtime | SSR runtime | same Flight stream, different output |
| C4 Initial response vs navigation response | HTML + inline Flight | Flight patch only | byte-level rows shown side by side |
| C5 Hydration | full-tree (Pages) | Client-Component-only (App) | light-up scope |
| C6 Bundlers | Webpack: 3 compilers stitched | Turbopack: unified graph | same source, target layers |
| C7 Prod vs dev | `next start` | `next dev` | manifests vs watcher, chunks vs on-demand, prefetch, caching, Strict Mode |
| C8 Rendering strategies | static | ISR | PPR — three lanes | what leaves at build, what at request |
| C9 Caches | server incremental cache | browser Segment Cache | populate → hit → invalidate |

### 3.4 Predict the machine

A scenario quiz separate from the journeys: 12 scenario questions (one per journey theme), each
answered by choosing entities or outcomes on the world map ("which regions does this request
touch?", "which segments are re-rendered?"). Feedback replays the relevant journey steps.

## 4. Progressive disclosure

| Level | Where | Content | Rule |
|---|---|---|---|
| 1 Story | step panel, atlas tooltip-free chips | one causal sentence | never contains file paths or internal class names |
| 2 Inspect | inspector drawer | structured fields (3.2) | opened by click or `Enter` on a focused entity |
| 3 Internals | inspector toggle, step "Internals" disclosure, source panel | function/class/file names, manifest excerpts, headers, protocol rows, historical vs current notes, doc links | collapsed by default; state remembered per session |

## 5. Returning from detail to context

- Breadcrumb `World › Server › render-server › RSC runtime` above the canvas; each crumb is a
  camera target.
- `Esc` or **Whole system** returns to the full map with the current step still highlighted.
- A minimap (bottom-left, 180 × 110 px) always shows the full world with the camera rectangle.
- The inspector never covers the canvas fully; on desktop it docks right, on mobile it is a
  bottom sheet at 50 % height with the focused entity kept visible above it.

## 6. Learning sequence

Recommended order (the journey index shows it; deep links allow any order):

```
J0 Whole lifecycle          the map, the token, the central claim
J1 Production build         what exists before any request
J2 Request routing          what happens before React
J5 App Router initial       the golden path (most design attention)
J6 Prefetch & navigation    patch, not document
J7 Server Actions           mutation round trip
J8 Caching, ISR, Cache Components, PPR
J3 Pages Router initial     the older model, taught against J5
J4 Pages Router navigation
J9 Development mode
J10 Custom server
J11 Built-in optimizations  everything above, seen as levers
```

## 7. Journeys

Step kinds: `move` (token travels), `transform`, `explain` (camera only), `predict`, `reveal`,
`check`. Each step below lists: camera · motion verb · what changes. Text is summarized; final
copy is authored in the journey data files.

### J0 Whole lifecycle (10 steps)

Following: `DashboardNav.tsx` as a module, then `GET /dashboard/settings` as a request.
What should click: *a document is built once; after that the client patches a tree.*

1. Whole system · explain · the three bands and the network line are introduced; everything dimmed.
2. Source · move · token = `DashboardNav.tsx` with its `"use client"` tag.
3. Compiler · transform · types and JSX stripped; token becomes `.js`.
4. Bundler · pack · token enters the graph, is assigned to the browser layer and packed into `app/dashboard/layout-3c4d.js`; a reference row appears in the client-reference manifest.
5. Shelf · explain · manifests, server chunks, browser chunks, prerenders lined up; build band dims.
6. HTTP entry → router-server · gate · token = request; ladder runs, lands on "page".
7. render-server · transform · RSC runtime produces Flight; tee; SSR runtime produces HTML.
8. Network · move · HTML with inline Flight crosses (chip `data + refs`); browser chunks cross (chip `code`).
9. Browser · light-up · paint, then only `DashboardNav` and `ProfileForm` hydrate.
10. Client router · swap · navigation to billing: a Flight patch crosses, one segment swaps, layouts locked. The central claim is shown as text on the canvas.

Checks: "Server Components run in the browser after hydration" (false); "Navigation downloads a new HTML document" (false); "The client-reference manifest is sent to the browser" (false: only references are).

### J1 Production build (18 steps)

Following: `ProfileForm.tsx`, then the route `/dashboard/settings`.
What should click: *the compiler sees one file; the bundler sees the whole graph; manifests are how runtime finds what build produced.*

1. Build band · explain · `next build` pipeline as a horizontal list: buildId → config → route discovery → compile+bundle → trace → analyze → prerender → standalone → summary.
2. Route discovery · assemble · `app/` and `pages/` folders become the route map; loader tree for `/dashboard/settings` drawn.
3. Compiler · transform · SWC strips types/JSX from `ProfileForm.tsx`; ✂ marks. N-API + WASM fallback noted (L3).
4. Compiler · transform · `"use client"` transform marks the boundary; `"use server"` transform assigns `updateProfile` its ID `7f3a9c1e2b44…`.
5. Compiler · transform · `optimizePackageImports` rewrites `import { Button } from 'ui-kit'` into a direct path (module list shrinks).
6. predict · "Which tool decides that `ProfileForm` ends up in the browser bundle: compiler or bundler?"
7. reveal · Bundler · the graph forms from entrypoints; the compiler never saw the graph.
8. Bundler · explain · layers: `rsc`, `ssr`, `app-pages-browser` as three stacked planes; `react-server` condition activates on the `rsc` plane only; `import 'react'` resolves to two different files (isometric cutaway).
9. Bundler · explain · Webpack: three target compilers; Turbopack: one unified graph (mini compare inset, links to C6).
10. Bundler · pack · `flight-client-entry-plugin` creates a browser entry at the `ProfileForm` boundary; `splitChunks` forms framework / lib / runtime / route chunks.
11. Bundler · reference · `ProfileForm` collapses into a reference; `flight-manifest-plugin` writes the row into `page_client-reference-manifest.js`.
12. Shelf · connect · every manifest is written: routes, pages, build, prerender, middleware, client-reference, server-reference; each pinned to its consumer below.
13. Route analysis · explain · `/dashboard/settings` marked with `"use cache"` data → static shell possible; `/dashboard/billing` reads `cookies()` inside Suspense → PPR shell + postponed; `/products/42` ƒ; `/posts/[id]` ● with revalidate 60.
14. Prerender · transform · static routes rendered now: `.html`, `.rsc`, `.prefetch.rsc`, `posts/7.json`; PPR shell stored with a postponed-state glyph.
15. Tracing · explain · file tracing draws the minimal file set for the settings server entry.
16. Standalone · pack · `.next/standalone/` assembled with its own `server.js`.
17. Summary · explain · the ○ ● ƒ tree printed; artifact families named.
18. check · "SWC decides which chunk a module lands in" (false); "Turbopack replaces SWC" (false: it embeds it); "Manifests are read by the browser" (partly: build-manifest has a browser copy; the rest are server-only).

### J2 Incoming request and server routing (14 steps)

Following: `GET /dashboard/settings`, then three other requests.
What should click: *most requests never reach React; router-server decides, render-server renders.*

1. HTTP entry · explain · Node `createServer` with one callback; listening before ready (queued requests glyph).
2. Startup · connect · router-server loads manifests into memory: buildId, page lists, handlers, `public/`, proxy matchers.
3. Ladder · gate · step 1 config headers applied.
4. Ladder · gate · step 2 redirects: `/old-settings` would exit here (ghost capsule shown exiting).
5. Ladder · gate · step 3 Proxy: matcher `/dashboard/:path*` matches; `proxy.ts` runs; decision encoded in headers; router-server reads them back. Runtime badge shows article snapshot (Edge) vs current (Node).
6. Ladder · gate · step 4 `beforeFiles` rewrites.
7. Ladder · gate · step 5 filesystem check: matched the page `/dashboard/settings`.
8. Ladder · explain · steps 6–8 shown as skipped (`afterFiles`, dynamic, `fallback`).
9. Handoff · move · request handed to render-server with resolved path + params; render-server may answer "cannot" and the ladder continues (dashed return edge).
10. predict · "`GET /_next/static/chunks/framework-a1b2c3.js`: which regions does it touch?"
11. reveal · exit · static chunk served at step 5, never reaches render-server; same for `public/logo.svg`.
12. exit · `GET /_next/image?url=/logo.svg&w=640&q=75` leaves to the image optimizer; `GET /api/hello` and a Route Handler go to render-server but never to React.
13. Minimal mode · explain · on serverless platforms most ladder steps are done by the platform (steps hatched `n/a`).
14. check · "Proxy runs after redirects from `next.config`" (true); "Every request reaches render-server" (false); "router-server renders HTML" (false).

### J3 Pages Router initial request (16 steps)

Following: `GET /products/42` (SSR) with `/posts/7` (SSG/ISR) as a parallel ghost.
What should click: *the whole page tree renders, the props are shipped twice, and the whole tree hydrates.*

1. Build recap · explain · strategy detection from exports: ○ ● ƒ; `_app.getInitialProps` would disable ASO (toggle shows the effect).
2. Router · connect · match in `routes-manifest` (static before dynamic before catch-all); module from `pages-manifest`.
3. Data · transform · `getServerSideProps` runs on the server with `req/res/params/query`; its code is absent from the browser chunk (chunk shown with a hole).
4. Ghost lane · explain · `/posts/7`: `getStaticProps` at build; ISR branches: fresh / stale-serve + regenerate; `fallback` modes false / true / `'blocking'` as three exits.
5. `getInitialProps` · explain · runs on server on first load, in the browser on navigation; its code is in the browser chunk (chunk without a hole) — security callout.
6. `_app` · assemble · `<App Component={ProductPage} pageProps={…}/>`.
7. SSR runtime · transform · full tree → HTML via `renderToReadableStream`; props complete before render starts (no per-boundary streaming).
8. `_document` · assemble · `<Html><Head/><body><Main/><NextScript/></body></Html>`; `<NextScript/>` reads `build-manifest` and emits script tags.
9. `__NEXT_DATA__` · transform · props serialized again; duplication cost chip (`128 KB` warning).
10. predict · "After paint, how much of the page's component code has the browser downloaded?"
11. reveal · Network · HTML crosses (`data`); all page chunks cross (`code`, whole tree).
12. Browser · light-up · paint; then `hydrateRoot` walks the entire tree.
13. Mismatch · explain · `Date.now()`, `window`, extensions → warning + subtree re-render.
14. ASO nuance · explain · `query` empty on first render; `router.isReady` flips after hydration (second render).
15. Compare hook · explain · link to C1 and C5.
16. check · "`getServerSideProps` code can end up in the browser" (false); "`getInitialProps` code can" (true); "Only interactive components hydrate in Pages Router" (false).

### J4 Pages Router navigation (12 steps)

Following: `<Link href="/posts/7">` then the click.
What should click: *`_app` stays, the page swaps, data comes from `/_next/data` or runs in the browser.*

1. Viewport prefetch · move · link enters viewport: SSG target → chunk + JSON; SSR target → chunk only; dedupe `Set`.
2. Hover prefetch · move · hover repeats the JSON request every time (article snapshot); `prefetch={false}` affects viewport only.
3. predict · "Navigating to `/products/42`: does the browser run `getServerSideProps`?"
4. reveal · Network · `GET /_next/data/k7Qm2xLp9/products/42.json` → `{ pageProps }`; server executes the function.
5. SSG lane · move · `/posts/7.json` served as a static file.
6. `getInitialProps` lane · transform · function executes in the browser; no server request.
7. Chunk load · move · `pages/posts/[id]` chunk crosses (`code`).
8. Reconcile · swap · `_app` locked; `Component` replaced; React reconciliation.
9. History · explain · `pushState`; back button replays the mechanism.
10. Shallow · explain · `router.push(url, as, { shallow: true })`: URL changes, no data function, same page only.
11. Version note · explain · article model vs current prefetch behavior (from the verification table).
12. check · "Shallow routing works across pages" (false); "SSR pages prefetch their data on viewport" (false).

### J5 App Router initial request (22 steps, the golden path)

Following: the route tree for `/dashboard/settings`, then Flight row for `settings`, then the `DashboardNav` reference.
What should click: *the RSC runtime produces Flight, not HTML; the SSR runtime consumes Flight; the browser receives Server Component output as data and Client Components as code.*

1. Render region · explain · isometric cutaway: two React module variants loaded in one process.
2. Bundler recap · explain · `rsc` layer activates `react-server`; `import 'react'` resolves to `react.react-server.js` (no `useState`); other layers get `index.js`.
3. Loader tree · assemble · `["", {children: ["dashboard", {children: ["settings", {children: ["__PAGE__", {}]}]}]}]` with `modules` per node.
4. Traversal · assemble · recursive walk root → dashboard → settings; parallel slots shown as an empty `@modal` example.
5. LayoutRouter · explain · a `⟦ ⟧` bracket placed at each parent→child transition.
6. Execution · transform · `RootLayout`, `DashboardLayout`, `SettingsPage` run in the RSC runtime; `await getProfile()` resolves; `AccountSummary` renders to elements.
7. predict · "The RSC runtime reaches `<DashboardNav />`. What does it emit?"
8. reveal · reference · not HTML, not the component: a client reference looked up in `page_client-reference-manifest.js` → `{ id, chunks: ["app/dashboard/layout-3c4d"], name }` + props.
9. Structure vs content · explain · `FlightRouterState` (shape) and segment slices `[segment, tree patch, content, head]` drawn as separate ribbons.
10. Flight · transform · the payload: rows for the tree, the three segments' content, two references, a Suspense boundary; textual rows and a base64 binary row.
11. Tee · split · one stream becomes two identical streams.
12. SSR runtime · transform · copy 1 deserialized to elements; `DashboardNav` reference resolved to the real module on the server; HTML produced. The SSR runtime does **not** re-run `SettingsPage`.
13. Inline · transform · copy 2 serialized into `<script>self.__next_f.push([1, "…"])</script>` chunks interleaved into the HTML stream.
14. Streaming · move · HTML leaves with a Suspense placeholder for a slow boundary; later chunk fills it.
15. Network · move · document crosses (`data + refs`); browser chunks listed in the references cross (`code`).
16. Paint · explain · visible page; nothing interactive yet.
17. Reconstruction · transform · browser drains `self.__next_f` (existing chunks) then listens for late ones; Flight rebuilt into an element tree with references.
18. Chunk load · move · `app/dashboard/layout-3c4d.js` and `settings/page-5e6f.js` load for `DashboardNav` and `ProfileForm`.
19. Hydration · light-up · only the two client subtrees light up; `AccountSummary` output stays static DOM but exists in the React tree as elements.
20. Central claim · explain · a document was constructed; the client now owns a route tree with the same shape as the server's.
21. Internals · explain · `renderToHTMLOrFlight`, `react-server-dom-webpack`, `text/x-component`, manifest shape (L3 disclosure).
22. check · "The SSR runtime re-executes `SettingsPage`" (false); "Flight is HTML in a different encoding" (false); "The browser receives `AccountSummary`'s source" (false).

### J6 App Router prefetch and navigation (18 steps)

Following: `<Link href="/dashboard/billing">` → prefetch task → segment `billing` → Flight patch.
What should click: *the client and server compare route trees and only the divergent subtree is rendered and sent; everything above it keeps its state.*

1. Link · move · `<Link>` in viewport becomes a prefetch task in the scheduler (priority, dedupe, cancel on mouse-leave).
2. Route Cache vs Segment Cache · explain · two drawers in the client-router region.
3. Tree prefetch · move · `GET /dashboard/billing` with `RSC: 1`, `Next-Router-Prefetch: 1`, `Next-Router-Segment-Prefetch: /_tree`.
4. Missing segments · move · one request per missing segment (`/dashboard/billing`); root and dashboard already cached, marked `kept`.
5. Cache Components nuance · explain · article rule: without `cacheComponents` only static routes get per-segment prefetch (`n/a` hatch on the dynamic segment); 16.3 rule: with `partialPrefetching: true` the default prefetch is one reusable App Shell per route, `prefetch={true}` adds URL-dependent cached content (version chips).
6. Click · move · navigation request: `RSC: 1`, `Next-Router-State-Tree`, `Next-Url`, `?_rsc=`; why `_rsc` exists (CDN key).
7. predict · "Which layouts execute again, which payload crosses the network, which client state survives?"
8. reveal · diff · server walks its loader tree and the client's `FlightRouterState`; shared prefix `"" → dashboard` locked.
9. Render · transform · only `BillingPage` runs in the RSC runtime; `DashboardLayout` and `RootLayout` are not rendered again.
10. Patch · move · Flight patch (one segment slice) crosses; no HTML.
11. Merge · swap · the `LayoutRouter` for `dashboard/children` swaps `settings → billing`; `DashboardNav` `open` state, DOM identity, scroll position locked.
12. History · explain · `pushState`; client tree updated.
13. Cache hit path · move · a second visit to settings: fully in the Segment Cache → no network, no server.
14. Compare hook · explain · C2, C4, C9.
15. Route Cache staleness · explain · when entries expire and what `router.refresh()` does.
16. Internals · explain · header values, `_tree` response rows, scheduler names (L3).
17. Version note · explain · article's Segment Cache description vs current default (verification table).
18. check · "`DashboardLayout` re-renders on navigation" (false); "Navigation response contains HTML" (false); "Shared layouts are re-downloaded" (false).

### J7 Server Actions (17 steps)

Following: `updateProfile` from source to action ID to POST envelope to invalidation signal to patch.
What should click: *an action is a POST to an ID; invalidation is a separate step; the UI update rides back in the same response only if something was invalidated.*

1. Source · explain · `"use server"` in `actions.ts`; an inline action in a component captures `secret`.
2. Compiler · transform · action ID assigned; `server-reference-manifest` row.
3. Client proxy · reference · in `ProfileForm` the import becomes a reference that knows only the ID.
4. Closure encryption · transform · captured `secret` encrypted with the deploy key, bound to the ID; `.bind(null, value)` arguments stay plain JSON (two envelopes side by side).
5. Form · explain · `<form action={updateProfile}>`; with JS: fetch; without JS: native POST (both paths drawn).
6. Request · move · `POST /dashboard/settings`, `Next-Action: 7f3a9c1e2b44…`, serialized args.
7. Router · gate · ladder as usual; handoff.
8. Lookup · connect · action handler resolves the ID in the manifest; an old deploy's ID is rejected before anything runs.
9. Boundary · explain · auth, authorization and validation happen inside the function (Next does none of it).
10. Mutation · transform · `db.update()`; the data source glyph changes.
11. predict · "The action returns `{ ok: true }` and calls nothing else. Does the page update?"
12. reveal · invalidate · no: field `f` is empty. Now with `updateTag("profile")`: the tag hatch sweeps the Data Cache and incremental cache entries immediately (same for `revalidatePath`, `refresh()`, cookie writes, `redirect()`).
13. Rerender · transform · because the action expired data, the current route renders again in the same request → Flight in `f`; return value in `a`. Alternative lane: `revalidateTag("profile", "max")` only marks the tag stale-while-revalidate, so `f` stays empty and a later read refreshes (version chip: single-argument `revalidateTag` is the article-era form, deprecated in 16).
14. Response · move · `text/x-component` with `a` and `f` crosses.
15. Merge · swap · client router applies `f` like a navigation patch; `useActionState` receives `a`.
16. `redirect()` · move · alternative branch: redirect path travels instead.
17. check · "`.bind()` arguments are encrypted" (false); "Every action re-renders the page" (false); "`revalidateTag(tag, 'max')` makes the same response carry fresh UI" (false: that is `updateTag`); "Unknown action IDs execute a fallback" (false).

### J8 Caching, ISR, Cache Components and PPR (20 steps)

Following: the cache map, then `GET /posts/7` (ISR), then `GET /dashboard/billing` (PPR).
What should click: *every cache has a location, a key and an invalidator; ISR decides when a whole route regenerates, PPR decides which part of a route is dynamic.*

1. Cache map · explain · all caches placed on the world with location chips (server store, browser tab, fs).
2. Request memoization · explain · one request, duplicate calls collapse.
3. Data Cache / `"use cache"` · explain · `getProfile` entry with tag `profile`, `cacheLife("hours")`; default without `"use cache"`: not cached (Cache Components), contrasted with the article-era implicit fetch cache.
4. Incremental cache · explain · key `/dashboard/settings`, value HTML + RSC + meta.
5. Static branch · move · `/posts/7`: entry fresh → served, render-server idle.
6. predict · "The ISR entry is stale. Does this user wait?"
7. reveal · stale-serve · stale entry leaves immediately; regeneration runs in the background; the next visitor gets the new entry.
8. Miss branch · transform · render, store with `revalidate`.
9. Terminology · explain · "Full Route Cache" / "Data Cache" / "Router Cache" names as used in docs of each era (verification table).
10. Browser caches · explain · Route Cache and Segment Cache drawers, populated by J6.
11. Image cache · explain · key `/logo.svg|640|75|webp` in `.next/cache/images`.
12. Build cache · explain · `.next/cache` + Turbopack persistent cache: across builds.
13. PPR build · transform · build render of `/dashboard/billing` stops at the Suspense boundary; shell stored; postponed state stored.
14. PPR request · move · shell leaves immediately.
15. PPR resume · resume · render resumes from the postponed state with the real cookies; dynamic rows stream into the hole.
16. predict · "Move `cookies()` from `InvoiceList` up into `BillingPage`. What becomes dynamic?"
17. reveal · the boundary jumps to the page root; the shell shrinks to the layouts (trap).
18. Invalidation ↔ rerender · explain · invalidation and rerender are separate operations: `updateTag` / `revalidatePath` expire now and the action response rerenders; `revalidateTag(tag, profile)` marks stale-while-revalidate and the next visit regenerates; `refresh()` rerenders without touching caches.
19. Bypass paths · explain · dynamic APIs, `no-store`, draft mode, `prefetch={false}`.
20. check · "ISR blocks the request until regeneration finishes" (false); "PPR is ISR with a smaller cache" (false); "Browser Segment Cache and server incremental cache store the same thing" (false).

### J9 Development mode (20 steps)

Following: the changed module `DashboardNav.tsx`, then `AccountSummary.tsx`.
What should click: *dev builds on demand and pushes results over a socket; Fast Refresh exists only for client code; server edits mean a new RSC payload.*

1. Processes · explain · parent supervises child; child owns HTTP + bundler + rendering.
2. Restart · move · `next.config.js` edit → child exits with a code → parent restarts it.
3. Watcher · explain · builds the route map live: pages, handlers, layouts, slots, matchers; conflicts (`app/` vs `pages/`); `.next/types`.
4. On-demand · gate · first `GET /dashboard/settings` waits while the entry is compiled (Webpack entry states added → building → built).
5. Eviction · explain · 6 s sweep, 60 s idle → disposed; browser pings keep entries alive (pages: `pathname`; app: full router tree).
6. Turbopack · explain · demand-driven graph; nothing to evict.
7. Static-params workers · explain · isolated worker per `generateStaticParams` call.
8. Socket · connect · `/_next/hmr` WebSocket owned by router-server; origin check; message categories.
9. Edit 1 · transform · save `DashboardNav.tsx` → recompile → `client change` message.
10. predict · "`DashboardNav` has `open = true`. After the edit, is it still open?"
11. reveal · refresh · Fast Refresh: `react-refresh` registered IDs + hook signature; same signature → state kept.
12. Signature change · explain · adding a hook → remount; non-component export → bubble → full reload.
13. Edit 2 · transform · save `AccountSummary.tsx` (Server Component) → server chunk replaced, `require` cache cleared → `server components change` message.
14. Refresh · move · the HMR client calls the router's `hmrRefresh()` (internal counterpart of `router.refresh()`, header `next-hmr-refresh`) inside `startTransition`; new Flight crosses and merges; a full `location.reload()` happens only after a prior runtime error.
15. HMR vs Fast Refresh · explain · the channel vs the React mechanism (pair from concept model §5).
16. Custom server in dev · explain · `upgrade` must be forwarded; `server.js` outside watcher and compiler.
17. Dev vs prod · explain · caching mostly off, viewport prefetch off, no minification, dev chunking, source maps, dev React, Strict Mode double render.
18. Performance · explain · dev numbers measure dev.
19. Internals · L3.
20. check · "Fast Refresh applies to Server Components" (false); "Editing a Server Component preserves its client children's state" (true, via refresh merge); "Dev timings predict production" (false).

### J10 Custom server (14 steps)

Following: `GET /legacy/settings` through `server.js`, then `GET /healthz`.
What should click: *a custom server wraps Next.js; it does not replace router-server and render-server.*

1. Ring · wrap · `server.js` draws around HTTP entry + router-server.
2. API · explain · `next({ dev })`, `app.prepare()`, `app.getRequestHandler()` → `handle`.
3. Ownership · explain · our `createServer((req, res) => …)` owns the socket.
4. `handle` · move · request enters the same ladder; Proxy runs; render-server renders.
5. `parsedUrl` · transform · `/legacy/settings` rewritten to `/dashboard/settings` before entering the ladder.
6. predict · "`/healthz` is answered by `server.js` without calling `handle`. Does Proxy see it?"
7. reveal · no: the request never enters the ring's inner machine.
8. Both routers · explain · one `handle` for Pages and App; the router choice is inside render-server.
9. Deprecated · explain · `app.render()` today normalizes and calls the same `requestHandler`.
10. NestJS bridge · explain · optional callout: controller guards → `app.render(req, res, '/view')`.
11. `standalone` · explain · tracing ignores `server.js` → runtime module-not-found; `export` has no server.
12. `useFileSystemPublicRoutes: false` · explain · server hides file routes; client-side navigation still can reach them.
13. Dev · explain · HMR `upgrade` forwarding.
14. check · "A custom server can skip Proxy by calling `handle` with a modified URL" (false: modifies input, still runs the ladder); "A custom server replaces render-server" (false).

### J11 Built-in optimizations (16 steps)

Following: the request `GET /dashboard/settings` as each lever is applied.
What should click: *each optimization moves work earlier (build) or narrower (fewer bytes, fewer renders), and each follows from a mechanism already on the map.*

1. Static rendering · explain · no runtime work.
2. ISR · explain · reuse rendered results.
3. PPR · explain · only the stable region to build.
4. Chunks · explain · framework / lib (> 160 KB) / runtime / route.
5. `modularizeImports` / `optimizePackageImports` · transform · barrel import rewritten.
6. `next/dynamic` · transform · `import()` boundary → separate chunk; Loadable 200 ms delay (article) vs verified; `ssr: false`.
7. `next/image` · move · request path `/_next/image` → `sharp` → `Accept` negotiation → width/quality key → disk cache; `srcset` and layout reservation in the browser.
8. `next/font/local` · transform · `@font-face` generated at build.
9. `next/font/google` · move · build-time download; dev warns + fallback, prod build fails.
10. Fallback metrics · explain · `size-adjust` prevents layout shift.
11. `next/script` · explain · `beforeInteractive` / `afterInteractive` / `lazyOnload` / `worker` placed on the browser timeline; `worker` (Partytown) marked experimental, Pages Router only, `n/a` under Turbopack.
12. File tracing · explain · smaller deploy, faster cold start, not faster React.
13. predict · "Which of these speeds up the React render itself?"
14. reveal · none of image/font/script/tracing; static/ISR/PPR avoid it; chunking reduces download.
15. Summary · explain · levers placed on the map.
16. check · "Tracing makes rendering faster" (false); "`next/font/google` fetches at request time" (false).

## 8. Understanding checks

- **Prediction questions** (one per journey, listed above) appear before the critical transition;
  the reveal step explains the result from the architecture and shows changed vs kept.
- **Misconception checks** (2–3 per journey) are true/false statements with a one-line why and a
  link to the step that shows it.
- **Predict the machine** (mode 3.4) holds the brief's ten reviewer questions plus two scenario
  questions per journey, answered on the map.
- Progress (answered, correct) is stored in `localStorage` only; it never gates content.

## 9. Desktop and mobile behavior

| Viewport | Layout |
|---|---|
| ≥ 1200 px | canvas left (≈ 62 %), step panel right (≈ 38 %), transport bar below the canvas, minimap bottom-left, inspector docks over the panel |
| 1024–1199 px | same, panel 40 %, internals collapsed by default |
| 768–1023 px | canvas full width, camera locked to **Follow** (Region level), step panel as a bottom sheet (peek 30 %, expanded 70 %), minimap in the sheet header |
| ≤ 767 px | focused scene: camera at Focus level only, whole-system available as a full-screen overlay; transport as a fixed bottom bar with ≥ 44 px targets; swipe left/right changes step; compare mode stacks lanes |

Touch: pinch-zoom and drag-pan on the canvas; tap to inspect. Keyboard: `Tab` cycles focusable
entities within the current camera; `Enter` inspects; `←/→` steps; `space` toggles play.

## 10. Routing and deep links

One HTML route. State in the URL hash, always serializable:

```
#/journey/app-initial/12         journey slug + step
#/atlas?entity=client-reference-manifest&cam=1200,600,2.5
#/compare/initial-load/7
#/predict/3
```

`cam=x,y,zoom` is optional on every route. Reloading restores the exact world state.

## 11. Technical approach (recommendation for the design review)

- Keep the existing Vite + TypeScript setup. Add **Preact + `@preact/signals`** for UI chrome and
  for rendering the world from data (JSX over SVG); no React, no Next.js, no WebGL.
- **SVG** for the world; the camera is a transform on one `<g>`, animated with the Web Animations
  API; labels in an HTML overlay for constant screen size. Isometric offsets are static SVG
  transforms.
- **Domain model as typed data**: `entities.ts`, `edges.ts`, `regions.ts`, `journeys/*.ts`,
  `compare/*.ts`, `quiz.ts`, `versions.ts`. A step is data; a pure function `worldState(journey,
  n)` derives the scene. Renderer never imports journey files directly.
- **Lazy loading**: journey data and compare lanes are dynamic imports; the initial bundle holds
  the world, the atlas and J0.
- **Tests**: Vitest for the domain (every step references existing entities/edges; determinism;
  cache-map completeness; coverage-matrix rows resolve to journeys). Playwright for J5, J6, J7
  end to end at the four required viewports, with reduced-motion and keyboard-only runs.
- **Alternatives considered** in the design review: (a) React Three Fiber world (rejected: text
  legibility, bundle size, 3D adds nothing beyond the two cutaways); (b) scroll-driven
  scrollytelling (rejected: no deterministic step control, no atlas, no compare sync).
