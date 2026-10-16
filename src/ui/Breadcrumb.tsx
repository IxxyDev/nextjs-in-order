import type { CameraTarget } from '../domain/types'
import type { Crumb } from '../domain/breadcrumb'

/** each crumb is a camera target; on phones the middle ones fold into "…" (styles.css) */
export function Breadcrumb({ crumbs, onGo }: { crumbs: Crumb[]; onGo: (target: CameraTarget) => void }) {
  const last = crumbs.length - 1
  const [world, ...rest] = crumbs.map((c, i) => (
    <li key={`${i}-${c.label}`} class={0 < i && i < last ? 'is-middle' : undefined}><button type="button" onClick={() => onGo(c.target)} aria-current={i === last ? 'location' : undefined}>{c.label}</button></li>
  ))
  return (
    <nav class="crumbs" aria-label="Camera breadcrumb">
      <ol>
        {world}
        {1 < last && <li key="gap" class="crumb-gap" aria-hidden="true">…</li>}
        {rest}
      </ol>
    </nav>
  )
}
