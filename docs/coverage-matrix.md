# Coverage matrix

One row per section of the nine articles (`all_articles.txt`), plus rows for the brief's mandatory
checklist items that the articles cover inside a larger section. Scenes and steps refer to
`experience-architecture.md` §7 (journeys J0–J11), §3.3 (compare pairs C1–C9) and §3.2 (Atlas).

Explanation layer: **L1** story sentence in the step, **L2** inspector fields, **L3** internals
disclosure / source panel. Status values: `planned`, `planned · version note` (the site must show
article snapshot vs current behavior), `implemented`, `deferred (reason)`, `corrected (source)`.

Verification source lists the article part and section, then the official source topic; the URL
list is in §Sources at the end.

## Article 1 — Architecture overview

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 1 | Introduction: compiler + bundler + two runtimes + protocol | J0 step 1 (three bands) | explain | L1 | A1 §Введение | implemented (J0) |
| 1 | Brief history: SSR wrapper → getInitialProps → 9.3 split → 12 SWC → 13 App Router → today | Atlas timeline strip in the Source region header; J0 step 1 caption | inspect | L2 (history field on `next build`), L3 | A1 §Краткая история; docs: release notes | planned |
| 1 | SWC as compiler (single file, N-API, no graph knowledge) | J1 steps 3–5 | transform | L1–L3 | A1 §SWC; A7 §SWC; docs: next/compiler | implemented (J1) |
| 1 | Turbopack as bundler: incremental graph, lazy bundling in dev, unified graph, crates location | J1 step 9; C6; J9 step 6 | explain / compare | L1–L3 | A1 §Turbopack; A7 §Turbopack; docs: turbopack | implemented (J1) · version note (default status) |
| 1 | `BaseServer`, `NextNodeServer`, `NextWebServer` | J2 step 9 inspector; Atlas render-server | inspect | L2, L3 | A1 §Серверный слой; source: packages/next/src/server | implemented (J2) |
| 1 | Node vs Edge capabilities and limits | Atlas runtime badges; J2 step 5 | inspect | L2 | A1 §Серверный слой; docs: runtimes | implemented (J2) |
| 1 | Middleware always on Edge | J2 step 5 (article snapshot chip vs current chip) | gate | L1 + version note | A1 §Серверный слой; docs: proxy runtime | implemented (J2) · version note |
| 1 | Route manifests used by `BaseServer` | J1 step 12; J2 step 2 | connect | L1–L3 | A1 §Серверный слой; A2 §Манифесты | implemented (J1) |
| 1 | Pages Router: page as rendering unit | J3 step 1 | explain | L1 | A1 §Страница как единица рендеринга | planned |
| 1 | `_app` and `_document` roles | J3 steps 6, 8 | assemble | L1–L2 | A1, A2 §Рендеринг HTML | planned |
| 1 | Pages data strategies (getStaticProps/ISR, getServerSideProps, getStaticPaths/fallback) | J3 steps 3–4 | transform / explain | L1–L2 | A1 §Стратегии получения данных | planned |
| 1 | Automatic Static Optimization | J3 step 1, 14 | explain | L1–L2 | A1; A2 §Как определяется стратегия | planned |
| 1 | Pages rendering + full-tree hydration limitation | J3 step 12; C5 | light-up | L1 | A1 §Рендеринг и гидратация | planned |
| 1 | Pages client navigation summary | J4 | – | L1 | A1 | planned |
| 1 | Limitations of Pages Router (page-level data, no nested layouts, whole bundle) | J3 step 15; C1 | compare | L1 | A1 §Ограничения Pages Router | planned |
| 1 | App Router as a parallel architecture (13 → stable 13.4; RSC stable in React 19) | J5 step 1 caption | explain | L1, L3 | A1 §App Router: новая архитектура | implemented (J5) |
| 1 | Component as rendering unit; `"use client"` | J5 steps 7–8; J0 step 2 | reference | L1 | A1 §Компонент как единица рендеринга | implemented (J5) |
| 1 | Route-segment file conventions (page, layout, loading, error, not-found) | J5 step 3 | assemble | L1–L2 | A1; docs: file conventions | implemented (J5) |
| 1 | Two React runtimes + `renderToHTMLOrFlight` decision by `RSC` header | J5 steps 1, 21; C3 | explain | L1, L3 | A1 §Два React-рантайма; source: app-render | implemented (J5) |
| 1 | RSC payload contents | J5 step 10 | transform | L1–L2 | A1; A3 §Рендеринг | planned · version note ("binary" wording) |
| 1 | Streaming and selective hydration via Suspense | J5 steps 14, 19 | fill / light-up | L1 | A1 §Streaming; docs: streaming | implemented (J5) |
| 1 | App client router (`AppRouter`), `RSC: 1`, layout state preservation | J6 steps 6, 11 | move / swap | L1–L3 | A1 §Клиентский роутер; source: app-router.tsx | planned |
| 1 | Prefetch on hover into a client cache | J6 step 1 | move | L1 | A1; A4 | planned · version note |
| 1 | Caching model evolution: 14 implicit fetch cache → 16 Cache Components explicit `"use cache"`, `cacheLife()` | J8 step 3 | explain | L1–L3 | A1 §Кеширование; docs: cacheComponents, use cache | planned · version note |
| 1 | PPR overview | J8 steps 13–15 | resume | L1 | A1 §Partial Prerendering; docs: PPR | planned · version note |
| 1 | Server Actions overview | J7 | – | L1 | A1 §Server Actions | planned |

