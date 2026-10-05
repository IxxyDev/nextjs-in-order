# Code lens · J9 Development mode (`dev-mode`)

Data: `src/domain/codeLens/dev-mode.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
Specimen lines: NC3/NC4 (`next.config.js`), DN5–DN12 (`DashboardNav.tsx`), AS2 (`AccountSummary.tsx`),
DL5. Dev behavior is not a fate (§3.3): the lens draws it as forms (terminal lines, an upgrade request,
the compiled refresh registration, a socket message, a Flight patch).

## 1. Summary

Open 4 · peek 4 · off 12.

| Step | Lens | Form | Visible | Change vs previous | Fates lit → entity | Motion · reduced motion |
|---|---|---|---|---|---|---|
| j9-1 | off | — | explain | — | — | — |
| j9-2 | peek | terminal | NC3, NC4 + `⚠ Found a change in next.config.js…`, `✓ Ready in 812ms` | — | ⊘ → `dev-child`, `dev-parent` | — · — |
| j9-3 | off | — | explain (live route map) | — | — | — |
| j9-4 | peek | terminal | `○ Compiling /dashboard/settings ...`, two request lines | — | none | — · — |
| j9-5…7 | off | — | explain | — | — | — |
| j9-8 | peek | http | `GET /_next/hmr` upgrade, `101`, `turbopack-connected` | — | none | — · — |
| j9-9 | **open** | tsx | DN6, DN7, DN9 same · DN10 gone · NE1 (edited DN10) new | the edit | ⚡S → `src-dashboard-nav`, `dev-turbopack` | `swap` · DN source beside the edit |
| j9-10 | off | — | predict | — | — | — |
| j9-11 | **open** | js | `$RefreshSig$`, `_s()`, hook signature, `$RefreshReg$` | TSX → dev JS with 5 new lines | ⚡S → `dev-fast-refresh` · 🔒 DN6 → `client-components` | `transform` · j9-9's pane beside the JS |
| j9-12 | peek | tsx | NE2 `// @refresh reset`, DN6, DN7, NE3 a new `useEffect` | — | ⚡S → `dev-fast-refresh` | — · — |
| j9-13 | **open** | json | AS2 gone, edited AS2 new · `{"type":"serverComponentChanges"}` | a message with no code | ⊘ AS2 → `src-account-summary`, `dev-module-cache` · ⊘ → `dev-hmr` | `fade-in` · AS2 source beside |
| j9-14 | **open** | flight-patch | request with `next-hmr-refresh: 1`, `1:I`, `0:`, new `<dl>` output, `$L1`, DN6 kept | new AS2 output; DashboardNav kept | ⊘ → `rsc-runtime-entity` · ⚡B → `flight`, `app-router` · 🔒, ⚡S DN6 → `client-components` | `swap` · source beside the patch |
| j9-15…20 | off | — | explain, check | — | — | — |

## 2. Details

### j9-2 · Restart on config change · `peek` · terminal

Ledger: `next.config.js saved (NC3, NC4 are read once, at startup) → ⚠ Found a change in next.config.js.
Restarting the server to apply the changes... → exit 77 → the parent forks a new child`. Expanded: NC3 and
NC4 as written ("read at startup: a running server cannot pick it up") and a two-line terminal pane.

### j9-4 · Compiled when asked for · `peek` · terminal

```text
 ○ Compiling /dashboard/settings ...                        printed only when a compile passes 3 s
 GET /dashboard/settings 200 in 4.2s (next.js: 3.8s, proxy.ts: 12ms, application-code: 390ms)
 GET /dashboard/settings 200 in 68ms (next.js: 9ms, proxy.ts: 3ms, application-code: 56ms)
```

The compile time sits in the `next.js:` part of the first request line; `proxy.ts:` appears because
PX8's matcher covers `/dashboard/:path*`. Timings are illustrative.

### j9-8 · The socket · `peek` · http

`GET /_next/hmr · Upgrade: websocket · Connection: Upgrade` → `HTTP/1.1 101 Switching Protocols` →
`← {"type":"turbopack-connected","data":{"sessionId":…}}`. Ledger names the origin check
(`allowedDevOrigins`).

### j9-9 · Edit 1: a Client Component · `open` · tsx

