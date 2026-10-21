import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { CompareLane, CompareWorld, LaneWorld, ResolvedPair } from '../domain/types'
import { deriveCompareState } from '../domain/compareState'
import { formatRoute } from '../domain/route'
import { catalogCode } from '../domain/catalogCode'
import { World } from './World'
import { Labels } from './Labels'
import { Transport } from './Transport'
import { Inspector } from './Inspector'
import { Legend } from './Legend'
import { createRig, goTo, LEGEND, type CameraRig, type Framing } from './camera'
import { phone, reducedMotion } from './layout'
import { useStepControls } from './useStepControls'
import { useCameraGestures } from './useCameraGestures'

/** the room between the last lane's title and the legend, in px */
const LANE_TITLE_GAP = 8
/** ruler times closer than this count as in step */
const TIE = 0.02

/** hasLegend: the stage's legend sits over this lane's top-right corner, so its labels and framing keep clear of it */
function Lane({ meta, world, rig, framing, hasLegend, selected, onSelect }: { meta: CompareLane; world: LaneWorld; rig: CameraRig; framing: Framing; hasLegend: boolean; selected?: string; onSelect: (id?: string) => void }) {
  const vp = rig.viewport.value
  const stage = useRef<HTMLElement>(null)
  useCameraGestures(rig, stage)
  useEffect(() => { rig.hasLegend.value = hasLegend }, [hasLegend])
  useEffect(() => { goTo(framing === 'follow' ? world.cameraTarget : { kind: 'world' }, reducedMotion.value, rig) }, [world, framing, vp.w, vp.h, hasLegend])
  return (
    <section class="lane" ref={stage} aria-label={meta.title}>
      <World rig={rig} entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={onSelect} />
      <Labels rig={rig} differs={world.differs} entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={onSelect} />
      <div class="lane-title">{meta.title}</div>
      {selected && <Inspector id={selected} onClose={() => onSelect(undefined)} />}
    </section>
  )
}

function Ruler({ lanes, times }: { lanes: CompareLane[]; times: number[] }) {
  const first = Math.min(...times)
  const ahead = times.every((t) => t - first <= TIE) ? undefined : lanes[times.indexOf(first)]
  return (
    <div class="ruler" role="img" aria-label={ahead ? `${ahead.short} is ahead` : 'Lanes in step'}>
      <div class="ruler-track" aria-hidden="true">
        {times.map((t, i) => <span key={lanes[i].short} class={`ruler-mark mark-${i}`} style={`--at: ${t}`}>{lanes[i].short}</span>)}
      </div>
      <div class="ruler-note" aria-hidden="true">{ahead ? `${ahead.short} ahead` : 'in step'}</div>
    </div>
  )
}

function ComparePanel({ pair, world, showText }: { pair: ResolvedPair; world: CompareWorld; showText: boolean }) {
  const { step } = world
  return (
    <section class="panel compare-panel" aria-labelledby="compare-title">
      <div class="eyebrow">{catalogCode(pair.id)} · {pair.title} · step {world.stepIndex + 1} of {pair.steps.length}</div>
      <h2 id="compare-title">{step.title}</h2>
      <p class="story">{step.story}</p>
      {world.lanes.map((l, i) => (
        <div class={`lane-story mark-${i}`} key={pair.lanes[i].title}>
          <div class="lane-name">{pair.lanes[i].title}</div>
          {l.token && <div class="following">Following: {l.token.label}</div>}
          <p>{l.lane.story}</p>
          {l.lane.rows && <ul class="rows">{l.lane.rows.map((r) => <li key={r}><code>{r}</code></li>)}</ul>}
          {l.lane.source && <a class="lane-source" href={formatRoute({ mode: 'journey', slug: l.lane.source.slug, step: l.lane.source.step - 1 })}>From {l.lane.source.label}</a>}
        </div>
      ))}
      <div class="click" aria-label="What is synchronized">Synchronized: {pair.synchronized}</div>
      {showText && <p class="text-equivalent">{world.text}</p>}
      <p class="visually-hidden" aria-live="polite">{world.text}</p>
    </section>
  )
}

export function CompareView({ pair, step, onStep }: { pair: ResolvedPair; step: number; onStep: (n: number) => void }) {
  const world = useMemo(() => deriveCompareState(pair, step), [pair, step])
  const rigs = useMemo(() => pair.lanes.map(() => createRig()), [pair])
  const [framing, setFraming] = useState<Framing>('follow')
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<{ lane: number; id: string } | undefined>()

  const { playing, setPlaying, stepTo } = useStepControls({ count: pair.steps.length, step, onStep, onEscape: () => { setSelected(undefined); setFraming('whole') } })
  /** the legend takes the stage's top-right corner: the last lane's side by side, the first lane's once phones stack them */
  const legendLane = phone.value ? 0 : pair.lanes.length - 1
  const lane = (i: number) => (
    <Lane key={pair.lanes[i].title} meta={pair.lanes[i]} world={world.lanes[i]} rig={rigs[i]} framing={framing} hasLegend={i === legendLane}
      selected={selected?.lane === i ? selected.id : undefined}
      onSelect={(id) => { setPlaying(false); setSelected(id ? { lane: i, id } : undefined) }} />
  )

  return (
    <div class={`compare lanes-${pair.lanes.length}`}>
      <div class="compare-stage" style={{ '--legend-room': `${LEGEND.right + LEGEND.w + LANE_TITLE_GAP}px` }}>
        <Legend />
        {lane(0)}
        <Ruler lanes={pair.lanes} times={world.ruler} />
        {pair.lanes.slice(1).map((_, i) => lane(i + 1))}
      </div>
      <ComparePanel pair={pair} world={world} showText={showText} />
      <Transport steps={pair.steps} step={world.stepIndex} playing={playing} view={framing} showText={showText} onStep={stepTo} onPlay={setPlaying} onView={setFraming} onShowText={setShowText} />
    </div>
  )
}
