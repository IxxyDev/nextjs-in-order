# Code lens · J7 Server Actions (`server-actions`)

Data: `src/domain/codeLens/server-actions.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
Counts: **6 open · 7 peek · 4 off** (17 steps). Opens: j7-2, j7-3, j7-4, j7-6, j7-14, j7-15.

## Summary

| Step | Lens | Form | Shows | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j7-1 | peek | tsx | `app/actions.ts` AC1–AC8 | ⇄, ⊘ → `src-actions` | fade-in · static |
| j7-2 | open | js | server compile of AC1–AC7 + the manifest row | ⇄ → `swc`, `server-reference-manifest`; AC1 → `src-actions` | transform · side-by-side (before = j7-1's source) |
| j7-3 | open, split | js-reference | server keeps the body · browser chunk holds `createServerReference(…)` | ⇄ → `swc`; PF3 → `browser-chunks`, `src-profile-form`; AC4 → `src-actions` | split · three-pane |
| j7-4 | open | flight | what-if SA2/SA3/SA4/SA7 source + four Flight rows | ⇄ → `next-f`; SA2 ⊘ → `next-f`; SA3/SA4 → `src-settings-page` | reference · static (source shown) |
| j7-5 | peek | html | PF5, PF7–PF9; summary names the no-JS `<form>` + `$ACTION_ID_…` field | ⚡S → `client-components`, `dom` | — |
| j7-6 | open | http | the POST: line, 4 headers, 2 body parts | ⇄ → `routing-ladder` · ⚡S → `client-components` | fade-in · static |
| j7-7 | off | — | routing, nothing changes form | — | — |
| j7-8 | peek | manifest | the ID lookup row | ⇄ → `server-reference-manifest`, `action-handler` | — |
| j7-9 | off | — | security explanation, no artifact | — | — |
| j7-10 | peek | tsx | AC5 · DA3–DA4 | ⊘ AC5 → `db`, `action-handler` · ▤ → `data-cache` | — |
| j7-11 | off | — | predict | — | — |
| j7-12 | peek | tsx | AC2, AC6 · DA4 | ⊘ AC2/AC6 → `data-cache`, `server-cache` · ▤ → `data-cache` | — |
| j7-13 | peek | tsx | SP4–SP5 · what-if AV1–AV2 | ⊘ SP → `rsc-runtime-entity` · ▤ → `data-cache` · AV → `data-cache` | — |
| j7-14 | open | flight | `0:{"a":"$@1","f":…}`, `1:{"ok":true}`, two re-rendered excerpts | ⊘, ⚡B → `flight` | fade-in · static |
| j7-15 | open | dom | the merged document: DN6 kept, fresh form, `Saved` | 🔒, ⚡S → `client-components` · ⊘ → `layout-router` | swap · side-by-side (before = source lines) |
| j7-16 | peek | http | what-if AR1–AR2 `redirect()` + `x-action-redirect: /dashboard/billing;push` | ⊘ AR → `action-handler`, AR2 → `app-router` | — |
| j7-17 | off | — | check | — | — |

## Step details

### j7-1 · peek · tsx
Ledger: `app/actions.ts · ⇄ 'use server' (AC1) + updateProfile(prevState, formData) (AC4) · ⊘ the body (AC5–AC7) · a second form, inline in SettingsPage, comes at step 4`. Expanding shows AC1–AC7 colored once. Hover AC1/AC4 → `src-actions`.

### j7-2 · open · js (server compile)
Pane `app/actions.js` (rsc), abridged, 5 shown lines + 3 folds:

```text
/* __next_internal_action_entry_do_not_use__ {"603a9c1e2b44…":{"name":"updateProfile"}} */   ⇄ AC1  morph  'use server' → comment
import { registerServerReference } from "private-next-rsc-server-reference";                 ⇄ —    new
▸ 2 import lines, unchanged (AC2, AC3)
export async function updateProfile(prevState, formData) {                                    ⇄ AC4  same   ✂ ': unknown · : FormData'
▸ 3 lines of the body, unchanged: they run only here (AC5–AC7)
}
▸ 2 lines: a check that every export is an async function (ensureServerEntryExports)          new
registerServerReference(updateProfile, "603a9c1e2b44…", null);                                ⇄ AC4  new
```

Second pane `server/server-reference-manifest.json`: the j0-5 row (2 lines), the bundler's write.
- Change: the directive becomes a comment, the ID appears. The body is untouched (it stays on the server).
- Motion `transform`; reduced: before pane = j7-1's source.

### j7-3 · open, split · js-reference
Server pane (rsc, `app/actions.js`): the function + folded body + `registerServerReference`. Browser pane
`static/chunks/app/dashboard/settings/page-5e6f.js`, hint "ProfileForm's import of app/actions.ts, as the browser layer compiles it":

```text
import { … } from "private-next-rsc-action-client-wrapper";                  ⇄ PF3 new
const $$RSC_SERVER_ACTION_0 = createServerReference(                       ⇄ PF3 AC4 new
    "603a9c1e2b44…", …);                                                    ⇄ PF3 AC4 new  morph (the ID)
