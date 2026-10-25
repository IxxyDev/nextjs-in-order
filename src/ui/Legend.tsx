import type { ChipState, GlyphKind } from '../domain/types'
import { GLYPH_NAME } from '../domain/glyphName'
import { STATE_LABEL } from '../domain/stateLabel'
import { FATES } from '../domain/codeLens/specimen/fates'
import { LEGEND } from './camera'
import { Glyph } from './Glyph'
import { GLYPH } from './labelLayout'

const KINDS = Object.keys(GLYPH_NAME) as GlyphKind[]
const STATES = Object.keys(STATE_LABEL) as ChipState[]
/** room past the GLYPH box for the shapes that reach out of it (the runtime is 72 wide) and their stroke */
const GLYPH_PAD = 6
const GLYPH_VIEW_BOX = `${-GLYPH.w / 2 - GLYPH_PAD} ${-GLYPH.h / 2 - GLYPH_PAD} ${GLYPH.w + 2 * GLYPH_PAD} ${GLYPH.h + 2 * GLYPH_PAD}`

/** the canvas vocabulary, read from the tables the canvas draws with: glyph shapes, code-lens fate marks, state chips; collapsed at every width */
export function Legend() {
  return (
    <details class="legend" style={{ top: `${LEGEND.top}px`, right: `${LEGEND.right}px` }}>
      <summary style={{ width: `${LEGEND.w}px`, height: `${LEGEND.h}px` }}>Legend</summary>
      <section class="legend-body" aria-label="Legend">
        <h3 id="legend-shapes">Shapes</h3>
        <ul aria-labelledby="legend-shapes">
          {KINDS.map((k) => <li key={k}><svg class="legend-glyph" viewBox={GLYPH_VIEW_BOX} aria-hidden="true"><Glyph kind={k} /></svg><span>{GLYPH_NAME[k]}</span></li>)}
        </ul>
        <h3 id="legend-marks">Code marks</h3>
        <ul aria-labelledby="legend-marks">
          {FATES.map((f) => <li key={f.id} class={`fate-${f.id}`}><span class="legend-mark" aria-hidden="true">{f.glyph}</span>{f.label}</li>)}
        </ul>
        <h3 id="legend-states">States</h3>
        <ul aria-labelledby="legend-states">
          {STATES.map((s) => <li key={s}><span class={`chip chip-${s}`}>{STATE_LABEL[s]}</span></li>)}
        </ul>
      </section>
    </details>
  )
}
