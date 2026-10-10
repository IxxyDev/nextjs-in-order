# Code lens

Status: **implemented for all 12 journeys** (J0 as §5; J1–J11 per §10, each detailed in
`docs/code-lens/<slug>.md`; summary in §10.3). The specimen (`src/domain/codeLens/specimen/`, one module per file), fates and per-journey lens
steps (`src/domain/codeLens/<slug>.ts`, one lazy chunk each) live in `src/domain/codeLens/` and are
checked by `validateSpecimen` (once) and `validateCodeLens` (for every journey) in `src/domain/validate.ts`. The UI is `src/ui/CodeLens.tsx` in the step panel, with pure helpers in
`src/domain/codeLens/view.ts` and the code ↔ map signals in `src/ui/lensLink.ts`. Differences from
this spec: j0-1 renders nothing (no disabled tab), and motion is a subtle CSS pass per verb (lines
fade in, the morph identifier holds its highlight, split panes slide apart) rather than a line-by-line
morph. Under reduced motion the `side-by-side` and `three-pane` steps draw a before pane next to the
after panes (Flight and Flight-patch steps stack it above them: their rows run past 100 columns).
A source before pane is one pane per specimen file (j0-7 draws four), titled with the file's path.
Before-pane lines are context: they link to nothing at the current step and never carry `off-map`;
a before pane whose lines are all gone (j0-10) says `replaced` in its header. Rule 3's ghost column
(⊘ source bars fading to 30 % with a `0 B` stamp at j0-8) is not drawn: disappearance is the j0-8
footer ledger ("0 B of JS in the browser · ⊘ …") alone.

**Presentation (clarity pass).** Code must read as code, so the lens spends its pixels on lines:

- **Change is drawn, not spelled.** A new line has a `+` in its diff column and a faint `--ok` tint; a
  removed line has a `−`, is dimmed and struck. The words stay for screen readers (visually hidden). A
  pane whose lines are all new (j0-2) or all gone (a reduced-motion before pane) says it once, in its
  header, not on every line. The morph keeps its highlighted identifier.
- **Notes trail the line** as an italic annotation in the prose serif; a note moves whole to the next
  line rather than splitting. Wrapped code hangs two columns past its own indent, so a continuation
  never reads as a new line.
- **The fate chip** sits only under the first line of a run of one fate, on one line (lowercase, never
  wrapping, truncated if it must). Lines without a chip keep the fate as visually hidden text.
- **Folds are one calm line**, never struck: `▸ 10 lines of DashboardNav (stay in the browser chunk)`.
  The data label is the whole phrase, count included. A fold that names specimen lines (`from`) or holds
  its own text (`lines`) opens in place; source lines inside a compiled pane are captioned "as written
  in …".
- **Pane header is one line**: side (when the title does not already say it) · file (a path keeps its
  file name and truncates its folders from the start) · badge (`×2`, `⑂ ×2`) · `abridged`. What the
  badge means is a short italic hint under the header (`hint` in the data).
- **Width.** Panes pair once the lens is ~580px wide (a container query on the lens, not the window).
  From 1280px a journey with a lens widens the step panel to `clamp(480px, 100vw − 760px, 700px)` for
  the whole journey (so the map does not jump between steps; the stage refits to what is left and the
  transport keeps one row). At 1440 the split pairs with ~40 columns per pane; at 1280 and 1024 the
  panes stack.
