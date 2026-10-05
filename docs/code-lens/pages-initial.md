# Code lens · J3 Pages Router: the initial request (`pages-initial`)

Data: `src/domain/codeLens/pages-initial.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
Specimen lines: `pages/products/[id].tsx` (PR), `pages/posts/[id].tsx` (PO), `pages/_app.tsx` (AP),
`pages/_document.tsx` (DC) and the what-if variant PI1–PI3.

The lesson the lens carries: in the Pages Router every component line is ⚡ split (its **code** crosses),
and the only ⊘ lines are the data function, its imports and `_document`. J0's violet Server Component
lines have no counterpart here.

## 1. Summary

Open 5 · peek 6 · off 5.

| Step | Lens | Form | Visible | Change vs previous | Fates lit → entity | Motion · reduced motion |
|---|---|---|---|---|---|---|
| j3-1 | peek | tsx | ledger only: PR3 → ƒ, PO3/PO6 → ●, none → ○ | — | — | — · — |
| j3-2 | peek | json | routes-manifest `dynamicRoutes` row, pages-manifest rows | source → manifest rows | none (rows come from file names, not lines) | — · — |
| j3-3 | **open, split** | js | server: PR2–PR5 · browser chunk: hole, `__N_SSP`, PR7–PR11 | one column → two; PR2–PR5 gone on the browser side | ⊘ → `gssp` · ⚡S → `browser-chunks` | `split` · three panes (source · server · browser) |
| j3-4 | peek | files | `posts/7.html`, `7.json`, prerender-manifest row | — | ○ → `server-cache` · ▤ → `server-cache`, `isr-regeneration`, `prerender-manifest` | — · — |
| j3-5 | peek | js | what if: PI1–PI3 inside the page chunk | no hole | ⚡S → `gip`, `browser-chunks` | — · — |
| j3-6 | peek | tsx | AP3, AP4, AP6, AP7 | — | ⚡S → `ssr-runtime-entity` | — · — |
| j3-7 | **open** | html | `<article>…</article>` from PR9–PR11; App › ThemeProvider row | JSX → tags | ⚡S → `ssr-runtime-entity`, `html` | `transform` · source beside HTML |
| j3-8 | peek | html | `<html>`, `<div id="__next">`, `<script defer>` tags, `_buildManifest.js` | — | ⊘ → `pages-document`, `html`; DC3 → `build-manifest` | — · — |
| j3-9 | **open** | json | `__NEXT_DATA__`: `props.pageProps.product`, `__N_SSP`, `page`, `query`, `buildId`, `gssp` | PR5's value as JSON | ⊘ → `next-data`, `html` | `wrap` · PR5 beside the JSON |
| j3-10 | off | — | predict | — | — | — |
| j3-11 | **open** | html | the script tags: framework, main, `_app`, products chunk, `__NEXT_DATA__` + 0 B ledger | code tags are the change | ⚡S AP → `pages-app`, `browser-chunks` · ⚡S PR → `pages-product-page`, `browser-chunks` · ⊘ → `next-data` | `wrap` + `fade-to-zero` · static ledger |
| j3-12 | **open** | dom | every PR/AP line hydrated, `__NEXT_DATA__` consumed | no text change; nothing static | ⚡S → `pages-app`, `pages-product-page`, `react-client` · 🔒 → `pages-app` · ⊘ → `next-data` | `light-up` · static chips |
| j3-13 | off | — | explain (hydration mismatch) | — | — | — |
| j3-14 | off | — | explain (isReady) | — | — | — |
| j3-15 | off | — | explain (vs App Router) | — | — | — |
| j3-16 | off | — | check | — | — | — |

## 2. Details

### j3-1 · The strategy comes from the exports · `peek` · tsx

A three-line ledger: `PR3 → ƒ`, `PO3 + PO6 → ●` with `revalidate 60 (PO8)`, `no data function → ○`.
No pane. **Deviation (clarity):** a source pane here would become the reduced-motion "before" pane of
j3-3 (`beforePanes` takes the latest earlier `tsx` step with panes), and that pane would mix the posts
file into a step about the products file. With no pane here, j3-3's before pane is the products source
it splits.

### j3-2 · Matching /products/42 · `peek` · json

Expanded: `routes-manifest.json` `dynamicRoutes` entry (`page`, `regex`, `routeKeys`, `namedRegex`) and
three `pages-manifest.json` rows. No fate: a route comes from a file name, not a specimen line, so no
row links. The notes say where `id = "42"` comes from.

### j3-3 · getServerSideProps runs, on the server only · `open`, split · js

Server pane `server/pages/products/[id].js` (→ `gssp`): PR2–PR5 compiled (PR3's type annotation is left out rather than drawn ✂, so the line fits two rows of a paired pane at 1440; PR7 in the browser pane keeps the ✂ as `: {…}`; PR4's note is "per request"), then
`ProductPage` folded ("the server copy renders the HTML, step 7").

Browser pane `static/chunks/pages/products/[id]-6e7f.js` (→ `browser-chunks`):

```text
▸ 4 lines of getServerSideProps and the db import: cut          PR2–PR5  gone
▸ 1 import line, unchanged                                       PR1      same
export var __N_SSP = true;                                       ⚡S  —   new   morph __N_SSP
export default function ProductPage({ product }) {               ⚡S PR7  same  ✂ : {…}
    return _jsxs("article", { children: [                        ⚡S PR9  same
        _jsx("h1", { children: product.name }),                  ⚡S PR10 same
        _jsx(Link, { href: "/posts/7", children: "Read the post" })   ⚡S PR11 same
    ] });
}
```

- **Change:** one column becomes two. The browser copy loses PR2–PR5 and gains one line,
  `export var __N_SSP = true`, which is all the client router later needs to know that data comes
  from `/_next/data` (J4). The chip names the transform for both bundlers: `next_strip_page_exports` under Turbopack (the 16 default), SWC `next_ssg` under Webpack.
- **Motion:** `split`. **Reduced motion:** `three-pane`: PR source (from the specimen) · server · browser.

### j3-4 · The ghost lane · `peek` · files

Ledger: the two files and the prerender-manifest row; the third line says what `fallback: 'blocking'`
(PO4) does. Expanded: `.next/server/pages/posts/` (`7.html` ○, `7.json` ○ with its exact shape) and the
prerender-manifest row (▤ PO8).

### j3-5 · getInitialProps: the chunk without a hole · `peek` · js

What-if pane (badge `what if`): PI1–PI3 compiled inside the same chunk, `ProductPage` folded.
The notes say the function runs in the tab on navigation and that its URL is readable by anyone.

### j3-6 · _app wraps the page · `peek` · tsx

AP3, AP4, AP6, AP7 as written; AP7's note binds `Component = ProductPage`, `pageProps = PR5's { product }`.
`pages-app` is neither in the step's states nor its camera, so the pane header has no entity and the
🔒 mark on AP4/AP6 shows `off-map`.

