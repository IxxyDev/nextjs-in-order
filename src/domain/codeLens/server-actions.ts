// src/domain/codeLens/server-actions.ts
import type { LensStep } from '../types'
import { ACTION_ID, source } from './specimen'

const BODY = ['AC5', 'AC6', 'AC7']

/**
 * the lens along J7: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/server-actions.md).
 */
export const STEPS: LensStep[] = [
  {
    step: 'j7-1', mode: 'peek', form: 'tsx',
    summary: [
      `app/actions.ts · ⇄ 'use server' (AC1) + updateProfile(prevState, formData) (AC4) · ⊘ the body (AC5–AC7) · a second form, inline in SettingsPage, comes at step 4`
    ],
    panes: [{ title: 'app/actions.ts', entity: 'src-actions', abridged: false, rows: [...source(['AC1', 'AC2', 'AC3', 'AC4', ...BODY]), { text: '}' }] }],
    links: [
      { fate: 'action-id', entities: ['src-actions'] },
      { fate: 'server-only', entities: ['src-actions'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j7-2', mode: 'open', form: 'js',
    panes: [
      {
        title: 'app/actions.js', hint: 'the server compile: the function stays, an ID is registered for it', abridged: true,
        rows: [
          { text: `/* __next_internal_action_entry… {"${ACTION_ID}":{"name":"updateProfile"}} */`, from: ['AC1'], fate: 'action-id', change: 'same', morph: ACTION_ID, note: "'use server' → action-entry comment" },
          { text: 'import { registerServerReference } from "private-next-rsc-server-reference";', fate: 'action-id', change: 'new' },
          { fold: 2, label: '2 import lines, unchanged', from: ['AC2', 'AC3'], change: 'same' },
          { text: 'export async function updateProfile(prevState, formData) {', from: ['AC4'], fate: 'action-id', change: 'same', cut: ': unknown · : FormData' },
          { fold: 3, label: '3 lines of the body, unchanged: they run only here', from: BODY, change: 'same' },
          { text: '}' },
          {
            fold: 2, label: '2 lines: a check that every export is an async function', change: 'new',
            lines: ['import { ensureServerEntryExports } from "private-next-rsc-action-validate";', 'ensureServerEntryExports([updateProfile]);']
          },
          { text: `registerServerReference(updateProfile, "${ACTION_ID}", null);`, from: ['AC4'], fate: 'action-id', change: 'new', note: 'the ID: a hash of salt + file + export' }
        ]
      },
      {
        title: 'server/server-reference-manifest.json', entity: 'server-reference-manifest', abridged: true,
        rows: [
          { text: `{ node: { "${ACTION_ID}": { workers: { "app/dashboard/settings/page": { moduleId: …, async: false } },`, from: ['AC4'], fate: 'action-id', change: 'new', note: 'written by the bundler' },
          { text: '  exportedName: "updateProfile", filename: "app/actions.ts" } }, edge: {}, encryptionKey: "…" }', from: ['AC4'], fate: 'action-id', change: 'new' }
        ]
      }
    ],
    links: [
      { fate: 'action-id', entities: ['swc', 'server-reference-manifest'] },
      { fate: 'action-id', entities: ['src-actions'], from: ['AC1'] }
    ],
    motion: ['transform'], reduced: 'side-by-side'
  },
  {
    step: 'j7-3', mode: 'open', form: 'js-reference', split: true,
    panes: [
      {
        side: 'server', title: 'server · rsc layer · app/actions.js', entity: 'src-actions', abridged: true,
        rows: [
          { text: 'export async function updateProfile(prevState, formData) {', from: ['AC4'], fate: 'action-id', change: 'same' },
          { fold: 3, label: '3 lines of the body: db.update, updateTag, return', from: BODY, change: 'same' },
          { text: '}' },
          { text: `registerServerReference(updateProfile, "${ACTION_ID}", null);`, from: ['AC4'], fate: 'action-id', change: 'same', morph: ACTION_ID }
        ]
      },
      {
        side: 'browser', title: 'static/chunks/app/dashboard/settings/page-5e6f.js', entity: 'browser-chunks',
        hint: "ProfileForm's import of app/actions.ts, as the browser layer compiles it", abridged: true,
        rows: [
          { text: 'import { … } from "private-next-rsc-action-client-wrapper";', from: ['PF3'], fate: 'action-id', change: 'new' },
          { text: 'const $$RSC_SERVER_ACTION_0 = createServerReference(', from: ['PF3', 'AC4'], fate: 'action-id', change: 'new' },
          { text: `    "${ACTION_ID}", …);`, from: ['PF3', 'AC4'], fate: 'action-id', change: 'new', morph: ACTION_ID },
          { text: 'export { $$RSC_SERVER_ACTION_0 as updateProfile };', from: ['PF3'], fate: 'action-id', change: 'new' },
          { fold: 3, label: '3 lines of the body: not in any browser chunk (0 B)', from: BODY, change: 'gone' }
        ]
      }
    ],
    links: [
      { fate: 'action-id', entities: ['swc'] },
      { fate: 'action-id', entities: ['browser-chunks', 'src-profile-form'], from: ['PF3'] },
      { fate: 'action-id', entities: ['src-actions'], from: ['AC4'] }
    ],
    motion: ['split'], reduced: 'three-pane'
  },
  {
    step: 'j7-4', mode: 'open', form: 'flight', chip: 'what if: an inline action in SettingsPage (not part of the app)',
    panes: [
      {
        title: 'app/dashboard/settings/page.tsx', entity: 'src-settings-page', badge: 'what if', hint: 'J7: an inline action next to the page', abridged: true,
        rows: source(['SA2', 'SA3', 'SA4', 'SA7'])
      },
      {
        title: 'Flight rows · inlined through self.__next_f', entity: 'next-f', abridged: true,
        rows: [
          { text: '   …["$","form",null,{"action":"$h3","children":…}]…', from: ['SA7'], fate: 'action-id', change: 'new', morph: '$h3', note: 'the action prop: a server reference' },
          { text: '3:{"id":"…","bound":"$@4"}', from: ['SA3'], fate: 'action-id', change: 'new', note: "upgrade's own ID; its bound args follow" },
          { text: '4:["$@5","pro"]', from: ['SA7'], fate: 'action-id', change: 'new', note: "'pro': plain JSON, readable and editable" },
          { text: '5:"kX9vQ2…"', from: ['SA2'], fate: 'server-only', change: 'new', note: 'secret, sealed by encryptActionBoundArgs: opaque' }
        ]
      }
    ],
    links: [
      { fate: 'action-id', entities: ['next-f'] },
      { fate: 'server-only', entities: ['next-f'], from: ['SA2'] },
      { fate: 'action-id', entities: ['src-settings-page'], from: ['SA3', 'SA4'] }
    ],
    motion: ['reference'], reduced: 'static'
  },
  {
    step: 'j7-5', mode: 'peek', form: 'html',
    summary: [
      `PF7 <form action={formAction}> · with JS: React intercepts submit and fetches · without JS: <form method="POST" enctype="multipart/form-data"> + <input type="hidden" name="$ACTION_ID_${ACTION_ID}"/> (useActionState adds $ACTION_KEY)`
    ],
    panes: [{ title: 'components/ProfileForm.tsx', entity: 'src-profile-form', abridged: true, rows: source(['PF5', 'PF7', 'PF8', 'PF9']) }],
    links: [{ fate: 'split', entities: ['client-components', 'dom'] }],
    motion: [], reduced: 'static'
  },
  {
    step: 'j7-6', mode: 'open', form: 'http',
    panes: [{
      title: 'POST /dashboard/settings · request', entity: 'client-components', abridged: true,
      rows: [
        { text: 'POST /dashboard/settings', change: 'new', note: 'the current page, not a route named after the action' },
        { text: `Next-Action: ${ACTION_ID}`, from: ['AC4', 'PF3'], fate: 'action-id', change: 'new', morph: ACTION_ID, note: 'the only thing that names the function' },
        { text: 'Accept: text/x-component', change: 'new' },
        { text: 'Next-Router-State-Tree: …"settings"…', change: 'new', note: 'sent, but with no RSC: 1 header the server ignores it: a re-render starts at the root' },
        { text: 'Content-Type: multipart/form-data; boundary=…', from: ['PF7'], fate: 'split', change: 'new', note: 'a FormData argument' },
        { text: '0: [null,"$K1"]', from: ['PF5'], fate: 'split', change: 'new', note: 'the arguments: prevState, then the form' },
        { text: '_1_name: Ada Lovelace', from: ['PF8'], fate: 'split', change: 'new', note: 'the form field' }
      ]
    }],
    links: [
      { fate: 'action-id', entities: ['routing-ladder'] },
      { fate: 'split', entities: ['client-components'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  { step: 'j7-7', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j7-8', mode: 'peek', form: 'manifest',
    summary: [`⇄ Next-Action ${ACTION_ID} → server-reference-manifest → workers["app/dashboard/settings/page"] · exportedName "updateProfile" ✓ · unknown ID: "Failed to find Server Action", nothing runs`],
    panes: [{
      title: 'server/server-reference-manifest.json', entity: 'server-reference-manifest', abridged: true,
      rows: [{ text: `{ node: { "${ACTION_ID}": { workers: { "app/dashboard/settings/page": { moduleId: …, async: false } }, exportedName: "updateProfile", … } } }`, from: ['AC4'], fate: 'action-id', change: 'same', note: 'found: the module loads, the export resolves' }]
    }],
    links: [{ fate: 'action-id', entities: ['server-reference-manifest', 'action-handler'] }],
    motion: [], reduced: 'static'
  },
  { step: 'j7-9', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j7-10', mode: 'peek', form: 'tsx',
    summary: ["⊘ AC5 db.update('profile', …) runs: the row changes · ▤ DA4 getProfile's entry (tag profile) still holds the old name"],
    panes: [
      { title: 'app/actions.ts', entity: 'src-actions', abridged: true, rows: source(['AC5']) },
      { title: 'lib/data.ts', abridged: true, rows: source(['DA3', 'DA4']) }
    ],
    links: [
      { fate: 'server-only', entities: ['db', 'action-handler'], from: ['AC5'] },
      { fate: 'cached', entities: ['data-cache'] }
    ],
    motion: [], reduced: 'static'
  },
  { step: 'j7-11', mode: 'off', panes: [], links: [], motion: [] },
  {
    step: 'j7-12', mode: 'peek', form: 'tsx',
    summary: ["⊘ AC6 updateTag('profile') → ▤ DA4 cacheTag('profile'): every entry with that tag expires now, in this request"],
    panes: [
      { title: 'app/actions.ts', entity: 'src-actions', abridged: true, rows: source(['AC2', 'AC6']) },
      { title: 'lib/data.ts', abridged: true, rows: source(['DA4']) }
    ],
    links: [
      { fate: 'server-only', entities: ['data-cache', 'server-cache'], from: ['AC2', 'AC6'] },
      { fate: 'cached', entities: ['data-cache'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j7-13', mode: 'peek', form: 'tsx',
    summary: [
      "⊘ SP5 getProfile() runs again: ▤ miss, fresh row from the db → f · what if AV2 revalidateTag('profile', 'max'): marked stale only, no f in this response"
    ],
    panes: [
      { title: 'app/dashboard/settings/page.tsx', entity: 'src-settings-page', abridged: true, rows: source(['SP4', 'SP5']) },
      { title: 'app/actions.ts', entity: 'src-actions', badge: 'what if', hint: 'J7, J8: revalidateTag instead of updateTag', abridged: true, rows: source(['AV1', 'AV2']) }
    ],
    links: [
      { fate: 'server-only', entities: ['rsc-runtime-entity'], from: ['SP4', 'SP5'] },
      { fate: 'cached', entities: ['data-cache'] },
      { fate: 'server-only', entities: ['data-cache'], from: ['AV1', 'AV2'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j7-14', mode: 'open', form: 'flight',
    panes: [{
      title: 'POST /dashboard/settings · 200 · text/x-component', entity: 'flight', abridged: true,
      rows: [
        { text: '0:{"a":"$@1","f":[[["",{…}],[…seed…],…,false]],"q":"","i":false,…}', from: ['AC6'], fate: 'server-only', change: 'new', morph: '"f"', note: 'a: the return value · f: the whole route from the root, there because of updateTag' },
        { text: '1:{"ok":true}', from: ['AC7'], fate: 'server-only', change: 'new', morph: '"ok"', note: 'a resolves to this row' },
        { text: '   …["$","dl",null,{"children":[…,["$","dd",null,{"children":"ada@example.com"}],…]}]…', from: ['AS2'], fate: 'server-only', change: 'new' },
        { text: '   …["$","$L2",null,{"name":"Ada Lovelace"}]…', from: ['SP9'], fate: 'client-boundary', change: 'new', note: 'fresh props: getProfile read the new row' },
        { fold: 4, label: "4 rows of client references and Next's own (LayoutRouter …)" }
      ]
    }],
    footer: ['no HTML · without updateTag (step 11) the root row is {a, f:"", q, i}: f is empty'],
    links: [
      { fate: 'server-only', entities: ['flight'] },
      { fate: 'client-boundary', entities: ['flight'] }
    ],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j7-15', mode: 'open', form: 'dom',
    panes: [{
      title: 'document · after the merge', entity: 'dom', abridged: true,
      rows: [
        { text: '<nav data-open="true">…</nav>', from: ['DN6'], fate: 'split', mark: 'shared-layout', change: 'same', note: 'kept: re-sent in f ($L1), same component in the same place, so its state survives' },
        { text: '<dl>…ada@example.com…</dl>', from: ['AS2'], fate: 'server-only', change: 'same', note: 'swapped in from f' },
        { text: '<form>…<input name="name" value="Ada Lovelace"/>…</form>', from: ['PF7', 'PF8'], fate: 'split', change: 'same', morph: 'Ada Lovelace', note: 'fresh props from f' },
        { text: "<button>Save</button>Saved", from: ['PF9'], fate: 'split', change: 'new', morph: 'Saved', note: 'useActionState: state = a = { ok: true }' }
      ]
    }],
    links: [
      { fate: 'shared-layout', entities: ['client-components'] },
      { fate: 'split', entities: ['client-components'] },
      { fate: 'server-only', entities: ['layout-router'] }
    ],
    motion: ['swap'], reduced: 'side-by-side'
  },
  {
    step: 'j7-16', mode: 'peek', form: 'http',
    summary: ['what if AR2 redirect("/dashboard/billing") in the action → x-action-redirect: /dashboard/billing;push · the client router navigates, no document load'],
    panes: [
      { title: 'app/actions.ts', entity: 'src-actions', badge: 'what if', hint: 'J7: redirect() after the update', abridged: true, rows: source(['AR1', 'AR2']) },
      {
        title: 'POST /dashboard/settings · response', entity: 'action-handler', abridged: true,
        rows: [{ text: 'x-action-redirect: /dashboard/billing;push', from: ['AR2'], fate: 'server-only', change: 'new', note: 'instead of f: the router navigates there' }]
      }
    ],
    links: [
      { fate: 'server-only', entities: ['action-handler'], from: ['AR1', 'AR2'] },
      { fate: 'server-only', entities: ['app-router'], from: ['AR2'] }
    ],
    motion: []
  },
  { step: 'j7-17', mode: 'off', panes: [], links: [], motion: [] }
]