```text
▸ 5 lines unchanged: the directive, the imports, the function           DN1–DN5 same
  const [open, setOpen] = useState<boolean>(false)                      ⚡S 🔒 DN6  same  hooks unchanged
  const pathname = usePathname()                                        ⚡S DN7     same  hooks unchanged
    <nav data-open={open}>                                              ⚡S DN9     same
      <button onClick={() => setOpen(!open)}>Menu</button>              ⚡S DN10    gone
      <button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>   ⚡S (DN10) new  morph button
▸ 2 <Link> lines, unchanged                                             DN11–DN12 same
```

Footer: `socket → browser · {"type":"turbopack-message","data":[{"type":"partial","instruction":{"type":"ChunkListUpdate",…}}]}: the new module code, inside JSON`.
The edit is chosen so the kept state is visible: with `open = true` kept, the button reads `Close`
after the refresh. **Reduced motion:** DN6–DN10 as in the specimen beside the edited pane.

### j9-11 · Fast Refresh keeps state · `open` · js

```text
var _s = $RefreshSig$();                                        ⚡S  —    new
export default function DashboardNav() {                        ⚡S DN5   same
    _s();                                                       ⚡S  —    new
    const [open, setOpen] = useState(false);                    ⚡S 🔒 DN6 same  ✂ <boolean>  open = true survives
▸ 5 lines: usePathname() and the <nav>, compiled to _jsxDEV(…) calls          DN7, DN9–DN12
}
_s(DashboardNav, "…", false, function() { return [usePathname]; });          ⚡S new  morph _s
_c = DashboardNav;                                              ⚡S  —    new
$RefreshReg$(_c, "DashboardNav");                               ⚡S  —    new  morph $RefreshReg$
```

Chip: `dev only: the react-refresh transform runs on the client layer; production output has none of these
lines`. The signature key is printed `"…"` because SWC hashes it by default; the note gives what it
hashes: `useState{[open, setOpen](false)}` and `usePathname{pathname}`. `usePathname` is listed in the
function because it is a custom hook (not a React built-in). `var _c;` is left out (abridged).
**Reduced motion:** j9-9's pane (the edited source) beside this one.

### j9-12 · When state is lost · `peek` · tsx

A what-if pane: NE2 `// @refresh reset`, DN6, DN7, and NE3, a new `useEffect(…)` line noted "a new
hook: the signature no longer matches".

### j9-13 · Edit 2: a Server Component · `open` · json

Two panes: `components/AccountSummary.tsx · saved` (AS2 gone, the edited AS2 new with `Email address`
highlighted) and `socket /_next/hmr → browser` with one row, `{"type":"serverComponentChanges"}`, noted
"no code inside: only \"refetch this page\"". Footer: `no Fast Refresh · nothing in the browser runs
AccountSummary, so no module code is sent: the old server chunk is cleared and the tab is told to refetch`.
The contrast with j9-9's footer (a message that carries code) is the point of the step.

### j9-14 · A new RSC payload · `open` · flight-patch

```text
GET /dashboard/settings?_rsc=… · RSC: 1 · Next-Router-State-Tree: … · next-hmr-refresh: 1     context
1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]         ⚡B DL5  same
0:{"f":[[["",{"children":["dashboard",…]}],…]],"S":false,…}              ⊘        new
   …["$","dl",null,{"children":[["$","dt",null,{"children":"Email address"}],…]}]…   ⊘ AS2 new  morph Email address
   …["$","$L1",null,{}]…                                                ⚡B DL5  same  morph $L1
DashboardNav · open = true                                              ⚡S 🔒 DN6 same  kept: no remount, no Fast Refresh
```