### j3-7 · The whole tree becomes HTML · `open` · html

```text
App › ThemeProvider: no tags of their own in this app            ⚡S AP4 AP6  same
<article>                                                        ⚡S PR9      new   morph article
<h1>Desk lamp</h1>                                               ⚡S PR10     new   morph h1
<a href="/posts/7">Read the post</a>                             ⚡S PR11     new   morph a
</article>
```

Chip: `react-dom/server: no RSC runtime, no Flight rows, no $L references; every component becomes tags`.
Every line is blue: the step's contrast with J0 step 7, where violet lines vanished behind their output.
`ThemeProvider` (TP1–TP6) renders only a context provider, so its markup is none.
**Reduced motion:** source (AP, PR) beside the HTML.

### j3-8 · _document builds the shell · `peek` · html

Ledger: DC1–DC3 → `<div id="__next">` + one `<script defer>` per chunk in
`build-manifest pages["/products/[id]"]`. Expanded: the document skeleton, the first chunk tag, a fold
with the other three, and `_buildManifest.js` (a `lowPriorityFiles` entry). DC3 lines link `pages-document`
and `html`; DC3 also links `build-manifest`.

### j3-9 · The props, a second time · `open` · json

`__NEXT_DATA__`, pretty-printed and abridged: `"pageProps": { "product": … }` (⊘ PR5, morph `product`),
`"__N_SSP": true`, `"page"`, `"query"`, `"buildId"`, `"isFallback": false, "gssp": true, …`.
Chip: once as markup, once as JSON; the 128 kB warning. **Reduced motion:** PR5 beside the JSON.

### j3-11 · Data and the whole tree cross · `open` · html

Six tag rows (framework, main, `_app` ⚡S, products chunk ⚡S, `__NEXT_DATA__` ⊘) and a fold with
polyfills, the webpack runtime, `_buildManifest.js` and `_ssgManifest.js`. Footer ledger:

```text
0 B of getServerSideProps in the browser · ⊘ PR2–PR5 were cut at build (step 3); only their result crosses, inside __NEXT_DATA__
code · ⚡ every line of _app and ProductPage, interactive or not (in J0 step 8 only the Client Components crossed as code)
```

Links are narrowed by line: the `_app` tag lights `pages-app`, the products tag `pages-product-page`
(both also `browser-chunks`). The chunk path is URL-encoded (`%5Bid%5D`), as `<NextScript/>` writes it.

### j3-12 · The whole tree hydrates · `open` · dom

Rows: `<div id="__next">` (hydrateRoot target), `App · ThemeProvider` (⚡S 🔒), `<article>`, `<h1>`, `<a>`
(⚡S, each "hydrated"), `<script id="__NEXT_DATA__">` (⊘, "consumed"). No row says `static`; the chip
points back at J0 step 9. **Motion:** `light-up` over every line.

## 3. Token verification

"v16.3.8" = `https://github.com/vercel/next.js/blob/v16.3.8/<path>`, read 2026-10-05.

