# Code lens · J5 App Router: the initial request (`app-initial`)

Data: `src/domain/codeLens/app-initial.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
J5 slows down j0-7…j0-9, so its rows reuse J0's exactly: `1:I` DashboardNav, `2:I` ProfileForm,
`0:` the root row (same text as j0-7), chunk names `layout-3c4d.js` / `page-5e6f.js`, buildId `k7Qm2xLp9`.

**Counts:** 22 steps · **open 5** (j5-8, 10, 12, 17, 19) · **peek 11** · **off 6** (j5-1, 4, 7, 16, 21, 22).
Same open steps as the §10.2 plan.

## 1. Summary

| Step | Lens | Form | Visible | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j5-1 | off | — | — (e2e relies on it) | — | — |
| j5-2 | peek | js | `react/jsx-runtime` import (rsc layer, from SP4) · DN4 `import { useState } from 'react'` | ⊘ → `layers`, `src-settings-page` · ⚡S → `src-dashboard-nav` | fade-in · static |
| j5-3 | peek | json | the loader tree `"" → dashboard → settings → __PAGE__`, 7 lines | ⊘ → `loader-tree` | fade-in · static |
| j5-4 | off | — | traversal is the map's job | — | — |
| j5-5 | peek | tsx | DL2, DL4, DL6 (`{children}` = the slot) | ⊘ DL6 → `layout-router`, `loader-tree` · ⊘ DL2/DL4 → `loader-tree` · 🔒 → `layout-router` | fade-in · static |
| j5-6 | peek | flight | DashboardLayout's and AccountSummary's output; getProfile's values | ⊘ → `rsc-runtime-entity` (AS2 also → `src-account-summary`) · ▤ → `db` | fade-in · static |
| j5-7 | off | — | predict (must not answer) | — | — |
| j5-8 | **open** | manifest | `<DashboardNav />` reached → the `clientModules` row → `1:I[…]` + `$L1` | ⚡B → `client-reference-manifest`, `rsc-runtime-entity`; DL5 → `browser-chunks` | connect + reference · static |
| j5-9 | peek | json | FlightRouterState vs CacheNodeSeedData (the two halves of `f`) | ⊘ → `segment-slices` | fade-in · static |
| j5-10 | **open** | flight | `1:I`, `2:I`, `0:`, then one excerpt per segment (`""`, dashboard, `__PAGE__`), folds for the layout-less settings segment and Next's own rows | ⊘ → `rsc-runtime-entity` (RL2/AS2 also → `segment-slices`) · ⚡B → `flight` | reference · static |
| j5-11 | peek | flight | ledger only: `⑂ ×2` | — | — |
| j5-12 | **open** | html | the document SSR writes from copy 1: DN9–DN12 as `<nav>` HTML, AS2 as `<dl>`, PF7–PF8 as `<form>` | ⚡S → `ssr-runtime-entity`, `html` (DN lines also → `src-dashboard-nav`) · ⊘ → `html` | transform · static |
| j5-13 | peek | html | the four `__next_f` push types | ⚡B → `next-f` | wrap · static |
| j5-14 | peek | html | billing: `<h1>`, the `B:0` template + fallback, the late `S:0` div, `$RC("B:0","S:0")` | ○ → `html` · ⌛ → `suspense-hole` · ⊘ → `src-billing-page` | fill · static |
| j5-15 | peek | files | the four chunks fetched + 0 B ledger | ⚡S → `browser-chunks`, `client-components` | fade-to-zero · static |
| j5-16 | off | — | paint: nothing in code changes | — | — |
| j5-17 | **open** | flight | `__next_f` array → the same rows again | ⚡B, ⊘ → `react-client` | transform · static |
| j5-18 | peek | files | the two referenced chunks | ⚡S → `browser-chunks`, `client-components` | fade-in · static |
| j5-19 | **open** | dom | as j0-9 with ProfileForm's input | ⚡S → `client-components`, `react-client` · ⊘ → `dom` | light-up · static |
| j5-20 | peek | json | the client FlightRouterState | ⊘ → `router-state-tree`, `app-router` | fade-in · static |
| j5-21 | off | — | internals step | — | — |
| j5-22 | off | — | check step | — | — |

Every linked entity is in that step's `states` or camera (`validateCodeLens`), and a scan of every
lens step at 1440 showed no `off-map` chip.

## 2. Step details

### j5-2 · peek · js
Excerpt: one compiled-import row for SettingsPage (`import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";`,
from SP4: SettingsPage imports nothing from `react` itself, so the JSX runtime import is where the
rsc layer's choice shows) and DN4 as written. Notes name the targets: `jsx-runtime.react-server.js` vs `index.js`.
The import edge is a resolver rule, so a ledger (peek) is enough: no artifact changes form.

