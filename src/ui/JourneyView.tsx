// src/ui/JourneyView.tsx
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { Camera, Journey } from '../domain/types'
import { deriveWorldState } from '../domain/worldState'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { StepPanel } from './StepPanel'
import { Transport } from './Transport'
import { Inspector } from './Inspector'
import { goTo, restoreCamera, viewport, writeCamToUrl } from './camera'
import { reducedMotion } from './useReducedMotion'
import { useStepControls } from './useStepControls'

/** follow the step's target, show the whole system, or hold a camera the user left (a URL cam) until they step or pick a view */
type View = 'follow' | 'whole' | 'manual'

export function JourneyView({ journey, step, cam, onStep }: { journey: Journey; step: number; cam?: Camera; onStep: (n: number) => void }) {
  const world = useMemo(() => deriveWorldState(journey, step), [journey, step])
  const [view, setView] = useState<View>(cam ? 'manual' : 'follow')
  const pickView = (follow: boolean) => { setView(follow ? 'follow' : 'whole'); writeCamToUrl(undefined, 0) }
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<string | undefined>()

  const vp = viewport.value
  const camKey = cam && `${cam.x},${cam.y},${cam.zoom}`
  useEffect(() => { if (cam) { restoreCamera(cam); setView('manual') } }, [camKey])
  /** stepping drops cam from the URL and hands the camera back to Follow */
  useEffect(() => { if (!cam) setView((v) => (v === 'manual' ? 'follow' : v)) }, [step, journey.slug])
  useEffect(() => { if (view !== 'manual') goTo(view === 'follow' ? world.cameraTarget : { kind: 'world' }, reducedMotion.value) }, [world, view, vp.w, vp.h])

  const onEscape = () => {
    setSelected(undefined)
    pickView(false)
  }
  const { playing, setPlaying, stepTo } = useStepControls({ count: journey.steps.length, step, onStep, onEscape })
  const onManual = (c: Camera) => { setView('manual'); writeCamToUrl(c) }
  const select = (id: string) => { setPlaying(false); setSelected(id) }

  return (
    <div class="journey">
      <div class="stage">
        <World entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        <Labels entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        <Minimap onManual={onManual} />
        {selected && <Inspector id={selected} onClose={() => setSelected(undefined)} />}
      </div>
      <StepPanel journey={journey} world={world} showText={showText} />
      <Transport journey={journey} step={step} playing={playing} follow={view === 'follow'} showText={showText} onStep={stepTo} onPlay={setPlaying} onFollow={pickView} onShowText={setShowText} />
    </div>
  )
}
