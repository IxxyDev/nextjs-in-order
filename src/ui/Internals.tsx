import type { SourceLink } from '../domain/types'
import { useSessionFlag } from './useSessionFlag'

interface InternalsProps {
  /** the session flag that keeps this disclosure open or closed across reloads */
  flagKey: string
  internals?: string[]
  sources?: SourceLink[]
}

/** Level 3 (§4): collapsed by default at every width (so also at 1024–1199px, §9), the open state holds for the session; renders nothing without internals or sources */
export function Internals({ flagKey, internals, sources }: InternalsProps) {
  const [isOpen, setOpen] = useSessionFlag(flagKey, false)
  /** the summary toggles through state at once (the toggle event comes a task later, after a quick reload could already have run); onToggle catches any other opening */
  const onSummary = (e: Event) => { e.preventDefault(); setOpen(!isOpen) }
  const onToggle = (e: Event) => { const isDetailsOpen = (e.currentTarget as HTMLDetailsElement).open; if (isDetailsOpen !== isOpen) setOpen(isDetailsOpen) }
  if (!internals?.length && !sources?.length) return null
  return (
    <details class="internals" open={isOpen} onToggle={onToggle}>
      <summary onClick={onSummary}>Internals</summary>
      {internals && <ul>{internals.map((l) => <li key={l}><code>{l}</code></li>)}</ul>}
      {sources && <ul>{sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>}
    </details>
  )
}