### j5-3 · peek · json
The loader tree, one segment per line, inner to outer: root `""` (RL1), dashboard (DL2), settings
(no layout: a bare line), `__PAGE__` with its `page` module (SP4), then the closing lines carry the
`layout` modules. Module getters are `…`; the trailing 4th element (static siblings) is the `…`.

### j5-5 · peek · tsx
DL2, DL4, DL6 as written. DL6 carries the note "the slot: a LayoutRouter owns it". DL5 is left out:
its ⚡ fate has no entity on this step, and the step is about the slot. The 🔒 marks DL2/DL4 carry
link to `layout-router`: it is the reason they will be kept.

### j5-6 · peek · flight · chip "○ route: this render ran at build…"
Three abridged excerpts of the output: DashboardLayout's `<section>`, AccountSummary's `<dl>`, and the
values `getProfile()` produced (▤, from SP5/DA2/DA3). Kept a peek: the form change Flight is drawn
open at j5-10, where the rows are complete. The chip carries the ○ fact the journey states (§7 item 4).

### j5-8 · open · manifest
- **Pane 1** `server/app/dashboard/settings/page_client-reference-manifest.js`: the reached
  `<DashboardNav />` (from DL5, context), `globalThis.__RSC_MANIFEST["/dashboard/settings/page"]`,
  `clientModules`, the DashboardNav row (morph id `"…/components/DashboardNav.tsx"`), a fold for the
  ProfileForm row, `ssrModuleMapping`. 5 shown.
- **Pane 2** `Flight · the row written`: `1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]`
  (new, morph `layout-3c4d.js`) and `…["$","$L1",null,{}]…` (new, morph `$L1`). 2 shown.
- **Change:** component → key → row: the same three hops as the story.
- **Motion:** connect (row to manifest) then reference. **Reduced motion:** static (the two panes
  already sit before → after; a side-by-side source pane would only repeat DL5).

### j5-9 · peek · json
`["",{"children":["dashboard",{"children":["settings",{"children":["__PAGE__",{}]}]}]},…]` next to
`[rsc, {"children":[rsc, …]}, null, false, …]`: the `CacheNodeSeedData` tuple
`[node, parallelRoutes, loading, isPartial, varyParams]` nested the same way.