export { $$RSC_SERVER_ACTION_0 as updateProfile };                                              ⇄ PF3 new
▸ 3 lines of the body: not in any browser chunk (0 B)                                           gone
```
The ID keeps its highlight in both columns. Reduced: three panes (source · server · browser).
The two browser rows are shortened with `…` so each fits two rows of a paired pane at 1440 (the full
call, `createServerReference(id, callServer, void 0, findSourceMapURL, "updateProfile")` with
`/*#__PURE__*/`, is in J7's step 3 internals and the token table); the "only the ID" note moved into the
morph highlight.

### j7-4 · open · flight
Two panes. The what-if source (SA2, SA3, SA4, SA7; badge `what if`) and the Flight rows, inlined through `self.__next_f`:

```text
   …["$","form",null,{"action":"$h3","children":…}]…     ⇄ SA7  the action prop: a server reference
3:{"id":"…","bound":"$@4"}                               ⇄ SA3  upgrade's own ID; its bound args follow
4:["$@5","pro"]                                          ⇄ SA7  'pro': plain JSON
5:"kX9vQ2…"                                              ⊘ SA2  secret, sealed by encryptActionBoundArgs
```
The two envelopes sit in one row (`4:`): the sealed one is a pointer to a promise row holding an opaque
base64 string, the plain one is just `"pro"`. Reduced: static (the source is already a pane).

### j7-5 · peek · html
Ledger: `PF7 <form action={formAction}> · with JS: React intercepts submit and fetches · without JS: <form method="POST" enctype="multipart/form-data"> + <input type="hidden" name="$ACTION_ID_603a9c1e2b44…"/> (useActionState adds $ACTION_KEY)`.

### j7-6 · open · http
```text
POST /dashboard/settings                                  context
Next-Action: 603a9c1e2b44…                                ⇄ AC4 PF3  morph (the ID)
Accept: text/x-component
Next-Router-State-Tree: …"settings"…                      sent, ignored without RSC: 1
Content-Type: multipart/form-data; boundary=…             ⚡S PF7
0: [null,"$K1"]                                           ⚡S PF5   prevState, then the form
_1_name: Ada Lovelace                                     ⚡S PF8
```
7 lines. `Ada Lovelace` is an illustrative new value (the app's current name is `Ada`).

### j7-8 · peek · manifest
Ledger: `⇄ Next-Action 603a9c1e2b44… → server-reference-manifest → workers["app/dashboard/settings/page"] · exportedName "updateProfile" ✓ · unknown ID: "Failed to find Server Action", nothing runs`.

### j7-10, j7-12, j7-13 · peek · tsx
Source excerpts only: AC5 next to DA4 (entry still old); AC2/AC6 next to DA4 (the tag); SP4–SP5 re-running next to the what-if AV1–AV2.

### j7-14 · open · flight
```text
0:{"a":"$@1","f":[[["",{…}],[…seed…],…,false]],"q":"","i":false,…}   ⊘ AC6  a: the return value · f: the whole route from the root
1:{"ok":true}                                             ⊘ AC7  a resolves to this row
   …["$","dl",…"ada@example.com"…]…                       ⊘ AS2
   …["$","$L2",null,{"name":"Ada Lovelace"}]…             ⚡B SP9 fresh props
