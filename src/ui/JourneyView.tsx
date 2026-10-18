// src/ui/JourneyView.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Camera, Journey } from '../domain/types'
import { deriveWorldState } from '../domain/worldState'
import { breadcrumbFor, regionLevel } from '../domain/breadcrumb'
import { hasLens } from '../domain/codeLens'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { Legend } from './Legend'
import { StepPanel } from './StepPanel'
import { Transport } from './Transport'
import { Inspector } from './Inspector'
import { Breadcrumb } from './Breadcrumb'
import { WholeOverlay } from './WholeOverlay'
import { CodeLens } from './CodeLens'
import { lensOpen } from './lensLink'
import { MAIN_RIG, goTo, viewport, type Framing, type View } from './camera'
import { useStepControls, useSwipeSteps } from './useStepControls'
import { useCameraGestures } from './useCameraGestures'
import { useUrlCamera } from './useUrlCamera'
import { phone, reducedMotion, tablet } from './layout'

/** the tablet sheet's peek height as a share of the canvas; .has-sheet .panel in styles.css uses the same 30% */
const PEEK = 0.3
/** room the phone peek leaves under the story, so the next block shows its top edge */
const STORY_GAP = 12

export function JourneyView({ journey, step, cam, onStep }: { journey: Journey; step: number; cam?: Camera; onStep: (n: number) => void }) {
  const world = useMemo(() => deriveWorldState(journey, step), [journey, step])
  const [framing, setFraming] = useState<Framing>('follow')
  /** stepping drops cam from the URL and hands the camera back to Follow */
  const { isHeld, hold, release } = useUrlCamera(cam, `${journey.slug}/${step}`)
  const pickView = (picked: Framing) => { setFraming(picked); release() }
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<string | undefined>()
  const [expanded, setExpanded] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const isTablet = tablet.value, isPhone = phone.value
  /** tablets lock the camera to Follow at Region level and phones keep it at Focus level: neither shows the whole system on this canvas */
  const locked = isTablet || isPhone
  const shown: View = isHeld ? 'manual' : locked && framing === 'whole' ? 'follow' : framing
  const target = isTablet ? regionLevel(world.cameraTarget) : world.cameraTarget

  const vp = viewport.value
  useEffect(() => { MAIN_RIG.sheet.value = isTablet ? PEEK : 0; return () => { MAIN_RIG.sheet.value = 0 } }, [isTablet])
  useEffect(() => { if (!isPhone) setOverlay(false) }, [isPhone])
  useEffect(() => { if (shown !== 'manual') goTo(shown === 'follow' ? target : { kind: 'world' }, reducedMotion.value) }, [world, shown, vp.w, vp.h, isTablet])

  /** phones: an open lens can take the panel to about three quarters of the space between header and transport, the map keeps the rest and refits to it */
  /** every registered lens has open steps (codeLens.test.ts), so the wide panel is set at once, never after the chunk loads */
  const lensed = hasLens(journey.slug)
  const canRoom = isPhone && lensed && lensOpen.value
  const roomy = canRoom && expanded
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!roomy) return
    /** scroll the panel only (scrollIntoView would also scroll the page): the lens head lands under the sticky toggle */
    const p = panel.current, lens = p?.querySelector<HTMLElement>('.lens'), head = p?.querySelector<HTMLElement>('.sheet-head')
    if (!p || !lens) return
    const top = p.scrollTop + lens.getBoundingClientRect().top - p.getBoundingClientRect().top - (head?.offsetHeight ?? 0) - 4
    p.scrollTo({ top, behavior: reducedMotion.value ? 'auto' : 'smooth' })
  }, [roomy, step])
  /** phones: the panel peeks down to the end of the story, so it reads without scrolling; the map keeps the rest (styles.css, --story-end) */
  useLayoutEffect(() => {
    const p = panel.current, story = p?.querySelector<HTMLElement>('.story')
    if (!isPhone || !p || !story) return
    const fit = () => p.style.setProperty('--story-end', `${story.offsetTop + story.offsetHeight + STORY_GAP}px`)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(story)
    return () => { ro.disconnect(); p.style.removeProperty('--story-end') }
  }, [isPhone, step, journey.slug, canRoom])

  const onEscape = () => {
    if (overlay) { setOverlay(false); return }
    if (roomy) { setExpanded(false); return }
    setSelected(undefined)
    pickView(locked ? 'follow' : 'whole')
  }
  const { playing, setPlaying, stepTo } = useStepControls({ count: journey.steps.length, step, onStep, onEscape })
  const root = useRef<HTMLDivElement>(null)
  useSwipeSteps(root, (dir) => stepTo(step + dir))
  const stage = useRef<HTMLDivElement>(null)
  const onManual = (c: Camera) => { setFraming('follow'); hold(c) }
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
  const roomHead = canRoom && (
    <div class="sheet-head is-room">
      <button type="button" class="sheet-handle" aria-expanded={roomy} onClick={() => setExpanded(!roomy)}>
        <span class="grabber" aria-hidden="true" />{roomy ? 'More room for the map' : 'More room for code'}
      </button>
    </div>
  )

  return (
    <div class={`journey ${isTablet ? 'has-sheet' : ''} ${lensed ? 'has-lens' : ''} ${roomy ? 'is-roomy' : ''}`} ref={root}>
      <Breadcrumb crumbs={crumbs} onGo={(t) => onManual(goTo(t, reducedMotion.value))} />
      <div class="stage" ref={stage}>
        <World entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        <Labels entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        {!isTablet && <Minimap onManual={onManual} />}
        <Legend />
        {selected && <Inspector id={selected} onClose={() => setSelected(undefined)} />}
      </div>
      <StepPanel journey={journey} world={world} showText={showText} header={sheetHead || roomHead} expanded={isTablet && expanded} panelRef={panel}
        lens={lensed && <CodeLens key={journey.slug} slug={journey.slug} stepId={world.step.id} selected={selected} />} />
      <Transport steps={journey.steps} step={step} playing={playing} view={shown} showText={showText} onStep={stepTo} onPlay={setPlaying} onView={pickView}
        onShowText={setShowText} whole={isTablet ? 'none' : isPhone ? 'overlay' : 'toggle'} onWhole={() => { setPlaying(false); setOverlay(true) }} />
      {overlay && <WholeOverlay world={world} onSelect={(id) => { setOverlay(false); select(id) }} onClose={() => setOverlay(false)} />}
    </div>
  )
}
