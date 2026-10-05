# Code lens · J11 Built-in optimizations (`optimizations`)

Data: `src/domain/codeLens/optimizations.ts`. Brief: [`../code-lens.md` §10.2](../code-lens.md#102-per-journey).
Counts: **4 open · 8 peek · 4 off** (16 steps). Opens: j11-5, j11-6, j11-7, j11-8.

## Summary

| Step | Lens | Form | Shows | Fates lit → entity | Motion · reduced |
|---|---|---|---|---|---|
| j11-1 | peek | files | SP4 ○ because SP5 ▤ → settings.html/.rsc/.meta | ○ → `prerendered-outputs` · ▤ → `server-cache` | — |
| j11-2 | peek | files | PO8 revalidate 60 | ▤ → `server-cache`, `isr-regeneration` | — |
| j11-3 | peek | html | BP6–BP8: shell vs hole | ○ → `ppr-shell` · ⌛ → `suspense-hole` | — |
| j11-4 | peek | files | the chunk families (ledger only) | — | — |
| j11-5 | open | js | NC5 + PB1 → the barrel rewrite | ⚡S → `swc`, `src-profile-form` · NC5 → `swc` | transform · static |
| j11-6 | open | files | what-if SD1–SD2 → ProfileForm's own chunk + fallback | ⚡B → `next-dynamic`, `suspense-hole` · SD1 → `next-dynamic` · ⚡S → `split-chunks`, `client-components` | split · static |
| j11-7 | open | html | PO13 → `<img>` + the `/_next/image` request | ⚡S → `next-image`, `dom` | fade-in · static |
| j11-8 | open | css | RL4–RL5 → `@font-face` + `.__className_…` | ⊘ → `font-loader`, `font-css` | transform · static |
| j11-9 | peek | css | Google variant (ledger only) | — | — |
| j11-10 | peek | css | the `Fallback` face (RL5) | ⊘ → `font-css`, `dom` | — |
| j11-11 | peek | html | AP2, AP8 → injected in idle time | ⚡S → `next-script` | — |
| j11-12 | peek | json | `.nft.json` (NC6) | ⊘ → `tracing`, `standalone` | — |
| j11-13…16 | off | — | predict, reveal, map, check | — | — |

Every open step pairs the source lines with the derived artifact, so reduced motion draws them
statically (`static`): the before pane is already on screen.

## Step details

### j11-5 · open · js
Source pane `next.config.js · components/ProfileForm.tsx`: NC5 (context) and PB1. Compiled pane,
hint "as compiled with --webpack; Turbopack (the default) keeps the import and skips the unused re-exports":
```text
import { Button } from "__barrel_optimize__?names=Button!=!ui-kit";   ⚡S PB1  morph Button
export { Button } from "./button.js"                                  ⚡S PB1  new: the barrel as the bundler now sees it
▸ the rest of ui-kit's re-exports: never reached                       gone
```

### j11-6 · open · files
What-if SD1–SD2 above `.next/static/chunks/`: `page-5e6f.js` without ProfileForm, `1f2e….js` (ProfileForm's
own chunk, from PF2/PF4/PF5/PF7–PF9) and `<p>Loading form…</p>` as the fallback while it loads.

### j11-7 · open · html
Source PO13 above:
```text
<img alt="" loading="lazy" width="1280" height="720" decoding="async" data-nimg="1" style="color:transparent"   ⚡S PO13  the box is reserved
  sizes="100vw" srcset="/_next/image?url=%2Fhero.jpg&w=640&q=75 640w, …&w=750&q=75 750w, … 3840w"   ⚡S PO13  every device width (without sizes: 1x and 2x)
  src="/_next/image?url=%2Fhero.jpg&w=3840&q=75">                                          ⚡S PO13  the largest, for a browser without srcset
GET /_next/image?url=%2Fhero.jpg&w=640&q=75 · Accept: image/avif,image/webp,…   PO13         morph w=640; a phone picks 640
200 · Content-Type: image/webp                                                               cache key hashes /hero.jpg, 640, 75, image/webp
```

### j11-8 · open · css
Source RL4–RL5 above, hint "family names stay as written; only the class is hashed (CSS modules); Turbopack hashes the class its own way":
```text
@font-face { font-family: 'brand';                                                        ⊘ RL5  the family keeps the variable name
  src: url(/_next/static/media/4e5f6a-s.p.woff2) format('woff2'); font-display: swap; }   ⊘ RL5  hashed copy of brand.woff2
▸ 1 rule: the 'brand Fallback' face (step 10)
.__className_a1b2c3 { font-family: 'brand', 'brand Fallback'; }                         ⊘ RL5  brand.className, the only hashed name
```

### Peeks
- j11-1 `○ /dashboard/settings · SP4 renders once at build because SP5 is ▤ "use cache" → settings.html · settings.rsc · settings.meta, served from the server cache`.
- j11-2 `● /posts/7 · pages/posts/7.html + 7.json · PO8 revalidate: 60 …`.
- j11-3 `◐ /dashboard/billing · ○ BP6, BP7, BP13 in the shell · ⌛ BP8 → IL4 cookies()`.
- j11-4 `static/chunks/ · framework-a1b2c3.js · webpack-9c0d.js · layout-3c4d.js · billing/page-7a8b.js` (names from the journey).
- j11-9 `next/font/google (not in the sample app) · next build fetches the stylesheet and font files …`.
- j11-10 the fallback face: `src: local("Arial"); ascent-override · descent-override · line-gap-override · size-adjust`.
- j11-11 `AP8 strategy="lazyOnload" · not in the HTML · after window load, in requestIdleCallback: <script … data-nscript="lazyOnload"> appended to <body>`.
- j11-12 `.next/server/app/dashboard/settings/page.js.nft.json · { "version": 1, "files": […] } · NC6`.

## Deviations from §10.2

- **j11-5:** the brief's "PB1 rewritten → `ui-kit/button`" is the journey's simplification. The SWC
  rewrite (`__barrel_optimize__?names=Button!=!ui-kit`) only happens on the Webpack path; Turbopack, the
  16 default, keeps the import and treats the listed package as side-effect free so the bundler skips
  the unused re-exports. The pane shows the Webpack form and says so in its hint.
- **j11-7 (resolved):** PO13 now carries `sizes="100vw"`, so Next writes the device-width srcset
  (`640w … 3840w`, `src` at `w=3840`; `sizes` sits before `srcset` as `ImageElement` renders it) and the
  journey's 640 request follows from PO13. Without `sizes` it would be a `1x`/`2x` srcset (`w=1920`,
  `w=3840`); the srcset row's note says so.
