// src/ui/Transport.tsx
import { useId } from 'preact/hooks'
import type { Step } from '../domain/types'

interface TransportProps {
  /** a journey's or a compare pair's steps, for the scrubber and its ticks */
  steps: Pick<Step, 'id' | 'title'>[]
  step: number
  playing: boolean
  follow: boolean
  showText: boolean
  onStep: (n: number) => void
  onPlay: (p: boolean) => void
  onFollow: (f: boolean) => void
  onShowText: (t: boolean) => void
  /** 'toggle' presses Whole system against Follow; 'overlay' opens it over the page instead (phones); 'none' leaves it out (tablets lock Follow) */
  whole?: 'toggle' | 'overlay' | 'none'
  onWhole?: () => void
}

export function Transport({ steps, step, playing, follow, showText, onStep, onPlay, onFollow, onShowText, whole = 'toggle', onWhole }: TransportProps) {
  const last = steps.length - 1
  const ticksId = useId()
  return (
    <div class="transport" role="toolbar" aria-label="Step controls">
      <button onClick={() => onStep(step - 1)} disabled={step === 0} aria-label="Previous step">◀</button>
      <button onClick={() => onPlay(!playing)} aria-pressed={playing} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
      <button onClick={() => onStep(step + 1)} disabled={step === last} aria-label="Next step">▶▶</button>
      <input type="range" min={0} max={last} value={step} aria-label="Step" aria-valuetext={`Step ${step + 1} of ${last + 1}: ${steps[step].title}`} onInput={(e) => onStep(Number((e.currentTarget as HTMLInputElement).value))} list={ticksId} />
      <datalist id={ticksId}>{steps.map((s, i) => <option key={s.id} value={i} label={s.title} />)}</datalist>
      <button onClick={() => onFollow(true)} aria-pressed={follow}>Follow</button>
      {whole === 'toggle' && <button onClick={() => onFollow(false)} aria-pressed={!follow}>Whole system</button>}
      {whole === 'overlay' && <button onClick={onWhole} aria-haspopup="dialog">Whole system</button>}
      <button onClick={() => onShowText(!showText)} aria-pressed={showText}>Read as text</button>
    </div>
  )
}