- **Phones.** The panel is ~36% of the screen, too little for code. When the lens is showing panes, a
  44px **"More room for code"** handle (the tablet sheet's grabber pattern) sits sticky at the top of
  the panel. It gives the panel ~4/5 of the space between breadcrumb and transport and scrolls the lens
  into view; the map keeps a strip (≥112px) and refits to it, so tapping or focusing a line still lights
  its entity on screen. The choice holds across open steps; peek steps hide the handle and give the map
  its room back; Escape also gives it back. Swipe-to-step on the panel is unchanged. A full-screen
  overlay was rejected because it hides the map the lines link to; a Code/Map toggle, because it shows
  only one at a time.
- The toggle that folds an open lens to its strip reads **Hide code** (its pair is the strip's **Show
  code**), so it is never confused with the tablet sheet's Collapse.

The code lens is a secondary panel that shows **one specimen app's code** changing form along J0,
step by step: TSX, then compiled JS, then a server reference next to a browser chunk, manifest
rows, Flight rows, HTML with `self.__next_f`, the hydrated DOM and a Flight patch. The map stays
the primary view. The lens shows the same journey as text, in the exact form each stage produces.

Domain facts come from `concept-model.md` (§7 verified facts win). Encodings extend
`visual-language.md`. Steps refer to `src/domain/journeys/whole-lifecycle.ts`. Entity ids come from
`src/domain/entities.ts`.

## 1. Principle: clarity, not brevity

The specimen doesn't need to be small. It needs to be clear (наглядность). Each line has to show
a **fate**: where the line ends up and when. A line with no visible fate is noise and gets cut.
The aim is a reader who can look at a colored source line and predict what the browser receives
for it.

## 2. Clarity rules

| # | Rule | Decision taken here |
|---|---|---|
| 1 | **Fate coloring.** Each line gets a fate. The source is colored once, and the reader follows the color from there. | We use two channels, not seven hues (§3). **Hue** shows *where* the line ends up. There are four hues, and each one predicts the network chip from `visual-language.md` §2: violet = only its output crosses, as `data`. Blue = its code crosses, as `code`. Pink = only an ID crosses. A **gutter mark** shows *when*: ○ prerendered, ⌛ streamed later, ▤ cached, 🔒 kept on navigation. Seven hues would be too many to track, and a line can have both a where-fate and a when-fate (`<InvoiceList />` is server-only *and* suspended). Color is never the only signal: every fate also has a glyph and a text chip (`visual-language.md` §5). |
| 2 | **Split is the main visual moment.** | At j0-4 one column turns into two: on the left the rsc-layer reference, on the right the browser chunk. This happens in sync with the map token entering `layers` → `browser-chunks`. The ssr-layer copy appears as a `×2` stack badge on the right column, not as a third column. |
| 3 | **Disappearance is shown.** | Server-only lines fade to 30 % with a `0 B` chip, and j0-8 ends with a "0 B of JS in the browser" ledger. Disappearance is a line in the ledger, not a blank space. |
| 4 | **Code ↔ map linking.** | Each fate links to one entity per step, chosen only from entities in that step's camera or `states` (§5). Hovering a line highlights the entity. Selecting the entity highlights its lines. A fate with no entity in the current step shows an `off-map` chip and does not move the camera. |
| 5 | **One form per stage; a form change is an event.** | Each step shows exactly one artifact form (§5). The change is drawn as an **identifier morph**: the shared identifier (`DashboardNav`, `"…/DashboardNav.tsx"`, `layout-3c4d.js`, `$L1`) keeps a highlight while the text around it turns into the new form. Under reduced motion, before and after are shown side by side. |
| 6 | **Diffs, not full listings.** | Each step shows 3–8 relevant lines per pane. Everything else is folded into "n lines" rows. A pane cut from a real artifact carries an `abridged` chip, and real-world ids we leave out are written `…`. |
| 7 | **Map stays primary.** | The lens has three states: `off`, `peek` (a one-line ledger strip under the step panel) and `open` (L2 drawer, docked like the inspector, never over the canvas). **Auto-open is data, not inferred from `kind`**: it is set per step in the lens data. In J0 it is `open` only on steps where the **artifact form changes**: 3, 4, 7, 8, 9, 10. That covers every `transform` step plus j0-8 (`move`) and j0-10 (`check`). Both of those change the form (Flight → HTML + `__next_f`, document → patch), and leaving them closed would break rule 5. Every other step is `peek` or `off`. A user who pins the lens keeps it open everywhere. |

More conventions:

- **Frame lines** (`return (`, `)`, `}`, `</>`) inherit the fate of their block. They render as
  hairline ink, never carry a chip and never appear in a diff. They are not counted as fate
  carriers.
- **Type annotations** are a token-level fate, not a line fate: at j0-3 they get a ✂ strike,
  the same ✂ mark as the transformed-module glyph.
- **Other-journey lines** are lines that matter only outside J0. `journeys` on a specimen line lists
  the journeys other than J0 whose lens shows it (every line outside the ten J0 files carries it).
  J0 never shows them, so the same source serves every journey (§10).
- **What-if variants** are specimen files with `variant` set: the same path written differently for one
  contrast a journey draws (`cookies()` moved up, `getInitialProps` instead of `getServerSideProps`).
  They are not part of the app. A pane drawn from one says `what if` in its header.
- **Long lines and the `…` convention.** No lens line should take three or more rows at 1440 (paired
  panes hold about 38 columns, a single pane about 77). Long identifiers get break points after `_ / . (`
  and a comma (`<wbr>`, with `overflow-wrap: break-word`), so they wrap between words and break mid-word
  only when nothing else fits. Where a row is still too long, the data shortens it with `…` in place of
  arguments, payloads or keys the step does not discuss (`createServerReference("603a9c1e2b44…", …)`,
  `{"children":…}` → `{…}`); the full form stays in that journey's token table.
- **The followed object** (`visual-language.md` §10) keeps its orange `--accent-now` ring in the lens
  as well. At j0-2…4 the ring is on the `DashboardNav.tsx` lines; from j0-6 on it is on the line that
  carries the request (§5).

## 3. Fates

### 3.1 Where (hue): exactly one per line

| Fate | Glyph | Token | Hue (light / dark) | Means | What crosses the network |
|---|---|---|---|---|---|
| `server-only` | ⊘ | `--fate-server` = `--accent-data` | `#8250df` / `#a371f7` | Server Component code, server data code, `"use server"` bodies. Runs in the RSC runtime (or the action handler) and is never in a browser chunk. | its **output**, as Flight rows / HTML (`data`) |
| `client-boundary` | ⚡ outline | `--fate-client` = `--accent-code` | `#0969da` / `#58a6ff` | The `'use client'` directive, plus every line in a Server Component that imports or renders a Client Component. On the server it becomes a **reference**. | a reference: `N:I[…]` + `$LN` (`data + refs`) |
| `split` | ⚡ filled | `--fate-client` | same as above, filled swatch | The body of a `'use client'` module. It is compiled twice (ssr layer: renders HTML on the server; browser layer: hydrates in the tab), and in the rsc layer it is replaced by a proxy. | its **code**, as a browser chunk (`code`) |
| `action-id` | ⇄ | `--fate-action` (new) | `#bf3989` / `#db61a2` (target ≥ 4.5:1 on band fills, to verify) | The `'use server'` directive and the exported action signature. The function gets a hashed ID at build. | only the **ID**, inside `createServerReference(…)` |

`client-boundary` and `split` share the blue hue on purpose: the reference (outline) points at the
code (filled). The outline/filled pair repeats the client-component glyph's filled ⚡ mark.

### 3.2 When (gutter mark): zero or one per line

| Timing fate | Mark | Means | Main entity |
|---|---|---|---|
| `static-shell` | ○ | The line's output is prerendered at build: a whole ○ route, or the static shell of a ◐ route. | `prerendered-outputs`, `ppr-shell` |
| `suspended` | ⌛ | The output streams later. It is a `$L` hole first and then a row that fills it. | `suspense-hole` (via `flight` in J0) |
| `cached` | ▤ | Part of a `"use cache"` function. This is why a route can be ○. | `data-cache` |
| `shared-layout` | 🔒 | Kept on the client: on a navigation the server writes no rows for it; after a Server Action it is re-sent from the root and React reconciliation keeps its nodes and state. | `src-root-layout`, `src-dashboard-layout`, `client-components` |

The marks reuse symbols that already mean these things on the site: ○ from the build summary, ⌛
from the Suspense glyph and 🔒 from the `kept` state. ▤ is the cache drawer drawn as a single
character.

### 3.3 Outside the App Router: the same eight, no new fates

J1–J11 add the Pages Router, Proxy, config, a custom server and the optimizations. Each fits a fate
that already predicts its network chip, so the legend stays at eight (a ninth would have to beat
clarity, and none did):

| Code | Fate | Why it fits |
|---|---|---|
| Pages page component (`ProductPage`, `PostPage`), `_app`, `getInitialProps` | ⚡ `split` | Compiled for the server (HTML) and the browser (hydrate); its **code** crosses. In the Pages Router every component line is blue: that contrast with J0's violet is the lesson of J3 step 11. |
| `getServerSideProps`, `getStaticProps`, `getStaticPaths` and imports only they use, `_document` | ⊘ `server-only` | Cut from the browser build (`next_ssg`); only their **output** crosses, as props JSON. |
| `getStaticProps`/`getStaticPaths` lines, a page prerendered at build | ○ `static-shell` | Output exists at build (● SSG). |
| `revalidate: 60` | ▤ `cached` | The stored result is reused until it goes stale (ISR), the Pages counterpart of `cacheLife`. |
| `_app` and `ThemeProvider` | 🔒 `shared-layout` | Kept across a Pages navigation while the page under them swaps (J4 step 8). |
| `proxy.ts`, `next.config.js`, `server.js`, `pages/api/hello.ts` | ⊘ `server-only` | Never in a browser chunk; their effect crosses as headers, a status line or JSON. No mark: they run per request (or at startup), which is the unmarked default. |
| Inline `'use server'` function, `action={upgrade.bind(null, 'pro')}` | ⇄ `action-id` | Only the ID (plus the bound and the sealed arguments) crosses. |
| `dynamic(() => import(...))` in a Server Component | ⚡ `client-boundary` | It renders a Client Component: a reference crosses, the code follows in its own chunk. |

Dev-only behavior (HMR, Fast Refresh) is not a fate: it changes no line's destination, only when a new
copy of the same destination arrives. J9 draws it as forms (`json` messages, a `js` refresh
registration), not as a mark.

## 4. Specimen

This is the sample app from `experience-architecture.md` §2, with names taken from `entities.ts`
and the journeys. Every line has an id (`DN6`) so steps and data can refer to it. Columns: id ·
source · where · when · notes.
`·` = frame line. Illustrative data values (`"Ada"`, `ada@example.com`, `€12.00`) appear only in
outputs.

```text
app/layout.tsx                                                         RootLayout · src-root-layout
RL4  import localFont from 'next/font/local'                       ⊘       J11
RL5  const brand = localFont({ src: './fonts/brand.woff2' })       ⊘       J11: runs at build; brand.className goes on <html>
RL1  export default function RootLayout({ children }: { children: React.ReactNode }) {   ⊘  🔒
RL2    return <html lang="en"><body>{children}</body></html>                              ⊘  🔒
RL3  }                                                                                    ·

app/dashboard/layout.tsx                                     DashboardLayout · src-dashboard-layout
DL1  import DashboardNav from '@/components/DashboardNav'          ⚡B     rsc layer: resolves to the proxy
DL2  export default function DashboardLayout({ children }: { children: React.ReactNode }) {   ⊘ 🔒
DL3    return (                                                    ·
DL4      <section className="dashboard">                           ⊘  🔒
DL5        <DashboardNav />                                        ⚡B 🔒   becomes $L1 + 1:I[…]
DL6        {children}                                              ⊘        the slot: LayoutRouter (J5 step 5)
DL7      </section>                                                ·
DL8    )                                                           ·
DL9  }                                                             ·

components/DashboardNav.tsx                                  DashboardNav · src-dashboard-nav
DN1  'use client'                                                  ⚡B
DN2  import Link from 'next/link'                                  ⚡S
DN3  import { usePathname } from 'next/navigation'                 ⚡S
DN4  import { useState } from 'react'                              ⚡S
DN5  export default function DashboardNav() {                      ⚡S
DN6    const [open, setOpen] = useState<boolean>(false)            ⚡S 🔒   state survives j0-10; <boolean> is the ✂ demo
DN7    const pathname = usePathname()                              ⚡S
DN8    return (                                                    ·
DN9      <nav data-open={open}>                                    ⚡S
DN10       <button onClick={() => setOpen(!open)}>Menu</button>    ⚡S      handler exists only after hydration
DN11       <Link href="/dashboard/settings" aria-current={pathname === '/dashboard/settings'}>Settings</Link>  ⚡S
DN12       <Link href="/dashboard/billing">Billing</Link>          ⚡S      J6: the prefetched link
DN13     </nav>                                                    ·
DN14   )                                                           ·
DN15 }                                                             ·

app/dashboard/settings/page.tsx                              SettingsPage · src-settings-page
SP1  import { getProfile } from '@/lib/data'                       ⊘
SP2  import AccountSummary from '@/components/AccountSummary'      ⊘
SP3  import ProfileForm from '@/components/ProfileForm'            ⚡B
SP4  export default async function SettingsPage() {                ⊘  ○    ○ route (J1 step 13)
SP5    const profile = await getProfile()                          ⊘  ▤    the reason it can be ○
SP6    return (                                                    ·
SP7      <>                                                        ·
SP8        <AccountSummary profile={profile} />                    ⊘       name vanishes; only <dl> rows remain
SP9        <ProfileForm name={profile.name} />                     ⚡B      becomes $L2 with props {"name":"Ada"}
SP10     </>                                                       ·
SP11   )                                                           ·
SP12 }                                                             ·

components/AccountSummary.tsx                                AccountSummary · src-account-summary
AS1  export default function AccountSummary({ profile }: { profile: { email: string; plan: string } }) {   ⊘
AS2    return <dl><dt>Email</dt><dd>{profile.email}</dd><dt>Plan</dt><dd>{profile.plan}</dd></dl>         ⊘
AS3  }                                                             ·

components/ProfileForm.tsx                                   ProfileForm · src-profile-form
PF1  'use client'                                                  ⚡B
PF2  import { useActionState } from 'react'                        ⚡S
PF3  import { updateProfile } from '@/app/actions'                 ⇄       browser layer: createServerReference stub
PF4  export default function ProfileForm({ name }: { name: string }) {   ⚡S
PF5    const [state, formAction] = useActionState(updateProfile, null)   ⚡S  J7
PF6    return (                                                    ·
PF7      <form action={formAction}>                                ⚡S
PF8        <input name="name" defaultValue={name} />               ⚡S
PF9        <button>Save</button> {state?.ok && 'Saved'}            ⚡S      J7
PF10     </form>                                                   ·
PF11   )                                                           ·
PF12 }                                                             ·

app/actions.ts                                               updateProfile · src-actions
AC1  'use server'                                                  ⇄
AC2  import { updateTag } from 'next/cache'                        ⊘       J7
AC3  import { db } from '@/lib/data'                               ⊘       J7
AC4  export async function updateProfile(prevState: unknown, formData: FormData) {   ⇄   ID 603a9c1e2b44…
AC5    await db.update('profile', { name: String(formData.get('name')) })           ⊘   J7 step 10
AC6    updateTag('profile')                                        ⊘       J7 step 12
AC7    return { ok: true }                                         ⊘       J7: crosses as field a
AC8  }                                                             ·

lib/data.ts                                                  abridged: db folded (4 lines)
DA1  import { cacheLife, cacheTag } from 'next/cache'              ⊘  ▤
DA2  export async function getProfile() {                          ⊘  ▤
DA3    'use cache'                                                 ⊘  ▤
DA4    cacheTag('profile'); cacheLife('hours')                     ⊘  ▤    J7/J8: the tag updateTag sweeps
DA5    return db.find('profile')                                   ⊘  ▤
DA6  }                                                             ·
DA7  export async function getInvoices(session?: string) {         ⊘  ⌛    J8: no "use cache", runs every request
DA8    return db.findMany('invoices', { session })                 ⊘  ⌛    J8
DA9  }                                                             ·

app/dashboard/billing/page.tsx                               BillingPage · src-billing-page
BP1  import { Suspense } from 'react'                              ⊘  ○
BP2  import InvoiceList from '@/components/InvoiceList'            ⊘  ⌛
BP3  export default async function BillingPage() {                 ⊘  ○    ◐ route (J1 step 13)
BP4    return (                                                    ·
BP5      <>                                                        ·
BP6        <h1>Billing</h1>                                        ⊘  ○
BP7        <Suspense fallback={<InvoicesSkeleton />}>              ⊘  ○    the fallback is in the shell
BP8          <InvoiceList />                                       ⊘  ⌛    becomes "$L2", filled later
BP9        </Suspense>                                             ·
BP10     </>                                                       ·
BP11   )                                                           ·
BP12 }                                                             ·
BP13 function InvoicesSkeleton() { return <p>Loading invoices…</p> }   ⊘  ○

components/InvoiceList.tsx                                   InvoiceList (part of src-billing-page)
IL1  import { cookies } from 'next/headers'                        ⊘  ⌛
IL2  import { getInvoices } from '@/lib/data'                      ⊘  ⌛
IL3  export default async function InvoiceList() {                 ⊘  ⌛
IL4    const session = (await cookies()).get('session')?.value     ⊘  ⌛    the read that makes it dynamic
IL5    const invoices = await getInvoices(session)                 ⊘  ⌛
IL6    return <ul>{invoices.map((inv) => <li key={inv.id}>{inv.total}</li>)}</ul>   ⊘  ⌛
IL7  }                                                             ·
```

**J0 files count:** 10 files, 93 lines (88 as J0 shipped, plus RL4–RL5 and DA7–DA9 for J8 and
J11, which J0 never shows). Of J0's original 88, 60 carry a fate and 28 are frame lines; J0 shows 42
of the 60. The other 18 (PF5, PF9, AC2–AC3, AC5–AC7, DA1–DA5, IL1–IL5, BP2) belong to J6–J8 or stay
folded behind a line that is shown. For settings, ○ sits on SP4 only, because the whole route is
prerendered. For billing it sits on individual lines, because there the shell and the hole split
the page.

**The rest of the app (J1–J11).** Ids are file prefix + number and never change; a line added later
takes the next free number, wherever it sits in the file (RL4–RL5 sit above RL1).

```text
proxy.ts                                                     proxy · proxy                      J2 J10 (PX2 J1)
PX1  import { NextResponse, type NextRequest } from 'next/server'  ⊘
PX2  export function proxy(request: NextRequest) {                 ⊘       Node by default since 16.0
PX3    if (!request.cookies.has('session')) {                      ⊘
PX4      return NextResponse.redirect(new URL('/login', request.url))   ⊘  the decision travels back as headers
PX5    }                                                           ·
PX6    return NextResponse.next()                                  ⊘       x-middleware-next: the ladder climbs on
PX7  }                                                             ·
PX8  export const config = { matcher: ['/dashboard/:path*'] }      ⊘       a regex in functions-config-manifest.json

next.config.js                                               nextConfig (no map entity)
NC1  module.exports = {                                            ·
NC2    cacheComponents: true,                                      ⊘       J1 J8 J11: PPR for billing
NC3    async headers() { return [{ source: '/:path*', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] }] },   ⊘  J2 J9 J10: step 1
NC4    async redirects() { return [{ source: '/old-settings', destination: '/dashboard/settings', permanent: true }] },   ⊘  J2 J9: step 2, 308
NC5    experimental: { optimizePackageImports: ['ui-kit'] },       ⊘       J1 J11
NC6    output: 'standalone',                                       ⊘       J1 J10 J11
NC7  }                                                             ·

server.js                                                    server.js · custom-server           J10 (SV4 J9)
SV1  const { createServer } = require('node:http')                ⊘
SV2  const { parse } = require('node:url')                        ⊘
SV3  const next = require('next')                                 ⊘
SV4  const app = next({ dev: process.env.NODE_ENV !== 'production' })   ⊘
SV5  const handle = app.getRequestHandler()                       ⊘       the handler router-server uses
SV6  app.prepare().then(() => {                                   ⊘       loads the tables next start would load
SV7    createServer((req, res) => {                               ⊘       our server owns the socket
SV8      const parsedUrl = parse(req.url, true)                   ⊘
SV9      if (parsedUrl.pathname === '/healthz') { res.statusCode = 200; return res.end('ok') }   ⊘  invisible to Next.js
SV10     if (parsedUrl.pathname === '/legacy/settings') return handle(req, res, { ...parsedUrl, pathname: '/dashboard/settings' })   ⊘
SV11     handle(req, res, parsedUrl)                              ⊘       the same ladder as next start
SV12   }).listen(3000)                                            ⊘
SV13 })                                                           ·

pages/_app.tsx                                               App · pages-app                     J3 J4 (AP2, AP8 J11)
AP1  import type { AppProps } from 'next/app'                     ⚡S      type-only: erased
AP2  import Script from 'next/script'                             ⚡S
AP3  import { ThemeProvider } from '@/components/ThemeProvider'   ⚡S
AP4  export default function App({ Component, pageProps }: AppProps) {   ⚡S 🔒
AP5    return (                                                   ·
AP6      <ThemeProvider>                                          ⚡S 🔒   keeps its state when the page swaps
AP7        <Component {...pageProps} />                           ⚡S      the slot: ProductPage, then PostPage
AP8        <Script src="https://example.com/analytics.js" strategy="lazyOnload" />   ⚡S   runs in browser idle time
AP9      </ThemeProvider>                                         ·
AP10   )                                                          ·
AP11 }                                                            ·

components/ThemeProvider.tsx                                 ThemeProvider · pages-app           J3 J4
TP1  import { createContext, useState } from 'react'               ⚡S
TP2  export const ThemeContext = createContext<unknown>(null)      ⚡S
TP3  export function ThemeProvider({ children }: { children: React.ReactNode }) {   ⚡S
TP4    const [theme, setTheme] = useState('light')                 ⚡S 🔒   the state J4 keeps when the page swaps
TP5    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>   ⚡S   no tags in the HTML
TP6  }                                                             ·

pages/_document.tsx                                          Document · pages-document           J3 (DC2 J4)
DC1  import { Html, Head, Main, NextScript } from 'next/document' ⊘
DC2  export default function Document() {                         ⊘       never in a browser chunk
DC3    return <Html><Head /><body><Main /><NextScript /></body></Html>   ⊘   <NextScript/> writes the chunk tags
DC4  }                                                            ·

pages/products/[id].tsx                                      ProductPage · pages-product-page    J3 J4
PR1  import Link from 'next/link'                                 ⚡S
PR2  import { db } from '@/lib/data'                              ⊘       only getServerSideProps uses it
PR3  export async function getServerSideProps({ params }: { params: { id: string } }) {   ⊘   ƒ: a hole in the chunk
PR4    const product = await db.find('product', params.id)       ⊘
PR5    return { props: { product } }                              ⊘       crosses as JSON
PR6  }                                                            ·
PR7  export default function ProductPage({ product }: { product: { name: string } }) {   ⚡S   the whole page is browser code
PR8    return (                                                   ·
PR9      <article>                                                ⚡S
PR10       <h1>{product.name}</h1>                                ⚡S
PR11       <Link href="/posts/7">Read the post</Link>             ⚡S      J4: prefetched in the viewport
PR12     </article>                                               ·
PR13   )                                                          ·
PR14 }                                                            ·

pages/posts/[id].tsx                                         PostPage · pages-post-page          J1 J3 J4 J8 J11
PO1  import Image from 'next/image'                               ⚡S      J11
PO2  import { db } from '@/lib/data'                              ⊘
PO3  export async function getStaticPaths() {                     ⊘  ○    runs at build
PO4    return { paths: [{ params: { id: '7' } }], fallback: 'blocking' }   ⊘  ○   unknown id: first visitor waits
PO5  }                                                            ·
PO6  export async function getStaticProps({ params }: { params: { id: string } }) {   ⊘  ○   ●
PO7    const post = await db.find('post', params.id)             ⊘  ○
PO8    return { props: { post }, revalidate: 60 }                 ⊘  ▤    ISR
PO9  }                                                            ·
PO10 export default function PostPage({ post }: { post: { title: string } }) {   ⚡S ○   HTML at build, code crosses anyway
PO11   return (                                                   ·
PO12     <article>                                                ⚡S
PO13       <Image src="/hero.jpg" width={1280} height={720} sizes="100vw" alt="" />   ⚡S   J11: box reserved, srcset lists every device width
PO14       <h1>{post.title}</h1>                                  ⚡S
PO15     </article>                                               ·
PO16   )                                                          ·
PO17 }                                                            ·

pages/api/hello.ts                                           handler · route-handler             J2
AH1  import type { NextApiRequest, NextApiResponse } from 'next'  ⊘
AH2  export default function handler(req: NextApiRequest, res: NextApiResponse) {   ⊘   no React, no HTML
AH3    res.json({ ok: true })                                     ⊘       crosses as JSON
AH4  }                                                            ·
```

What-if variants (`variant` set; abridged to the lines that differ):

```text
app/dashboard/settings/page.tsx   what if · J7: an inline action next to the page
SA1  export default async function SettingsPage() {               ⊘
SA2    const secret = process.env.BILLING_KEY                     ⊘       captured: crosses sealed
SA3    async function upgrade(plan: string) {                     ⇄       its own action ID
SA4      'use server'                                             ⇄
SA5      await db.update('plan', { plan, key: secret })           ⊘
SA6    }                                                          ·
SA7    return <form action={upgrade.bind(null, 'pro')}><button>Upgrade</button></form>   ⇄   'pro' crosses as plain JSON
SA8  }                                                            ·

app/dashboard/settings/page.tsx   what if · J11: ProfileForm behind next/dynamic
SD1  import dynamic from 'next/dynamic'                           ⊘
SD2  const ProfileForm = dynamic(() => import('@/components/ProfileForm'), { loading: () => <p>Loading form…</p> })   ⚡B   replaces SP3

components/ProfileForm.tsx        what if · J1, J11: a button from a barrel package
PB1  import { Button } from 'ui-kit'                              ⚡S      rewritten to the one file that defines Button

app/actions.ts                    what if · J7, J8: revalidateTag instead of updateTag
AV1  import { revalidateTag } from 'next/cache'                   ⊘
AV2    revalidateTag('profile', 'max')                            ⊘       marks stale only: no f in the response

app/dashboard/billing/page.tsx    what if · J8: cookies() read above the boundary
BV1  export default async function BillingPage() {                ⊘  ⌛    the whole page is now in the hole
BV2    const session = (await cookies()).get('session')?.value    ⊘  ⌛    moved up from IL4
BV3    return (                                                   ·
BV4      <Suspense fallback={<InvoicesSkeleton />}>               ⊘  ⌛    no longer in the shell
BV5        <InvoiceList session={session} />                      ⊘  ⌛
BV6      </Suspense>                                              ·
BV7    )                                                          ·
BV8  }                                                            ·

pages/products/[id].tsx           what if · J3, J4: getInitialProps instead of getServerSideProps
PI1  ProductPage.getInitialProps = async ({ query }: { query: { id: string } }) => {   ⚡S   server first, browser on navigation
PI2    const res = await fetch(`https://api.example.com/products/${query.id}`)   ⚡S   anything it reads ships in the chunk
PI3    return { product: await res.json() }                       ⚡S
PI4  }                                                            ·