- **j11-8:** names follow the Webpack loader; the hint flags the Turbopack difference.
- All open steps carry a source pane next to the artifact (clarity: the config or call that causes it).

## Token verification (Next.js v16.3.8)

| Token | Checked in |
|---|---|
| `__barrel_optimize__?names=…!=!<pkg>` (SWC `autoModularizeImports`, Webpack); barrel loader output `export { a } from './a'` | `crates/next-custom-transforms/src/transforms/optimize_barrel.rs`, `packages/next/src/build/swc/options.ts`, `packages/next/src/build/webpack/loaders/next-barrel-loader.ts` |
| Turbopack: `optimize_package_imports` → `side_effect_free_packages` | `crates/next-core/src/next_client/context.rs`, `next_server/context.rs` |
| srcset: width without `sizes` → `[width, 2·width]` mapped to the next size → `1x`/`2x`; `sizes` → every `deviceSizes` width with `w` | `packages/next/src/shared/lib/get-img-props.ts` |
| `deviceSizes [640, 750, 828, 1080, 1200, 1920, 2048, 3840]`, `qualities [75]`, `formats ['image/webp']` | `packages/next/src/shared/lib/image-config.ts` |
| image cache key = `getHash([CACHE_VERSION, href, width, quality, mimeType])`; the lens names its inputs, not the key | `packages/next/src/server/image-optimizer.ts` ≈571, v16.3.8 |
| `/_next/image?url=<encoded>&w=<w>&q=<q>` | `packages/next/src/shared/lib/image-loader.ts` |
| `loading="lazy"`, `decoding="async"`, `data-nimg`, `style="color:transparent"` (until an error sets `showAltText`) | `get-img-props.ts` ≈698 (and the `Image` component), v16.3.8 |
| `static/media/[hash](-s)(.p).<ext>` | `packages/next/src/build/webpack/loaders/next-font-loader/index.ts` |
| `'<family> Fallback'` face, `local("Arial")`, `ascent/descent/line-gap-override`, `size-adjust`; `.className` rule | `…/next-font-loader/postcss-next-font.ts`, `packages/font/src/local/loader.ts` |
| `__<exportName>_<hash>` for the CSS-module class only (`__className_a1b2c3`); families stay `'brand'` / `'brand Fallback'` (`formatFamily(fontFamily)`, `` `${fontFamily} Fallback` ``) | `packages/next/src/build/webpack/config/blocks/css/loaders/next-font.ts` (`getLocalIdent`), `…/next-font-loader/postcss-next-font.ts` (≈44–46, 74), v16.3.8 |
| lazyOnload: `window` load → `requestIdleCallback` → `document.body.appendChild`, `data-nscript` | `packages/next/src/client/script.tsx` |
| `.nft.json` `{ version, files }` per entry | concept-model (tracing row); journey j11-12 |

## Gaps

- Resolved: PO13 now has `sizes="100vw"`, so the `<img>` lists every device width (`640w … 3840w`,
  `src` at 3840) and the `w=640` request row names PO13. Without `sizes` the srcset would be `1x`/`2x`
  only, which the note says.
- j11-4 and j11-9 have no specimen lines (ledger only; `next/font/google` is not in the sample app).

## Unverified

- Chunk and file hashes (`a1b2c3`, `4e5f6a`, `1f2e…`) and `./button` are illustrative.
- That the App Router `next/dynamic` chunk for an already-client ProfileForm is a separate file
  named only by hash (the journey's claim; not traced in source).
- `font-display: swap` is the documented default, not re-read in the loader source.
