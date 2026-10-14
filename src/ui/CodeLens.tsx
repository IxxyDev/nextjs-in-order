// src/ui/CodeLens.tsx
import { useEffect, useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import type { ArtifactForm, CodeLine, Fate, FateId, LensPane, LensRow, LensStep, LineChange } from '../domain/types'
import { loadLens, peekLens } from '../domain/codeLens'
import { beforePanes, chipRows, entitiesForRow, isFold, rowsForEntities, stripLines } from '../domain/codeLens/view'
import { LENS_KEY } from '../domain/sessionFlags'
import { reducedMotion } from './useReducedMotion'
import { clearLensLit, lensLit, lensOpen, mapHover } from './lensLink'
import { useLazy } from './useLazy'
import { useSessionFlag } from './useSessionFlag'

const FORM: Record<ArtifactForm, string> = {
  tsx: 'TSX', js: 'JS', 'js-reference': 'JS + references', manifest: 'manifests', flight: 'Flight rows', html: 'HTML', dom: 'DOM', 'flight-patch': 'Flight patch',
  http: 'HTTP', json: 'JSON', css: 'CSS', files: 'files', terminal: 'terminal'
}
const BODY_ID = 'code-lens-body'
/** forms whose rows run past 100 columns: their before | after stacks */
const STACKED = new Set<ArtifactForm>(['flight', 'flight-patch', 'http', 'json'])

/** a run this long may not fit a narrow pane: it gets break points after _ / . ( and a comma, so it wraps between words, not mid-word */
const LONG_RUN = 16
function breakable(text: string): ComponentChildren {
  if (text.length < LONG_RUN) return text
  return text.split(/(\s+)/).flatMap((run, i) => run.length < LONG_RUN || /\s/.test(run)
    ? [run]
    : run.split(/(?<=[_/.(,])/).flatMap((part, j) => (j ? [<wbr key={`${i}:${j}`} />, part] : [part])))
}

/** the shared identifier keeps its highlight while the text around it changes form */
function Code({ text, morph }: { text: string; morph?: string }) {
  const i = morph ? text.indexOf(morph) : -1
  return <code class="lens-code">{i < 0 ? breakable(text) : <>{breakable(text.slice(0, i))}<mark class="lens-morph">{breakable(morph!)}</mark>{breakable(text.slice(i + morph!.length))}</>}</code>
}

/** a wrapped line hangs two columns past its own indent, so a continuation never reads as a new line */
function Text({ text, morph, children }: { text: string; morph?: string; children?: ComponentChildren }) {
  const body = text.trimStart()
  return <div class="lens-line" style={{ '--lead': String(text.length - body.length) }}><Code text={body} morph={morph} />{children}</div>
}

const CHANGE: Record<LineChange, string> = { new: 'new line', same: '', gone: 'removed' }
const SIGN: Partial<Record<LineChange, string>> = { new: '+', gone: '−' }

interface RowProps {
  step: LensStep; row: CodeLine; k: string; n: number; chip: { hue: boolean; mark: boolean }
  fate: (id?: FateId) => Fate | undefined; lit: boolean; roving: (k: string) => { tabIndex: number; 'data-key': string; 'data-lens-row': true }
  /** the pane's own header says it (every line new, or every line gone): the lines carry no per-line change */
  quiet?: boolean
  /** a reduced-motion before pane: earlier context, linked to nothing at this step and never flagged off-map */
  context?: boolean
}

/**
 * one code line: change as a diff sign and tint, fate as the hue bar and gutter glyphs, the note as a trailing
 * annotation; the group's fate chip sits on its first line only, so color is never the only signal
 */
function Line({ step, row, k, n, chip, fate, lit, roving, quiet, context }: RowProps) {
  const hue = fate(row.fate), mark = fate(row.mark)
  const entities = context ? [] : entitiesForRow(step, row)
  const change = quiet ? undefined : row.change
  const point = () => { lensLit.value = { ids: new Set(entities), hue: row.fate } }
  const cls = ['lens-row', row.fate ? `fate-${row.fate}` : 'is-frame', row.mark ? `has-${row.mark}` : '', change ? `is-${change}` : '', lit ? 'is-lit' : '', context ? 'is-context' : '']
  /** rule 4: a fate with nothing on the map at this step says so */
  const offMap = !context && (!!hue || !!mark) && !entities.length
  const chips = (hue && chip.hue) || (mark && chip.mark) || offMap
  return (
    <li class={cls.filter(Boolean).join(' ')} style={{ '--i': String(n) }} {...roving(k)} onMouseEnter={point} onMouseLeave={clearLensLit} onFocus={point} onBlur={clearLensLit}>
      <span class="lens-sign" aria-hidden="true">{change && SIGN[change]}</span>
      <span class="lens-gutter" aria-hidden="true"><span>{hue?.glyph}</span><span>{mark?.glyph}</span></span>
      <div class="lens-cell">
        <Text text={row.text} morph={row.morph}>
          {row.cut && <del class="lens-cut"><span aria-hidden="true">✂ </span>{row.cut}</del>}
          {row.note && <span class="lens-note">{row.note}</span>}
          {change && CHANGE[change] && <span class="visually-hidden"> · {CHANGE[change]}</span>}
          {hue && !chip.hue && <span class="visually-hidden"> · {hue.label}</span>}
          {mark && !chip.mark && <span class="visually-hidden"> · {mark.label}</span>}
        </Text>
        {chips && (
          <div class="lens-meta">
            {hue && chip.hue && <span class={`lens-chip fate-${hue.id}`}>{hue.glyph} {hue.label} · {hue.chip}</span>}
            {mark && chip.mark && <span class="lens-chip is-mark">{mark.glyph} {mark.label}</span>}
            {offMap && <span class="lens-flag">off-map</span>}
          </div>
        )}
      </div>
    </li>
  )
}

/** the code lens (docs/code-lens.md): one specimen app's code changing form along the journey, linked both ways to the map */
export function CodeLens({ slug, stepId, selected }: { slug: string; stepId: string; selected?: string }) {
  const { value: bundle, isFailed, retry } = useLazy(slug, peekLens, loadLens)
  useEffect(() => () => clearLensLit(), [])
  /** unset: each step's mode decides; an explicit expand or collapse holds for the session (expand pins it open, collapse keeps open steps to the strip) */
  const [choice, choose] = useSessionFlag(LENS_KEY)
  const [folds, setFolds] = useState<ReadonlySet<string>>(new Set())
  /** one tab stop for all lines; ↑/↓ move between them (←/→/Space/Home/End stay with the step controls) */
  const [active, setActive] = useState<string>()
  const root = useRef<HTMLElement>(null)
  useEffect(() => { clearLensLit(); setActive(undefined) }, [stepId])
  /** whether the panes show, for the phone's room toggle; written after render, cleared on unmount */
  const showing = useRef(false)
  useEffect(() => { lensOpen.value = showing.current })
  useEffect(() => () => { lensOpen.value = false }, [])

  showing.current = false
  if (isFailed) return <section class="lens" aria-label="Code lens"><p class="lens-failed" role="alert">Couldn't load the code lens. <button onClick={retry}>Retry</button></p></section>
  if (!bundle) return null
  const index = bundle.lens.steps.findIndex((s) => s.step === stepId)
  const step = bundle.lens.steps[index]
  if (!step || step.mode === 'off') return null

  const fate = (id?: FateId) => (id ? bundle.fates.find((f) => f.id === id) : undefined)
  const expandable = step.panes.length > 0
  const expanded = expandable && (choice ?? step.mode === 'open')
  showing.current = expanded
  const reduced = reducedMotion.value
  const before = expanded && reduced ? beforePanes(bundle.lens, bundle.specimen, index) : []
  const panes: LensPane[] = [...before, ...step.panes]
  const pointed = new Set([mapHover.value, selected].filter((id): id is string => !!id))
  /** keys are `pane:row` over all panes; before panes are context and never light */
  const lit = rowsForEntities(step, panes, pointed)
  const roving = (k: string) => ({ tabIndex: k === (active ?? '0:0') ? 0 : -1, 'data-key': k, 'data-lens-row': true as const })
  const onFocusIn = (e: FocusEvent) => { const k = (e.target as HTMLElement).dataset?.key; if (k) setActive(k) }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const items = [...root.current!.querySelectorAll<HTMLElement>('[data-lens-row]')]
    const i = items.indexOf(e.target as HTMLElement)
    if (i < 0) return
    e.preventDefault()
    items[Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus()
  }
  const toggleFold = (k: string) => { const s = new Set(folds); if (!s.delete(k)) s.add(k); setFolds(s) }
  const specimen = bundle.specimen.flatMap((f) => f.lines)

  /** every non-fold line of a pane is new (a fresh artifact) or gone (a before pane): said once in its header */
  const uniform = (rows: LensRow[]): LineChange | undefined => {
    const lines = rows.filter((r) => !isFold(r))
    const c = lines[0]?.change
    return c && c !== 'same' && lines.every((r) => r.change === c) ? c : undefined
  }

  const rowFor = (row: LensRow, k: string, n: number, chip: { hue: boolean; mark: boolean }, isLit: boolean, quiet: boolean, context: boolean) => {
    if (!isFold(row)) return <Line key={k} step={step} row={row} k={k} n={n} chip={chip} fate={fate} lit={isLit} roving={roving} quiet={quiet} context={context} />
    /** a fold is one calm line, never struck: what it leaves out, and (when it can) a toggle that shows it */
    const cls = 'lens-row is-fold'
    const gone = row.change === 'gone' && <span class="visually-hidden"> · removed</span>
    const source = row.lines?.length ? undefined : row.from?.map((id) => specimen.find((l) => l.id === id)).filter((l) => !!l)
    if (!row.lines?.length && !source?.length) {
      return <li key={k} class={cls} style={{ '--i': String(n) }} {...roving(k)}><span class="lens-sign" aria-hidden="true" /><span class="lens-fold"><span aria-hidden="true">⋯ </span>{row.label}{gone}</span></li>
    }
    const open = folds.has(`${stepId}:${k}`)
    const inner: CodeLine[] = row.lines?.length ? row.lines.map((text) => ({ text })) : source!.map((l) => ({ text: l.text, from: [l.id], fate: l.fate, mark: l.mark }))
    const chips = chipRows(inner)
    /** source lines inside a compiled pane say where they come from */
    const file = source && bundle.specimen.find((f) => f.lines.some((l) => l.id === source[0].id))
    const caption = source && step.form !== 'tsx' ? `as written in ${file ? `${file.path}${file.variant ? ' (what if)' : ''}` : 'the source'}` : undefined
    return (
      <li key={k} class={cls} style={{ '--i': String(n) }}>
        <span class="lens-sign" aria-hidden="true" />
        <div class="lens-cell">
          <button type="button" class="lens-fold" aria-expanded={open} {...roving(k)} onClick={() => toggleFold(`${stepId}:${k}`)}>
            <span class="lens-fold-icon" aria-hidden="true">▸</span>{row.label}{gone}
          </button>
          {open && (
            <div class="lens-unfolded">
              {caption && <p class="lens-caption">{caption}</p>}
              <ol class="lens-rows">{inner.map((r, j) => <Line key={`${k}:${j}`} step={step} row={r} k={`${k}:${j}`} n={0} chip={chips[j]} fate={fate} lit={!context && entitiesForRow(step, r).some((e) => pointed.has(e))} roving={roving} context={context} />)}</ol>
            </div>
          )}
        </div>
      </li>
    )
  }

  const paneFor = (p: LensPane, i: number) => {
    const isBefore = i < before.length
    const chips = chipRows(p.rows)
    const all = uniform(p.rows)
    /** a title is 'path' or 'path · description': the path keeps its file name whole and truncates its folders from the start;
     * the description follows it; any other title truncates at the end */
    const [head, ...desc] = p.title.split(' · ')
    const path = !/\s/.test(head) && /[/.]/.test(head)
    const cut = head.lastIndexOf('/') + 1
    /** the side label is left out only when the title already opens with it ('server · rsc layer'), not for a path such as server/pages/… */
    const side = isBefore ? 'before' : p.side && !p.title.startsWith(`${p.side} ·`) ? p.side : undefined
    return (
      <section key={`${step.step}:${i}`} class={`lens-pane ${p.side ? `side-${p.side}` : ''} ${isBefore ? 'is-before' : ''} ${all === 'gone' ? 'is-all-gone' : ''} ${isBefore && step.reduced === 'three-pane' ? 'is-wide' : ''}`} aria-label={`${isBefore ? 'Before: ' : ''}${p.title}`}>
        <header class="lens-pane-head">
          {side && <span class="lens-side">{side}</span>}
          {path
            ? <span class="lens-file is-path" title={p.title}><span class="lens-dir"><bdi>{head.slice(0, cut)}</bdi></span><span class="lens-base">{head.slice(cut)}</span>{desc.length > 0 && <span class="lens-desc">{` · ${desc.join(' · ')}`}</span>}</span>
            : <span class="lens-file" title={p.title}>{p.title}</span>}
          {p.badge && <span class="lens-badge">{p.badge}</span>}
          {all === 'new' && !isBefore && <span class="lens-flag is-new">new</span>}
          {all === 'gone' && <span class="lens-flag is-gone">replaced</span>}
          {p.abridged && <span class="lens-flag">abridged</span>}
        </header>
        {p.hint && !isBefore && <p class="lens-hint">{p.hint}</p>}
        <ol class="lens-rows">{p.rows.map((r, j) => rowFor(r, `${i}:${j}`, j, chips[j], !isBefore && lit.has(`${i}:${j}`), !!all, isBefore))}</ol>
      </section>
    )
  }

  /** the split always pairs; a reduced-motion before | after pairs code, but Flight rows (100+ columns each) read better stacked */
  const paired = step.split || (before.length > 0 && !STACKED.has(step.form!))
  const strip = stripLines(step, bundle.fates).map((l) => <span key={l} class="lens-strip-line">{l}</span>)
  const motion = reduced ? '' : step.motion.map((m) => `motion-${m}`).join(' ')
  return (
    <section class="lens" aria-labelledby="lens-title" ref={root} onKeyDown={onKeyDown} onFocusIn={onFocusIn}>
      <div class="lens-head">
        <h3 id="lens-title" class="lens-title">Code lens</h3>
        {step.form && <span class="lens-tag">{FORM[step.form]}</span>}
        {expanded && <button type="button" class="lens-toggle" aria-expanded="true" aria-controls={BODY_ID} onClick={() => choose(false)}>Hide code</button>}
      </div>
      {step.chip && <p class="lens-chipline">{step.chip}</p>}
      {expanded
        ? <div id={BODY_ID} key={step.step} class={`lens-body ${motion}`}>
            <div class={`lens-panes ${paired ? 'is-paired' : ''}`}>{panes.map(paneFor)}</div>
          </div>
        : expandable
          ? <button type="button" class={`lens-strip ${step.dimmed ? 'is-dimmed' : ''}`} aria-expanded="false" onClick={() => choose(true)}>
              {strip}
              <span class="lens-strip-cta">Show code</span>
            </button>
          : <div class={`lens-strip ${step.dimmed ? 'is-dimmed' : ''}`}>{strip}</div>}
      {step.footer && (
        <div key={`${step.step}:ledger`} class={`lens-ledger ${motion}`} role="note" aria-label="Ledger">
          {step.footer.map((l) => { const [head, ...rest] = l.split(' · '); return <p key={l}><strong>{head}</strong>{rest.length ? ` · ${rest.join(' · ')}` : ''}</p> })}
        </div>
      )}
    </section>
  )
}