## Article 2 — Pages Router internals

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 2 | Production build outputs (`.next/`) | J1 step 17; Atlas shelf | explain | L1–L2 | A2 §Сборка для продакшена | implemented (J1) |
| 2 | `pages-manifest.json` (route → server module) | J1 step 12; J3 step 2 | connect | L2–L3 (excerpt) | A2 §Манифесты | implemented (J1) |
| 2 | `build-manifest.json` (route → browser chunks, `lowPriorityFiles`) | J1 step 12; J3 step 8 | connect | L2–L3 (excerpt) | A2 §Манифесты | implemented (J1) |
| 2 | `prerender-manifest.json` (revalidate/expire, fallback, dataRoute) | J1 step 12; J3 step 4 | connect | L2–L3 (excerpt) | A2 §Манифесты | implemented (J1) |
| 2 | `routes-manifest.json` (static/dynamic, priority, redirects/rewrites/headers, dataRoutes, rsc header) | J1 step 12; J2 step 2 | connect | L2–L3 (excerpt) | A2 §Манифесты | implemented (J1) |
| 2 | Server files (`.next/server/pages`, prerendered `.html`/`.json`) vs client chunks (`.next/static/chunks`) | J1 step 14, 17; Atlas shelf | inspect | L1–L2 | A2 §Серверные и клиентские файлы | implemented (J1) |
| 2 | Route-level code splitting | J1 step 10 | pack | L1 | A2 §Серверные и клиентские файлы | implemented (J1) |
| 2 | Rendering-strategy detection from exports; `_app.getInitialProps` disables ASO | J3 step 1 | explain (toggle) | L1–L2 | A2 §Как определяется стратегия | planned |
| 2 | Build output symbols ○ ● ƒ | J1 step 17 | explain | L1 | A2 | implemented (J1) |
| 2 | Route matching priority (static → dynamic → catch-all) | J3 step 2; J2 step 7 | gate | L1–L2 | A2 §Матчинг маршрута | implemented (J2) |
| 2 | `getStaticProps`: file read, ISR stale-while-revalidate | J3 step 4; J8 steps 5–8 | stale-serve | L1–L2 | A2 §getStaticProps; docs: ISR | planned |
| 2 | `getStaticPaths` fallback `false` / `true` / `'blocking'` | J3 step 4 (three exits) | gate | L1–L2 | A2 §getStaticProps; docs: getStaticPaths | planned |
| 2 | `getServerSideProps`: per request, stripped from client bundle, context | J3 step 3 | transform | L1–L2 | A2 §getServerSideProps | planned |
| 2 | `getInitialProps`: server + client, code in bundle, security; `_app.getInitialProps` + gSSP context-switch nuance | J3 step 5; J4 step 6 | transform | L1–L3 | A2 §getInitialProps | planned |
| 2 | HTML rendering pipeline: `_app` wrap, `renderToReadableStream`, streaming limitation | J3 steps 6–7; C1 ruler | transform | L1–L3 | A2 §Рендеринг HTML; source: pages render | planned |
| 2 | `_document`, `<Main/>`, `<NextScript/>`; server-only, not re-rendered on navigation | J3 step 8 | assemble | L1–L2 | A2 §Рендеринг HTML | planned |
| 2 | `__NEXT_DATA__` contents and duplication cost (128 KB warning) | J3 step 9 | transform | L1–L3 (excerpt) | A2 §NEXT_DATA | planned |
| 2 | Hydration sequence: chunks → read `__NEXT_DATA__` → `hydrateRoot` → attach | J3 steps 11–12 | light-up | L1–L2 | A2 §Гидратация | planned |
| 2 | Hydration mismatch causes | J3 step 13 | explain | L1–L2 | A2 §Гидратация | planned |
| 2 | Whole-tree hydration vs App Router | C5 | compare | L1 | A2 §Гидратация | planned |
| 2 | ASO empty `query` and `router.isReady` | J3 step 14 | explain | L1–L2 | A2 §Гидратация | planned |
| 2 | Client navigation entry (`<Link>`, `router.push`) | J4 | – | L1 | A2 §Клиентская навигация | planned |
| 2 | Viewport prefetch: SSG chunk+JSON, SSR chunk only, `Set` dedupe | J4 step 1 | move | L1–L2 | A2 §Prefetch | planned · version note |
| 2 | Hover prefetch repeats; `prefetch={false}` viewport-only; `<a>` escape | J4 step 2 | move | L1–L2 | A2 §Prefetch; source: next/link (pages) | planned · version note |
| 2 | `/_next/data/{buildId}/…json` for gSSP; static JSON for gSP; in-browser `getInitialProps` | J4 steps 4–6 | move | L1–L3 | A2 §Запрос данных | planned |
| 2 | New-page reconciliation: `_app` kept, `Component` swapped | J4 step 8; C2 | swap | L1 | A2 §Рендер новой страницы | planned |
| 2 | History API, back button | J4 step 9 | explain | L1 | A2 | planned |
| 2 | Shallow routing and its single-page boundary | J4 step 10 | explain | L1–L2 | A2 §Shallow routing; docs: shallow routing | planned |

