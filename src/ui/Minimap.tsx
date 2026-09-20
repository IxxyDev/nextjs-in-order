// src/ui/Minimap.tsx
import { REGIONS, WORLD } from '../domain/regions'
import { camera, viewport, setCamera } from './camera'

export function Minimap() {
  const cam = camera.value, vp = viewport.value
  const w = vp.w / cam.zoom, h = vp.h / cam.zoom
  const onClick = (ev: MouseEvent) => {
    const el = ev.currentTarget as SVGSVGElement
    const r = el.getBoundingClientRect()
    setCamera({ ...cam, x: ((ev.clientX - r.left) / r.width) * WORLD.w, y: ((ev.clientY - r.top) / r.height) * WORLD.h })
  }
  return (
    <svg class="minimap" viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} onClick={onClick} aria-label="Minimap. Click to move the camera." role="img">
      {REGIONS.map((r) => <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="currentColor" stroke-width={8} opacity={0.5} />)}
      <rect class="cam" x={cam.x - w / 2} y={cam.y - h / 2} width={w} height={h} />
    </svg>
  )
}
