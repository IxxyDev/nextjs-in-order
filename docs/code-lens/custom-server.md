# Code lens · J10 Custom server (`custom-server`)

Data: `src/domain/codeLens/custom-server.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
server.js is plain Node: its lines never change form, so they are shown as written (peek). The lens
opens on the two requests the journey follows, where the form is the HTTP exchange: `/legacy/settings`
climbing the ladder after the rewrite (j10-5) and `/healthz` answered with the ladder struck (j10-7).

**Counts:** 14 steps · **open 2** (j10-5, 7) · **peek 6** (j10-2, 3, 4, 9, 11, 12) · **off 6**
(j10-1, 6, 8, 10, 13, 14). Same steps and modes as the §10.2 plan.

## 1. Summary

| Step | Lens | Form | Visible | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j10-1 | off | — | the ring: the map's job | — | — |
| j10-2 | peek | js | SV3–SV6: require, `next({ dev })`, `getRequestHandler()`, `prepare()` | ⊘ SV3/SV4 → `custom-server` · SV5 → `custom-handle` · SV6 → `routing-ladder`, `routes-manifest`, `middleware-manifest` | fade-in · static |
| j10-3 | peek | js | SV1, SV7, SV12: our server owns the socket | ⊘ → `custom-server` | fade-in · static |
| j10-4 | peek | js | SV8, SV11 `handle(req, res, parsedUrl)`; NC3 and PX8 as what applies inside | ⊘ SV → `custom-handle` · NC3 → `routing-ladder` · PX8 → `proxy` | fade-in · static |
| j10-5 | **open** | http | `GET /legacy/settings` → `GET /dashboard/settings` (SV10, morph), step 1 headers ✓ (NC3), step 3 proxy ✓ (PX8, PX6), step 5 filesystem, `200 · x-frame-options: DENY` | ⊘ SV10 → `custom-handle` · NC3 → `routing-ladder` · PX → `proxy` | transform · side-by-side |
| j10-6 | off | — | predict | — | — |
| j10-7 | **open** | http | `GET /healthz` → `200 · ok` (SV9) · struck: `x-frame-options: DENY` (NC3), `proxy(request) · the session check` (PX3) | ⊘ SV9 → `custom-healthz` · NC3 → `rung-headers` · PX3 → `proxy` | swap · side-by-side |
| j10-8 | off | — | one handle, both routers: no code changes form | — | — |
| j10-9 | peek | js | what-if SR1 `app.render(…)` → `req.url = formatUrl(…)` → `this.requestHandler(req, res)` | ⊘ SR1 → `custom-handle`, `routing-ladder`, `proxy` | — |
| j10-10 | off | — | NestJS bridge: no specimen code | — | — |
| j10-11 | peek | files | `.next/standalone/`: Next's `server.js` (NC6), `node_modules/`, your server.js struck | ⊘ NC6 → `standalone`, `tracing` · SV → `custom-server` | — · static |
| j10-12 | peek | js | what-if NV1 `useFileSystemPublicRoutes: false` + SV10 | ⊘ NV1 → `rung-filesystem` · SV10 → `custom-handle` | — |
| j10-13 | off | — | `server.on('upgrade', …)` is not in the specimen (§4 of the brief) | — | — |
| j10-14 | off | — | check | — | — |

## 2. Step details

### j10-2 … j10-4 · peek · js
Source panes titled `server.js` (entity `custom-server`). j10-4 adds NC3 and PX8 as written, with the
ladder step each applies at, so the reader sees which config and proxy lines a `handle` call reaches.

### j10-5 · open · http (js → http)
Pane `GET /legacy/settings · through handle` (entity `custom-handle`), 6 shown:
`GET /legacy/settings` (context, "as it reaches server.js"), `GET /dashboard/settings` (SV10, morph
`/dashboard/settings`, "handle rebuilt req.url from parsedUrl: the ladder sees only this"),
`1 headers "/:path*" ✓ → x-frame-options: DENY` (NC3), `3 proxy "/dashboard/:path*" ✓ →
x-middleware-next: 1` (PX8, PX6, "Proxy runs: the rewrite does not skip it"), `5 filesystem → page
/dashboard/settings`, `200 · x-frame-options: DENY · content-type: text/html; charset=utf-8`.
The ladder lines are summaries of router-server's decisions (J2 shows each one stored), written in
http form so the request reads top to bottom. **Reduced** side-by-side: SV10, NC3, PX6, PX8 source
stacked above.

### j10-7 · open · http
Pane `GET /healthz · answered by server.js` (entity `custom-healthz`): the request, `200 · ok` (SV9,
morph `ok`, "res.end('ok'): handle is never called"), then two gone rows: `x-frame-options: DENY`
(NC3, "missing: headers() runs inside handle") and `proxy(request) · the session check` (PX3, "never
ran, whatever the matcher says"). The struck rows are the lesson, so they link to the `na` ladder
entities they stand for. Validator note: the previous lens step (j10-6) is off, so http → http is a
change from "no form"; the response is a different artifact from j10-5's.

### j10-9, j10-12 · peek
Each shows a what-if variant line (the app's own `server.js` and `next.config.js` stay as they are):
j10-9 the `server.js` pane with SR1 (`app.render(req, res, '/dashboard/settings', parsedUrl.query)`);
j10-12 `next.config.js` with NV1 (`useFileSystemPublicRoutes: false`) → `rung-filesystem`, and SV10
→ `custom-handle` with the note "with NV1: no page found, only a rewrite would reach one". An earlier
pass said SV10 maps a path to a page by hand; 16.3.8 does not support that: `handle(req, res,
parsedUrl)` and `app.render` only rewrite `req.url` and re-enter `resolveRoutes`, which drops
`appFile`/`pageFile` outputs unless `useFileSystemPublicRoutes || didRewrite`.

### j10-11 · peek · files
`.next/standalone/` (entity `standalone`): `server.js` (NC6, "generated by Next, not yours"),
`node_modules/`, and `your server.js and what only it requires` (SV1, SV3, gone, "not traced: Error:
Cannot find module …").

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>`, fetched 2026-10-05.