## Article 3 — App Router from request to hydration

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 3 | Two React builds in one process | J5 step 1 (cutaway); C3 | explain | L1–L2 | A3 §Два рантайма React | implemented (J5) |
| 3 | RSC build: async components, serializes to a stream, no DOM, no `useState`/`useEffect` | J5 step 6; Atlas RSC runtime | transform | L1–L2 | A3; docs: server components | planned · version note ("binary") |
| 3 | `react-server` conditional export map in React's `package.json` | J5 step 2 (L3 excerpt) | explain | L3 | A3; source: react package.json | implemented (J5) |
| 3 | Bundler layers activate the condition per module | J1 step 8; J5 step 2 | explain | L1–L3 | A3; A7 §Слои | implemented (J1) |
| 3 | Loader tree shape `[segment, parallelRoutes, modules]`; `children` and `@slot` keys | J5 step 3 | assemble | L1–L3 (excerpt) | A3 §Как описывается маршрут; source: next-app-loader | implemented (J5) |
| 3 | Segment = folder; example `/dashboard/settings` | J5 step 3; example app | assemble | L1 | A3 §Рендеринг | implemented (J5) |
| 3 | Structure vs content separation (why) | J5 step 9; J6 step 8 | explain / diff | L1 | A3 §Рендеринг | implemented (J5) |
| 3 | Recursive render: layout/page, descend into children and parallel slots | J5 step 4 | assemble | L1–L2 | A3 §Рендеринг | implemented (J5) |
| 3 | `LayoutRouter` boundary at each transition | J5 step 5; J6 step 11 | explain / swap | L1–L2 | A3; source: layout-router.tsx | implemented (J5) |
| 3 | `"use client"` boundary: reference instead of execution; `page_client-reference-manifest.js` | J5 steps 7–8 | reference | L1–L3 (manifest excerpt) | A3 §Рендеринг | implemented (J5) |
| 3 | RSC Payload contents; single-letter keys; inlined into HTML | J5 step 10 | transform | L1–L3 (rows) | A3 §Рендеринг | implemented (J5) |
| 3 | Two parallel uses of the payload (HTML + inline) | J5 steps 11–13 | split | L1 | A3 §Рендеринг | implemented (J5) |
| 3 | `FlightRouterState`: bidirectional, per-segment marks (refetch, head-only) | J5 step 9; J6 step 6 | explain | L1–L3 | A3 §Flight Protocol; source: router-reducer types | implemented (J5) |
| 3 | Segment slices `[segment, tree patch, content, head]`; streamability | J5 step 9–10 | explain | L2–L3 | A3 §Flight Protocol | implemented (J5) |
| 3 | Flight → HTML: tee, SSR consumes copy 1, seeds router state, does not re-render | J5 steps 11–12; C3 | split / transform | L1–L2 | A3 §Как RSC превращается в HTML | implemented (J5) |
| 3 | Why not straight to HTML (three uses of one stream) | J5 step 12 caption; J0 step 7 | explain | L1 | A3 | implemented (J5) |
| 3 | `self.__next_f` chunks: init / text / base64 binary | J5 step 13 | transform | L1–L3 (script excerpt) | A3 §Аналог NEXT_DATA | implemented (J5) |
| 3 | HTML and hydration data in one stream | J5 steps 13–14 | move | L1 | A3 | implemented (J5) |
| 3 | Browser reconstruction: replay existing chunks, then intercept late ones | J5 step 17 | transform | L1–L2 | A3 §Гидратация | implemented (J5) |
| 3 | Client-Component-only hydration; 80 % rule | J5 step 19; C5 | light-up | L1 | A3 §Гидратация | implemented (J5) |

