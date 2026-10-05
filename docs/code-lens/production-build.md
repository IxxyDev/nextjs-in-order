# Code lens · J1 Production build (`production-build`)

Data: `src/domain/codeLens/production-build.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
J1 follows ProfileForm from source to a browser chunk and a manifest row, then `/dashboard/settings`
from discovery to a prerendered file. The lens opens where the artifact changes form: SWC output, the
action split, the barrel rewrite, the chunk listing, the manifest row, the prerendered files and the
route summary.

**Counts:** 18 steps · **open 7** (j1-3, 4, 5, 10, 11, 14, 17) · **peek 7** (j1-2, 7, 8, 12, 13,
15, 16) · **off 4** (j1-1, 6, 9, 18). Same open and peek steps as the §10.2 plan.

## 1. Summary

| Step | Lens | Form | Visible | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j1-1 | off | — | the pipeline: the map's job | — | — |
| j1-2 | peek | files | route map from `app/` + `pages/` (SP4, BP3, PR7, PO10, AH2) · loader tree `"" → dashboard → settings → __PAGE__` | ⊘ → `src-settings-page`, `src-billing-page`, `loader-tree`, `src-root-layout`, `src-dashboard-layout`, `route-discovery` · ⚡S → `route-discovery` | fade-in · static |
| j1-3 | **open** | js | ProfileForm.js: marker comment, JSX runtime import, `{ name: string }` ✂, `_jsxs("form", …)`, `_jsx("input", …)` | ⚡B, ⚡S → `swc` · PF1 → `src-profile-form` | transform · side-by-side |
| j1-4 | **open**, split | js-reference | server: action-entry comment, `registerServerReference(updateProfile, "603a9c1e2b44…", null)` · browser: `createServerReference("603a9c1e2b44…", callServer, void 0, findSourceMapURL, "updateProfile")` | ⇄ → `swc` · AC1 → `src-actions` · AC4 → `server-reference-manifest` · PF3 → `src-profile-form` | split · three-pane |
| j1-5 | **open** | js | what if PB1: `"__barrel_optimize__?names=Button!=!ui-kit"` (NC5 as context) · the barrel served as `export { Button } from "./button.js"` | ⚡S → `swc`, `bundler` · NC5 ⊘ → `swc` | transform · side-by-side |
| j1-6 | off | — | predict | — | — |
| j1-7 | peek | tsx | SP3 → PF1: the import edge | ⚡B → `bundler`; SP3 → `src-settings-page`; PF1 → `src-profile-form` | connect · static |
| j1-8 | peek | js | PF2 `import … from 'react'` → `react/index.js` (ssr, browser) vs `react.react-server.js` (rsc) | ⚡S → `layers`, `src-profile-form` · ⊘ → `layers`, `src-settings-page` | fade-in · static |
| j1-9 | off | — | Webpack vs Turbopack: no code changes form | — | — |
| j1-10 | **open** | files | `.next/static/chunks/`: `settings/page-5e6f.js` ← PF, the client entry at SP3 → PF1, a fold for SettingsPage/AccountSummary (no chunk), framework, main-app, webpack, `layout-3c4d.js` | ⚡S → `browser-chunks`, `split-chunks` · ⚡B → `flight-client-entry-plugin` | split · static |
| j1-11 | **open** | manifest | PF1 → `registerClientReference(…, "…/components/ProfileForm.tsx", "default")` · the `clientModules` row in `page_client-reference-manifest.js` | ⚡B → `client-reference-manifest`, `flight-manifest-plugin` · PF1 → `src-profile-form` | reference · static |
| j1-12 | peek | manifest | ledger: each manifest → its one reader (4 lines, no panes) | — | — |
| j1-13 | peek | tsx | SP5 ▤ → ○, IL4 → ◐, PR3 → ƒ, PO8 → ● | ⊘ → `route-analysis` · ▤ SP5 → `src-settings-page`, PO8 → `prerender-manifest` · ⌛ → `src-billing-page` | fade-in · static |
| j1-14 | **open** | files | `.next/server/`: `settings.html`, `.rsc`, `.segments/_tree.segment.rsc`, `billing.html`, `billing.meta` with `"postponed"`, `posts/7.html`, `posts/7.json` | ⊘ → `prerender` · ○, ⌛ → `prerendered-outputs` · ▤ → `server-cache` | fade-in · static |
| j1-15 | peek | json | `settings/page.js.nft.json` `{ "version": 1, "files": [ … ] }` | — (no fated rows) | — |
| j1-16 | peek | files | NC6 → `.next/standalone/`: `server.js`, `node_modules/`, `.next/server/` | ⊘ → `standalone` | — · static |
| j1-17 | **open** | terminal | `Route (app)` / `Route (pages)` with `Revalidate` `Expire`, each row tied to its deciding line; `ƒ Proxy (Middleware)` | ⊘ PR3 → `route-analysis`, PX2 → `proxy` · ○, ⌛ → `prerendered-outputs` · ▤ → `prerender-manifest` | fade-in · static |
| j1-18 | off | — | check | — | — |

Every shown row with a fate links to an entity in that step's `states` or camera (validated by
`validate.test.ts`); no `off-map` chip appears on an open step.

## 2. Step details

### j1-2 · peek · files
Two panes when expanded. `route map · from app/ and pages/` (entity `route-discovery`): five
`file → route` rows, colored by the file's own fate (the Pages pages are ⚡S, everything else ⊘).
`loader tree · /dashboard/settings` (entity `loader-tree`): the journey's internals string, abridged
(the real tree is `[segment, parallelRoutes, modules]`; the lens keeps the journey's shorter form).

### j1-3 · open · js (files → js)
As j0-3, on ProfileForm. 6 shown lines: the marker comment (morph `client`, PF1), the JSX runtime
import (new), `export default function ProfileForm({ name }) {` with ✂ `: { name: string }` (PF4),
`_jsxs("form", { action: formAction, children: [` (PF7, morph `form`), `_jsx("input", { name: "name",
defaultValue: name }),` (PF8, morph `input`), the frame `] });`. Folds: the two imports (PF2, PF3,
unchanged), PF5 and PF9 (both J7 lines, compiled the same way). **Motion** transform; **reduced**
side-by-side with the PF source.

### j1-4 · open, split · js-reference
- **server · rsc** (`app/actions.js`): the action-entry comment shortened to
  `/* __next_internal_action_entry_do_not_use__ {…} */` (morph `action`, AC1, "from 'use server'"), the
  `registerServerReference` import (new), the export with ✂ `types` (AC4), a fold for
  the body (AC5–AC7, "stay here and run on the POST (J7)"), a fold holding the two
  `ensureServerEntryExports` lines, and `registerServerReference(updateProfile, "603a9c1e2b44…", null);`
  (new, morph the ID, "in the manifest"). 4 shown.
- **browser · app-pages-browser** (hint: what PF3's import resolves to): the entry comment folded
  ("the same action-entry comment"), `import { … } from "private-next-rsc-action-client-wrapper";`,
  `const $$RSC_SERVER_ACTION_0 = createServerReference(` / `"603a9c1e2b44…", …);` on two rows (morph the ID), `export {
  $$RSC_SERVER_ACTION_0 as updateProfile };` (PF3), and the body fold marked gone. 3 shown.
- **Change:** one file, two outputs: the server keeps the body and registers the ID; the browser gets
  only the ID. **Motion** split; **reduced** three-pane (ProfileForm PF3 + actions.ts source, then both).
- The plan's "AC1/AC4 server: registerServerReference · browser: createServerReference" is kept. Rows
  in this paired step are shortened with `…` (entry comment payload, import list, the call's last four
  arguments and `/*#__PURE__*/`, the TS types as ✂ `types`) so no line takes three rows of a paired pane
  at 1440; the full forms are in the token table below.

### j1-5 · open · js
What-if variant PB1 (the pane hint says so). Pane 1 `ProfileForm.js`: NC5 as context (no change) and
`import { Button } from "__barrel_optimize__?names=Button!=!ui-kit";` (morph `Button`). Pane 2
`ui-kit (the barrel) · as next-barrel-loader serves it`: a gone fold "every other re-export of ui-kit:
dropped, never walked" and the new `export { Button } from "./button.js"`.
**Deviation (accuracy):** the plan reads "direct file import". In 16.3.8 the SWC pass
(`named_import_transform.rs`) rewrites the import to the `__barrel_optimize__` request and the Webpack
`next-barrel-loader` turns the barrel into one re-export; with Turbopack (the default) there is no
rewrite string: `optimizePackageImports` marks the package side-effect free
(`side_effect_free_packages_glob` in `next_client/context.rs`, `next_server/context.rs`) and the graph
follows the re-export to the same file. The lens prints the Webpack form (it is the only visible text)
and says so in the hints. `./button.js` and the other re-exports are illustrative.

### j1-7 · peek · tsx
SP3 and PF1 as written, with notes naming their files. Summary: the edge only the bundler sees.

### j1-8 · peek · js
PF2 as written, then two derived rows: `ssr · app-pages-browser: "react" → react/index.js` (⚡S) and
`rsc: "react" → react/react.react-server.js` (⊘, from SP4: SettingsPage's JSX reaches React in the rsc
layer). Paths follow the journey's internals (see §3).

### j1-10 · open · files (js → files across off steps; previous lens form is `js` at j1-8)
`.next/static/chunks/` (entity `browser-chunks`, hint "Webpack names, as in the journey"): ProfileForm's
`app/dashboard/settings/page-5e6f.js` first (morph the file name), the client entry (⚡B, SP3 + PF1),
a gone fold for SettingsPage and AccountSummary, then framework / main-app / webpack (no fate: Next's
own) and `layout-3c4d.js` (DashboardNav, J0). 6 shown. **Motion** split (the boundary opens a new
entry); reduced static.

### j1-11 · open · manifest
Pane 1 `server · ProfileForm in the rsc layer`: `export default registerClientReference(function() {
throw … }, "…/components/ProfileForm.tsx", "default");` (morph the path) and a gone fold for 6 PF lines.
Pane 2 `server/app/dashboard/settings/page_client-reference-manifest.js`: J0's 16.3 shape with the
ProfileForm row shown (morph the same path) and DashboardNav folded. The shared path string is the
morph across both panes: the proxy's key becomes the manifest key.

### j1-12 · peek · manifest (ledger only)
Four lines; no panes, because the step's subject is the readers on the map, not file text. The first
line names `functions-config-manifest.json` (Proxy matchers), not `middleware-manifest.json` (see Discrepancies).

### j1-13 · peek · tsx
SP5, IL4, PR3, PO8 as written, one pane, each with the strategy it decides.

### j1-14 · open · files
`.next/server/` (entity `prerendered-outputs`). 7 shown + a fold for the two `.meta` files: the app one holds status and headers, the pages one only `{ routeCache }`.
`billing.meta "postponed": "…"` stands for the postponed state; there is no `billing.rsc` (with PPR a
postponed route skips the route `.rsc`, `export/routes/app-page.ts` `shouldWriteRsc`).

### j1-15 · peek · json, j1-16 · peek · files
Expanded panes only; rows are Next's own files and carry no fate except NC6 and the generated
`server.js` at j1-16.

### j1-17 · open · terminal
8 shown lines: both table headers, billing ◐, settings ○ `1h 1d`, `├   /posts/[id] 1m 1y` (grouped
header, no symbol; the times sit on it) with the child `│ └ ● /posts/7` and blank times, `└ ƒ /products/[id]`, `ƒ Proxy (Middleware)`. Folds: three rows no
specimen line decides (`○ /_not-found`, `/_app`, `ƒ /api/hello`) and the 4-line legend.
**Deviation (accuracy):** the plan writes `(ISR: 60 Seconds)`; 16.3 prints `Revalidate` / `Expire`
columns (concept-model V35), so `/posts/[id]` reads `1m 1y`. Rows are in `localeCompare` order as
`filterAndSortList` sorts them (posts before products).

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>`, fetched 2026-10-05.

| Token | Where checked |
|---|---|
| marker comment, `react/jsx-runtime` import, `_jsx`/`_jsxs` | as J0 (`../code-lens.md` §6) |
| `/* __next_internal_action_entry_do_not_use__ {"<id>":{"name":"updateProfile"}} */`, `registerServerReference(fn, "<id>", null)` from `private-next-rsc-server-reference`, `ensureServerEntryExports([…])` from `private-next-rsc-action-validate` | fixture `crates/next-custom-transforms/tests/fixture/server-actions/server-graph/3/output.js`, v16.3.8 |
| `createServerReference("<id>", callServer, void 0, findSourceMapURL, "<name>")` from `private-next-rsc-action-client-wrapper`, `const $$RSC_SERVER_ACTION_N = /*#__PURE__*/ …; export { $$RSC_SERVER_ACTION_N as <name> }` | fixture `…/client-graph/1/output.js`, v16.3.8 (index 0 for a file with one export) |
| `603a9c1e2b44…` | as J0 §6 (prefix 0x60 for two declared args) |
| `"__barrel_optimize__?names=Button!=!ui-kit"` | `crates/next-custom-transforms/src/transforms/named_import_transform.rs`, v16.3.8; enabled by `optimizePackageImports` → `autoModularizeImports` in `packages/next/src/build/swc/options.ts` |
| barrel served as `export { Button } from "<path>"` | `packages/next/src/build/webpack/loaders/next-barrel-loader.ts` (`output += \nexport { ${name} } from ${JSON.stringify(decl[0])}`), v16.3.8 |
| Turbopack: side-effect-free packages instead of a rewrite | `crates/next-core/src/next_client/context.rs`, `next_server/context.rs` (`side_effect_free_packages_glob(next_config.optimize_package_imports())`), v16.3.8 |
| `registerClientReference(…, "<path>", "default")`, `globalThis.__RSC_MANIFEST[…]`, `clientModules`, `name: "*"`, `chunks` (Turbopack paths; hint: Webpack flat `[chunkId, file, …]`), `async` | as J0 §6; `flight-manifest-plugin.ts` ≈145, v16.3.8 |
| `settings.html`, `.rsc`, `.segments/_tree.segment.rsc`, `.meta` with `postponed`, no `.rsc` for a postponed route | `packages/next/src/export/routes/app-page.ts` (`shouldWriteRsc`, `RSC_SEGMENTS_DIR_SUFFIX`, `RSC_SEGMENT_SUFFIX`, `NEXT_META_SUFFIX`, `meta.postponed`), `packages/next/src/lib/constants.ts`, v16.3.8; concept-model V34 |
| `pages/posts/7.html` + `7.json`; `7.meta` holds only `JSON.stringify({ routeCache })` | `packages/next/src/export/routes/pages.ts` (`NEXT_DATA_SUFFIX`; ≈130–134), v16.3.8 |
| `1m 1y` on the `/posts/[id]` row, child `/posts/7` blank: for a dynamic SSG page `pageInfo` is the parent's, so `pageInfo.initialCacheControl = cacheControl` fills the grouped row; `printTreeView` reads child times from `pageInfos.get(route)`, which has no `/posts/7` entry | `packages/next/src/build/index.ts` ≈4166, `build/utils.ts` `printTreeView` (≈386–505), v16.3.8 |
| `Route (app)` / `Route (pages)`, `Revalidate`, `Expire`, `┌ ├ └ │`, grouped parent row without a symbol (times from the parent's `initialCacheControl`), child rows with the symbol (times from `pageInfos.get(route)`, unset for pages), `ƒ Proxy (Middleware)` line, legend wording incl. "(uses generateStaticParams)" when an app dir exists | `packages/next/src/build/utils.ts` (`printTreeView`, `filterAndSortList`, `getTreeViewSymbol`), v16.3.8 |
| `1m`, `1h`, `1d`, `1y` | `packages/next/src/build/output/format.ts` (`humanReadableTimeRounded`); `cacheLife('hours')` = revalidate 3600, expire 86400 and `expireTime` default 31536000 in `packages/next/src/server/config-shared.ts`; ISR expire filled from `expireTime` in `build/index.ts` `getCacheControl`, v16.3.8 |
| `framework-a1b2c3.js`, `main-app-d4e5f6.js`, `webpack-9c0d.js`, `layout-3c4d.js`, `page-5e6f.js` | illustrative names from the journey (j1-10 internals) and `experience-architecture.md` §2 |
| `.nft.json` `{ version: 1, files: [...] }`, `.next/standalone/server.js` | journey j1-15/j1-16 internals; concept-model §3.2/§3.3 (not re-read in source) |

**Unverified (derived, not observed in a build):**
- `○ /dashboard/settings 1h 1d`: follows from `cacheLife('hours')` propagating to the route's
  `initialCacheControl`; the propagation itself was not traced line by line.
- Resolved: the `/posts/[id]` row carries `1m 1y` (`build/index.ts` ≈4166 sets the parent's
  `initialCacheControl`); the child `/posts/7` row is blank.
- j1-8 paths `react/index.js` / `react/react.react-server.js`: the conditional export is real
  (concept-model V32), but Next 16 aliases `react` to its vendored copy, so the resolved file lives
  under `next/dist/compiled/react/…`; the lens keeps the journey's package-level wording.

## 4. Gaps

- No specimen line for the trailing `] });` of the compiled form (written as a frame row, no `from`).
- The rsc proxy, manifest, chunk and file listings are derived rows; all name their specimen lines in
  `from` except Next's own chunks and files.

## 5. Discrepancies (resolved in the journeys, the entity and concept-model V38)

- **Proxy matchers are not in `middleware-manifest.json` in 16.3.** For a Node proxy (`proxy.ts` is
  always Node), `build/index.ts` writes `functions['/_middleware'] = { runtime: 'nodejs', matchers }` to
  `server/functions-config-manifest.json`; `printTreeView` says so in a comment. j1-12 internals
  (`server/middleware-manifest.json → ladder step 3`), J2 step 2 and the `middleware-manifest` entity
  described the Edge-era file. Now: j1-12 internals and the J1 ledger name
  `functions-config-manifest.json`; the entity keeps its id (`middleware-manifest`) and names the file.
- j1-17 internals already use `Revalidate 1m`; its legend line for ● says "uses getStaticProps /
  generateStaticParams", while 16.3 prints only `generateStaticParams` when an app dir exists
  (`staticFunctionInfo` in `build/utils.ts`). Now: j1-17 internals and concept-model V35 say so; the
  story keeps "from getStaticProps or generateStaticParams" because it describes what makes a route ●,
  not the printed legend.