### j5-10 · open · flight · chip "○ route…"
Eight rows shown: `1:I`, `2:I`, `0:` (j0-7's text), then the root segment's `<html>` excerpt (its
slot is `$L…`, Next's LayoutRouter reference), dashboard's `<section>` with `$L1`, AccountSummary's
`<dl>` and `$L2` with `{"name":"Ada"}`, both labelled segment `__PAGE__`. Folds: "1 segment with no
layout of its own: settings (only its slot)" and j0-7's "6 rows of Next's own…".
**Deviation:** the plan says "folded by segment"; one fold per segment would hide the content the
step is about, so the shown rows are one per segment with content, and only the content-less
settings segment folds.

### j5-11 · peek · flight
Summary only: "⑂ ×2 · the same Flight bytes twice: copy 1 → the SSR runtime…, copy 2 →
self.__next_f…". No pane: there is nothing new to show line by line (the tee copies bytes).

### j5-12 · open · html · chip "○ route…"
Rows: `<html lang="en"><body><section class="dashboard">` (⊘ RL2 DL4), `<nav data-open="false">`
(DN9 + DN6, morph `nav`), `<button>Menu</button>` (DN10, "no onClick in HTML"), the two `<a>` (DN11
with `aria-current="true"`, DN12), `</nav>`, `<dl>…</dl>` (AS2, "from row 0: AccountSummary not run
again"), `<form …><input name="name" value="Ada"/><button>Save</button></form>` (PF7–PF8). 8 shown.
**Reduced motion:** static; a source before pane would be five specimen files.

### j5-13 · peek · html
Four rows: `(self.__next_f=self.__next_f||[]).push([0])`, `self.__next_f.push([1,"1:I[…"])` (⚡B DL5),
`;self.__next_f.push([2,…])` (appended to the bootstrap script only when there is form state),
`self.__next_f.push([3,"…base64…"])`.

### j5-14 · peek · html
Billing, not settings (the journey says so): `<h1>Billing</h1>` ○, `<!--$?--><template id="B:0"></template><p>Loading invoices…</p><!--/$-->` ○,
then `<div hidden id="S:0"><ul><li>€12.00</li>…</ul></div>` ⌛ and `<script>$RC("B:0","S:0")</script>` ⌛.

### j5-15 · peek · files
`/_next/static/chunks/framework-….js`, `main-app-….js`, `app/dashboard/layout-3c4d.js` (DN5),
`app/dashboard/settings/page-5e6f.js` (PF4). Summary: the j0-8 0 B ledger plus the code line.

### j5-17 · open · flight
The `__next_f` array as one context row (`[0] · [1,"1:I[…]\n2:I[…]\n0:{…"] · [1,"…"]`), then the rows
decoded again: `1:I`, `2:I`, `0:` (same text as j5-10), `$L1`, the `<dl>` output. Change: html → flight
(the reverse of j5-13's wrap). Motion: transform; reduced: static.

### j5-18 · peek · files
The two chunks named by `1:I` and `2:I`, from DN5–DN12 and PF4/PF7/PF8.

### j5-19 · open · dom
As j0-9: `<section>` static, `<nav>` hydrated, `<dl>` static ("still in the React tree"), `<form>`
hydrated. The `self.__next_f` row of j0-9 is left out: j5-17 already showed it consumed.

### j5-20 · peek · json
The client FlightRouterState (from RL1, DL2, SP4), "seeded from row 0 "f"".

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>` (fetched raw 2026-10-05).

| Token | Where checked |
|---|---|
| `react-server` export condition; `react.react-server.js` / `index.js`; `jsx-runtime.react-server.js` / `jsx-runtime.js` | `packages/next/src/compiled/react/package.json` v16.3.8 (`exports["."]`, `exports["./jsx-runtime"]`) |
| loader tree node `[segment, parallelRoutes, modules, staticSiblings]`, `__PAGE__` with `page: [getter, path]`, `layout: [getter, path]` | `packages/next/src/build/webpack/loaders/next-app-loader/index.ts` v16.3.8 (page node template, `props[...] = [segmentKey, subtree, modules, siblings]`) |
| `globalThis.__RSC_MANIFEST[...]`, `clientModules` row shape; `chunks` as file paths (Turbopack), hint names the Webpack flat `[chunkId, file, …]` list | as §6 of `code-lens.md`; `flight-manifest-plugin.ts` ≈145 (`chunks.push(chunkId, file)`), v16.3.8 |
| `1:I[…]`, `$L1`, `$L2`, `"$Sreact.suspense"`, root row keys | as §6 of `code-lens.md` (j0-7 text reused) |
| `CacheNodeSeedData = [node, parallelRoutes, loading (null), isPartial, varyParams]`; `FlightRouterState = [segment, parallelRoutes, refreshState?, refresh?, prefetchHints?]` | `packages/next/src/shared/lib/app-router-types.ts` v16.3.8 |
| `__next_f` types `[0]` bootstrap, `[1, text]`, `[2, formState]` (appended to the bootstrap script only when `formState != null`), `[3, base64]` | `packages/next/src/server/app-render/use-flight-response.tsx` v16.3.8 (`INLINE_FLIGHT_PAYLOAD_*`, `writeInitialInstructions`) |
| `<!--$?--><template id="B:0">`, `<!--/$-->`, `<div hidden id="S:0">`, `$RC("B:0","S:0")` | React `packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js` and `…/fizz-instruction-set/ReactDOMFizzInstructionSetInlineCodeStrings.js` on facebook/react main (Next 16.3 vendors a React canary; checked on main, not on the exact vendored build) |
| `aria-current="true"` for a boolean | React stringifies booleans on `aria-*` (as `code-lens.md` §4 notes); not re-checked in source |
| `framework-….js`, `main-app-….js` | journey j5-15 text (Webpack chunk names); hashes elided |
| `settings.html` + `settings.rsc` for the ○ route | concept-model V34 |

## 4. Gaps

- No specimen line imports React in `SettingsPage`, so j5-2's rsc-layer row is a derived compile row
  (`from: SP4`), not a source line.
- The layout-less `settings` segment has no specimen line; it is a fold without `from`.

## 5. Notes for the journey owner

- Resolved: j5-10 internals now name the four-node tree (`"" → dashboard → settings → __PAGE__`) and
  say SettingsPage's content sits in `__PAGE__`, as the lens labels it.
