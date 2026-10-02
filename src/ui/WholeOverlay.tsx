// src/ui/WholeOverlay.tsx
import { useEffect, useMemo, useRef } from 'preact/hooks'
import type { WorldState } from '../domain/types'
import { World } from './World'
import { Labels } from './Labels'
import { WORLD } from '../domain/regions'
import { createRig, setCamera } from './camera'

/** phones: the whole system on its own rig, fitted to the world, over the page; the main canvas stays at Focus level */
export function WholeOverlay({ world, onSelect, onClose }: { world: WorldState; onSelect: (id: string) => void; onClose: () => void }) {
  const rig = useMemo(createRig, [])
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    close.current!.focus()
    return () => opener?.focus()
  }, [])
  const vp = rig.viewport.value
  /** a phone is narrower than the world at MIN_ZOOM, so this fit skips the clamp the main canvas uses */
  useEffect(() => { setCamera({ x: WORLD.x + WORLD.w / 2, y: WORLD.y + WORLD.h / 2, zoom: 0.96 * Math.min(vp.w / WORLD.w, vp.h / WORLD.h) }, rig) }, [vp.w, vp.h])
  return (
    <div class="whole-overlay" role="dialog" aria-modal="true" aria-label="Whole system">
      <div class="whole-head">
        <span>Whole system · step {world.stepIndex + 1}</span>
        <button ref={close} type="button" onClick={onClose} aria-label="Close whole system">✕</button>
      </div>
      <div class="whole-body">
        <World rig={rig} entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} onSelect={onSelect} />
        <Labels rig={rig} entityStates={world.entityStates} activeEdges={world.activeEdges} token={world.token} onSelect={onSelect} />
      </div>
    </div>
  )
}