## Article 4 — Navigation, cache and mutations

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 4 | Navigation request headers `RSC`, `Next-Router-State-Tree` (URL-encoded JSON), `Next-Url` | J6 step 6 | move | L1–L3 (values) | A4 §Клиентская навигация; docs/source: app-router headers | planned |
| 4 | `_rsc` cache-busting parameter and CDN keys | J6 step 6 | explain | L1–L2 | A4 | planned |
| 4 | Server walks both trees; renders from divergence or explicit marks | J6 step 8 | diff | L1–L2 | A4 | planned |
| 4 | Client merges patch; unchanged segments keep nodes (scroll, accordions, form text) | J6 step 11 | swap | L1 | A4 | planned |
| 4 | Shared layout neither rendered nor sent | J6 step 9 | transform | L1 | A4 | planned |
| 4 | Prefetch: viewport + hover, Flight into cache | J6 step 1 | move | L1 | A4 §Segment Cache и prefetch | planned · version note |
| 4 | Route Cache (trees) vs Segment Cache (segments) | J6 step 2; J8 step 10; C9 | explain | L1–L2 | A4; docs: segment cache | planned · version note |
| 4 | Old model (tree to first `loading`) vs new (tree first, then missing segments) | J6 steps 3–4; version chips | move | L1 + version note | A4 | planned · version note |
| 4 | Network burst: `Next-Router-Segment-Prefetch: /_tree`, per-segment paths, `Next-Router-Prefetch: 1` | J6 steps 3–4 | move | L2–L3 | A4; source: prefetch headers | planned |
| 4 | Why it is cheap: dedupe, shared segments, small parallel HTTP/2, scheduler with priorities/cancel | J6 step 1 | explain | L1–L2 | A4 | planned |
| 4 | `prefetch` prop to weaken/disable | J6 step 1 | inspect | L2 | A4; docs: Link prefetch | planned · version note |
| 4 | Server prepares segment hints (`loading` below?) | J6 step 5 | explain | L3 | A4 | planned |
| 4 | Cache Components nuance: per-segment prefetch for all routes only with `cacheComponents: true` | J6 step 5 | explain | L1–L2 | A4; docs: cacheComponents | planned · version note |
| 4 | Server Action ID (hash) and `server-reference-manifest` | J7 step 2 | transform | L1–L3 | A4 §Server Actions | planned |
| 4 | POST with `Next-Action` and serialized args | J7 step 6 | move | L1–L2 | A4 | planned |
| 4 | Response `text/x-component` with `a` (result) and `f` (flight) | J7 steps 13–14 | move | L1–L3 | A4; source: action-handler | planned |
| 4 | Rerender only if invalidated (`revalidatePath/Tag`, `redirect`) | J7 steps 11–13 | invalidate | L1 | A4 | planned · version note (`updateTag`/`refresh`) |
| 4 | Unknown / old action IDs rejected before execution | J7 step 8 | connect | L1 | A4 | planned |
| 4 | Closure encryption with deploy key, ID as checksum | J7 step 4 | transform | L1–L2 | A4; docs: security | planned |
| 4 | `.bind()` arguments travel as plain JSON | J7 step 4 | explain | L1–L2 | A4 | planned |
| 4 | Forms without JavaScript | J7 step 5 | explain | L1 | A4 | planned |

## Article 5 — Server layer

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 5 | Plain Node HTTP server with one `(req, res)` callback | J2 step 1 | explain | L1 | A5 §Колбэк на HTTP-сервере | implemented (J2) |
| 5 | Listening before initialization; early requests wait | J2 step 1 | explain | L1–L2 | A5; source: start-server | implemented (J2) |
| 5 | router-server vs render-server roles | J2 steps 1, 9; Atlas | explain | L1 | A5 §Два слоя | implemented (J2) |
| 5 | Exact ladder order (headers → redirects → middleware → beforeFiles → fs → afterFiles → dynamic → fallback) | J2 steps 3–8 | gate | L1–L2 | A5 §Порядок обработки; docs: proxy matching order | implemented (J2) |
| 5 | Minimal mode on serverless platforms | J2 step 13 | explain | L1–L2 | A5 | implemented (J2) |
| 5 | Startup reads buildId, page lists, handlers, `public/`, proxy rules from manifests | J2 step 2 | connect | L1–L2 | A5 §Что сервер отдаёт сам | implemented (J2) |
| 5 | Direct static delivery `/_next/static`, `public/` | J2 step 11 | exit | L1 | A5 | implemented (J2) |
| 5 | Image optimizer branch | J2 step 12; J11 step 7 | exit | L1–L2 | A5 | planned |
| 5 | Route Handlers (method table) | J2 step 12 | exit | L1–L2 | A5 §API-эндпоинты; docs: route handlers | implemented (J2) |
| 5 | Pages API Routes (`(req, res)` + helpers) | J2 step 12 | exit | L1–L2 | A5 | implemented (J2) |
| 5 | Endpoint and page are the same exit type for router-server | J2 step 12 | explain | L1 | A5 | implemented (J2) |
| 5 | Proxy matcher → `middleware-manifest` regexes; header/cookie conditions | J2 step 5 | gate | L1–L3 | A5 §Middleware (proxy); docs: proxy matcher | implemented (J2) · version note (name) |
| 5 | Decision encoded in response headers and read back | J2 step 5 | gate | L2–L3 | A5 | implemented (J2) |
| 5 | "Always on Edge" rationale | J2 step 5 version chip | explain | version note | A5; docs: proxy runtime | implemented (J2) · version note |
| 5 | Handoff with resolved metadata; render-server may decline and the ladder continues | J2 step 9 | move | L1–L2 | A5 §Передача в рендер | implemented (J2) |

