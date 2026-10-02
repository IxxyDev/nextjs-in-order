// src/ui/JourneyView.tsx
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { Journey } from '../domain/types'
import { deriveWorldState } from '../domain/worldState'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { StepPanel } from './StepPanel'
import { Transport } from './Transport'
import { Inspector } from './Inspector'
import { goTo, viewport } from './camera'
import { reducedMotion } from './useReducedMotion'
import { useStepControls } from './useStepControls'

export function JourneyView({ journey, step, onStep }: { journey: Journey; step: number; onStep: (n: number) => void }) {
  const world = useMemo(() => deriveWorldState(journey, step), [journey, step])
  const [follow, setFollow] = useState(true)
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<string | undefined>()

  const vp = viewport.value
  useEffect(() => { goTo(follow ? world.cameraTarget : { kind: 'world' }, reducedMotion.value) }, [world, follow, vp.w, vp.h])

  const { playing, setPlaying, stepTo } = useStepControls({ count: journey.steps.length, step, onStep, onEscape: () => { setSelected(undefined); setFollow(false) } })
  const select = (id: string) => { setPlaying(false); setSelected(id) }

  return (
    <div class="journey">
      <div class="stage">
        <World entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        <Labels entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} selected={selected} onSelect={select} />
        <Minimap />
        {selected && <Inspector id={selected} onClose={() => setSelected(undefined)} />}
      </div>
      <StepPanel journey={journey} world={world} showText={showText} />
      <Transport journey={journey} step={step} playing={playing} follow={follow} showText={showText} onStep={stepTo} onPlay={setPlaying} onFollow={setFollow} onShowText={setShowText} />
    </div>
  )
}