| Token as shown | Where checked |
|---|---|
| `next_ssg` drops `getServerSideProps`/`getStaticProps`/`getStaticPaths` and imports only they use; inserts `export var __N_SSP = true` (`__N_SSG` for SSG) before the first remaining export | `crates/next-custom-transforms/src/transforms/next_ssg.rs` (`SSG_EXPORTS`, `atom!("__N_SSP")`, `VarDeclKind::Var`), v16.3.8 (Webpack); Turbopack runs `next_strip_page_exports` (`crates/next-core/src/next_shared/transforms/next_strip_page_exports.rs`, a wrapper over `next-custom-transforms` `strip_page_exports.rs`, "the original transform is … next_ssg.rs") |
| `dynamicRoutes` entry `{ page, regex: "^/products/([^/]+?)(?:/)?$", routeKeys: { nxtPid: "nxtPid" }, namedRegex: "^/products/(?<nxtPid>[^/]+?)(?:/)?$" }` | `packages/next/src/build/utils.ts` `pageToRoute` (`prefixRouteKeys: true`), `lib/constants.ts` `NEXT_QUERY_PARAM_PREFIX = 'nxtP'`, `shared/lib/router/utils/route-regex.ts`, v16.3.8 |
| pages-manifest `"/products/[id]": "pages/products/[id].js"` | journey j3-2 internals and `entities.ts`; file name convention not re-read in source |
| prerender-manifest route `initialRevalidateSeconds`, `srcRoute`, `dataRoute: /_next/data/<buildId>/<page>.json` | `packages/next/src/build/index.ts` (`PrerenderManifestRoute`, `dataRoute: path.posix.join('/_next/data', buildId, …)`), v16.3.8 |
| `7.json` = `{"pageProps":{…},"__N_SSG":true}`; `__N_SSP: true` on gSSP props | `packages/next/src/server/render.tsx` (`props[STATIC_PROPS_ID] = true`, `props[SERVER_PROPS_ID] = true`, `metadata.pageData = props`), `shared/lib/constants.ts` (`STATIC_PROPS_ID = '__N_SSG'`, `SERVER_PROPS_ID = '__N_SSP'`), v16.3.8 |
| `__NEXT_DATA__` keys `props`, `page`, `query`, `buildId`, `isFallback`, `gssp` (and `gsp`, `gip`, `appGip`…, undefined ones dropped by `JSON.stringify`) | `render.tsx` `htmlProps.__NEXT_DATA__`, v16.3.8 |
| `<script id="__NEXT_DATA__" type="application/json">`, 128 kB warning (`largePageDataBytes`) | `packages/next/src/pages/_document.tsx` (`getInlineScriptSource`), v16.3.8; concept-model row `__NEXT_DATA__` |
| `<div id="__next">` | `render.tsx` (`<div id="__next">{children}</div>`), v16.3.8 |
| `<script src="/_next/…" defer="">`, polyfills `nomodule`, `lowPriorityFiles` (`_buildManifest.js`, `_ssgManifest.js`), path through `encodeURIPath` (`[id]` → `%5Bid%5D`) | `_document.tsx` (`getScripts`, `getPolyfillScripts`), `shared/lib/encode-uri-path.ts` (`encodeURIComponent` per segment), v16.3.8 |
| `static/<buildId>/_buildManifest.js`, `self.__BUILD_MANIFEST = {…};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()` | `build-manifest-plugin.ts` (`buildNodejsLowPriorityPath`: `${CLIENT_STATIC_FILES_PATH}/${buildId}/${filename}`; `generateClientManifest`), v16.3.8 |
| react-dom/server render, no RSC runtime | concept-model row "`_app` wrap → `renderToReadableStream`"; journey j3-7 |
| `buildId k7Qm2xLp9`, `framework-a1b2c3.js`, `webpack-9c0d.js` | `experience-architecture.md` §2 |
| `main-4f5a6b.js`, `pages/_app-2c3d.js`, `pages/products/[id]-6e7f.js`, `Desk lamp` | illustrative, chosen here in the §2 style (Webpack-style named chunks, as the rest of the site). A Turbopack production build names chunks by content hash only |

Not verified: whether `_document`'s `scriptLoader` key appears in this app's `__NEXT_DATA__` (left as `…`).

## 4. Gaps

- PI1's real compiled form keeps `ProductPage.getInitialProps = …` after the component; the pane shows
  it first and folds the component, which is an ordering choice, not output order.
- Resolved: `components/ThemeProvider.tsx` is in the specimen (TP1–TP6). It renders a context provider,
  so it still has no tags of its own: the j3-7 row names TP5, j3-12 names TP4, j3-11's `_app` chunk row
  names TP3–TP5.
- AP3 and DC1–DC3 are tagged `j3` already; nothing missing for J3.

## 5. Deviations from §10.2

- j3-1: ledger only, no pane (reason above).
- j3-3: the browser pane shows the added `export var __N_SSP = true` line, which §10.2 does not list; it
  is the visible remainder of the cut function and is what J4 step 4 relies on.
- j3-9: the JSON is pretty-printed over eight rows instead of the one-line form in the j3-9 internals, so
  `pageProps` can carry the morph and its own fate.
