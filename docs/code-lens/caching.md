# Code lens · J8 Caching, ISR, Cache Components and PPR (`caching`)

Data: `src/domain/codeLens/caching.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
Counts: **4 open · 8 peek · 8 off** (20 steps). Opens: j8-4, j8-13, j8-15, j8-17.

## Summary

| Step | Lens | Form | Shows | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j8-1 | off | — | the cache map: no code | — | — |
| j8-2 | peek | tsx | SP4, SP5, SP8 | ⊘ SP5 → `request-memo`, `db` · SP4 → `src-settings-page`, `rsc-runtime-entity` · SP8 → `src-account-summary` | — |
| j8-3 | peek | tsx | DA2–DA5 ▤ vs DA7–DA8 ⌛ | ▤ → `data-cache` · ⌛ → `db`, `rsc-runtime-entity` | — |
| j8-4 | open | files | `settings.html`/`.rsc`/`.meta`, the prerender-manifest row, the server-cache key | ○ → `prerendered-outputs` · ▤ DA4 → `server-cache`, `prerender-manifest` · SP5 → `server-cache` | connect · static |
| j8-5 | peek | http | `x-nextjs-cache: HIT` · PO8 | ▤ → `server-cache` | — |
| j8-6 | off | — | predict | — | — |
| j8-7 | peek | http | `x-nextjs-cache: STALE` · PO6–PO8 | ○ → `isr-regeneration` · ▤ → `server-cache`, `isr-regeneration` | — |
| j8-8 | peek | http | `x-nextjs-cache: MISS` · PO4, PO6, PO8 | ○ → `pages-renderer` · ▤ → `server-cache` | — |
| j8-9, j8-10 | off | — | names, the tab caches: no code changes form | — | — |
| j8-11 | peek | files | the image cache key (ledger only) | — | — |
| j8-12 | off | — | build cache: no specimen code | — | — |
| j8-13 | open | html | billing's shell + `billing.meta` postponed | ○ → `ppr-shell` · ⌛ → `prerender`, `server-cache` · ⊘ BP → `rsc-runtime-entity` | fade-in · side-by-side |
| j8-14 | peek | http | the shell leaves first (ledger only) | — | — |
| j8-15 | open | html | the resumed part of the same response | ⌛ → `suspense-hole`, `html`; IL4/DA7/DA8 → `db`, `rsc-runtime-entity` | fill · side-by-side |
| j8-16 | off | — | predict | — | — |
| j8-17 | open | html | what-if BV source + BL `loading.tsx` + the shrunken shell | ○ → `ppr-shell` · ⌛ → `suspense-hole` · RL2/DL4 → layouts · BV → `src-billing-page` | swap · static |
| j8-18 | peek | tsx | AC2/AC6 vs what-if AV1/AV2 | ⊘ AC → `data-cache`, `action-handler` · AV → `server-cache` | — |
| j8-19, j8-20 | off | — | explain without code; check | — | — |

## Step details

### j8-4 · open · files
```text
settings.html                                                       ⊘○ SP4  the document, rendered at build
settings.rsc                                                        ⊘○ SP4  the same render as Flight rows
▸ settings.segments/: one prefetch file per segment (J6)
settings.meta  { "headers": { "x-next-cache-tags": "…,profile", … }, … }                         ⊘▤ DA4  morph profile
.next/prerender-manifest.json  "/dashboard/settings": { "initialRevalidateSeconds": 3600, … }   ⊘▤ DA4  cacheLife('hours'): 1 h; expire 86400 (1 d)  (the path was ../../, one level short of .next/)
server cache · key /dashboard/settings → HTML · RSC · meta                                     ⊘▤ SP5
```
- The brief wrote the meta as `{revalidate, tags: ["profile"]}`. In 16.3 the `.meta` file holds
  `headers` (tags travel as the `x-next-cache-tags` header), `status`, `postponed`, `segmentPaths`; the
  revalidate and expire times live in `prerender-manifest.json`. The lens shows the real split.
- `3600` / `86400` are `cacheLife('hours')`'s revalidate and expire, propagated to the route because
  `getProfile` is the only cache the page reads.

### j8-13 · open · html
```text
<html lang="en"><body><section class="dashboard"><nav …>…</nav>    ⊘○ RL2 DL4  the layouts
<h1>Billing</h1>                                                  ⊘○ BP6
<!--$?--><template id="B:0"></template>                           ⊘○ BP7  the boundary, still pending
<p>Loading invoices…</p><!--/$-->                                 ⊘○ BP13 the fallback is in the shell
▸ 6 lines of InvoiceList: not rendered at build, it reads cookies()   gone
billing.meta  { "postponed": "…", … }                             ⊘⌛ BP8  where rendering stopped
```
Footer: `◐ /dashboard/billing · shell at build, hole per request`. Reduced: source lines (RL2, DL4, BP6, BP7, BP13, BP8) as the before pane.

### j8-15 · open · html
```text
▸ shell bytes, already sent: the layouts, <h1>, the skeleton
cookies() → this visitor's session · getInvoices(session) → db.findMany(…)   ⊘⌛ IL4 DA7 DA8
<div hidden id="S:0"><ul><li>€12.00</li>…</ul></div>                          ⊘⌛ IL6
<script>$RC("B:0","S:0")</script>                                             ⊘⌛ BP8  swaps it in
<script>self.__next_f.push([1,"…"])</script>                                  ⊘⌛ IL6  the rows for React
```
`B:0` (j8-13) and `S:0` keep their highlight: the swap script names the boundary the shell left open.

### j8-17 · open · html
Three panes: the what-if `app/dashboard/billing/page.tsx` (BV1, BV2, BV4, BV5, every line ⌛), the
what-if `app/dashboard/billing/loading.tsx` (BL1, BL2 ○) and the shell, now the layouts plus one hole
(`<!--$?--><template id="B:0"></template>` from BV1 ⌛, then `<p>Loading billing…</p><!--/$-->` from BL2 ○),
with `<h1>`, the boundary and the skeleton folded as gone. Chip: loading.tsx is the boundary above the
page; without one, Cache Components reports the route as blocking.

### Peeks
- j8-2 `⊘ SP5 getProfile() · asked twice in one render → one run, one result · the memo is dropped when the request ends`.
- j8-3 `▤ DA2–DA5 getProfile: 'use cache' · cacheTag('profile') · cacheLife('hours') → stored across requests · ⌛ DA7–DA8 getInvoices: no directive → runs on every request`.
- j8-5/7/8 `x-nextjs-cache: HIT | STALE | MISS` with PO8, PO6–PO8, PO4 (`/posts/8` is an illustrative unlisted id).
- j8-11 `GET /_next/image?url=%2Fhero.jpg&w=640&q=75 · Accept: image/webp → cache key = getHash([CACHE_VERSION, href, w, q, mimeType]) of /hero.jpg · 640 · 75 · image/webp → a file in .next/cache/images`.
- j8-14 `GET /dashboard/billing → 200 · text/html · billing.html streams first …`.
- j8-18 AC6 `updateTag` vs AV2 `revalidateTag('profile', 'max')`.

## Deviations from §10.2

- **j8-16 is off, not peek.** §10.1 says predict steps are off, and the BV specimen lines carry ⌛ marks
  and the note "the whole page is now in the hole": a peek would answer the question. The BV source is
  drawn at j8-17 (the reveal) instead.
- **j8-4's meta** follows the 16.3 file layout (above) instead of `{revalidate, tags}`.
- **j8-17 has a source pane** next to the shell, so the reveal shows the cause and the effect together.

## Token verification (Next.js v16.3.8 unless noted)

| Token | Checked in |
|---|---|
| `.meta` = `{ headers, status, postponed, segmentPaths }`; `.rsc`, `.meta` suffixes; `x-next-cache-tags` | `packages/next/src/server/lib/incremental-cache/file-system-cache.ts`, `packages/next/src/lib/constants.ts` |
| image cache key = `getHash([CACHE_VERSION, href, width, quality, mimeType])`; the lens names its inputs, not the key | `packages/next/src/server/image-optimizer.ts` ≈571, v16.3.8 |
| `initialRevalidateSeconds`, `initialExpireSeconds` in prerender-manifest routes | `packages/next/src/build/index.ts` |
| `cacheLife('hours')` = stale 300, revalidate 3600, expire 86400 | `packages/next/src/server/config-shared.ts` |
| `"use cache"` tags and lifetimes propagate to the enclosing prerender | `packages/next/src/server/use-cache/use-cache-wrapper.ts` (`propagateCacheLifeAndTagsToRevalidateStore`) |
| `x-nextjs-cache: HIT / STALE / MISS / REVALIDATED` on Pages ISR routes | `packages/next/src/server/route-modules/pages/pages-handler.ts` |
| `<!--$?--><template id="B:0">`, `<div hidden id="S:0">`, `$RC("B:0","S:0")` | vendored `packages/next/src/compiled/react-dom/cjs/react-dom-server.node.development.js` |
| `updateTag`, `revalidateTag(tag, 'max')`, `cacheTag`, `cacheLife` | §6 of `../code-lens.md`; concept-model V6, V14, V15 |
| image cache key (url, width, quality, format), `.next/cache/images` | concept-model (image optimizer cache row); journey j8-11 |

## Gaps

- **j8-2 (kept as a gap):** the specimen's `AccountSummary` receives `profile` as a prop (AS1), which
  J0 relies on, so there is no second `getProfile()` line. The journey story now says so ("had
  AccountSummary called getProfile() itself"); the peek shows SP5 and SP8.
- **j8-17 (resolved):** the what-if `app/dashboard/billing/loading.tsx` (BL1–BL3) is the boundary above
  the BV page, so "the shell keeps the layouts" holds under Cache Components: the shell pane now shows
  the `B:0` hole and BL2's fallback, and the chip and j8-16/j8-17 stories name `loading.tsx`.
- j8-11, j8-14: no specimen lines (ledger only).

## Unverified

- Whether `x-next-cache-tags` also lists the implicit `_N_T_…` tags in the stored meta (elided as `…`).
- `/posts/8`, `€12.00`, the meta's `postponed` value are illustrative.
