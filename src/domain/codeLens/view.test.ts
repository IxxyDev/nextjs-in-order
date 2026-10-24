import { describe, it, expect } from 'vitest'
import type { CodeLens, CodeLine, LensStep } from '../types'
import { FATES, SPECIMEN } from './specimen'
import { STEPS } from './whole-lifecycle'
import { beforePanes, chipRows, entitiesForRow, isFold, rowsForEntities, stripLines } from './view'

const LENS: CodeLens = { journey: 'j0', steps: STEPS }
const step = (id: string) => LENS.steps.find((s) => s.step === id)!
const at = (id: string) => LENS.steps.findIndex((s) => s.step === id)

describe('lens links', () => {
  const nav: LensStep = {
    step: 'j0-3', mode: 'open', form: 'js', panes: [], motion: [],
    links: [
      { fate: 'client-boundary', entities: ['swc'] },
      { fate: 'client-boundary', entities: ['src-dashboard-nav'], from: ['DN1'] }
    ]
  }

  it('lights every entity linked to the row\'s hue, a link narrowed to the row\'s source line included', () => {
    expect(entitiesForRow(nav, { text: '/* __next_internal_client_entry_do_not_use__ default auto */', from: ['DN1'], fate: 'client-boundary' })).toEqual(['swc', 'src-dashboard-nav'])
  })
  it('leaves out a link narrowed to other source lines', () => {
    expect(entitiesForRow(nav, { text: 'export default function DashboardNav() {', from: ['DN5'], fate: 'client-boundary' })).toEqual(['swc'])
  })
  it('lights through the timing mark when the row has one', () => {
    const s: LensStep = {
      step: 'j0-10', mode: 'open', form: 'flight-patch', panes: [], motion: [],
      links: [
        { fate: 'server-only', entities: ['rsc-runtime-entity'], from: ['BP7', 'BP8'] },
        { fate: 'suspended', entities: ['suspense-hole'] },
        { fate: 'shared-layout', entities: ['src-root-layout', 'src-dashboard-layout'] },
        { fate: 'server-only', entities: ['layout-router'], from: ['DL6'] }
      ]
    }

    expect(entitiesForRow(s, { text: 'no rows: RootLayout · DashboardLayout', from: ['RL1', 'DL2'], mark: 'shared-layout' })).toEqual(['src-root-layout', 'src-dashboard-layout'])
    expect(entitiesForRow(s, { text: '…["$","$1",null,{"children":"$L2"}]…', from: ['BP7', 'BP8'], fate: 'server-only', mark: 'suspended' })).toEqual(['rsc-runtime-entity', 'suspense-hole'])
    expect(entitiesForRow(s, { text: 'DashboardLayout {children} → LayoutRouter', from: ['DL6'], fate: 'server-only' })).toEqual(['layout-router'])
  })
  it('lights nothing from a fold', () => {
    expect(entitiesForRow(nav, { fold: 3, label: '3 import lines, unchanged', from: ['DN2', 'DN3', 'DN4'] })).toEqual([])
  })
  it('lights nothing from a fateless line', () => {
    expect(entitiesForRow(nav, { text: 'GET /dashboard/billing?_rsc=qR7vX2mK9pLw3sTb · RSC: 1' })).toEqual([])
  })
  it('lights nothing on a step with no links', () => {
    expect(entitiesForRow({ ...nav, links: [] }, { text: 'export default function DashboardNav() {', from: ['DN5'], fate: 'client-boundary' })).toEqual([])
  })
  it('maps an entity back to the rows that link to it', () => {
    const s = step('j0-4')
    expect([...rowsForEntities(s, s.panes, new Set(['browser-chunks']))]).toEqual(['1:0', '1:1', '1:2'])
    expect([...rowsForEntities(s, s.panes, new Set(['layers']))]).toEqual(['0:0', '0:1', '0:3', '0:4'])
    expect(rowsForEntities(s, s.panes, new Set()).size).toBe(0)
    expect(rowsForEntities(s, s.panes, new Set(['dom'])).size).toBe(0)
  })
})

