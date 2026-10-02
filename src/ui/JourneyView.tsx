// src/ui/JourneyView.tsx
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Camera, Journey } from '../domain/types'
import { deriveWorldState } from '../domain/worldState'
import { breadcrumbFor, regionLevel } from '../domain/breadcrumb'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { StepPanel } from './StepPanel'
import { Transport } from './Transport'
import { Inspector } from './Inspector'
import { Breadcrumb } from './Breadcrumb'
import { WholeOverlay } from './WholeOverlay'
import { MAIN_RIG, goTo, restoreCamera, viewport, writeCamToUrl } from './camera'
import { reducedMotion } from './useReducedMotion'
import { useStepControls, useSwipeSteps } from './useStepControls'
import { useCameraGestures } from './useCameraGestures'
import { phone, tablet } from './layout'

/** follow the step's target, show the whole system, or hold a camera the user left (a URL cam) until they step or pick a view */
type View = 'follow' | 'whole' | 'manual'
/** the tablet sheet's peek height as a share of the canvas; .has-sheet .panel in styles.css uses the same 30% */
const PEEK = 0.3

export function JourneyView({ journey, step, cam, onStep }: { journey: Journey; step: number; cam?: Camera; onStep: (n: number) => void }) {
  const world = useMemo(() => deriveWorldState(journey, step), [journey, step])
  const [view, setView] = useState<View>(cam ? 'manual' : 'follow')
  const pickView = (follow: boolean) => { setView(follow ? 'follow' : 'whole'); writeCamToUrl(undefined, 0) }
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<string | undefined>()
  const [expanded, setExpanded] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const isTablet = tablet.value, isPhone = phone.value
  /** tablets lock the camera to Follow at Region level and phones keep it at Focus level: neither shows the whole system on this canvas */
  const locked = isTablet || isPhone
  const shown: View = locked && view === 'whole' ? 'follow' : view
  const target = isTablet ? regionLevel(world.cameraTarget) : world.cameraTarget

  const vp = viewport.value
  const camKey = cam && `${cam.x},${cam.y},${cam.zoom}`
  useEffect(() => { if (cam) { restoreCamera(cam); setView('manual') } }, [camKey])
  /** stepping drops cam from the URL and hands the camera back to Follow */
  useEffect(() => { if (!cam) setView((v) => (v === 'manual' ? 'follow' : v)) }, [step, journey.slug])
  useEffect(() => { MAIN_RIG.sheet.value = isTablet ? PEEK : 0; return () => { MAIN_RIG.sheet.value = 0 } }, [isTablet])
  useEffect(() => { if (!isPhone) setOverlay(false) }, [isPhone])
  useEffect(() => { if (shown !== 'manual') goTo(shown === 'follow' ? target : { kind: 'world' }, reducedMotion.value) }, [world, shown, vp.w, vp.h, isTablet])

  const onEscape = () => {
    if (overlay) { setOverlay(false); return }
    setSelected(undefined)
    pickView(locked)
  }
  const { playing, setPlaying, stepTo } = useStepControls({ count: journey.steps.length, step, onStep, onEscape })
  const root = useRef<HTMLDivElement>(null)
  useSwipeSteps(root, (dir) => stepTo(step + dir))
  const stage = useRef<HTMLDivElement>(null)
  const onManual = (c: Camera) => { setView('manual'); writeCamToUrl(c) }
  useCameraGestures(MAIN_RIG, stage, onManual)
  const select = (id: string) => { setPlaying(false); setSelected(id) }
  const current = Object.keys(world.entityStates).find((id) => world.entityStates[id] === 'current')
  const crumbs = breadcrumbFor({ target, entity: selected ?? world.token?.at ?? current })

  const sheetHead = isTablet && (
    <div class="sheet-head">
      <button type="button" class="sheet-handle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        <span class="grabber" aria-hidden="true" />{expanded ? 'Collapse' : 'Expand'}<span class="visually-hidden"> step panel</span>
      </button>
      <Minimap onManual={onManual} docked />
    </div>
  )

  return (
    <div class="journey has-sheet" ref={root}>
      <Breadcrumb crumbs={crumbs} onGo={(t) => onManual(goTo(t, reducedMotion.value))} />
      <div class="stage" ref={stage}>
        <World entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        <Labels entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        {!isTablet && <Minimap onManual={onManual} />}
        {selected && <Inspector id={selected} onClose={() => setSelected(undefined)} />}
      </div>
      <StepPanel journey={journey} world={world} showText={showText} header={sheetHead} expanded={isTablet && expanded} />
      <Transport journey={journey} step={step} playing={playing} follow={shown === 'follow'} showText={showText} onStep={stepTo} onPlay={setPlaying} onFollow={pickView}
        onShowText={setShowText} whole={isTablet ? 'none' : isPhone ? 'overlay' : 'toggle'} onWhole={() => { setPlaying(false); setOverlay(true) }} />
      {overlay && <WholeOverlay world={world} onSelect={(id) => { setOverlay(false); select(id) }} onClose={() => setOverlay(false)} />}
    </div>
  )
}
