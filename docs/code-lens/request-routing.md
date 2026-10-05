# Code lens · J2 Incoming request and server routing (`request-routing`)

Data: `src/domain/codeLens/request-routing.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
J2 is about decisions, not code: most steps are lookups in tables the build wrote. The lens shows
those tables as stored (peek) and opens twice, where a request's answer takes a new form: Proxy's
decision as headers (j2-5) and an API route's JSON (j2-12).

**Counts:** 14 steps · **open 2** (j2-5, 12) · **peek 6** (j2-2, 3, 4, 7, 9, 11) · **off 6** (j2-1, 6,
8, 10, 13, 14). Same steps and modes as the §10.2 plan.

## 1. Summary

| Step | Lens | Form | Visible | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j2-1 | off | — | the HTTP entry: no artifact yet | — | — |
| j2-2 | peek | json | `routes-manifest.json` headers (NC3), redirects (NC4), empty rewrites; `functions-config-manifest.json` `/_middleware` matchers (PX8) | ⊘ NC3/NC4 → `routes-manifest`, `routing-ladder` · PX8 → `middleware-manifest` | connect · static |
| j2-3 | peek | json | NC3 as written → the stored header rule (morph `"/:path*"`) | ⊘ → `rung-headers` | fade-in · static |
| j2-4 | peek | json | NC4 as written → the stored redirect, `"statusCode": 308` (morph `308`); `/old-settings` would leave here | ⊘ → `rung-redirects` | fade-in · static |
| j2-5 | **open** | http | matched `"/dashboard/:path*"` (PX8), `x-middleware-next: 1` (PX6) · the branch not taken: `307 · location: http://…/login` (PX3–PX4) | ⊘ → `proxy` · PX8 → `middleware-manifest` | transform · side-by-side |
| j2-6 | off | — | no beforeFiles rules: nothing to show | — | — |
| j2-7 | peek | json | `app-paths-manifest.json` `"/dashboard/settings/page"` (the match) · `pages-manifest.json` (not tried) | ⊘ → `rung-filesystem` | fade-in · static |
| j2-8 | off | — | steps 6–8 skipped | — | — |
| j2-9 | peek | http | ledger only: resolved path + params handed to render-server | — | — |
| j2-10 | off | — | predict | — | — |
| j2-11 | peek | http | `200 · cache-control: public, max-age=31536000, immutable`; PX8 as written, "no match: Proxy skipped" | ⊘ PX8 → `proxy` | fade-in · static |
| j2-12 | **open** | json | `content-type: application/json; charset=utf-8`, `{"ok":true}` (AH3) · footer: the image request | ⊘ → `route-handler` | transform · side-by-side |
| j2-13 | off | — | minimal mode: no new artifact | — | — |
| j2-14 | off | — | check | — | — |

## 2. Step details

### j2-2 · peek · json
- Pane `.next/routes-manifest.json` (entity `routes-manifest`): the `headers` array with NC3's rule and
  its regex; a fold for the redirect Next adds itself (`/:path+/` → `/:path+`, internal, 308); the
  `redirects` array with NC4's rule; empty `rewrites` (steps 4, 6, 8); a fold for `staticRoutes` and
  `dynamicRoutes`. 3 shown.
- Pane `.next/server/functions-config-manifest.json` (entity `middleware-manifest`, hint: a Node proxy
  keeps its matchers here; `middleware-manifest.json` holds only Edge middleware): the `/_middleware`
  entry with `runtime: "nodejs"` and `matchers: [{ regexp: "…/dashboard…", originalSource:
  "/dashboard/:path*" }]`. The regexp is abridged: it also covers `/_next/data/<buildId>/…` and the
  `.rsc` / `.segments` transport forms of the path.
- **Deviation (accuracy):** the plan says "PX8 matcher regex" in the routes-manifest excerpt and the
  journey says `server/middleware-manifest.json`. In 16.3.8 a proxy's matchers go to
  `functions-config-manifest.json` (see Discrepancies). The pane links to the map's `middleware-manifest`
  entity, which is what the map calls this table.

### j2-3, j2-4 · peek · json
The config line as written, then the row as stored. The morph identifier is the piece that survives:
the source pattern at j2-3, the status code at j2-4 (`permanent: true` → `"statusCode": 308`,
`permanent` dropped). j2-4 adds a ⊘ row `GET /old-settings → 308 · location: /dashboard/settings`:
"not this request: it would leave here".

### j2-5 · open · http (json → http)
- Pane `proxy → router-server · session cookie present` (entity `proxy`): the request as context,
  `matched "/dashboard/:path*"` (PX8, "so proxy(request) runs") and `x-middleware-next: 1` (PX6,
  morph `next`, "NextResponse.next(): climb on to step 4").
- Pane `the branch not taken · no session cookie`: `307 Temporary Redirect · location: http://…/login`
  (PX3, PX4). The host is elided: `new URL('/login', request.url)` is absolute. Kept as a separate
  pane with no change sign, so it reads as the alternative, not as part of this response.
