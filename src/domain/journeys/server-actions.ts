import type { Journey } from '../types'
import { JOURNEY_META } from './meta'
import { SOURCES } from '../sources'

export const SERVER_ACTIONS: Journey = {
  ...JOURNEY_META.serverActions,
  following: 'updateProfile from source to an action ID, to a POST envelope, to an invalidation signal, to a patch',
  whatShouldClick: 'An action is a POST to an ID. Invalidation is a separate step. The UI update rides back in the same response only if something was invalidated.',
  steps: [
    {
      id: 'j7-1', kind: 'explain', title: 'A directive at the top of a file',
      story: 'app/actions.ts starts with "use server" and exports updateProfile(prevState, formData). A second form is also possible: an inline async function inside a Server Component with "use server" as its first statement. That one captures a variable from its scope, secret, and that capture will matter later.',
      camera: { kind: 'entities', ids: ['src-actions', 'src-settings-page'] },
      token: { at: 'src-actions', glyph: 'source-module', label: 'actions.ts · "use server"' },
      states: { 'src-actions': 'current', 'src-settings-page': 'active' }, edges: []
    },
    {
      id: 'j7-2', kind: 'transform', title: 'The compiler assigns an ID',
      story: 'SWC replaces the function with a registration: a hash of the file path, the export name and a per-build salt becomes its action ID, so it changes between deploys. The bundler writes a row into server-reference-manifest mapping that ID to the server module and export. The ID is what the browser will know; the function stays on the server.',
      camera: { kind: 'entities', ids: ['src-actions', 'swc', 'bundler', 'server-reference-manifest'] },
      token: { at: 'server-reference-manifest', glyph: 'reference', label: '603a9c1e2b44… → actions.ts#updateProfile' },
      states: { 'src-actions': 'kept', swc: 'active', bundler: 'active', 'server-reference-manifest': 'new' }, edges: ['e-actions-swc', 'e-swc-bundler', 'e-bundler-srm'],
      internals: ['serverActions transform in @next/swc: registerServerReference(updateProfile, "603a9c1e2b44…", null)', 'ID = 1 prefix byte (60: two declared arguments, no rest) + sha1(salt + file + ":" + export)', '.next/server/server-reference-manifest.js: { node: { "603a…": { workers: {…}, layer: "rsc" } } }']
    },
    {
      id: 'j7-3', kind: 'transform', title: 'The client sees a proxy',
      story: 'ProfileForm is a Client Component that imports updateProfile. In the browser layer that import does not resolve to the function: it becomes createServerReference(id, callServer, …), a proxy that knows only the ID and how to POST. No database code, no secrets, no server module ends up in a browser chunk.',
      camera: { kind: 'entities', ids: ['src-profile-form', 'swc', 'browser-chunks'] },
      token: { at: 'browser-chunks', glyph: 'reference', label: 'updateProfile = createServerReference("603a…", callServer, …)' },
      states: { 'src-profile-form': 'active', swc: 'active', 'browser-chunks': 'new', 'src-actions': 'kept' }, edges: ['e-form-swc', 'e-swc-bundler', 'e-bundler-browser-chunks'],
      internals: ['createServerReference("603a9c1e2b44…", callServer, void 0, findSourceMapURL, "updateProfile") from private-next-rsc-action-client-wrapper']
    },
    {
      id: 'j7-4', kind: 'transform', title: 'Two envelopes for arguments',
      story: 'The inline action captured secret. Captured values are encrypted with a key derived from the deploy and bound to the action ID, so the browser carries an opaque blob it cannot read or alter. Arguments passed with .bind(null, value) are different: they travel as plain, readable JSON. Two envelopes side by side; only one is sealed.',
      camera: { kind: 'entities', ids: ['src-settings-page', 'flight-tee', 'next-f'] },
      token: { at: 'next-f', glyph: 'json', label: 'encrypted closure · plain bound args' },
      states: { 'src-settings-page': 'active', 'server-reference-manifest': 'kept', 'next-f': 'active', 'browser-chunks': 'kept' }, edges: ['e-tee-nextf'],
      internals: ['encryption-utils.ts: encryptActionBoundArgs(actionId, args) with a per-build key (or NEXT_SERVER_ACTIONS_ENCRYPTION_KEY)', '.bind() arguments: serialized by the Flight client, not encrypted'],
      sources: [SOURCES.serverActionsSecurity]
    },
    {
      id: 'j7-5', kind: 'explain', title: 'One form, two paths',
      story: 'ProfileForm renders <form action={formAction}> from useActionState: a real form whose action is the proxy from step 3. With JavaScript, React intercepts submit and sends a fetch. Without JavaScript, the browser does a native POST to the current URL with the action ID in a hidden field, and the server answers with a new document. Both paths reach the same function.',
      camera: { kind: 'entities', ids: ['client-components', 'dom'] },
      token: { at: 'client-components', glyph: 'component-client', label: '<form action={formAction}> · useActionState(updateProfile)' },
      states: { 'client-components': 'current', dom: 'active' }, edges: ['e-react-client-components'],
      internals: ['const [state, formAction] = useActionState(updateProfile, null)', 'hydrated: fetch(currentUrl, { method: "POST", headers: { "Next-Action": id } })', 'no JS: multipart POST with $ACTION_ID_<id> field; response is HTML']
    },
    {
      id: 'j7-6', kind: 'move', title: 'The POST envelope',
      story: 'The request is a POST to the current page, /dashboard/settings, not to a route named after the action. The header Next-Action carries the ID; the body carries the serialized arguments: useActionState\'s previous state, then the form. An action with captured or bound values, like step 4\'s inline one, would send the sealed blob and the plain values too.',
      camera: { kind: 'entities', ids: ['client-components', 'routing-ladder'] },
      token: { at: 'routing-ladder', glyph: 'request', label: 'POST /dashboard/settings · Next-Action: 603a9c1e2b44…' },
      states: { 'client-components': 'active', 'routing-ladder': 'current' }, edges: ['e-client-action'],
      internals: ['Next-Action: 603a9c1e2b44…', 'Content-Type: multipart/form-data here (a FormData argument); text/plain;charset=UTF-8 when every argument is plain JSON', 'body fields: 0 = [null,"$K1"] (prevState, then a reference to the form), _1_name = the input (React encodeReply)']
    },
    {
      id: 'j7-7', kind: 'move', title: 'The ladder as usual',
      story: 'The router-server does not special-case actions. The POST climbs the same ladder as any request: proxy, early exits, route match. It matches the page route for /dashboard/settings and is handed to render-server, which notices the Next-Action header and picks the action handler instead of a render.',
      camera: { kind: 'entities', ids: ['routing-ladder', 'proxy', 'action-handler'] },
      token: { at: 'action-handler', glyph: 'request', label: 'handoff · Next-Action present' },
      states: { 'routing-ladder': 'active', proxy: 'active', 'action-handler': 'current' }, edges: ['e-ladder-proxy', 'e-ladder-action']
    },
    {
      id: 'j7-8', kind: 'move', title: 'The ID is looked up before anything runs',
      story: 'The handler looks the ID up in server-reference-manifest. If it is there, the module is loaded and the export resolved. If it is not, because it came from a form rendered by an older deploy, the request is rejected before any code runs. There is no fallback and no guessing.',
      camera: { kind: 'entities', ids: ['action-handler', 'server-reference-manifest', 'server-chunks'] },
      token: { at: 'server-reference-manifest', glyph: 'reference', label: '603a… → actions.ts#updateProfile ✓' },
      states: { 'action-handler': 'active', 'server-reference-manifest': 'current', 'server-chunks': 'active' }, edges: ['e-srm-action'],
      internals: ['action-handler.ts: handleAction → getActionModIdOrError', 'unknown ID: "Failed to find Server Action" → 404 / re-render without running']
    },
    {
      id: 'j7-9', kind: 'explain', title: 'The boundary is a public endpoint',
      story: 'Anyone who knows the ID can POST to it. Next.js verifies that the ID exists, decrypts the closure and rejects cross-origin POSTs (Origin must match Host or serverActions.allowedOrigins); it does not check who is asking. Authentication, authorization and input validation happen inside updateProfile, written by you, exactly as in a route handler.',
      camera: { kind: 'entities', ids: ['action-handler', 'src-actions'] },
      token: { at: 'action-handler', glyph: 'action', label: 'updateProfile(prevState, formData) · your checks first' },
      states: { 'action-handler': 'current', 'src-actions': 'active' }, edges: []
    },
    {
      id: 'j7-10', kind: 'transform', title: 'The mutation',
      story: 'The function runs: db.update(profile). The data source changes. At this moment nothing else in the world knows about it: the "use cache" entry for getProfile still holds the old value, and the browser still shows the old form.',
      camera: { kind: 'entities', ids: ['action-handler', 'db', 'data-cache'] },
      token: { at: 'db', glyph: 'data-source', label: 'profile row updated' },
      states: { 'action-handler': 'active', db: 'current', 'data-cache': 'stale' }, edges: ['e-action-db']
    },
    {
      id: 'j7-11', kind: 'predict', title: 'The function returns',
      story: 'updateProfile returns { ok: true } and calls nothing else: no updateTag, no revalidatePath, no redirect.',
      camera: { kind: 'entities', ids: ['action-handler', 'data-cache', 'client-components'] },
      token: { at: 'action-handler', glyph: 'json', label: 'return { ok: true }' },
      states: { 'action-handler': 'current', 'data-cache': 'stale', 'client-components': 'kept' }, edges: [],
      question: {
        text: 'Does the page update?',
        options: [
          'Yes: every action response re-renders the current route',
          'No: the response carries only the return value; nothing was invalidated, so nothing is re-rendered',
          'Yes, but only the Client Component that submitted the form',
          'No, and the return value is also dropped'
        ],
        answer: 1,
        why: 'The response has two fields: a for the return value and f for a re-rendered route. f is filled only when the action invalidated something. Here it did not, so useActionState receives { ok: true } and the page shows the old data.'
      }
    },
    {
      id: 'j7-12', kind: 'reveal', title: 'Invalidation is its own step',
      story: 'Field f is empty: the page did not update. Now run the same action with updateTag("profile"). The tag hatch sweeps every "use cache" and server cache entry carrying that tag, immediately, in this request. revalidatePath expires by path instead; refresh() and a cookie write touch no cache but also force a re-render. redirect() branches off (step 16).',
      camera: { kind: 'entities', ids: ['action-handler', 'data-cache', 'server-cache'] },
      token: { at: 'data-cache', glyph: 'cache', label: 'tag "profile" · swept' },
      states: { 'action-handler': 'active', 'data-cache': 'invalid', 'server-cache': 'invalid', db: 'fresh' }, edges: ['e-action-data-cache', 'e-action-server-cache'],
      internals: ['updateTag(tag): expire now, read-your-writes in the same request', 'revalidatePath(path): expire by path', 'refresh(), cookies().set(): no cache change, but the render is marked as needing a refresh']
    },
    {
      id: 'j7-13', kind: 'transform', title: 'Rerender rides in the same response',
      story: 'Because something was invalidated, the handler renders the current route again inside the same request: SettingsPage runs, getProfile misses the swept cache and reads the fresh row. That Flight goes into f; the return value goes into a. The alternative, revalidateTag("profile", "max"), only marks the tag stale: f stays empty and a later read refreshes in the background.',
      camera: { kind: 'entities', ids: ['action-handler', 'rsc-runtime-entity', 'data-cache', 'flight'] },
      token: { at: 'rsc-runtime-entity', glyph: 'component-server', label: 'SettingsPage (re-rendering)' },
      states: { 'action-handler': 'active', 'rsc-runtime-entity': 'current', 'data-cache': 'fresh', flight: 'new', db: 'active' }, edges: ['e-action-rsc', 'e-data-cache-rsc', 'e-db-rsc', 'e-action-flight'],
      internals: ['article era: revalidateTag(tag) with one argument expired immediately; deprecated in 16', 'Next.js 16: updateTag(tag) = expire now; revalidateTag(tag, "max") = stale-while-revalidate', 'the action POST has no RSC: 1 header, so the server ignores Next-Router-State-Tree and renders the whole route from the root']
    },
    {
      id: 'j7-14', kind: 'move', title: 'The response',
      story: 'One response crosses: text/x-component whose root row has two named fields. a is the return value serialized as Flight; f is the whole route re-rendered from the root, or an empty string when nothing was invalidated. No HTML.',
      camera: { kind: 'entities', ids: ['flight', 'app-router'] },
      token: { at: 'flight', glyph: 'flight', label: 'a: { ok: true } · f: [tree, segments…]' },
      states: { flight: 'current', 'app-router': 'active', html: 'na' }, edges: ['e-action-flight', 'e-flight-router-patch'],
      internals: ['Content-Type: text/x-component', 'rows: 0:{"a":"$@1","f":[[["",{…}],[…seed…],…,false]],"q":"","i":false,…} then 1:{"ok":true}', 'f path: the tree from the root, after slice(1) drops the root \'\' segment', 'a points at row 1 as a promise; f is inline FlightData (16.3; canary renames it t)', 'no-JS path: the same render is sent as HTML instead']
    },
    {
      id: 'j7-15', kind: 'transform', title: 'Merge',
      story: 'The client router turns f into a full route tree and navigates to it, as if to the same URL. React reconciles the new tree with the old one: DashboardNav and the form are the same components in the same places, so they keep their state and take fresh props. useActionState receives a as the new state.',
      camera: { kind: 'entities', ids: ['app-router', 'layout-router', 'client-components'] },
      token: { at: 'client-components', glyph: 'json', label: 'useActionState ← { ok: true }' },
      states: { 'app-router': 'active', 'layout-router': 'current', 'client-components': 'active', dom: 'kept' }, edges: ['e-flight-router-patch'],
      internals: ['server-action-reducer.ts: convertServerPatchToFullTree(f) → navigateToKnownRoute(…, FreshnessPolicy.RefreshAll); a resolves the awaiting promise', 'source TODO: "the server always renders from the root in response to a Server Action"']
    },
    {
      id: 'j7-16', kind: 'move', title: 'Alternative branch: redirect()',
      story: 'If the action calls redirect("/dashboard/billing") the response carries a redirect target instead of f. The client router performs a navigation to that URL, using the same prefetch caches and patch mechanics as a click, so a redirect after a mutation costs one round trip, not a document load.',
      camera: { kind: 'entities', ids: ['action-handler', 'flight', 'app-router', 'route-cache'] },
      token: { at: 'app-router', glyph: 'request', label: 'X-Action-Redirect: /dashboard/billing' },
      states: { 'action-handler': 'active', flight: 'active', 'app-router': 'current', 'route-cache': 'active' }, edges: ['e-action-flight', 'e-flight-router-patch', 'e-route-cache-router'],
      internals: ['header X-Action-Redirect: <url>;push | ;replace', 'the redirected route\'s Flight can be inlined when the router can render it']
    },
    {
      id: 'j7-17', kind: 'check', title: 'Check yourself',
      story: 'Four statements about what you just watched.',
      camera: { kind: 'world' },
      states: { 'action-handler': 'active', 'server-reference-manifest': 'active', 'data-cache': 'active', flight: 'active', 'app-router': 'active' }, edges: ['e-client-action', 'e-srm-action', 'e-action-flight', 'e-flight-router-patch'],
      checks: [
        { statement: '.bind() arguments are encrypted before they reach the browser.', isTrue: false, why: 'Only captured closure variables are encrypted. Bound arguments travel as plain JSON and can be read and altered by the client.' },
        { statement: 'Every action re-renders the page.', isTrue: false, why: 'The f field is filled only when the action invalidated or refreshed something (updateTag, revalidatePath, refresh, a cookie write). Otherwise only the return value comes back; a redirect() replaces f with a navigation.' },
        { statement: 'revalidateTag("profile", "max") makes the same response carry fresh UI.', isTrue: false, why: 'That form marks the tag stale-while-revalidate; the next read refreshes in the background. updateTag("profile") is the call that expires now and re-renders in the same response.' }
      ]
    }
  ]
}
