# Code lens · J4 Pages Router: navigation (`pages-navigation`)

Data: `src/domain/codeLens/pages-navigation.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
Specimen lines: PR11 (the link), PR5 (the data), PO6–PO14 (the target page), AP4/AP6 (the kept `_app`),
DC2 (the absent `_document`) and the what-if variant PI1–PI3. Chunk names follow
`pages-initial.md`, plus `static/chunks/pages/posts/[id]-8a9b.js` (illustrative).

## 1. Summary

Open 2 · peek 5 · off 5.

| Step | Lens | Form | Visible | Change vs previous | Fates lit → entity | Motion · reduced motion |
|---|---|---|---|---|---|---|
| j4-1 | peek | http | PR11 + the two prefetch requests | — | ⚡S PR11 → `pages-product-page` · ⚡S PO10 → `browser-chunks` · ⊘/▤ → `pages-data-endpoint` | — · — |
| j4-2 | peek | http | the hover call + the JSON request it may send | — | ⚡S → `pages-product-page`, `pages-prefetch` · ⊘ → `pages-data-endpoint` | — · — |
| j4-3 | off | — | predict | — | — | — |
| j4-4 | **open** | json | request line, `200 · application/json`, `{ "pageProps": …, "__N_SSP": true }`, no document | PR5 as JSON; `_document` gone | ⊘ PR5 → `gssp`, `pages-data-endpoint` · ⊘ DC2 → `pages-document` | `transform` · PR5, DC2 beside the JSON |
| j4-5 | peek | json | `x-nextjs-cache: HIT`, stored `posts/7.json` | — | ○ → `server-cache`, `pages-data-endpoint` · ▤ → `server-cache` | — · — |
| j4-6 | peek | js | what if: PI1–PI3 running in the tab | — | ⚡S → `gip`, `pages-product-page` | — · — |
| j4-7 | peek | manifest | `_buildManifest.js` rows for both pages | — | ⚡S PO10 → `pages-post-page`, `browser-chunks` · PR7 → `browser-chunks` | — · — |
| j4-8 | **open** | dom | `<App Component={PostPage}>` 🔒, ThemeProvider 🔒, ProductPage gone, PostPage new, no `_document` | the slot swaps type | 🔒 → `pages-app` · ⚡S AP → `pages-app` · PR7 → `pages-product-page` · PO → `pages-post-page` · DC2 → `pages-document` | `swap` · static `kept`/`gone`/`new` |
| j4-9 | off | — | explain (history) | — | — | — |
| j4-10 | off | — | explain (shallow routing) | — | — | — |
| j4-11 | off | — | explain (then and now) | — | — | — |
| j4-12 | off | — | check | — | — | — |

## 2. Details

### j4-1 · A link in the viewport · `peek` · http

Ledger: `PR11 <Link href="/posts/7"> in view → the posts page chunk + /_next/data/k7Qm2xLp9/posts/7.json
(● target; a getServerSideProps target gets its chunk only) · once per URL`. Expanded: PR11 as written,
`GET /_next/static/chunks/pages/posts/%5Bid%5D-8a9b.js` (⚡S, from PO10) and
`GET /_next/data/k7Qm2xLp9/posts/7.json · purpose: prefetch · x-nextjs-data: 1` (⊘ ▤, from PO8).

### j4-2 · Hover prefetch · `peek` · http

Ledger and pane match the step's story: the hover handler calls
`prefetch(router, href, as, { locale, priority: true, bypassPrefetchedCheck: true })`, skipping
next/link's `prefetched` Set. With `priority: true` and `__NEXT_OPTIMISTIC_CLIENT_CACHE` (default on),
`router.prefetch` passes `unstable_skipClientCache: true`, so `fetchNextData` calls `getData({})` and the
JSON is requested again on every hover; the fresh promise then replaces the `sdc` entry. The JSON row's
note says "sent again on each hover (unstable_skipClientCache)".

### j4-4 · The data route · `open` · json

```text
GET /_next/data/k7Qm2xLp9/products/42.json · x-nextjs-data: 1       context
200 · Content-Type: application/json; charset=utf-8                   context
{
  "pageProps": { "product": { "name": "Desk lamp" } },                ⊘ PR5  new   morph product
  "__N_SSP": true                                                     —      new
}
no document: _document is not rendered                                ⊘ DC2  gone
```

Chip: `no HTML is rendered: the endpoint runs getServerSideProps and sends its result as JSON`. The
`gone` DC2 row draws the absence (as j0-10's "no rows" line does). **Reduced motion:** PR5 and DC2 as
written, beside the JSON.

### j4-5 · The SSG lane · `peek` · json

`200 · x-nextjs-cache: HIT`, then the stored body `{ "pageProps": { "post": { "title": "Notes on ISR" } },
"__N_SSG": true }` (○ PO6/PO7) and one ▤ PO8 row on staleness.

### j4-6 · The getInitialProps lane · `peek` · js

The what-if chunk rows PI1–PI3, compiled, with notes "runs in the tab on this navigation" and "from the
browser: no req, no res".

### j4-7 · The page chunk · `peek` · manifest

`static/k7Qm2xLp9/_buildManifest.js`: `self.__BUILD_MANIFEST = {__rewrites: {…},`, the `/posts/[id]` row
(⚡S PO10, "the chunk this click needs"), the `/products/[id]` row, `sortedPages`, and the
`__BUILD_MANIFEST_CB` tail.

### j4-8 · _app stays, the page swaps · `open` · dom

```text
<App Component={PostPage} pageProps={{ post }}>     ⚡S 🔒 AP4  same  morph Component  kept: rendered again, not remounted
  <ThemeProvider>                                   ⚡S 🔒 AP6  same  kept: its state and DOM stay
    <ProductPage product={…}>                       ⚡S PR7     gone  replaced: a different type in the slot
▸ 3 lines of ProductPage's <article>: unmounted with it          PR9–PR11 gone
    <PostPage post={…}>                             ⚡S PO10    new
      <article><h1>Notes on ISR</h1></article>      ⚡S PO12 PO14 new
no document: _document exists only in the first HTML   ⊘ DC2    gone
```

Chip: `one render of _app with a new Component prop: what sits in the slot changes type, so React
replaces it`. **Reduced motion:** static; the rows already carry `kept`/`gone`/`new` (a source before
pane would be four files).

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>`, read 2026-10-05.

| Token as shown | Where checked |
|---|---|
| `/_next/data/<buildId><dataRoute>.json` | `packages/next/src/client/page-loader.ts` (`getDataHref`), v16.3.8 |
| `x-nextjs-data: 1` on every data fetch; `purpose: prefetch` on prefetches | `packages/next/src/shared/lib/router/router.ts` (`fetchRetry`, `fetchNextData`), v16.3.8 |
| viewport prefetch once per `href%as%locale` (a module-level `Set`); hover `prefetch(router, href, as, { locale, priority: true, bypassPrefetchedCheck: true })` | `packages/next/src/client/link.tsx` (`prefetched`, `onMouseEnter`), v16.3.8 |
| hover re-requests the JSON: `unstable_skipClientCache: options.unstable_skipClientCache \|\| (options.priority && !!process.env.__NEXT_OPTIMISTIC_CLIENT_CACHE)`; with it `fetchNextData` returns `getData({})` and only then writes `inflightCache[cacheKey]` | `router.ts` `prefetch` (≈2576–2579) and `fetchNextData` (≈627), `server/config-shared.ts` (`optimisticClientCache: true`), v16.3.8 |
| viewport prefetch (no `priority`) goes through `this.sdc`, kept in production (`persistCache: !this.isPreview`) | `router.ts` `fetchNextData`, `prefetch`, v16.3.8 |
| j4-7: viewport prefetch → `pageLoader.prefetch` → `prefetchViaDom` (`<link rel="prefetch">`, not executed); hover → `pageLoader.loadPage` (runs the chunk) | `router.ts` `prefetch` (`this.pageLoader[options.priority ? 'loadPage' : 'prefetch'](route)`), `client/route-loader.ts` (`prefetch`, `prefetchViaDom`), v16.3.8 |
| prefetch disabled in development | `router.ts` `prefetch` (`process.env.NODE_ENV !== 'production'` → return), v16.3.8 |
| data response body = `pageData` = `{ pageProps, __N_SSP: true }` / `{ pageProps, __N_SSG: true }`, `application/json; charset=utf-8` | `packages/next/src/server/route-modules/pages/pages-handler.ts` (`JSON.stringify(result.value.pageData)`, `JSON_CONTENT_TYPE_HEADER`), `render.tsx`, `lib/constants.ts`, v16.3.8 |
| `x-nextjs-cache: HIT` / `STALE` / `MISS` / `REVALIDATED` for getStaticProps pages | `pages-handler.ts`, v16.3.8 |
| `self.__BUILD_MANIFEST = {…};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()`, `__rewrites`, `sortedPages`, `/_app` deps filtered out | `packages/next/src/build/webpack/plugins/build-manifest-plugin.ts` (`generateClientManifest`, devalue output), v16.3.8 |
| `getInitialProps` ctx in the browser without `req`/`res` | journey j4-6 internals; concept-model row "Pages client router" |
| `<App Component pageProps>` re-render, `_document` only in the first HTML | concept-model rows `_app.tsx`, Pages client router; journey j4-8 |
| `Notes on ISR`, `posts/[id]-8a9b.js` | illustrative |

## 4. Discrepancy with the journey (none)

An earlier pass claimed the data cache answers the hover. That was wrong: a hover prefetch has
`priority: true`, and with `__NEXT_OPTIMISTIC_CLIENT_CACHE` on by default (`optimisticClientCache: true`)
it skips the client cache, so each hover sends the JSON request again. j4-2's story, token and lens agree.

## 5. Gaps

- Resolved: DC2 is tagged `j3, j4`.
- Resolved: `components/ThemeProvider.tsx` is in the specimen (TP1–TP6); j4-8's `<ThemeProvider>` row
  names TP4, the state it keeps.

## 6. Deviations from §10.2

- j4-4 and j4-8 each add one `gone` DC2 row so the "no `_document`" fact is linked on the map.
