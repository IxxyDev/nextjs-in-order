// src/ui/Minimap.tsx
import { REGIONS, WORLD } from '../domain/regions'
import type { Camera } from '../domain/types'
import { MINIMAP, camera, viewport, setCamera } from './camera'

/** docked: drawn in the tablet sheet's header instead of over the canvas */
export function Minimap({ onManual, docked }: { onManual: (cam: Camera) => void; docked?: boolean }) {
  const cam = camera.value, vp = viewport.value
  const w = vp.w / cam.zoom, h = vp.h / cam.zoom
  const onClick = (ev: MouseEvent) => {
    const el = ev.currentTarget as SVGSVGElement
    const r = el.getBoundingClientRect()
    const next = { ...cam, x: ((ev.clientX - r.left) / r.width) * WORLD.w, y: ((ev.clientY - r.top) / r.height) * WORLD.h }
    setCamera(next)
    onManual(next)
  }
  return (
    <svg class={`minimap ${docked ? 'is-docked' : ''}`} style={{ ...(docked ? {} : { left: `${MINIMAP.left}px`, bottom: `${MINIMAP.bottom}px` }), width: `${MINIMAP.w}px`, height: `${MINIMAP.h}px` }} viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} onClick={onClick} aria-label="Minimap. Click to move the camera." role="img">
      {REGIONS.map((r) => <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="currentColor" stroke-width={8} opacity={0.5} />)}
      <rect class="cam" x={cam.x - w / 2} y={cam.y - h / 2} width={w} height={h} />
    </svg>
  )
}