▸ 4 rows of client references and Next's own
```
Footer: `no HTML · without updateTag (step 11) the root row is {a, f:"", q, i}: f is empty`.

### j7-15 · open · dom
DN6's `<nav>` kept (🔒; re-sent in `f` as `$L1`, state survives through React reconciliation), `<dl>` and the form swapped in from `f`, `<button>Save</button>Saved` new (state = `a`). Motion `swap`.

### j7-16 · peek · http
Ledger: `what if AR2 redirect("/dashboard/billing") in the action → x-action-redirect: /dashboard/billing;push · the client router navigates, no document load`.
Expanded: the what-if `app/actions.ts` pane (AR1, AR2) and the response header row from AR2.

## Deviations from §10.2

- **j7-1 shows only `app/actions.ts`; the SA variant moves to j7-4.** j7-1's panes are the "before" pane of j7-2 under reduced motion (`beforePanes` picks the last `tsx` step); with the SA variant there, j7-2's before pane would show an unrelated file. j7-4 is where the capture matters, so the SA lines are drawn there, next to the rows they produce. j7-1's ledger still names the second form.
- **j7-4 has two panes (source + Flight)** instead of Flight alone, so `secret` and `'pro'` can be read next to their envelopes without reduced motion.
- **j7-2 adds the manifest row as a second pane** (the brief says "manifest row"), drawn as in j0-5.

## Token verification (Next.js v16.3.8 unless noted)

| Token | Checked in |
|---|---|
| action-entry comment `{"<id>":{"name":"updateProfile"}}`, `registerServerReference(fn, id, null)`, `ensureServerEntryExports([...])` and their import sources | fixture `crates/next-custom-transforms/tests/fixture/server-actions/server-graph/3/output.js` (v16.3.8) |
| `const $$RSC_SERVER_ACTION_0 = /*#__PURE__*/ createServerReference(id, callServer, void 0, findSourceMapURL, "name")` + `export { … as name }`, import from `private-next-rsc-action-client-wrapper` | fixture `…/client-graph/1/output.js` (v16.3.8) |
| ID prefix `60` for `(prevState, formData)` | `server_actions.rs` `generate_server_reference_id`: the arg mask counts declared params (not body use) → `0b0_110000_0` = `0x60` |
| `encryptActionBoundArgs(actionId, ...args)` is async (a promise) and returns base64 | `packages/next/src/server/app-render/encryption.ts`; compiler call `$$RSC_SERVER_ACTION_0.bind(null, encryptActionBoundArgs("<id>", …))` in fixture `server-graph/1/output.js` |
| server reference in Flight: `"$h" + id`, outlined `{id, bound}` with `bound` a promise (`$@`) | vendored `packages/next/src/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-server.node.development.js` (`serializeServerReference`) |
| `Next-Action`, `Accept: text/x-component`, `Next-Router-State-Tree` on the action fetch; `omitUnusedArgs` | `packages/next/src/client/components/router-reducer/reducers/server-action-reducer.ts`, `shared/lib/server-reference-info.ts` |
| reply body: FormData arg → `"$K1"`, fields prefixed `_1_`, root in part `0` | vendored `react-server-dom-webpack-client.browser.development.js` (`processReply`, `encodeReply` with prefix `""`) |
| `$ACTION_ID_<id>` hidden field, `$ACTION_KEY` from useActionState | server decode in `react-server-dom-webpack-server…js` (`$ACTION_ID_`/`$ACTION_REF_`), `react-dom-server.node.development.js` (`$ACTION_KEY`) |
| `ActionFlightResponse { a, b?, f, q, i }` | `packages/next/src/shared/lib/app-router-types.ts` |
| no invalidation → `skipPageRendering` → `flightData = ''`, so the root row is `{a, f:"", q, i}` (+`b`) | `action-handler.ts` (`workStore.pathWasRevalidated === ActionDidNotRevalidate`), `app-render.tsx` `generateDynamicRSCPayload` (`let flightData: FlightData = ''`), v16.3.8 |
| re-render from the root: the action fetch sends no `RSC: 1`, so `shouldProvideFlightRouterState` is false and `walkTreeWithFlightRouterState` renders at `''`; `f` = `[[tree, seed, head, false]]` after `path.slice(1)` | `server-action-reducer.ts` ≈118–132 (headers), `app-render.tsx` `parseRequestHeaders` (≈448–467) and ≈760, v16.3.8; the reducer's own TODO: "the server always renders from the root in response to a Server Action" |
| the client applies `f` with `convertServerPatchToFullTree` → `navigateToKnownRoute(…, FreshnessPolicy.RefreshAll)`; DashboardNav keeps its state by reconciliation, not by being left out | `server-action-reducer.ts` ≈468–520, v16.3.8 |
| `"Failed to find Server Action. …"`, `x-action-redirect: <url>;<type>` | `packages/next/src/server/app-render/action-handler.ts` |
| `updateTag`, `revalidateTag(tag, 'max')` | `docs/code-lens.md` §6 (cache.d.ts), concept-model V14/V15 |

## Gaps

- No specimen line for the new name value; `Ada Lovelace` appears only in derived rows.
- `$ACTION_KEY`'s value and whether the SSR'd hidden inputs end up in the hydrated submit's FormData are not shown (abridged).
- Resolved: j7-16 shows the what-if variant AR1–AR2 (`redirect('/dashboard/billing')` in `app/actions.ts`) and the `x-action-redirect` header row from AR2.

## Unverified

- The `push` default for a `redirect()` inside an action (the header format is verified, the default type is from the docs).
- Row numbers (`$h3`, `$@4`, `5:`) and the base64 sample are illustrative.