Chip: `hmrRefresh() inside startTransition: the same path as router.refresh(), marked with next-hmr-refresh: 1`.
`Email address` keeps its highlight from j9-13 to here. **Reduced motion:** no earlier `flight` step in
J9, so the before panes are the source lines (AS2 as it was, DL5, DN6).

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>`, read 2026-10-05.

| Token as shown | Where checked |
|---|---|
| `⚠ Found a change in next.config.js. Restarting the server to apply the changes...`, then `process.exit(RESTART_EXIT_CODE)` | `packages/next/src/server/lib/start-server.ts` (Watchpack on `CONFIG_FILES`, `Log.warn`), v16.3.8 |
| `RESTART_EXIT_CODE = 77`; parent restarts with the same options and resets the start time for `Ready in` | `server/lib/utils.ts`; `cli/next-dev.ts` (`child.on('exit')`, `NEXT_PRIVATE_START_TIME`), v16.3.8 |
| prefixes `⚠` warn, `✓` event, `○` wait; `✓ Ready in …` | `build/output/log.ts` (`prefixes`), `start-server.ts` (`Log.event(\`Ready in …\`)`), v16.3.8 |
| `○ Compiling <route> ...` only after `MAX_LOG_SKIP_DURATION_MS = 3000`; no "Compiled" line after an on-demand compile | `build/output/store.ts`, v16.3.8; Turbopack feeds it via `startBuilding(pathname, …)` in `server/dev/hot-reloader-turbopack.ts` |
| request line `GET <url> <status> in <t> (next.js: …, proxy.ts: …, application-code: …)` | `server/dev/log-requests.ts` (`logIncomingRequests`, labels `next.js`, `proxy.ts`, `generate-params`, `application-code`), v16.3.8 |
| `/_next/hmr` upgrade handled in router-server after `blockCrossSiteDEV(… allowedDevOrigins …)` | `server/lib/router-server.ts` (`upgradeHandler`, `isHMRRequest`), v16.3.8 |
| messages are JSON with a `type` key: `turbopack-connected` (`data: { sessionId }`), `turbopack-message` (`data: Update[]`), `serverComponentChanges` (no other field) | `server/dev/hot-reloader-types.ts` (`HMR_MESSAGE_SENT_TO_BROWSER`, message interfaces), `hot-reloader-turbopack.ts` (`sendToClient`: `JSON.stringify` for string types), v16.3.8 |
| `Update` = `{ resource, type: "partial", instruction: { type: "ChunkListUpdate", merged: [{ entries: { code, map, url } }] } }` | `build/swc/types.ts` (`PartialUpdate`, `EcmascriptMergedUpdate`), v16.3.8 |
| `var _s = $RefreshSig$()`, `_s()`, `_s(Comp, key, false, function() { return [customHooks]; })`, `_c = Comp; $RefreshReg$(_c, "Comp")` | swc `crates/swc_ecma_transforms_react` refresh test snapshots (`register_fn_with_hooks`, `hook_signatures_should_include_custom_hook`), main; key hashed with SHA-1/base64 unless `emit_full_signatures` (default `false`, `refresh/options.rs`, `refresh/hook.rs`). Next passes `refresh: true` with default options (`build/swc/options.ts`, v16.3.8). SWC's exact output was not regenerated for this file |
| dev JSX `_jsxDEV` from `react/jsx-dev-runtime` | `build/swc/options.ts` (`runtime: 'automatic'`, `development: !!development`), v16.3.8; alias spelling is SWC's standard |
| `hmrRefresh()` in `startTransition`; `next-hmr-refresh: 1`; `window.location.reload()` on error state | `client/dev/hot-reloader/app/hot-reloader-app.tsx`, `client/components/app-router-headers.ts` (`NEXT_HMR_REFRESH_HEADER`), `router-reducer/fetch-server-response.ts`, v16.3.8; concept-model V37 |
| `1:I[…]`, `$L1`, `["$","dl",…]`, `0:{"f":…,"S":false,…}` | as `../code-lens.md` §6 (J0 rows); `"S":false` because `S: workStore.isStaticGeneration` is false in `next dev` (`app-render.tsx` v16.3.8 ≈790) |

Not verified: whether the app client adds a query (`?id=…`, read by `hot-reloader-turbopack.ts` as the
HTML request id) to the socket URL; the lens prints `GET /_next/hmr` without it. In 16.3.8 a
`serverFastRefresh` path (`setupServerHmr`) also exists next to `deleteCache`; the lens follows the
journey ("the old server chunk is cleared") and does not name either mechanism.

## 4. Gaps

- Resolved: the edits are what-if specimen lines. `components/DashboardNav.tsx` (J9 variant) holds NE1
  (edited DN10, j9-9), NE2 `// @refresh reset` and NE3 `useEffect(…)` (j9-12);
  `components/AccountSummary.tsx` (J9 variant) holds AE1 (edited AS2, j9-13, j9-14). Reduced-motion
  before panes leave a what-if line on a new row out, so j9-9 and j9-13 still draw DN10 and AS2 before.
- Resolved: NC3/NC4 are tagged `j9`.
- The terminal and socket lines have no specimen source, so j9-4 and j9-8 light nothing on the map.

## 5. Deviations from §10.2

- j9-9 shows the hook lines DN6/DN7 next to the edit (marked "hooks unchanged") because j9-10 asks about
  state and j9-11 answers with the hook signature.
- j9-13 adds a source pane (AS2 before/after) next to the message, so the edit and its one-line
  consequence sit together.