| Token | Where checked |
|---|---|
| `handle(req, res, parsedUrl)` sets `req.url = formatUrl(parsedUrl)` then calls `this.requestHandler(req, res)` | `packages/next/src/server/next.ts` (`NextCustomServer.getRequestHandler`), v16.3.8 |
| `app.render(…)`: `warnDeprecatedCustomServerMethod('render')`, `req.url = formatUrl({ ...parsedUrl, pathname, query })`, `this.requestHandler(req, res)` | same file (`render`), v16.3.8. The journey's j10-9 internals write `this.requestHandler(req, res, parsedUrl)`; the source passes two arguments |
| `x-middleware-next: 1` | `packages/next/src/server/web/spec-extension/response.ts`, v16.3.8 |
| `x-frame-options: DENY` from `headers()` at ladder step 1 | J2 (`build-custom-route.ts`); concept-model §4.10 |
| `content-type: text/html; charset=utf-8` | standard App Router HTML response type (not re-read in source) |
| standalone does not trace a custom server; `Cannot find module` | concept-model V22 (docs), journey j10-11 internals |
| `useFileSystemPublicRoutes: false` behavior | concept-model V22 (docs); `packages/next/src/server/lib/router-utils/resolve-routes.ts` ≈292–296 and ≈508–511 (`config.useFileSystemPublicRoutes \|\| didRewrite \|\| (output.type !== 'appFile' && output.type !== 'pageFile')`), v16.3.8: only a next.config rewrite reaches a page; `handle` with a new pathname and `app.render` do not |

**Unverified:** the exact `content-type` header on the static settings response (not re-read).

## 4. Gaps

- Resolved: `app.render` (SR1) and `useFileSystemPublicRoutes: false` (NV1) are what-if variants;
  j10-9 shows SR1, j10-12 shows NV1 with SV10. The app's own files stay without them.
- Resolved: j10-9's internals now write `this.requestHandler(req, res)` (two arguments).
- `server.on('upgrade', …)` is not in the specimen: j10-13 stays `off`, as the brief says.
