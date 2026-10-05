// src/domain/codeLens/view.ts
import type { ArtifactForm, CodeLens, Fate, FoldRow, LensPane, LensRow, LensStep, LineChange, SpecimenFile } from '../types'

/** pure helpers the lens UI draws from; types only here, so the lens data stays in its lazy chunk */

export const isFold = (r: LensRow): r is FoldRow => 'fold' in r

/** the entities a row lights: every link whose fate is the row's hue or mark, narrowed to its lines when the link names `from` */
export function entitiesForRow(step: LensStep, row: LensRow): string[] {
  if (isFold(row)) return []
  const out = new Set<string>()
  for (const l of step.links) {
    if (l.fate !== row.fate && l.fate !== row.mark) continue
    if (l.from && !l.from.some((id) => row.from?.includes(id))) continue
    for (const e of l.entities) out.add(e)
  }
  return [...out]
}

/** `pane:row` keys of the rows that link to any of the entities (map hover or inspector selection → lines) */
export function rowsForEntities(step: LensStep, panes: LensPane[], entities: ReadonlySet<string>): Set<string> {
  const out = new Set<string>()
  if (!entities.size) return out
  panes.forEach((p, i) => p.rows.forEach((r, j) => { if (entitiesForRow(step, r).some((e) => entities.has(e))) out.add(`${i}:${j}`) }))
  return out
}

/** which rows carry the text chip: the first line of each run of one hue (or one mark) in a pane; fateless lines do not break a run */
export function chipRows(rows: LensRow[]): { hue: boolean; mark: boolean }[] {
  let hue: string | undefined, mark: string | undefined
  return rows.map((r) => {
    if (isFold(r)) return { hue: false, mark: false }
    const h = !!r.fate && r.fate !== hue, m = !!r.mark && r.mark !== mark
    if (r.fate) hue = r.fate
    if (r.fate || r.mark) mark = r.mark
    return { hue: h, mark: m }
  })
}

/** the one-line strip: the step's own ledger, or (an open step the user collapsed) its pane titles and fate counts */
export function stripLines(step: LensStep, fates: Fate[]): string[] {
  if (step.summary?.length) return step.summary
  const counts = new Map<string, number>()
  for (const p of step.panes) for (const r of p.rows) if (!isFold(r) && r.fate) counts.set(r.fate, (counts.get(r.fate) ?? 0) + 1)
  const tally = fates.filter((f) => counts.has(f.id)).map((f) => `${f.glyph} ${f.label} ${counts.get(f.id)}`)
  return [[step.panes.map((p) => p.title).join(' | '), ...tally].join(' · ')]
}

/** reduced motion draws a form change as before | after: these forms show the earlier form's panes, every other one its specimen source */
const BEFORE: Partial<Record<ArtifactForm, ArtifactForm>> = { js: 'tsx', 'flight-patch': 'flight' }

/** the "before" pane(s) for a reduced-motion step (docs/code-lens.md §5.2), or none when the step is drawn static */
export function beforePanes(lens: CodeLens, specimen: SpecimenFile[], index: number): LensPane[] {
  const step = lens.steps[index]
  if (!step || !step.form || (step.reduced !== 'side-by-side' && step.reduced !== 'three-pane')) return []
  const form = BEFORE[step.form]
  const earlier = form && lens.steps.slice(0, index).reverse().find((s) => s.form === form && s.panes.length)
  /** the patch replaces the earlier rows, so they are drawn gone; a source is drawn plain */
  const change: LineChange | undefined = step.form === 'flight-patch' ? 'gone' : undefined
  if (earlier) return earlier.panes.map((p) => ({ ...p, rows: p.rows.map((r) => ({ ...r, change })) }))
  /** the source lines the step's rows come from, in specimen order: one pane per file, so each says where it is written */
  const variant = new Set(specimen.filter((f) => f.variant).flatMap((f) => f.lines.map((l) => l.id)))
  /** a what-if line on a new row is the edit itself (J9's saved lines), not what came before it */
  const ids = new Set(step.panes.flatMap((p) => p.rows.flatMap((r) => (r.from ?? []).filter((id) => !(r.change === 'new' && variant.has(id))))))
  const panes: LensPane[] = specimen.flatMap((f) => {
    const rows = f.lines.filter((l) => ids.has(l.id)).map((l) => ({ text: l.text, from: [l.id], fate: l.fate, mark: l.mark }))
    /** a what-if variant says so in its header */
    return rows.length ? [{ title: f.path, ...(f.variant && { badge: 'what if', hint: f.variant }), abridged: rows.length < f.lines.length || !!f.variant, rows }] : []
  })
  if (panes.length <= MAX_SOURCE_PANES) return panes
  /** more files than fit beside the step: the first keeps its pane, the rest fold into one "n more files" pane, a fold per file */
  const [first, ...rest] = panes
  const folds: LensRow[] = rest.map((p) => {
    const from = p.rows.flatMap((r) => (isFold(r) ? [] : r.from ?? []))
    return { fold: from.length, label: `${from.length} ${from.length === 1 ? 'line' : 'lines'} of ${p.title}${p.badge ? ' (what if)' : ''}`, from }
  })
  return [first, { title: `${rest.length} more files`, abridged: true, rows: folds }]
}

/** a reduced-motion step draws at most this many source panes before its own, so the panel never fills with context */
const MAX_SOURCE_PANES = 2