## Article 6 — Custom server

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 6 | Valid use cases; serverless limitation | J10 step 3 caption | explain | L1 | A6 §Зачем | planned |
| 6 | Minimal server: `next(options)`, `prepare()`, `getRequestHandler()`; options list | J10 step 2 | explain | L1–L3 | A6 §Минимальный сервер; docs: custom server | planned |
| 6 | `server.js` outside compiler and bundler | J10 step 2; J9 step 16 | explain | L1 | A6 | planned |
| 6 | `handle` = router-server handler; full ladder; Proxy only for what reaches `handle` | J10 steps 4, 6–7 | move / predict | L1 | A6 §Путь запроса в handle | planned |
| 6 | Wrapper, not replacement: our server → handle → router-server → render-server | J10 step 1; central conclusion | wrap | L1 | A6 | planned |
| 6 | Custom routing through `parsedUrl` (rebuilds `req.url`) | J10 step 5 | transform | L1–L3 (code) | A6 §Кастомная маршрутизация | planned |
| 6 | Same `handle` for Pages and App; router choice inside render-server | J10 step 8 | explain | L1 | A6 §Pages Router и App Router | planned |
| 6 | Deprecated `render`, `renderToHTML`, `renderError`, `render404` | J10 step 9 | explain | L1–L3 | A6 §Устаревшие способы; source: next-server custom | planned |
| 6 | Modern `render()` delegates to the same `requestHandler` | J10 step 9 | explain | L3 | A6; source | planned |
| 6 | NestJS/Express bridge story | J10 step 10 | explain (optional callout) | L3 | A6 | planned |
| 6 | `output: 'standalone'` conflict (tracing skips `server.js`) | J10 step 11 | explain | L1–L2 | A6 §Ограничения; docs: output | planned |
| 6 | `output: 'export'` conflict | J10 step 11 | explain | L1 | A6 | planned |
| 6 | `useFileSystemPublicRoutes: false` and client-side caveat | J10 step 12 | explain | L1–L2 | A6; docs: useFileSystemPublicRoutes | planned |
| 6 | Dev with custom server: restart and WebSocket caveats | J10 step 13; J9 step 16 | explain | L1 | A6 | planned |

## Article 7 — Build internals

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 7 | Compiler vs bundler responsibilities | J1 steps 3, 7; concept pair | predict / reveal | L1 | A7 §Компилятор и бандлер | implemented (J1) |
| 7 | Bundler options: Webpack, Turbopack, Rspack (experimental); Turbopack embeds SWC | J1 step 9 | explain | L1–L2 | A7; docs: rspack | implemented (J1) · version note |
| 7 | History: Babel/Terser/Webpack → SWC (12) → Turbopack | Atlas build region history field | inspect | L2 | A7 | planned |
| 7 | SWC transforms list (types, JSX, downlevel, minify) | J1 step 3 | transform | L1–L2 | A7 §SWC | implemented (J1) |
| 7 | Native N-API packages per platform; WASM fallback | J1 step 3 L3 | inspect | L3 | A7 | implemented (J1) |
| 7 | Next-specific transforms: console removal, `data-testid`, CSS-in-JS | J1 step 3 L3 | inspect | L3 | A7; docs: compiler options | implemented (J1) |
| 7 | `modularizeImports` / `optimizePackageImports` | J1 step 5; J11 step 5 | transform | L1–L2 | A7; docs: optimizePackageImports | planned |
| 7 | `serverComponents` / `serverActions` transforms; action IDs | J1 step 4; J7 step 2 | transform | L1–L3 | A7 | implemented (J1) |
| 7 | Babel fallback and its cost | J1 step 3 (toggle) | inspect | L2 | A7; docs: babel | implemented (J1 step 3 internals; no toggle yet) |
| 7 | Worker-thread scheduling (`registerWorkerScheduler`) | J1 step 3 L3 | inspect | L3 | A7 | implemented (J1) |
| 7 | Webpack: three target compilers stitched | J1 step 9; C6 | compare | L1–L2 | A7 §Webpack | implemented (J1) |
| 7 | Layers list and their effect on resolution | J1 step 8 | explain | L1–L3 (list) | A7 §Слои; source: webpack-config layers | implemented (J1) |
| 7 | `react-server` resolution in the `rsc` layer | J1 step 8; J5 step 2 | explain | L1–L3 | A7 | implemented (J1) |
| 7 | `next-swc-loader` per layer | J1 step 3 L3 | inspect | L3 | A7 §Загрузчики и плагины | implemented (J1) |
| 7 | `next-flight-loader` | J1 step 4 L3 | inspect | L3 | A7 | implemented (J1) |
| 7 | `next-app-loader` | J5 step 3 L3 | inspect | L3 | A7 | implemented (J5) |
| 7 | `next-font-loader`, CSS loader chain | J11 steps 8–9 | transform | L2–L3 | A7 | planned |
| 7 | Plugins generate manifests | J1 step 12 | connect | L2 | A7 | implemented (J1) |
| 7 | `flight-client-entry-plugin` and `flight-manifest-plugin` | J1 steps 10–11 | pack / reference | L1–L3 | A7 | implemented (J1) |
| 7 | Chunk policy: framework, lib > ~160 KB, runtime | J1 step 10; J11 step 4 | pack | L1–L2 | A7 §Разделение на чанки; source: webpack-config splitChunks | planned |
| 7 | Turbopack default in 16; Webpack via flag | J1 step 9 version chip | explain | version note | A7 §Turbopack; docs | implemented (J1) · version note |
| 7 | `turbo-tasks`: functions, tasks, values, `Vc`; dependency graph | J1 step 9 L3; C6 | inspect | L3 | A7 §Устройство Turbopack | implemented (J1) |
| 7 | Bottom-up invalidation; affected subgraph only | C6; J9 step 6 | explain | L1–L2 | A7 | planned |
| 7 | Persistent filesystem cache across builds | J8 step 12 | explain | L1–L2 | A7; docs: turbopack cache | planned |
| 7 | Crates: core, ecmascript, css, resolve, node | J1 step 9 L3 | inspect | L3 | A7 | implemented (J1) |
| 7 | Unified graph vs separate compilers | C6 | compare | L1 | A7 | planned |
| 7 | Next ↔ Turbopack through N-API `Project`; identical manifests | J1 step 9 L3; J1 step 12 | inspect | L2–L3 | A7 §Как Next.js управляет Turbopack | implemented (J1) |
| 7 | `next build` phases: buildId, config, redirects/rewrites, route discovery, compile, trace, analyze, prerender, standalone, summary | J1 step 1 | explain | L1–L2 | A7 §Другие шаги | implemented (J1) |
| 7 | Route analysis and prerender | J1 steps 13–14 | explain / transform | L1–L2 | A7 | implemented (J1) |
| 7 | Output file tracing → standalone | J1 steps 15–16; J11 step 12 | explain / pack | L1–L2 | A7; docs: output tracing | planned |

