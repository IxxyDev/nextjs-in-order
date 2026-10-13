import { useState } from 'preact/hooks'
import type { SourceLink } from '../domain/types'
import { sessionFlags } from '../domain/sessionFlags'

interface Props {
  /** the session flag that keeps this disclosure open or closed across reloads */
  flagKey: string
  internals?: string[]
  sources?: SourceLink[]
}

/** Level 3 (§4): collapsed by default at every width (so also at 1024–1199px, §9), the open state holds for the session; renders nothing without internals or sources */
export function Internals({ flagKey, internals, sources }: Props) {
  const [open, setOpenState] = useState(() => sessionFlags.get(flagKey) ?? false)
  const setOpen = (next: boolean) => { setOpenState(next); sessionFlags.set(flagKey, next) }
  /** the summary toggles through state at once (the toggle event comes a task later, after a quick reload could already have run); onToggle catches any other opening */
  const onSummary = (e: Event) => { e.preventDefault(); setOpen(!open) }
  const onToggle = (e: Event) => { const isOpen = (e.currentTarget as HTMLDetailsElement).open; if (isOpen !== open) setOpen(isOpen) }
  if (!internals?.length && !sources?.length) return null
  return (
    <details open={open} onToggle={onToggle}>
      <summary onClick={onSummary}>Internals</summary>
      {internals && <ul>{internals.map((l) => <li key={l}><code>{l}</code></li>)}</ul>}
      {sources && <ul>{sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>}
    </details>
  )
}
