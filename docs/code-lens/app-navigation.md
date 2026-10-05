# Code lens · J6 App Router: prefetch and navigation (`app-navigation`)

Data: `src/domain/codeLens/app-navigation.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
j6-10 is j0-10's patch (same rows, same `?_rsc=qR7vX2mK9pLw3sTb`, same buildId `k7Qm2xLp9`); the prefetch steps
show the 16.3 Segment Cache protocol as the source writes it.

**Counts:** 18 steps · **open 5** (j6-3, 4, 6, 10, 11) · **peek 4** (j6-1, 8, 9, 12) · **off 9**
(j6-2, 5, 7, 13–18). Same open steps as the §10.2 plan.

## 1. Summary

| Step | Lens | Form | Visible | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j6-1 | peek | tsx | DN12 `<Link href="/dashboard/billing">` | ⚡S → `client-components`, `prefetch-scheduler` | fade-in · static |
| j6-2 | off | — | cache drawers: the map's job | — | — |
| j6-3 | **open** | http | request: `GET /dashboard/billing`, `RSC: 1`, `Next-Router-Prefetch: 1`, `Next-Router-Segment-Prefetch: /_tree` · response: the `RootTreePrefetch` row, one segment per line | ⚡S (the href) → `prefetch-scheduler` · ⊘ → `route-cache` | fade-in · static |
| j6-4 | **open** | flight | `Next-Router-Segment-Prefetch: /dashboard/billing/__PAGE__`, fold for the cached `""`/dashboard, the `SegmentPrefetchResponse` envelope, `"$Sreact.suspense"`, BP6 ○, BP7/BP8 hole | ⊘ → `flight`, `src-billing-page` · ○ → `segment-cache` · ⌛ → `src-billing-page` | fill · static |
| j6-5 | off | — | policy (no code changes form) | — | — |
| j6-6 | **open** | http | `GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb`, `RSC: 1`, `Next-Router-State-Tree` (encoded, then decoded), `Next-Url` | ⚡S (the href) → `app-router`, `routing-ladder` | fade-in · static |
| j6-7 | off | — | predict | — | — |
| j6-8 | peek | json | the decoded header tree against the loader tree's three levels | 🔒 → `src-root-layout`, `src-dashboard-layout` · ⊘ → `loader-tree`, `router-state-tree` | fade-in · static |
| j6-9 | peek | tsx | BP3, BP6–BP8, IL5 run · RL1, DL2 not called | ⊘ BP/IL → `rsc-runtime-entity`, `src-billing-page` · ○ → `src-billing-page` · ⌛ IL5 → `db`, BP8 → `src-billing-page` · 🔒 → both layouts | fade-in · static |
| j6-10 | **open** | flight-patch | j0-10's patch, with the 16.3 request tree and a "no `<html>`" line | ⊘ → `segment-slices` · ○, ⌛ → `flight` · 🔒 → `app-router` | swap + fill · side-by-side |
| j6-11 | **open** | dom | kept `<section>` and `<nav data-open="true">`, gone `<dl>`/`<form>`, new `<h1>` and `<ul>` | 🔒 → `client-components`, `dom` · ⚡S DN → `client-components`, PF → `src-settings-page` · ⊘ AS2 → `src-settings-page`, BP6/IL6 → `layout-router`, `src-billing-page` · ○, ⌛ → `layout-router` | swap · static |
| j6-12 | peek | json | `history.pushState(…)` + the new FlightRouterState | ⊘ → `router-state-tree`, `app-router` | fade-in · static |
| j6-13 … j6-18 | off | — | cache hit, compare, staleness, internals, version, check: no code changes form | — | — |

All links are on stage (validated); a scan of every lens step at 1440 showed no `off-map` chip.

## 2. Step details

### j6-1 · peek · tsx
DN12 as written, note "a prefetch task for /dashboard/billing". Summary: priority Default, raised to
Intent on hover; deduplicated; dropped when it leaves the viewport.

### j6-3 · open · http (form changes tsx → http)
- **Pane 1** `prefetch · the tree`: the four request lines; `/_tree` is the morph identifier, note
  "structure only". The `GET` line comes from DN12 (the href).
- **Pane 2** `200 · text/x-component` (hint: served from `billing.segments/_tree.segment.rsc`, written
  at build): `0:{"buildId":"k7Qm2xLp9","tree":{"name":"","param":null,"prefetchHints":…,"slots":{"children":`
  and one line per segment (`dashboard`, `billing`, `__PAGE__`), ending `"staleTime":…}`. Note "names only: no content".
- The `?_rsc=` the client adds to prefetches is left out (abridged): j6-6 is where it matters.

### j6-4 · open · flight
- `GET /dashboard/billing · Next-Router-Segment-Prefetch: /dashboard/billing/__PAGE__` (context).
- Fold: "2 segments not requested: "" and dashboard are already in the Segment Cache" (from RL2, DL4).
- `0:{"buildId":"k7Qm2xLp9","data":[{"rsc":…,"isPartial":"$@…",…}],…}`: "isPartial never resolves:
  the page has a hole".
- `1:"$Sreact.suspense"`, then BP6 `<h1>` ○ and the BP7/BP8 boundary with `"children":"$L2"` ⌛,
  note "hole: no row 2 in a prefetch". 6 shown.
- **Motion:** fill (the hole stays dashed). **Reduced:** static.

### j6-6 · open · http
`GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb` (morph `_rsc`, "a hash of the headers below: the CDN key"),
`RSC: 1`, `Next-Router-State-Tree: %5B%22%22%2C%7B%22children%22%3A…` ("URL-encoded JSON"), the decoded
tree `["",{"children":["dashboard",{"children":["billing",{…"refetch"…}]}]}]` (morph `"refetch"`), and
`Next-Url: /dashboard/settings`.
**Deviation (accuracy, now in the journey too):** the plan said the header carries "the client copy
of the route tree". In 16.3.8, after a prefetch, the navigation sends the *target* tree built from the
prefetched route tree, with `"refetch"` set on the top-most segment the client cache cannot fill
(`createDynamicRequestTree` in `ppr-navigations.ts`). The current (settings) tree is sent only when
nothing was prefetched (`navigateToUnknownRoute` in `segment-cache/navigation.ts`), which is what j0-10
shows. The lens writes `{…"refetch"…}` inside billing without saying which node carries it: whether
it is `billing` or `__PAGE__` depends on how the layout-less billing segment was cached, which was not
pinned down.

### j6-8 · peek · json
The decoded header, then `"" · app/layout.tsx` (RL1, 🔒 locked), `"dashboard" · app/dashboard/layout.tsx`
(DL2, 🔒 locked), `"billing" · app/dashboard/billing/page.tsx` (BP3, "under the "refetch" mark: rendered").
It stays a peek: comparing two trees is a lookup, and j6-10 opens on the form change.

### j6-9 · peek · tsx
BP3, BP6, BP7, BP8 and IL5 as written (they run), RL1 and DL2 (note "not called").

### j6-10 · open · flight-patch
The request line now shows the 16.3 tree (`RSC: 1 · Next-Router-State-Tree: …"refetch"…`), then j0-10's
fold of the gone settings rows, `1:"$Sreact.suspense"`, the root row whose `f` path is
`["","children","dashboard","children","billing",…`, the `<h1>` ○ row, the `$L2` hole ⌛, row `2:` ⌛,
"no rows: RootLayout · DashboardLayout · DashboardNav" 🔒 and "no `<html>`, no `<script>`: the SSR
runtime is not involved". 8 shown. The `…` after `"billing"` in the path covers the case where
rendering starts at `__PAGE__`. j0-10's "DashboardLayout {children} → LayoutRouter swaps…" row moved to
j6-11, where the swap happens.
- `rsc-runtime-entity`, `suspense-hole` and the layout sources are not on this step's stage, so ⊘ links
  `segment-slices`, ○/⌛ link `flight` and 🔒 links `app-router` (which keeps them).
- **Reduced motion:** side-by-side, as j0-10 (Flight-patch panes stack their before pane).

### j6-11 · open · dom
`<section class="dashboard">` (DL4, 🔒 kept: the same node), `<nav data-open="true">…</nav>` (DN6 +
DN9, 🔒 "kept: the menu stays open"), struck `<dl>…</dl>` (AS2, "settings unmounted") and `<form>…</form>`
(PF7–PF8), new `<h1>Billing</h1>` ○ and `<ul><li>€12.00</li>…</ul>` ⌛ ("fills the hole when row 2
arrives"). The pane hint names the swap: "the LayoutRouter for dashboard/children swaps settings → billing".
`data-open="true"` assumes the user opened the menu before clicking Billing (the story's "keeps its
open state").

### j6-12 · peek · json
`history.pushState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: … }, "", "/dashboard/billing")` and
`["",{"children":["dashboard",{"children":["billing",{"children":["__PAGE__",{}]}]}]},…]`, note "was …"settings"…".

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>` (fetched raw 2026-10-05).

| Token | Where checked |
|---|---|
| `rsc`, `next-router-prefetch`, `next-router-segment-prefetch`, `next-router-state-tree`, `next-url`, `_rsc`, `text/x-component` | `packages/next/src/client/components/app-router-headers.ts` v16.3.8 |
| tree prefetch headers `RSC: 1`, `Next-Router-Prefetch: 1`, `Next-Router-Segment-Prefetch: /_tree` | `packages/next/src/client/components/segment-cache/cache.ts` v16.3.8 (tree request) |
| segment request key `/dashboard/billing/__PAGE__` (children key omitted, `__PAGE__` part, root sent as `/_index`) | `packages/next/src/shared/lib/segment-cache/segment-value-encoding.ts` (`createSegmentRequestKeyPart`, `appendSegmentRequestKeyPart`) and `segment-cache/cache.ts` (`normalizedRequestKey`) v16.3.8 |
| `/_tree` response `RootTreePrefetch { buildId?, tree, staleTime }`, `TreePrefetch { name, param, prefetchHints, slots }` (key order as built) | `packages/next/src/server/app-render/collect-segment-data.tsx` v16.3.8 |
| segment response `{ buildId, data: [{ rsc, isPartial, staleTime, varyParams }], …, needsRuntimeRequest }`; `isPartial` stays pending for a segment with holes | same file (`renderSegmentPrefetch`, `SegmentPrefetch`) |
| `.segments/` + `_tree.segment.rsc` | `packages/next/src/lib/constants.ts` v16.3.8 (`RSC_SEGMENTS_DIR_SUFFIX`, `RSC_SEGMENT_SUFFIX`); concept-model V34 |
| `Next-Router-State-Tree` = `encodeURIComponent(JSON.stringify(tree))`, client-only data stripped | `packages/next/src/client/flight-data-helpers.ts` (`prepareFlightRouterStateForRequest`) v16.3.8 |
| target tree with `"refetch"` on the top-most segment needing data (after a prefetch); current tree when nothing was prefetched | `packages/next/src/client/components/router-reducer/ppr-navigations.ts` (`createDynamicRequestTree`) and `segment-cache/navigation.ts` (`navigateToUnknownRoute`) v16.3.8 |
| `Next-Url: /dashboard/settings` (sent when the router's `nextUrl` is set; initialised from the current path) | `router-reducer/fetch-server-response.ts` and `create-initial-router-state.ts` v16.3.8 |
| `_rsc` = hash of prefetch, segment-prefetch, state-tree and next-url headers | `router-reducer/set-cache-busting-search-param.ts` v16.3.8 |
| `PrefetchPriority` Intent > Default (hover → Intent) | `segment-cache/types.ts` v16.3.8 |
| `history.pushState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: … }, "", url)` | `packages/next/src/client/components/app-router.tsx` v16.3.8 |
| `?_rsc=qR7vX2mK9pLw3sTb`: 16 base64url chars, SHA-256 of `prefetch,segment,state-tree,next-url` headers truncated to 12 bytes (value illustrative) | `packages/next/src/shared/lib/router/utils/cache-busting-search-param.ts` (`CACHE_BUSTING_SEARCH_PARAM_DIGEST_BYTES = 12`), v16.3.8 |
| navigation patch `0:{"f":…,"q":…,"i":…,"S":…,"b":…}`, `"$Sreact.suspense"`, `$L2` | as `code-lens.md` §6 (j0-10 text reused) |
| `f` path `["children","dashboard","children","billing",…]` (root `''` dropped) and `"S":false` | `app-render.tsx` v16.3.8 ≈760 (`path.slice(1)`), ≈790 (`S: workStore.isStaticGeneration`) |

## 4. Gaps

- None in the specimen: every shown line that comes from the app names its specimen line.
  Request/response lines (headers, envelopes, `"$Sreact.suspense"`) are Next's own and carry no `from`.

## 5. Unverified / open

- Which node carries `"refetch"` (layout-less `billing` vs `__PAGE__`) and whether the layout-less
  billing segment is its own prefetch request or inlined (16.3 prefetch inlining): the lens writes both
  abridged (`{…"refetch"…}`, a single `__PAGE__` request) rather than guess.
- Whether a navigation after a partial prefetch returns the static rows again (j6-10 keeps j0-10's full
  patch, as the journey does).

## 6. Notes for the journey owner

Resolved in the journey (concept-model V39):
- j6-6's story and internals now say the header carries the target tree with a `"refetch"` mark after
  a prefetch (the current tree only when nothing was prefetched); j6-8's story walks that tree against
  the loader tree and renders from the mark, with "settings ≠ billing" as the no-prefetch case. The
  `router-state-tree` entity and j6-16's check say the same.
- j6-4 internals write the request key `/dashboard/billing/__PAGE__`.
- Kept: J0 step 10 ("the client sends its route tree") models no prefetch, which is the case where the
  current tree is sent; its lens shows that tree.