describe('lens chips', () => {
  it('puts the text chip on the first line of each run of one hue or one mark', () => {
    const rows: CodeLine[] = [
      { text: 'a', fate: 'server-only' }, { text: '}' }, { text: 'b', fate: 'server-only', mark: 'static-shell' },
      { text: 'c', fate: 'server-only', mark: 'suspended' }, { text: 'd', fate: 'split' }, { text: 'e', mark: 'shared-layout' }
    ]
    expect(chipRows(rows)).toEqual([
      { hue: true, mark: false }, { hue: false, mark: false }, { hue: false, mark: true },
      { hue: false, mark: true }, { hue: true, mark: false }, { hue: false, mark: true }
    ])
  })
})

describe('lens strip', () => {
  it('uses the step ledger when it has one', () => {
    const s: LensStep = { step: 'j0-5', mode: 'peek', form: 'manifest', summary: ['client-reference-manifest.json · 1 entry'], panes: [], links: [], motion: [] }

    expect(stripLines(s, FATES)).toEqual(['client-reference-manifest.json · 1 entry'])
  })
  it('counts the lines of each fate after the pane titles, without a ledger', () => {
    const s: LensStep = {
      step: 'j0-4', mode: 'peek', form: 'js-reference', links: [], motion: [],
      panes: [
        { title: 'server · rsc layer', abridged: true, rows: [{ text: 'export default registerClientReference(', fate: 'client-boundary' }] },
        { title: 'static/chunks/app/dashboard/layout-3c4d.js', abridged: true, rows: [{ text: 'useState(false)', fate: 'split' }, { text: '}' }, { text: '_jsx("button", …)', fate: 'split' }] }
      ]
    }

    expect(stripLines(s, FATES)).toEqual(['server · rsc layer | static/chunks/app/dashboard/layout-3c4d.js · ⚡ client boundary 1 · ⚡ split 2'])
  })
})

describe('reduced-motion before panes', () => {
  it('shows the earlier form where one exists: TSX before JS, Flight before the patch (drawn gone)', () => {
    expect(beforePanes(LENS, SPECIMEN, at('j0-3'))).toEqual(step('j0-2').panes.map((p) => ({ ...p, rows: p.rows.map((r) => ({ ...r, change: undefined })) })))
    const patch = beforePanes(LENS, SPECIMEN, at('j0-10'))
    expect(patch[0].title).toBe(step('j0-7').panes[0].title)
    expect(patch[0].rows.every((r) => r.change === 'gone')).toBe(true)
  })
  it('falls back to the specimen source, in specimen order', () => {
    const [src, ...more] = beforePanes(LENS, SPECIMEN, at('j0-4'))
    expect(more).toEqual([])
    expect(src.title).toBe('components/DashboardNav.tsx')
    expect(src.rows.map((r) => (r as CodeLine).from![0])).toEqual(['DN1', 'DN2', 'DN3', 'DN4', 'DN5', 'DN6', 'DN7', 'DN9', 'DN10', 'DN11', 'DN12'])
  })
  it('gives each source file its own pane, at most two: past that, the rest fold into one "n more files" pane, a fold per file', () => {
    const flight = beforePanes(LENS, SPECIMEN, at('j0-7'))
    expect(flight.map((p) => p.title)).toEqual(['app/dashboard/layout.tsx', '3 more files'])
    expect(flight[0].rows.map((r) => (r as CodeLine).from![0])).toEqual(['DL4', 'DL5'])
    expect(flight[1].rows.map((r) => (isFold(r) ? [r.label, r.from] : []))).toEqual([
      ['4 lines of components/DashboardNav.tsx', ['DN9', 'DN10', 'DN11', 'DN12']],
      ['1 line of app/dashboard/settings/page.tsx', ['SP9']],
      ['1 line of components/AccountSummary.tsx', ['AS2']]
    ])
    expect(flight.every((p) => p.abridged)).toBe(true)
  })
  it('leaves out a what-if line that is the new row itself (J9 step 13: the saved edit is not the before)', async () => {
    const { STEPS: J9 } = await import('./dev-mode')
    const j9: CodeLens = { journey: 'j9', steps: J9 }
    const panes = beforePanes(j9, SPECIMEN, J9.findIndex((s) => s.step === 'j9-13'))
    expect(panes.map((p) => p.title)).toEqual(['components/AccountSummary.tsx'])
    expect(panes[0].rows.map((r) => (r as CodeLine).from![0])).toEqual(['AS2'])
  })
  it('draws static steps without a before pane', () => {
    for (const id of ['j0-1', 'j0-2', 'j0-8', 'j0-9']) expect(beforePanes(LENS, SPECIMEN, at(id))).toEqual([])
  })
})