## Article 8 — Development mode

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 8 | Parent and child processes; restart on config change (exit code) | J9 steps 1–2 | move | L1–L2 | A8 §Процессы внутри dev | planned |
| 8 | Bundler embedded in the child runtime (between router-server and render-server) | J9 step 1; C7 | explain | L1 | A8 | planned |
| 8 | Isolated workers for `getStaticPaths` / `generateStaticParams` | J9 step 7 | explain | L1–L2 | A8 | planned |
| 8 | Watcher-built route map replaces manifests; watched set | J9 step 3; C7 | explain | L1–L2 | A8 §Маршруты без манифестов | planned |
| 8 | Conflicts (`app/` vs `pages/`), generated `.next/types`, route-change message | J9 step 3 | explain | L1–L2 | A8 | planned |
| 8 | On-demand compilation: entry map with statuses, last-active, dispose flag | J9 step 4 | gate | L1–L3 | A8 §Компиляция по требованию | planned |
| 8 | Invalidation scope: changed modules only, but chunk graph/codegen/hashing whole | J9 step 4 L3 | inspect | L3 | A8 | planned |
| 8 | Eviction: 6 s timer, 60 s idle, dropped at next compile; rationale | J9 step 5 | explain | L1–L2 | A8 | planned |
| 8 | Browser pings keep entries alive (pathname / router tree) | J9 step 5 | explain | L2 | A8 | planned |
| 8 | Turbopack: demand-driven, nothing to evict | J9 step 6 | explain | L1 | A8 | planned |
| 8 | HMR WebSocket owned by router-server; `/_next/hmr`; other paths continue routing | J9 step 8 | connect | L1–L2 | A8 §Канал обновлений | planned |
| 8 | Origin validation | J9 step 8 | explain | L2 | A8; docs: allowedDevOrigins | planned |
| 8 | Message categories: build lifecycle, route map, change classification, reload | J9 step 8 L3 | inspect | L3 | A8 | planned |
| 8 | HMR vs Fast Refresh | J9 step 15; concept pair | explain | L1 | A8 §Fast Refresh | planned |
| 8 | `react-refresh` runtime; SWC registers component IDs + hook signatures (client layer only) | J9 step 11 | refresh | L1–L3 | A8 | planned |
| 8 | State-preservation rules (components-only export, signature change, other exports) | J9 steps 11–12 | explain | L1–L2 | A8 | planned |
| 8 | No Fast Refresh for server code | J9 step 13 | explain | L1 | A8 | planned |
| 8 | Server change classification; `require` cache cleared | J9 step 13 | transform | L1–L2 | A8 §Серверные изменения | planned |
| 8 | Client: `router.refresh()` in `startTransition`; error state → reload | J9 step 14 | move | L1–L2 | A8 | planned |
| 8 | Custom server: `upgrade` forwarding; unwatched `server.js` | J9 step 16; J10 step 13 | explain | L1 | A8 §Кастомный сервер в dev | planned |
| 8 | Dev/prod differences: caching, viewport prefetch off, minification, chunking, source maps, dev React, Strict Mode | J9 step 17; C7 | compare | L1–L2 | A8 §Итого | planned |
| 8 | Dev performance is not production evidence | J9 step 18 | explain | L1 | A8 | planned |