components/DashboardNav.tsx       what if · J9: edits saved during next dev
NE1        <button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>   ⚡S   edit 1: DN10 with new markup (j9-9)
NE2  // @refresh reset                                            ⚡S      remount on every edit (j9-12)
NE3    useEffect(() => { document.title = pathname }, [pathname])   ⚡S   a new hook: new signature (j9-12)

components/AccountSummary.tsx     what if · J9: edit 2, a Server Component
AE1    return <dl><dt>Email address</dt><dd>{profile.email}</dd><dt>Plan</dt><dd>{profile.plan}</dd></dl>   ⊘   edit 2: AS2 relabelled (j9-13, j9-14)

app/actions.ts                    what if · J7: redirect() after the update
AR1  import { redirect } from 'next/navigation'                   ⊘
AR2    redirect('/dashboard/billing')                             ⊘       replaces AC7: x-action-redirect instead of f (j7-16)

app/dashboard/billing/loading.tsx what if · J8: a boundary above the cookies-up page
BL1  export default function Loading() {                          ⊘  ○    Next wraps the page in <Suspense fallback={<Loading />}>
BL2    return <p>Loading billing…</p>                             ⊘  ○    the fallback, prerendered into the shell (j8-17)
BL3  }                                                            ·

server.js                         what if · J10: the deprecated app.render
SR1      if (parsedUrl.pathname === '/render/settings') return app.render(req, res, '/dashboard/settings', parsedUrl.query)   ⊘   (j10-9)