- **Motion** transform (the code becomes headers); **reduced** side-by-side: the proxy.ts source
  (PX3, PX4, PX6, PX8) stacked above (http stacks).

### j2-7 · peek · json
Two one-row panes. The app-paths row comes from SP4 and is ⊘ (the match); the pages-manifest row has
`from` AH2, PR7 and no fate ("not tried: a static route wins first").

### j2-9 · peek · http
Ledger only. The handoff carries metadata (path, params), not text a reader can see, so no pane.

### j2-11 · peek · http
`200 · cache-control: public, max-age=31536000, immutable` as context (no fate: it is Next's own file)
and PX8 as written with "no match for /_next/static: Proxy skipped", linked to the dimmed `proxy`.

### j2-12 · open · json (http → json)
Pane `GET /api/hello · application/json` (entity `route-handler`): the content type and `{"ok":true}`
(AH3, morph `ok`). Both lines new, so the header says `new` once. Footer ledger: the image request
(`/_next/image?url=%2Fhero.jpg&w=640&q=75` → a 640 px variant in the format the Accept header
allows, kept in `.next/cache/images`). **Reduced** side-by-side: AH source stacked above.

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>`, fetched 2026-10-05.

| Token | Where checked |
|---|---|
| header rule `{ source, headers, regex }`, redirect rule `{ source, destination, statusCode, regex }` (`permanent` dropped) | `packages/next/src/lib/build-custom-route.ts`, `lib/redirect-status.ts`, v16.3.8 |
| `"^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$"`, `"^(?!/_next)/old-settings(?:/)?$"` | computed with Next's own `next@16.3.8/dist/compiled/path-to-regexp` and the steps of `buildCustomRoute` (`strict`, `delimiter: '/'`, `modifyRouteRegex` with `restrictedRedirectPaths = ['/_next']`, `normalizeRouteRegex`), v16.3.8 |
| internal redirect `/:path+/` → `/:path+`, permanent | `packages/next/src/lib/load-custom-routes.ts` (`trailingSlash` false branch), v16.3.8 |
| `rewrites: { beforeFiles, afterFiles, fallback }`, `staticRoutes`, `dynamicRoutes` | `RoutesManifest` type in `packages/next/src/build/index.ts`, v16.3.8 |
| `server/functions-config-manifest.json`, `functions['/_middleware'] = { runtime: 'nodejs', matchers: [{ regexp, originalSource }] }`, `version: 1` | `packages/next/src/build/index.ts` (`writeFunctionsConfigManifest`, proxy branch), v16.3.8 |
| matcher regexp covers `/_next/data/…` and transport forms | `packages/next/src/build/analysis/get-page-static-info.ts` (`OPTIONAL_MIDDLEWARE_NEXT_DATA_PREFIX`, `sourceSuffix`), v16.3.8 |
| `x-middleware-next: 1`; `NextResponse.redirect` default `307` + `Location` | `packages/next/src/server/web/spec-extension/response.ts`, v16.3.8 |
| `cache-control: public, max-age=31536000, immutable` for `/_next/static` | `packages/next/src/server/lib/router-server.ts` (`nextStaticFolder` branch, production), v16.3.8 |
| `content-type: application/json; charset=utf-8` from `res.json` | `packages/next/src/server/api-utils/node/api-resolver.ts` (`sendJson`), `lib/constants.ts` `JSON_CONTENT_TYPE_HEADER`, v16.3.8 |
| `app-paths-manifest.json` / `pages-manifest.json` row shapes | concept-model §3.3, journey j2-2 internals (not re-read in source) |
| `?url=%2Fhero.jpg&w=640&q=75`, `.next/cache/images` | concept-model §3.4 and V29; the URL is encoded by the default loader (not re-read in source) |
| `k7Qm2xLp9`, `framework-a1b2c3.js` | illustrative (`experience-architecture.md` §2) |

**Unverified:** the exact manifest row values of `app-paths-manifest.json` / `pages-manifest.json`
(shape from concept-model), and the full matcher regexp (abridged on purpose).

## 4. Gaps

None that need a specimen line: every fated row names its specimen lines. Header lines, the request
lines and Next's own files are context rows without a fate.

## 5. Discrepancies (resolved: j2-2 internals, the `middleware-manifest` entity and concept-model §3.3 / V38 now name `functions-config-manifest.json`)

- **`middleware-manifest` vs `functions-config-manifest`.** j2-2 internals
  (`server/middleware-manifest.json: the matcher /dashboard/:path* as a regex`), the j2-5 camera's
  `middleware-manifest` entity and concept-model §3.3 describe where Edge middleware matchers live. In
  16.3.8 `proxy.ts` (always Node) writes its matchers to `server/functions-config-manifest.json`
  (`build/index.ts`; `printTreeView` also reads `functionsConfigManifest.functions['/_middleware']`).
  The lens prints the real file and keeps the entity link.