## Article 9 — Optimization mechanisms

| Article | Section / concept | Visual scene | Interaction | Explanation layer | Verification source | Status |
|---|---|---|---|---|---|---|
| 9 | Static as default: dynamic APIs decide | J11 step 1; J1 step 13 | explain | L1 | A9 §Статика | planned · version note (Cache Components defaults) |
| 9 | ISR stale-while-revalidate | J8 steps 6–7; J11 step 2 | stale-serve | L1 | A9 | planned |
| 9 | Incremental cache lookup branches (miss / fresh / stale) | J8 steps 4–8 | move | L1–L2 | A9 | planned |
| 9 | Plain static as infinite-revalidate special case | J8 step 5 | explain | L2 | A9 | planned |
| 9 | PPR: static shell + postponed state; request fills holes | J8 steps 13–15 | resume | L1–L2 | A9 §Partial Prerendering; docs: PPR | planned · version note |
| 9 | Dynamic API placement trap | J8 steps 16–17 | predict / reveal | L1 | A9 | planned |
| 9 | Automatic chunk splitting recap | J11 step 4 | explain | L1 | A9 §Разбиение бандла | planned |
| 9 | Import optimization recap | J11 step 5 | transform | L1 | A9 | planned |
| 9 | `next/dynamic` on `Loadable`; `import()` boundary chunk | J11 step 6 | transform | L1–L2 | A9; docs: lazy loading | planned |
| 9 | Loadable 200 ms delay; `ssr: false` | J11 step 6 | explain | L2 + version note | A9; source: next/dynamic | planned · version note |
| 9 | `next/image`: width/height or static import; layout reservation | J11 step 7 | explain | L1–L2 | A9 §next/image; docs: image | planned |
| 9 | `/_next/image` request; `sharp`; `Accept` format; `.next/cache/images` | J11 step 7; J2 step 12 | move | L1–L3 | A9; docs: image optimization | planned |
| 9 | `srcset` from `deviceSizes` | J11 step 7 | explain | L2 | A9 | planned |
| 9 | `next-font-loader`; local: metrics + `@font-face` | J11 step 8 | transform | L1–L2 | A9 §next/font; docs: font | planned |
| 9 | Google: CSS fetch, file download, self-hosting | J11 step 9 | move | L1–L2 | A9 | planned |
| 9 | Download moment: build vs first dev compile | J11 step 9 | explain | L2 | A9 | planned |
| 9 | Failure: dev warns + fallback, prod build fails; CI implication | J11 step 9 | explain | L1–L2 | A9; docs: font | planned · version note |
| 9 | Fallback metrics and `size-adjust` | J11 step 10 | explain | L1–L2 | A9 | planned |
| 9 | `next/script` strategies incl. `worker` (Partytown) | J11 step 11 | explain | L1–L2 | A9 §next/script; docs: script | planned · version note (worker status) |
| 9 | File tracing: deploy size, cold start, not render speed | J11 step 12 | explain | L1 | A9 §Трассировка файлов | planned |
| 9 | Closing thesis: move work to build, narrow runtime | J11 step 15 | explain | L1 | A9 §Итого | planned |

## Brief checklist items not tied to one article section

| Item | Visual scene | Status |
|---|---|---|
| Runtime layers as depth (RSC over SSR) | J5 step 1 cutaway | implemented (J5) |
| Caches at different layers | J8 step 1 cache map | planned |
| Version/scope note visible in product | header chip "Articles: Next.js 15→16 (2025) · verified against Next.js <version> (2026-09)" | planned |
| Source panel with doc links | inspector L3 and step Internals | planned |
| Reduced-motion static path | every motion verb has a static equivalent (`visual-language.md` §8) | planned |
| Text equivalent per scene | step `text` + generated `stateDescription` | planned |
| Predict-the-machine mode | §3.4 | planned |

## Sources

Official sources used for the version-sensitive rows (all fetched 2026-09-19, docs version 16.3.5).
The row IDs match `concept-model.md` §7.