next.config.js                    what if · J10: file routes hidden from the server
NV1    useFileSystemPublicRoutes: false,                          ⊘       not access control (j10-12)
```

A what-if line on a new row is the edit itself, so a reduced-motion before pane leaves it out
(`beforePanes`): J9's before panes show DN10 and AS2, not NE1 and AE1.

**Whole specimen count:** 31 files (19 app files + 12 variants), 213 lines, 60 frame lines. By hue:
⊘ 95 · ⚡B 7 · ⚡S 45 · ⇄ 6. By mark: ○ 13 · ⌛ 14 · ▤ 7 · 🔒 9. `codeLens.test.ts` pins these
numbers. Outside the ten J0 files every non-frame line names the journeys whose lens shows it
(`journeys`); a line a journey links by `from` is always tagged with that journey.

Specimen notes:

- `aria-current={pathname === '/dashboard/settings'}` is a boolean `aria-current`, which React
  renders as `"true"`. It's there so `usePathname` has a visible effect in the HTML at j0-8.
- `db` in `lib/data.ts` is the data handle J7 calls `db.update`. `experience-architecture.md` §2 lists
  only `getProfile`/`getInvoices`, so the specimen keeps `db` folded.
- `updateProfile(prevState, formData)` follows J7, and `experience-architecture.md` §2 now writes
  the same signature (§7, item 6).
- The app files follow `experience-architecture.md` §2 and the journey internals: `proxy.ts` exports
  `proxy` and `config.matcher` (16.0 rename, concept-model V1/V2); `next.config.js` (not `.ts`, as the
  journeys write it) holds `cacheComponents` at the top level (16.0) and `optimizePackageImports`
  under `experimental`; `server.js` is the J10 internals' code verbatim.
- `ThemeProvider`, `brand.woff2`, `BILLING_KEY`, `upgrade`/`'pro'` and `api.example.com` are
  illustrative names (no journey fixes them). `/hero.jpg` sits on the post page because the sample
  app has no other page for it; it is a Pages Router page, so `next/image` there is ⚡S.
- Not in the specimen on purpose: a `server.on('upgrade', …)` forward (J9 step 16, J10 step 13: the
  API is not verified here, so those steps stay `off`) and `_app.getInitialProps`.
  `useFileSystemPublicRoutes` and `app.render` are what-if variants (NV1, SR1), not part of the app:
  the app's own `next.config.js` keeps file routes and its `server.js` uses `handle` only.
- `AccountSummary` keeps receiving `profile` as a prop (J0's narrative), so J8 step 2 states the
  memoization as a hypothetical ("had AccountSummary called getProfile() itself") and shows SP5/SP8.

## 5. J0 step by step

### 5.1 Summary

| Step | Lens | Form | Visible | Change vs previous | Fates lit → entity | Motion · reduced motion |
|---|---|---|---|---|---|---|
| j0-1 | off | none | — | — | — | — · — |
| j0-2 | peek | TSX (ledger only) | `DashboardNav.tsx` + `DL5` | the source appears | ⚡B → `src-dashboard-nav`, `src-dashboard-layout` · ⚡S → `src-dashboard-nav` | swatches fade in · drawn |
| j0-3 | open | JS (one file, client-layer compile) | `DashboardNav.js` | 3 morphed, 1 new, ✂ on types | ⚡B, ⚡S → `swc` | **transform** morph · before/after panes |
| j0-4 | open | JS with references (two columns) | rsc proxy · `layout-3c4d.js` | 10 ⚡S lines gone on the left; proxy new; body same on the right | ⚡B → `layers` · ⚡S → `browser-chunks` | **split** (reference + pack) · three static panes |
| j0-5 | peek | manifest JSON + chunk names (ledger) | 2 client rows, 1 action row, server chunks, `settings.html`/`.rsc` | form change: code → rows | ⚡B → `client-reference-manifest` · ⇄ → `server-reference-manifest` · ⊘ → `server-chunks` · ⚡S → `browser-chunks` · ○ → `prerendered-outputs` | **connect** · dotted paths drawn |
| j0-6 | peek (dimmed) | unchanged ledger + request chip | `GET /dashboard/settings` | nothing in code changes | none lit | — · — |
| j0-7 | open | Flight rows | `1:I`, `2:I`, `0:{…}`, 3 inline element excerpts | `<DashboardNav />` → `$L1`; `<AccountSummary …/>` → `["$","dl",…]` | ⊘ → `rsc-runtime-entity` · ⚡B → `flight`, `client-reference-manifest` · ⚡S → `ssr-runtime-entity` | **reference** + identifier morph · before/after |
| j0-8 | open | HTML + `self.__next_f.push` | 7 lines of document + 0 B ledger | rows wrapped in `<script>`; refs → `<script src>` | ⊘ → `html` (0 B on `browser-chunks`) · ⚡S → `browser-chunks` · ⚡B → `next-f` · ⇄ → `browser-chunks` | **wrap** + **fade to 0 B** · static ledger |
| j0-9 | open | hydrated DOM | 4 DOM lines | no text change; ⚡ lines go live | ⚡S → `client-components` · ⚡B → `react-client` · ⊘ → `dom` | **light-up** · `hydrated` / `static` chips |
| j0-10 | open | Flight patch | request line, `1:`, `0:{…}`, 2 inline excerpts, `2:` | settings rows gone; billing rows new; 🔒 rows absent | ⊘ → `rsc-runtime-entity` · ○ → `flight` · ⌛ → `suspense-hole` · 🔒 → `src-root-layout`, `src-dashboard-layout`, `client-components` · slot → `layout-router` | **swap** + **fill** · before/after panes |

### 5.2 Details

Each step lists the excerpt shown, what changed, and why the lens does what it does. The right-hand
column of each excerpt holds the fate, the source-line id it comes from, and the change
(`new` / `same` / `gone` / `morph`).

#### j0-1 · Three bands of time · lens `off`

No artifact exists yet. Showing a legend before there is a file to apply it to would teach symbols
with nothing to attach them to. The step panel shows only a disabled `Code lens · from step 2` tab.

#### j0-2 · A module with a directive · lens `peek`

The peek strip is a one-line ledger:

```text
DashboardNav.tsx · 15 lines · ⚡B 1 (DN1) · ⚡S 10 (DN2–DN7, DN9–DN12) · imported by dashboard/layout.tsx DL5 ⚡B
```

Expanding it (L2, user action) shows the colored source DN1–DN12 with `DL5` pinned above it as
context. This is the "color once" moment. It stays a peek because j0-2 is a `move` step: the map
token is the subject. j0-3 opens the lens with this exact view as its "before" pane, so a user who
never expands still sees the colored source first. Hovering DN1 highlights `src-dashboard-nav`.
Hovering DL5 highlights `src-dashboard-layout`.

#### j0-3 · The compiler sees one file · lens `open` · form JS

`abridged` · SWC output for the client layers (ssr and browser are the same here), shown
unminified:

```text
/* __next_internal_client_entry_do_not_use__ default auto */                 ⚡B  DN1   morph  'use client' → marker comment
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";              ⚡S  —     new    automatic JSX runtime
                                                     … 3 imports (DN2–DN4)        same
