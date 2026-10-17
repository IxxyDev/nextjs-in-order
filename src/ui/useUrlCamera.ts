import { useEffect, useState } from 'preact/hooks'
import type { Camera } from '../domain/types'
import { restoreCamera, writeCamToUrl } from './camera'

/**
 * A camera from the URL, or one the user moved, is held until the focus changes (a step, an entity, a question);
 * while it is held, the view leaves framing alone. hold takes every manual move and writes it to the URL; release
 * hands the camera back to framing and clears it from the URL.
 */
export function useUrlCamera(cam: Camera | undefined, focus: string): { isHeld: boolean; hold: (cam: Camera) => void; release: () => void } {
  const [isHeld, setHeld] = useState(cam !== undefined)
  const camKey = cam && `${cam.x},${cam.y},${cam.zoom}`
  useEffect(() => { if (cam) { restoreCamera(cam); setHeld(true) } }, [camKey])
  /** a new focus comes with a URL without cam */
  useEffect(() => { if (!cam) setHeld(false) }, [focus])
  const hold = (moved: Camera) => { setHeld(true); writeCamToUrl(moved) }
  const release = () => { setHeld(false); writeCamToUrl(undefined, 0) }
  return { isHeld, hold, release }
}