| ID | Source |
|---|---|
| S1 | https://nextjs.org/docs/app/api-reference/file-conventions/proxy |
| S2 | https://nextjs.org/docs/app/guides/upgrading/version-16 |
| S3 | https://nextjs.org/blog/next-16 |
| S4 | https://nextjs.org/docs/app/api-reference/turbopack |
| S5 | https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache |
| S6 | https://nextjs.org/blog/next-16-3 |
| S7 | https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents |
| S8 | https://nextjs.org/docs/app/getting-started/caching |
| S9 | https://nextjs.org/docs/app/guides/caching-without-cache-components |
| S10 | https://nextjs.org/docs/app/guides/upgrading/version-16 (Caching APIs, PPR, images, dev output) |
| S11 | https://nextjs.org/blog/next-16 (Enhanced Routing and Navigation) |
| S12 | https://nextjs.org/docs/app/api-reference/components/link |
| S13 | https://nextjs.org/blog/next-16-3 (prefetch inlining, native Node streams) |
| S14 | https://github.com/vercel/next.js/blob/canary/packages/next/src/client/components/app-router-headers.ts |
| S15 | https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching |
| S16 | https://nextjs.org/docs/pages/api-reference/components/link |
| S17 | https://nextjs.org/docs/app/guides/server-actions |
| S18 | https://nextjs.org/docs/app/api-reference/functions/revalidateTag |
| S19 | https://nextjs.org/docs/app/api-reference/functions/updateTag |
| S20 | https://nextjs.org/docs/app/guides/self-hosting (encryption key, cache handler) |
| S21 | https://nextjs.org/docs/app/glossary |
| S22 | https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/use-flight-response.tsx |
| S23 | https://github.com/vercel/next.js/tree/canary/packages/next/src/server |
| S24 | https://github.com/vercel/next.js/tree/canary/packages/next/src/server/lib |
| S25 | https://github.com/vercel/next.js/blob/canary/packages/next/src/server/next.ts |
| S26 | https://nextjs.org/docs/app/guides/custom-server |
| S27 | https://nextjs.org/docs/pages/building-your-application/configuring/custom-server (`useFileSystemPublicRoutes` note) |
| S28 | https://github.com/vercel/next.js/blob/canary/packages/next/src/server/dev/on-demand-entry-handler.ts |
| S29 | https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins |
| S30 | https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/loadable.shared-runtime.tsx |
| S31 | https://nextjs.org/docs/app/guides/lazy-loading |
| S32 | https://github.com/vercel/next.js/blob/canary/packages/font/src/google/loader.ts |
| S33 | https://nextjs.org/docs/app/api-reference/components/script |
| S34 | https://nextjs.org/docs/app/getting-started/linking-and-navigating |
| S35 | https://nextjs.org/docs/app/api-reference/components/font |

Article sources: https://telegra.ph/deep-dive-nextjs-part-1-05-02 … part-9-08-09 (see `fetch_articles.py`).


## Milestone 1 QA (2026-09-20)

Verified in Chromium through Playwright against the Vite dev server. Journey 0, System Atlas, inspector, deep links, keyboard stepping and text equivalent are implemented.

| Viewport | Result |
|---|---|
| 1440 × 900 | canvas left, panel right; world fit; labels collapse to glyphs at low zoom; no console errors |
| 1024 × 768 | same layout, no horizontal scroll, transport buttons ≥ 44 px |
| 768 × 1024 | canvas above, panel below, transport at the bottom, no horizontal scroll |
| 390 × 844 | focused scene (region-level camera), compact header, no horizontal scroll, minimap hidden |
| reduced motion | camera and token jump-cut (`transition-duration: 0s`), panel and live region update identically |

Checks: `tsc --noEmit` clean, `vitest run` 25 tests green, `vite build` succeeds (84 kB JS, 8 kB CSS before compression).

## Milestone 2 QA (2026-09-20)

Journey 5 (22 steps) plays end to end. Verified at 1440 × 900: predict step (four options, reveal with explanation), check step (three statements with feedback), overlay edge labels with crossing chips, journeys menu. Spot check at 390 × 844 on the streaming step. No console errors. `vite build`: 104 kB JS / 9.5 kB CSS before compression.

## Milestone 3 QA (2026-10-02)

Journey 6 (18 steps) and Journey 7 (17 steps) play end to end. Verified at 1440 × 900 with ArrowRight through every step: the URL hash advances by one and the panel title changes on each step. J6 predict (step 7) and check (step 18, three statements) and J7 predict (step 11) and check (step 17, four statements) show the reveal or per-statement feedback with explanations. Spot check at 390 × 844 on steps 1, 7, 12 and 18 of J6 and steps 1, 6, 11, 16 and 17 of J7. No console errors or warnings. Defects found at 390 × 844 and fixed in `src/styles.css`: the header grid column grew to the width of the journey select (page scrollWidth 474 > 390), and the transport and panel buttons were 40 px. The app grid column is now `minmax(0, 1fr)`, the header nav wraps, and transport and panel buttons are at least 44 px on narrow screens (scrollWidth now 390). 34 tests pass. `vite build`: 137 kB JS / 12.8 kB CSS before compression.