export default function DashboardNav() {                                     ⚡S  DN5   same
    const [open, setOpen] = useState(false);                                 ⚡S  DN6   ✂      <boolean> removed
    return _jsxs("nav", { "data-open": open, children: [                     ⚡S  DN9   morph  <nav …> → _jsxs("nav", …)
        _jsx("button", { onClick: () => setOpen(!open), children: "Menu" }), ⚡S  DN10  morph
                                                     … 2 Link calls (DN11–DN12)   morph
```

- **Change:** the directive is gone and a marker comment takes its place (that is the "metadata" in
  j0-3 internals). One import is new. Types are ✂. JSX becomes calls.
- **Links:** ⚡B and ⚡S → `swc`. The marker line also → `src-dashboard-nav` (kept).
- **Motion:** `transform`. The TSX pane cross-fades into the JS pane line by line. Each morphed line
  keeps its identifier (`DashboardNav`, `nav`, `button`) highlighted while the text around it
  changes. ✂ draws on `<boolean>`, which then collapses.
- **Reduced motion:** TSX (before) and JS (after) side by side, with morph rows aligned by source id
  and ✂ marks drawn.
- **L3 note:** in the **rsc** layer the same transform replaces the whole module (step 4). SWC
  doesn't know who imports the file. The bundler does.

#### j0-4 · The bundler sees the graph · lens `open` · form JS with references (split)

Left column: `server · rsc layer`, linked to `layers`.

```text
import { registerClientReference } from "react-server-dom-turbopack/server";   ⚡B  DN1        new
export default registerClientReference(                                         ⚡B  DN5        morph  function → reference
    function() { throw new Error("Attempted to call the default export of … from the server …"); },   folded
    "…/components/DashboardNav.tsx",                                            ⚡B  —          new    the key step 5 looks up
    "default",                                                                  ⚡B  —          new
);
                                                         … 10 ⚡S lines DN2–DN12        gone   (0 lines on the server side)
```

Right column: `browser · app-pages-browser layer → static/chunks/app/dashboard/layout-3c4d.js`,
linked to `browser-chunks`, with badge `×2 · also in the ssr layer (stays on the server, renders HTML in step 7)`.
`abridged`, shown unminified:

```text
function DashboardNav() {                                                       ⚡S  DN5    same
    const [open, setOpen] = useState(false);                                    ⚡S  DN6    same
    return _jsxs("nav", { "data-open": open, children: [ … ] });                ⚡S  DN9–12 same
}
```

- **Change:** one column becomes two. On the left the body is gone and a reference is new. On the
  right the body is the same, now inside a named chunk.
- **Links:** ⚡B → `layers` (the rsc layer's resolver rule). ⚡S → `browser-chunks`. The chunk
  name in the header → `browser-chunks` as well. `client-reference-manifest` is pulsed as the
  destination of the `"…/DashboardNav.tsx"` string, which becomes its key in step 5.
- **Motion:** `split`. The pane widens. The ⚡S lines duplicate. The left copy collapses into the
  `registerClientReference` call (verb `reference`), and the right copy slides into a chunk frame
  labelled `layout-3c4d.js` (verb `pack`). This runs at the same time and for the same duration as
  the map token entering `layers`/`browser-chunks`. The `"…/DashboardNav.tsx"` string keeps its
  highlight in both columns.
- **Reduced motion:** three static panes (source · rsc proxy · browser chunk), with `gone` / `new` /
  `same` chips.
- **L3 note:** with `--webpack` the import is
  `react-server-dom-webpack/server`, written by `next-flight-loader`. A CommonJS client module gets
  `createClientModuleProxy(…)` (Turbopack) or `createProxy(…)` (Webpack) instead.

#### j0-5 · The shelf between build and runtime · lens `peek` · form manifest JSON + chunk names

j0-5 is an `explain` step, and the shelf is an inventory. A ledger answers "where did each color
go?" in five rows, which full JSON would bury. Peek ledger:

```text
⚡B  "…/components/DashboardNav.tsx" → chunks ["static/chunks/app/dashboard/layout-3c4d.js"]          client-reference-manifest
⚡B  "…/components/ProfileForm.tsx"  → chunks ["static/chunks/app/dashboard/settings/page-5e6f.js"]   client-reference-manifest
⇄   "603a9c1e2b44…" → updateProfile · app/actions.ts · worker app/dashboard/settings/page          server-reference-manifest
⊘   server/app/layout.js · server/app/dashboard/layout.js · server/app/dashboard/settings/page.js   server-chunks only
○   server/app/dashboard/settings.html · settings.rsc   (○ because SP5 is ▤)                         prerendered-outputs
```

Expanded (L3, `abridged`), the real 16.3 manifest shape:

```text
globalThis.__RSC_MANIFEST["/dashboard/settings/page"] = {
  clientModules: {
    "…/components/DashboardNav.tsx": { id: …, name: "*", chunks: ["static/chunks/app/dashboard/layout-3c4d.js"], async: false },
    "…/components/ProfileForm.tsx":  { id: …, name: "*", chunks: ["static/chunks/app/dashboard/settings/page-5e6f.js"], async: false }
  }, ssrModuleMapping: {…}, …
}
server-reference-manifest.json: { node: { "603a9c1e2b44…": { workers: { "app/dashboard/settings/page": { moduleId: …, async: false } },
                                  exportedName: "updateProfile", filename: "app/actions.ts" } }, edge: {}, encryptionKey: "…" }
```

- **Change:** the form changes from code to rows. The proxy's path string becomes a manifest key,
  and the chunk name becomes a chunk entry. ⇄ shows up here for the first time: J0 never compiles
  `actions.ts` in view, but the shelf shows its result.
- **Links:** as in the ledger's right column (all are in j0-5 `states`).
- **Motion:** `connect`. Each ledger row draws a dotted line to its shelf entity on the map.
- **Reduced motion:** the paths are drawn complete.

#### j0-6 · A request meets the ladder · lens `peek`, dimmed

The j0-5 ledger stays, at 35 % opacity, with a header chip `GET /dashboard/settings · no code
changes form here`. The point of the step is that routing reads `routes-manifest` and leaves code
alone. A dimmed but present ledger shows "same artifacts" without competing with the ladder. An
empty lens would read as "the lens broke". No fate is lit and no links are active.

#### j0-7 · Two runtimes, one stream · lens `open` · form Flight rows

`abridged`. Row numbers follow `compare/responses.ts` (c4-3) and the j5-10 internals: `1:I` DashboardNav,
`2:I` ProfileForm, `0:` the root row with the tree and segments inline. Module ids are elided as `…`:

```text
1:I[…,["static/chunks/app/dashboard/layout-3c4d.js"],"default"]           ⚡B  DL5   new   reference to step 4's chunk
2:I[…,["static/chunks/app/dashboard/settings/page-5e6f.js"],"default"]    ⚡B  SP9   new
0:{"P":…,"c":["","dashboard","settings"],"q":"","i":false,"f":[[["",{…}],…,…,false]],"S":true,…,"b":"k7Qm2xLp9"}   ⊘ tree + seed
   …["$","section",null,{"className":"dashboard","children":[["$","$L1",null,{}],…]}]…     ⊘ DL4 · ⚡B DL5   morph  <DashboardNav /> → ["$","$L1",null,{}]
   …["$","dl",null,{"children":[…,["$","dd",null,{"children":"ada@example.com"}],…]}]…   ⊘ AS2   morph  <AccountSummary …/> → its output
   …["$","$L2",null,{"name":"Ada"}]…                                         ⚡B  SP9   morph  props become data
                                  … 6 rows folded: Next's own client references (LayoutRouter …), "$Sreact.fragment", metadata
```

- **Change:** component names turn into references (⚡B) or disappear behind their output (⊘).
  `getProfile()` is now just `"Ada"`. ⚡S lines aren't here, because the code isn't in Flight.
- **Links:** ⊘ → `rsc-runtime-entity`. ⚡B `I` rows → `client-reference-manifest` (the lookup) and
  `$L` → `flight`. ⚡S is shown as a ghost row `rendered by the ssr copy → html` → `ssr-runtime-entity`.
  The tee (`flight-tee`) is a `⑂ ×2` badge on the pane header: these bytes go to the SSR runtime
  and also into the page.
- **Motion:** `reference`. Each JSX line from SP/DL/AS slides in from the left edge and morphs into
  its row. The ⚡B identifiers keep their highlight through `<DashboardNav />` → `$L1` → `1:I[…]`.
- **Reduced motion:** source lines on the left and rows on the right, aligned by source id.
- **Footnote chip** (§7, item 4): `○ route: this render ran at build; a production GET is served these rows from settings.rsc`.

#### j0-8 · What crosses the network · lens `open` · form HTML + `self.__next_f.push`

`abridged`:

```text
<html lang="en"><body><section class="dashboard">                                       ⊘  RL2 DL4  output only
<nav data-open="false"><button>Menu</button><a href="/dashboard/settings" aria-current="true">Settings</a>…</nav>   ⚡S DN9–12  ssr copy's HTML
<dl><dt>Email</dt><dd>ada@example.com</dd>…</dl>                                         ⊘  AS2      output only
<form …><input name="name" value="Ada"/><button>Save</button></form>                     ⚡S PF7–9  action fields folded (J7)
<script src="/_next/static/chunks/app/dashboard/layout-3c4d.js" async=""></script>       ⚡S  —       new   code crosses
<script>(self.__next_f=self.__next_f||[]).push([0])</script>                             —   —       new   bootstrap
<script>self.__next_f.push([1,"1:I[…,[\"static/chunks/app/dashboard/layout-3c4d.js\"],\"default\"]\n…"])</script>   ⚡B DL5  morph  row → inline chunk
```

Footer ledger, always shown on this step:

```text
0 B of JS in the browser   ⊘ RootLayout · DashboardLayout · SettingsPage · AccountSummary · getProfile · updateProfile body
1 ID                       ⇄ updateProfile → createServerReference("603a9c1e2b44…", callServer, void 0, findSourceMapURL, "updateProfile") in page-5e6f.js
```

- **Change:** Flight rows are wrapped in `<script>` pushes. Client references become `<script src>`
  tags. ⊘ lines appear only as markup.
- **Links:** ⊘ markup → `html`, with the `0 B` chip on `browser-chunks`. ⚡S `<script src>` →
  `browser-chunks`, and its HTML → `html`. ⚡B push row → `next-f`. ⇄ ID → `browser-chunks`.
  The network double line on the map gets the matching chips (`code` for blue, `data + refs` for the
  push rows). That is rule 1 paying off: the hue already predicted the chip.
- **Motion:** `wrap`. Each row slides into a `<script>` frame. Then **fade to 0 B**: a narrow ghost
  column of source swatches on the left fades its ⊘ bars to 30 % and stamps `0 B` on each, while ⚡S
  bars connect to the `<script src>` line.
- **Reduced motion:** the ledger and the ghost column drawn in their final state.

#### j0-9 · Paint first, hydrate the islands · lens `open` · form hydrated DOM

```text
<section class="dashboard">                 ⊘  DL4      static · as painted
<nav data-open="false">…</nav>              ⚡S DN9–12   hydrated · open=false · onClick live
<dl>…ada@example.com…</dl>                  ⊘  AS2      static · as painted
<form>…</form>                              ⚡S PF7–9    hydrated · formAction live (J7)
self.__next_f                               ⚡B          consumed: rows replayed into the React tree
```

- **Change:** no text changes, and that is the point. Hydration attaches behavior and doesn't
  produce markup. The form stays DOM. Only the chips change.
- **Links:** ⚡S → `client-components`. ⚡B → `react-client`. ⊘ → `dom`.
- **Motion:** `light-up`. A glow spreads over ⚡S lines only, in sync with the canvas.
- **Reduced motion:** the `hydrated` / `static` chips (`visual-language.md` §8, light-up).

#### j0-10 · The central claim · lens `open` · form Flight patch

`abridged`. The response is `text/x-component`, with no HTML:

```text
GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb · RSC: 1 · Next-Router-State-Tree: …"settings"…      header line (context)
1:"$Sreact.suspense"                                                                    —        new
0:{"f":[["children","dashboard","children","billing",[…tree patch…],[…seed…],…,false]],"q":"","i":false,"S":false,…,"b":"k7Qm2xLp9"}   ⊘ starts at billing
   …["$","h1",null,{"children":"Billing"}]…                                             ⊘ ○ BP6       new
   …["$","$1",null,{"fallback":["$","p",null,{"children":"Loading invoices…"}],"children":"$L2"}]…   ⊘ ○ BP7 · ⌛ BP8   new   hole
2:["$","ul",null,{"children":[["$","li","inv_1",{"children":"€12.00"}],…]}]             ⊘ ⌛ IL6     new   fills $L2 later
DashboardLayout {children} → LayoutRouter swaps settings for billing                     ⊘ DL6        same  the slot: replaced, not re-rendered
                                no rows: RootLayout · DashboardLayout · DashboardNav    🔒 RL DL DN6  kept
```

- **Change:** every settings row from j0-7 is `gone` (shown struck in the before pane). Billing rows
  are `new`. The 🔒 lines produce **no rows at all**, and that absence is itself a line in the
  diff.
- **Links:** ⊘ → `rsc-runtime-entity` (BillingPage only). ○ → `flight`. ⌛ → `suspense-hole`
  (§7, item 5). 🔒 → `src-root-layout`, `src-dashboard-layout`, `client-components` (DN6 keeps
  `open`). The DL6 `{children}` slot → `layout-router`; its pane header names `src-settings-page`
  (replaced) and `src-billing-page` (new).
- **Motion:** `swap`. The settings rows slide out, the billing rows slide in, and the 🔒 lines get
  lock glyphs. Then `fill`: the `"$L2"` token is dashed until row `2:` arrives, then turns solid.
- **Reduced motion:** before (j0-7 rows) and after (patch) panes, with `replaced` / `new` / `kept`
  chips and the hole drawn filled with a `later` chip.
- **Checks:** the third check ("the manifest is sent to the browser") links to the j0-8 pane. It
  shows `I` rows and no `clientModules`.
- **L3 note:** with prefetch (J6) the ○ shell rows may already be in the client cache, and only the
  ⌛ part is fetched on click. J0 shows the full patch.

## 6. Token verification

Every Next.js or React token the lens prints, with the place it was checked. "v16.3.8" means
`https://github.com/vercel/next.js/blob/v16.3.8/<path>`. "canary" was checked 2026-10-05 and
matched 16.3.8 unless noted.

| Token as shown | Where checked |
|---|---|
| `/* __next_internal_client_entry_do_not_use__ default auto */`; directive removed in non-rsc layers | source: `crates/next-custom-transforms/src/transforms/react_server_components.rs` (`prepend_comment_node`, `remove_top_level_directive`), v16.3.8 + canary |
| rsc layer replaces a client module (SWC: `createProxy` from `private-next-rsc-mod-ref-proxy`) | same file, `to_module_ref` |
| `registerClientReference(function(){throw…}, "<path>", "default")` from `react-server-dom-turbopack/server` (ESM), `createClientModuleProxy` (CJS) | source: `crates/next-core/src/next_client_reference/ecmascript_client_reference/ecmascript_client_reference_module.rs`, v16.3.8 |
| `--webpack`: same call from `react-server-dom-webpack/server`; CJS → `createProxy` | source: `packages/next/src/build/webpack/loaders/next-flight-loader/index.ts`, v16.3.8 |
| `import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"` | `runtime: 'automatic'` in source `packages/next/src/build/swc/options.ts` v16.3.8; the `_jsx` alias spelling is SWC's standard output (not checked line by line) |
| `registerServerReference(updateProfile, "<id>", null)`, `ensureServerEntryExports([...])`, imports from `private-next-rsc-server-reference` / `private-next-rsc-action-validate`, `/* __next_internal_action_entry_do_not_use__ {"<id>":{"name":"updateProfile"}} */` | source: `server_actions.rs` (`annotate_ident_as_server_reference`, ensure block) v16.3.8; fixture `crates/next-custom-transforms/tests/fixture/server-actions/server-graph/3/output.js` (canary) |
| `createServerReference("<id>", callServer, void 0, findSourceMapURL, "updateProfile")` from `private-next-rsc-action-client-wrapper`; local name `$$RSC_SERVER_ACTION_0` | source: `server_actions.rs` v16.3.8; fixture `…/client-graph/1/output.js` (canary) |
| Action ID = 1 prefix byte (type bit, 6-bit arg mask, rest bit) + sha1(salt + file + ":" + export), 42 hex chars | source: `server_actions.rs` `generate_server_reference_id`, v16.3.8 |
| `603a9c1e2b44…` | prefix `60` follows the rule above for two declared arguments; the hash part is illustrative (`experience-architecture.md` §2, journeys j1-4, j7-2; §7, item 3) |
| `globalThis.__RSC_MANIFEST["/dashboard/settings/page"]`, `clientModules` key = module path, `name: "*"`, `chunks` = paths (Turbopack) or one flat `[chunkId, file, chunkId, file, …]` list (Webpack: `chunks.push(chunkId, file)`, flight-manifest-plugin.ts ≈145), `async` | source: `crates/next-core/src/next_manifests/client_reference_manifest.rs` and `packages/next/src/build/webpack/plugins/flight-manifest-plugin.ts`, v16.3.8 |
| server-reference manifest `{ node: { id: { workers, layer?, exportedName?, filename? } }, edge, encryptionKey }` | source: `packages/next/src/build/webpack/plugins/flight-client-entry-plugin.ts` (`ActionManifest`), v16.3.8 |
| `N:I[id, chunks, name]` (`,1` appended when async) | source: React `packages/react-server/src/ReactFlightServer.js` (`emitImportChunk`, `serializeRowHeader`) and `react-server-dom-turbopack/src/server/ReactFlightServerConfigTurbopackBundler.js` (`getClientReferenceMetadata`), facebook/react main |
| `$L<hex>` lazy (client component in element-type position; pending async component), `$@` promise, `$S` symbol (`"$Sreact.suspense"`), `$undefined`, element `["$", type, key, props]` | source: `ReactFlightServer.js` (`serializeLazyID`, `serializePromiseID`, `serializeSymbolReference`, `serializeClientReference`, element tuple) and `react-client/src/ReactFlightClient.js` (`parseModelString`), main; concept-model V18 |
| Initial payload keys `P c q i f m G S … b`; `b` only when no `deploymentId`; `c` = pathname split on `/` | source: `packages/next/src/server/app-render/app-render.tsx` (`getRSCPayload`, `maybeAppendBuildIdToRSCPayload`, `prepareInitialCanonicalUrl`) and `packages/next/src/shared/lib/app-router-types.ts`, v16.3.8 |
| `?_rsc=qR7vX2mK9pLw3sTb`: 16 base64url chars, SHA-256 of `prefetch,segment,state-tree,next-url` headers truncated to 12 bytes (value illustrative) | `packages/next/src/shared/lib/router/utils/cache-busting-search-param.ts` (`CACHE_BUSTING_SEARCH_PARAM_DIGEST_BYTES = 12`), v16.3.8 |
| Navigation patch `{f, q, i, S, …, b}`; `FlightDataPath` = segment path pairs + `[segment, treePatch, seedData, head, isHeadPartial]` | same files, v16.3.8; journey j6-10; c4-3. Re-checked 2026-10-05: `generateDynamicRSCPayload` in `app-render.tsx` v16.3.8 returns `{ f, q: getRenderedSearch(query), i: !!couldBeIntercepted, S, h, r }` (then `s` when set, `b` via `maybeAppendBuildIdToRSCPayload`), so `q` and `i` are in navigation responses and stay in the j0-10 row; `h`, `r` are the `…` |
| `f` path without the root `''`: `["children","dashboard","children","billing", tree, seed, head, false]`; `"S":false` on a runtime navigation | `app-render.tsx` v16.3.8 ≈760 (`.map((path) => path.slice(1)) // remove the '' (root) segment`) and ≈790 (`S: workStore.isStaticGeneration`, false outside prerendering); the initial HTML row keeps `"S":true` because the ○ settings page is prerendered |
| `(self.__next_f=self.__next_f\|\|[]).push([0])`, `self.__next_f.push([1,"…"])` | source: `packages/next/src/server/app-render/use-flight-response.tsx` v16.3.8; concept-model V18, V19 |
| `buildId k7Qm2xLp9`, chunk names `layout-3c4d.js` / `page-5e6f.js`, `?_rsc=qR7vX2mK9pLw3sTb`, `Next-Router-State-Tree` | `experience-architecture.md` §2; journeys j1-1, j5-15, j6-6 |
| `cacheLife`, `cacheTag`, `updateTag` exported from `next/cache` | source: `packages/next/cache.d.ts` v16.3.8; concept-model V6, V15 |
| `(await cookies())` | Next 15+ async request APIs (docs, concept-model V8). Not re-checked in source |

## 7. Discrepancies with existing data (resolved in US-005)

Each item says what the site data said, what it says now, and why. Items 7 and 9 are kept on
purpose.

1. **Manifest row shape. Fixed.** `entities.ts` (client-reference-manifest, flight-manifest-plugin),
   j1-11, j5-8, the r1 quiz answer and `experience-architecture.md` §2 wrote
   `{ id: "(app-pages-browser)/./components/DashboardNav.tsx", chunks: ["app/dashboard/layout-3c4d"], name: "default" }`.
   They now use the 16.3 shape: the entry is keyed by module path, `name: "*"`, `chunks` are file
   paths (Webpack: a flat `[chunkId, file, …]` list, noted where the Webpack path is named). The export
   name `"default"` appears only in the Flight `I` row, which internals now show next to the row.
   L2 wording stays plain: "a row keyed by the module's path: its id and the chunk that contains
   it". `{ id, chunks, name }` remains wherever it describes the Flight reference (concept-model,
   j5-7 options), because that is the `I` row's content.
2. **`registerServerReference` third argument. Fixed.** j1-4 and j7-2 internals now write
   `registerServerReference(updateProfile, "603a9c1e2b44…", null)` and say where the export name
   lives (action-entry comment, client stub). j7-3 now writes `createServerReference(id, callServer, …)`
   in the story and the full five-argument call in internals and the token label (item 9).
3. **Action ID prefix. Fixed.** The illustrative ID is now `603a9c1e2b44…` everywhere it appears
   (j1-4, j7-2, j7-3, j7-6, j7-8, quiz s7, `experience-architecture.md` §2 and step lists, this
   document). Prefix byte `0x60` is what `generate_server_reference_id` gives
   `updateProfile(prevState, formData)`: two declared arguments, no rest. The hash part stays
   illustrative, which `experience-architecture.md` §2 now says. No e2e test referenced the ID.
4. **Settings render model. Fixed: settings is ○ static everywhere.** J1 (steps 13, 14, 17), J8
   step 4, J11 step 1, compare c8 and this specimen (SP4 ○, SP5 ▤) all depend on settings being the
   ○ example next to billing's ◐. Making settings dynamic would have broken all of them and lost
   the ○/◐ contrast. With `cacheComponents: true` a dynamic settings page would also need its own
   Suspense boundary (concept-model V8), adding lines with no fate in J0. The render that J0 step 7
   and J5 step 6 show is the same RSC + SSR render prerender runs at build (j1-14: "the same RSC
   and SSR runtimes that will serve requests"), so those steps keep their teaching. They now say
   once that for this ○ route the render ran at build and a production GET is served its stored
   result, and that a dynamic route runs it per request. Internals point to J1 step 14 and the server cache.
   The quiz r2 prompt, compare c1-4 and the settings and AccountSummary entity `exists` texts say
   the same. j5-14 now streams billing's `InvoiceList` boundary and says settings has none. j5-10
   drops the settings "Suspense boundary" row. The lens footnote chip on j0-7 (§5.2) carries the
   same fact.
5. **j0-10 states. Fixed.** j0-10 now lists `layout-router` (active) and `suspense-hole` (new). The
   lens links ⌛ → `suspense-hole` and the DL6 slot → `layout-router` (§5.1, §5.2).
6. **`updateProfile` signature. Fixed.** `experience-architecture.md` §2 and the `src-actions`
   entity now write `updateProfile(prevState, formData)`, as J7 does.
7. **Canary drift after 16.3. Kept.** On canary (2026-10-05) `InitialRSCPayload.f` is renamed `t`
   (transport data) and `ActionFlightResponse` uses `t?`. 16.3.8 still uses `f`. The site follows
   16.3. Watch this when the site moves to 16.4. j7-14 internals mention the rename.
8. **j7-14 `f`. Fixed.** Internals now read `0:{"a":"$@1","f":[[["",{…}],[…seed…],…,false]],…}` (the route from the root, root `''` path segment dropped) then
   `1:{"ok":true}`: `a` points at a promise row, and `f` is inline `FlightData`. The story says
   "a root row with two named fields" instead of "two named rows".
9. **j7-3 `createServerReference`. Fixed, abridged.** The story keeps the short
   `createServerReference(id, callServer, …)`. Internals give the full call:
   `createServerReference("603a9c1e2b44…", callServer, void 0, findSourceMapURL, "updateProfile")`.

## 8. Extension later (superseded by §10)

| Journey | Lens candidates | Specimen lines it lights |
|---|---|---|
| J1 Production build | j1-3 (SWC on ProfileForm: same as j0-3, with `PF4` types ✂), j1-4 (two-pane: `actions.ts` server compile `registerServerReference` vs client compile `createServerReference`, the ID morph `AC4` → `"603a…"`), j1-10/12 (split + manifest for ProfileForm → `page-5e6f.js`), j1-14 (○ `settings.html` / `.rsc` / `.segments/` and the ◐ billing shell: ○ vs ⌛ lines) | PF, AC, SP, BP, IL, DA (▤ explains ○) |
| J5 App Router initial | j5-8 (manifest lookup), j5-10 (full row listing: the only place the lens may show > 8 lines, folded by segment), j5-12 (SSR copy: ⚡S → HTML), j5-13 (four `__next_f` types `[0]` `[1]` `[2]` `[3]`), j5-17 (replay), j5-19 (light-up) | same as J0 plus row-level folding |
| J7 Server Actions | j7-2/3 (the ⇄ split: server keeps the body, browser gets an ID), j7-4 (needs one inline action: `$$RSC_SERVER_ACTION_0.bind(null, encryptActionBoundArgs(id, secret))` vs a plain `.bind(null, value)`; add 3–4 specimen lines in SettingsPage marked `J7`), j7-6 (POST envelope), j7-14 (`0:{"a":…,"f":…}`), j7-15 (merge) | AC1–AC7, PF3, PF5, PF9 |
| J8 (later) | billing ◐: ○ shell rows at build, ⌛ rows at request | BP, IL |

## 9. Data model sketch

For the implementer. The lens is pure data next to the journey. A pure function derives the panes
for step *n*, like `worldState`. The implemented types in `src/domain/types.ts` refine this sketch:
the timing channel is `mark` (`MarkFate`), folds are rows inside a pane (`FoldRow`), a morphed line is
`change: 'same'` plus `morph`, and each lit fate's entities sit on the step (`LensLink`) instead of on the
fate.

```ts
type FateId = 'server-only' | 'client-boundary' | 'split' | 'action-id'          // hue channel
type TimingId = 'static-shell' | 'suspended' | 'cached' | 'shared-layout'      // gutter mark channel
type ArtifactForm = 'tsx' | 'js' | 'js-reference' | 'manifest' | 'flight' | 'html' | 'dom' | 'flight-patch'

interface Fate {
  id: FateId | TimingId
  channel: 'hue' | 'mark'
  label: string                     // 'server-only'
  glyph: string                     // '⊘'
  token?: string                    // '--fate-server' (hue channel only)
  entityByStep: Partial<Record<string /* step id */, string[] /* entity ids, must be in camera or states */>>
}

interface SpecimenLine {            // the source, colored once
  id: string                        // 'DN6'
  file: string                      // 'components/DashboardNav.tsx'
  text: string
  fate?: FateId                     // absent only on frame lines
  timing?: TimingId
  frame?: true
  journeys?: string[]               // ['j7'] → dimmed in J0
}

interface CodeLine {                // one line of a derived artifact
  text: string
  from?: string[]                   // specimen line ids it comes from (drives hover ↔ entity and morph alignment)
  fate?: FateId
  timing?: TimingId
  change: 'new' | 'same' | 'gone'
  morph?: { identifier: string }    // the token that keeps its highlight across the morph
}

interface CodeArtifact {
  form: ArtifactForm
  file: string                      // 'static/chunks/app/dashboard/layout-3c4d.js'
  // (no layer field: the pane title names the layer where it matters, e.g. 'server · rsc layer')
  entity: string                    // pane header link
  lines: CodeLine[]                 // 3–8 shown
  folds?: { after: number; count: number; label: string }[]
  abridged: boolean
}

interface LensStep {
  step: string                      // 'j0-4'
  mode: 'off' | 'peek' | 'open'     // data, not inferred from step kind (rule 7)
  panes: CodeArtifact[]             // 1, or 2 for split / before-after
  ledger?: string[]                 // peek strip / 0 B footer
  motion: 'transform' | 'split' | 'connect' | 'reference' | 'wrap' | 'light-up' | 'swap' | 'fill' | 'none'
  reduced: 'side-by-side' | 'three-pane' | 'static'
}
```

Tests to add with the implementation:

- every `from` id exists in the specimen;
- every `entityByStep` id exists and is in that step's camera or `states`;
- each `open` pane shows at most 8 non-folded lines;
- every non-frame specimen line has a `fate`;
- `mode: 'open'` only on steps whose `form` differs from the previous step's.

## 10. All journeys

The lens runs on every journey. Where code does not change form the step is `peek` (a one-line
ledger) or `off`; `open` stays reserved for a form change (rule 7, checked by `validateCodeLens`).
This section was the brief for writing J1–J11 (§10.3 is the result); each journey's detailed design goes in its own file,
`docs/code-lens/<slug>.md`, in the shape of §5.

### 10.1 Contract for one journey's lens

- **Write only** `src/domain/codeLens/<slug>.ts` (it exports `STEPS: LensStep[]`, empty until
  written) and `docs/code-lens/<slug>.md`. A new e2e file `e2e/code-lens-<slug>.spec.ts` is allowed.
- **Do not edit** shared files: `codeLens/index.ts` (the registry already lists all 12),
  `codeLens/specimen/*`, `codeLens/view.ts`, `types.ts`, `validate.ts`, the tests next to them,
  `CodeLens.tsx`, `lensLink.ts`, `JourneyView.tsx`, `StepPanel.tsx`, `styles.css`, this file, the
  journeys and `e2e/code-lens.spec.ts`. A missing specimen line is written as a derived row without
  `from` (or a fold with `lines`) and listed under "Gaps" in the journey's `.md`.
- Build source panes with `source(ids, change)` and a step with no lens with `off(step)`, both from
  `./specimen`; derived rows name the specimen lines they come from in `from`, so hover ↔ map
  linking and reduced-motion before panes work.
- One entry per journey step, in order. `validate.test.ts` checks it: every step covered once,
  `peek` has a `summary`, `open` changes form and shows ≤ 8 lines per pane, a predict step is `off`
  and a check step is `off` unless it opens on a new form,
  every `from` and entity resolves, every linked entity is in that step's `states` or camera.
- Forms: `tsx · js · js-reference · manifest · flight · html · dom · flight-patch` (J0) plus `http`
  (request or response lines), `json` (a JSON body or file), `css`, `files` (a listing of emitted
  files) and `terminal` (CLI output). `http` and `json` stack their reduced-motion before pane.
  Motion verbs are the existing ten (`LensMotion`).
- The panel widens at ≥1280px only for a journey with an `open` step; phones get "More room for
  code" whenever panes show. Predict steps are `off` (the lens must not answer the question);
  check steps are `off`. j5-1 stays `off` (an e2e test relies on it).
- Every token printed must be checked against Next.js 16.3 (§6 style) and listed in the `.md`.

### 10.2 Per journey

Columns: step · lens · form · what it shows (specimen lines → artifact). Steps not listed are `off`.

**J1 Production build** (`production-build`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j1-2 | peek | files | route list from `app/` + `pages/`; loader tree `"" → dashboard → settings` |
| j1-3 | open | js | PF1–PF9 → SWC output: marker comment, `{ name: string }` ✂, JSX → `_jsx` (as j0-3) |
| j1-4 | open, split | js-reference | AC1/AC4 server: `registerServerReference(updateProfile, "603a9c1e2b44…", null)` · browser: `createServerReference(…)` |
| j1-5 | open | js | PB1 `import { Button } from 'ui-kit'` → direct file import; NC5 as context |
| j1-7 | peek | tsx | SP3 → PF1: the import edge only the bundler sees |
| j1-8 | peek | js | `import "react"` → `react.react-server.js` (rsc) vs full React (ssr, browser) |
| j1-10 | open | files | browser entries: framework, main-app, webpack, `layout-3c4d.js`, `settings/page-5e6f.js` ← PF lines |
| j1-11 | open | manifest | PF1 rsc proxy + the ProfileForm `clientModules` row |
| j1-12 | peek | manifest | ledger: each manifest → its one reader |
| j1-13 | peek | tsx | the lines that decide each strategy: SP5 ▤ → ○, IL4 → ◐, PR3 → ƒ, PO8 → ● ISR |
| j1-14 | open | files | `settings.html`/`.rsc`/`.segments/`, `posts/7.html` + `.json`, billing shell + postponed |
| j1-15 | peek | json | `.nft.json` of the settings entry |
| j1-16 | peek | files | `.next/standalone/` listing (NC6) |
| j1-17 | open | terminal | the route summary `○ ◐ ƒ ●` with `(ISR: 60 Seconds)`, each row linked to its deciding line |

**J2 Incoming request and server routing** (`request-routing`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j2-2 | peek | json | routes-manifest excerpt: NC3 headers, NC4 redirects, PX8 matcher regex |
| j2-3 | peek | json | NC3 → the header rule as stored, `X-Frame-Options: DENY` to come |
| j2-4 | peek | json | NC4 → redirect rule (`statusCode: 308`, regex); `/old-settings` would leave here |
| j2-5 | open | http | PX1–PX8 → the decision as headers (`x-middleware-next`); PX4's redirect as the ghost branch |
| j2-7 | peek | json | pages-manifest / app-paths row for `/dashboard/settings` |
| j2-9 | peek | http | handoff: resolved path + params |
| j2-11 | peek | http | `GET /_next/static/chunks/framework-a1b2c3.js` → 200 from disk; PX8 did not match |
| j2-12 | open | json | AH1–AH3 → `{"ok":true}`; the image request as a ledger line |

**J3 Pages Router: the initial request** (`pages-initial`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j3-1 | peek | tsx | the exports that decide: PR3 → ƒ, PO6 → ●, none → ○ |
| j3-2 | peek | json | `dynamicRoutes` regex + pages-manifest row for `/products/[id]` |
| j3-3 | open, split | js | `next_ssg`: server keeps PR2–PR5 · browser chunk has a hole (PR2–PR5 gone), PR7–PR11 kept |
| j3-4 | peek | files | `posts/7.html` + `7.json`, revalidate 60 (PO8) |
| j3-5 | peek | js | variant PI1–PI3 inside the page chunk: no hole |
| j3-6 | peek | tsx | AP4–AP7 wrapping `<ProductPage product={…} />` |
| j3-7 | open | html | the whole tree → HTML (AP6, PR9–PR11 output) |
| j3-8 | peek | html | DC1–DC3 → `<html><head>…<body><div id="__next">…` + script tags |
| j3-9 | open | json | PR5's props a second time: `__NEXT_DATA__` `{props:{pageProps:{product}},page,query,buildId}` |
| j3-11 | open | html | what crosses: every ⚡S line as code (`pages/_app`, `pages/products/[id]` chunks); ⊘ PR2–PR5 0 B ledger |
| j3-12 | open | dom | every ⚡S line hydrated, nothing static (contrast j0-9) |

**J4 Pages Router: navigation** (`pages-navigation`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j4-1 | peek | http | PR11 → viewport prefetch: the posts chunk + `/_next/data/k7Qm2xLp9/posts/7.json` |
| j4-2 | peek | http | the hover repeat of the JSON request |
| j4-4 | open | json | `GET /_next/data/k7Qm2xLp9/products/42.json` → `{ pageProps: { product }, __N_SSP: true }` from PR3–PR5 |
| j4-5 | peek | json | `posts/7.json` from the stored entry (PO8) |
| j4-6 | peek | js | variant PI1–PI3 running in the tab |
| j4-7 | peek | manifest | build-manifest row for `/posts/[id]` |
| j4-8 | open | dom | `<App Component={PostPage}>`: AP4/AP6 🔒 kept, PR lines gone, PO lines new |

**J5 App Router: the initial request** (`app-initial`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j5-2 | peek | js | `import "react"` in SP vs DN: two resolutions |
| j5-3 | peek | json | the loader tree for `/dashboard/settings` |
| j5-5 | peek | tsx | DL6 `{children}` → LayoutRouter |
| j5-6 | peek | flight | ledger: SettingsPage → output only, `getProfile()` → `"Ada"` (○, ran at build) |
| j5-8 | open | manifest | DL5 → module path → `clientModules` row → `1:I[…]` |
| j5-9 | peek | json | FlightRouterState vs segment slices |
| j5-10 | open | flight | the full rows, folded by segment (≤ 8 shown per pane) |
| j5-11 | peek | flight | the tee: `⑂ ×2` |
| j5-12 | open | html | SSR copy: DN9–DN12 → `<nav>` HTML |
| j5-13 | peek | html | the four `__next_f` push types `[0]` `[1]` `[2]` `[3]` |
| j5-14 | peek | html | billing: skeleton first, later chunk with the content and its swap script |
| j5-15 | peek | files | ledger of what crosses (as j0-8's footer) |
| j5-17 | open | flight | `__next_f` replayed into rows again |
| j5-18 | peek | files | the two referenced chunks |
| j5-19 | open | dom | DN and PF hydrate; AS, layouts stay as painted (as j0-9) |
| j5-20 | peek | json | the client's FlightRouterState |

**J6 App Router: prefetch and navigation** (`app-navigation`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j6-1 | peek | tsx | DN12 `<Link href="/dashboard/billing">` → a prefetch task |
| j6-3 | open | http | `RSC: 1 · Next-Router-Prefetch: 1 · Next-Router-Segment-Prefetch: /_tree` → the tree |
| j6-4 | open | flight | billing's segment up to the boundary: BP6/BP7 ○ rows, BP8 hole empty |
| j6-6 | open | http | the navigation request: `Next-Router-State-Tree`, `Next-Url`, `?_rsc=qR7vX2mK9pLw3sTb` |
| j6-8 | peek | json | the two trees; `""` and `dashboard` locked (🔒) |
| j6-9 | peek | tsx | BP lines run; RL/DL not called |
| j6-10 | open | flight-patch | the patch (as j0-10) |
| j6-11 | open | dom | the LayoutRouter swap: DN6 `open` kept, settings → billing |
| j6-12 | peek | json | pushState + the updated FlightRouterState |

**J7 Server Actions** (`server-actions`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j7-1 | peek | tsx | AC1, AC4 and the variant SA1–SA7 |
| j7-2 | open | js | AC1–AC7 server compile: `registerServerReference(…)`, action-entry comment, manifest row |
| j7-3 | open, split | js-reference | server keeps the body · browser: PF3 → `createServerReference("603a9c1e2b44…", callServer, …)` |
| j7-4 | open | flight | SA2 sealed (encrypted bound args) vs SA7 `'pro'` plain |
| j7-5 | peek | html | PF7 → `<form>` with the hidden `$ACTION_ID_…` field (no-JS path) |
| j7-6 | open | http | `POST /dashboard/settings · Next-Action: 603a9c1e2b44…` + body |
| j7-8 | peek | manifest | the ID lookup |
| j7-10 | peek | tsx | AC5 runs; DA4's entry still old |
| j7-12 | peek | tsx | AC6 `updateTag('profile')` sweeps DA4's tag |
| j7-13 | peek | tsx | SP5 re-runs, misses, reads fresh; variant AV2 as the alternative |
| j7-14 | open | flight | `0:{"a":"$@1","f":[…]}` then `1:{"ok":true}` |
| j7-15 | open | dom | the merge: PF9 shows `Saved`, DN6 kept |
| j7-16 | peek | http | variant AR1–AR2 `redirect()` → the `x-action-redirect` header |

**J8 Caching, ISR, Cache Components and PPR** (`caching`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j8-2 | peek | tsx | SP5 and AS both ask for the profile: one call |
| j8-3 | peek | tsx | DA2–DA5 ▤ vs DA7–DA8 (no directive) |
| j8-4 | open | files | the server-cache entry for `/dashboard/settings`: `.html`, `.rsc`, meta `{revalidate, tags: ["profile"]}` |
| j8-5 | peek | http | `/posts/7` fresh hit: no render |
| j8-7 | peek | http | stale served; PO6–PO8 regenerate behind |
| j8-8 | peek | http | miss with `fallback: 'blocking'` (PO4) |
| j8-11 | peek | files | the image cache key `/hero.jpg|640|75|webp` |
| j8-13 | open | html | billing at build: shell with skeleton, stop point saved (BP ○, IL ⌛) |
| j8-14 | peek | http | the shell streamed from the cache |
| j8-15 | open | html | the resumed rows filling the hole (IL ⌛, DA7–DA8) |
| j8-16 | peek | tsx | variant BV1–BV5 (the premise, not the answer) |
| j8-17 | open | html | the shell now holds the layouts and `loading.tsx`'s fallback (BL1–BL2 ○); every BV line ⌛ |
| j8-18 | peek | tsx | AC6 `updateTag` vs variant AV2 `revalidateTag(…, 'max')` |

**J9 Development mode** (`dev-mode`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j9-2 | peek | terminal | NC lines edited → the restart line |
| j9-4 | peek | terminal | compile on first request for `/dashboard/settings` |
| j9-8 | peek | http | `GET /_next/hmr` upgrade |
| j9-9 | open | tsx | the edit: DN10 → NE1 (what-if variant line) |
| j9-11 | open | js | the compiled module with the Fast Refresh registration and DN6's hook signature |
| j9-12 | peek | tsx | NE3 adds a hook, so the signature changes; NE2 `// @refresh reset` |
| j9-13 | open | json | the `serverComponentChanges` message after AS2's edit |
| j9-14 | open | flight-patch | the refreshed rows: new AS2 output, DN6 🔒 kept |

**J10 Custom server** (`custom-server`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j10-2 | peek | js | SV3–SV6: create, prepare, handler |
| j10-3 | peek | js | SV7 owns the socket |
| j10-4 | peek | js | SV11 `handle(req, res, parsedUrl)` → the ladder (NC3, PX8 apply) |
| j10-5 | open | http | SV10: `GET /legacy/settings` → rebuilt as `/dashboard/settings`, then the ladder |
| j10-7 | open | http | SV9: `200 ok`, no `X-Frame-Options` (NC3 never ran), PX never ran |
| j10-9 | peek | js | variant SR1 `app.render(…)` → `this.requestHandler(req, res)` |
| j10-11 | peek | files | standalone listing without `server.js` (NC6) |
| j10-12 | peek | js | variant NV1 `useFileSystemPublicRoutes: false`; SV10 maps the path by hand |

**J11 Built-in optimizations** (`optimizations`)

| Step | Lens | Form | Shows |
|---|---|---|---|
| j11-1 | peek | files | settings served from the cache (SP5 ▤ → ○) |
| j11-2 | peek | files | post 7 + revalidate (PO8) |
| j11-3 | peek | html | billing's shell (BP ○ / IL ⌛) |
| j11-4 | peek | files | the chunk families |
| j11-5 | open | js | PB1 rewritten; NC5 |
| j11-6 | open | files | variant SD2 → its own chunk, fetched on first render; fallback meanwhile |
| j11-7 | open | html | PO13 → `<img width height srcset="/_next/image?url=%2Fhero.jpg&w=640&q=75 640w, …">` |
| j11-8 | open | css | RL4–RL5 → `@font-face` with the hashed file + the `__className_…` rule |
| j11-9 | peek | css | the Google variant: downloaded at build |
| j11-10 | peek | css | the `brand Fallback` face with `size-adjust` |
| j11-11 | peek | html | AP8 → the script injected in idle time |
| j11-12 | peek | json | `.nft.json` (NC6) |

J0 stays as §5. The opens per journey: J1 7, J2 2, J3 5, J4 2, J5 5, J6 5, J7 6, J8 4, J9 4, J10
2, J11 4.

### 10.3 Status per journey (as built)

Every journey's lens is written and validated (`validate.test.ts`: one entry per step, every `from`
and link resolves and is on stage; `codeLens.test.ts`: registry and lazy load). Counts are lens modes
per step; the open steps match the §10.2 plan for every journey.

| Journey | Steps | Open | Peek | Off | Open steps | Design | e2e |
|---|---|---|---|---|---|---|---|
| J0 `whole-lifecycle` | 10 | 6 | 3 | 1 | 3, 4, 7, 8, 9, 10 | §5 | `code-lens.spec.ts` |
| J1 `production-build` | 18 | 7 | 7 | 4 | 3, 4, 5, 10, 11, 14, 17 | `code-lens/production-build.md` | `code-lens-production-build.spec.ts` |
| J2 `request-routing` | 14 | 2 | 6 | 6 | 5, 12 | `code-lens/request-routing.md` | `code-lens-production-build.spec.ts` |
| J3 `pages-initial` | 16 | 5 | 6 | 5 | 3, 7, 9, 11, 12 | `code-lens/pages-initial.md` | `code-lens-journeys.spec.ts` |
| J4 `pages-navigation` | 12 | 2 | 5 | 5 | 4, 8 | `code-lens/pages-navigation.md` | `code-lens-journeys.spec.ts` |
| J5 `app-initial` | 22 | 5 | 11 | 6 | 8, 10, 12, 17, 19 | `code-lens/app-initial.md` | `code-lens-app-initial.spec.ts` |
| J6 `app-navigation` | 18 | 5 | 4 | 9 | 3, 4, 6, 10, 11 | `code-lens/app-navigation.md` | `code-lens-app-navigation.spec.ts` |
| J7 `server-actions` | 17 | 6 | 7 | 4 | 2, 3, 4, 6, 14, 15 | `code-lens/server-actions.md` | `code-lens-journeys.spec.ts` |
| J8 `caching` | 20 | 4 | 8 | 8 | 4, 13, 15, 17 | `code-lens/caching.md` | `code-lens-journeys.spec.ts` |
| J9 `dev-mode` | 20 | 4 | 4 | 12 | 9, 11, 13, 14 | `code-lens/dev-mode.md` | `code-lens-journeys.spec.ts` |
| J10 `custom-server` | 14 | 2 | 6 | 6 | 5, 7 | `code-lens/custom-server.md` | `code-lens-production-build.spec.ts` |
| J11 `optimizations` | 16 | 4 | 8 | 4 | 5, 6, 7, 8 | `code-lens/optimizations.md` | `code-lens-journeys.spec.ts` |
| **All** | **197** | **52** | **75** | **70** | | | |

Resolved after the per-journey pass (the lead's integration): the specimen gained `ThemeProvider.tsx`
(TP), `sizes="100vw"` on PO13, and what-if variants for the J9 edits (NE, AE), J7's `redirect()` (AR),
J8's `loading.tsx` (BL), J10's `app.render` (SR) and `useFileSystemPublicRoutes` (NV); the rows that
had no `from` now name them. Journey text now follows 16.3.8 where the lens found it differed: J6
steps 4, 6 and 8 (the segment request key and the `"refetch"`-marked target tree), J5 step 10
(`__PAGE__`), J1 step 12, J2 step 2 and the `middleware-manifest` entity (Proxy matchers in
`functions-config-manifest.json`, concept-model V38), J1 step 17 (the legend names only
`generateStaticParams` when `app/` exists), J8
steps 2, 16, 17 and J10 step 9. What stays a gap is listed under "Gaps" in each journey's file.
