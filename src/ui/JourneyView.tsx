// src/ui/JourneyView.tsx
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Journey } from '../domain/types'
import { deriveWorldState } from '../domain/worldState'
import { clampIndex } from '../domain/route'
import { World } from './World'
import { Labels } from './Labels'
import { Minimap } from './Minimap'
import { StepPanel } from './StepPanel'
import { Transport } from './Transport'
import { Inspector } from './Inspector'
import { goTo, viewport } from './camera'
import { reducedMotion } from './useReducedMotion'

const AUTOPLAY_MS = 6000

export function JourneyView({ journey, step, onStep }: { journey: Journey; step: number; onStep: (n: number) => void }) {
  const world = useMemo(() => deriveWorldState(journey, step), [journey, step])
  const [follow, setFollow] = useState(true)
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<string | undefined>()

  const vp = viewport.value
  useEffect(() => { goTo(follow ? world.cameraTarget : { kind: 'world' }, reducedMotion.value) }, [world, follow, vp.w, vp.h])

  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    if (step >= journey.steps.length - 1) { setPlaying(false); return }
    const t = setTimeout(() => onStep(step + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [playing, step, journey])

  /** bound once and reading the latest props, so a fast second press never sees a stale step */
  const latest = useRef({ step, onStep, last: journey.steps.length - 1 })
  latest.current = { step, onStep, last: journey.steps.length - 1 }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.isContentEditable || t.closest?.('input, textarea, select, [role=option], [role=listbox]')) return
      const { step, onStep, last } = latest.current
      if (e.key === 'ArrowRight') { setPlaying(false); onStep(step + 1) }
      else if (e.key === 'ArrowLeft') { setPlaying(false); onStep(step - 1) }
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p) }
      else if (e.key === 'Home') onStep(0)
      else if (e.key === 'End') onStep(last)
      else if (e.key === 'Escape') { setSelected(undefined); setFollow(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const stepTo = (n: number) => { setPlaying(false); onStep(clampIndex(n, journey.steps.length)) }
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
