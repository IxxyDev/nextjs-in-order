// src/ui/Breadcrumb.tsx
import type { CameraTarget } from '../domain/types'
import type { Crumb } from '../domain/breadcrumb'

/** each crumb is a camera target; on phones the middle ones fold into "…" (styles.css) */
export function Breadcrumb({ crumbs, onGo }: { crumbs: Crumb[]; onGo: (target: CameraTarget) => void }) {
  const last = crumbs.length - 1
  return (
    <nav class="crumbs" aria-label="Camera breadcrumb">
      <ol>
        {crumbs.flatMap((c, i) => [
          ...(i === 1 && last > 1 ? [<li key="gap" class="crumb-gap" aria-hidden="true">…</li>] : []),
          <li key={`${i}-${c.label}`} class={i > 0 && i < last ? 'is-middle' : undefined}><button type="button" onClick={() => onGo(c.target)} aria-current={i === last ? 'location' : undefined}>{c.label}</button></li>
        ])}
      </ol>
    </nav>
  )
}
