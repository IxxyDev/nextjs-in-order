// src/ui/Transport.tsx
import type { Journey } from '../domain/types'

export interface TransportProps {
  journey: Journey
  step: number
  playing: boolean
  follow: boolean
  showText: boolean
  onStep: (n: number) => void
  onPlay: (p: boolean) => void
  onFollow: (f: boolean) => void
  onShowText: (t: boolean) => void
}

export function Transport({ journey, step, playing, follow, showText, onStep, onPlay, onFollow, onShowText }: TransportProps) {
  const last = journey.steps.length - 1
  return (
    <div class="transport" role="toolbar" aria-label="Journey controls">
      <button onClick={() => onStep(step - 1)} disabled={step === 0} aria-label="Previous step">◀</button>
      <button onClick={() => onPlay(!playing)} aria-pressed={playing} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
      <button onClick={() => onStep(step + 1)} disabled={step === last} aria-label="Next step">▶▶</button>
      <input type="range" min={0} max={last} value={step} aria-label="Step" aria-valuetext={`Step ${step + 1} of ${last + 1}: ${journey.steps[step].title}`} onInput={(e) => onStep(Number((e.currentTarget as HTMLInputElement).value))} list={`ticks-${journey.id}`} />
      <datalist id={`ticks-${journey.id}`}>{journey.steps.map((s, i) => <option key={s.id} value={i} label={s.title} />)}</datalist>
      <button onClick={() => onFollow(true)} aria-pressed={follow}>Follow</button>
      <button onClick={() => onFollow(false)} aria-pressed={!follow}>Whole system</button>
      <button onClick={() => onShowText(!showText)} aria-pressed={showText}>Read as text</button>
    </div>
  )
}
