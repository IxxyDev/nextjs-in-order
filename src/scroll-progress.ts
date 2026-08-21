export interface ActRect {
  top: number
  height: number
}

/** Progress 0-1 through an act's section as it crosses the viewport, top to bottom. */
export function computeActProgress(rect: ActRect, viewportHeight: number): number {
  const raw = (viewportHeight - rect.top) / (rect.height + viewportHeight)
  return Math.min(1, Math.max(0, raw))
}

/** Maps a completed-act index plus in-act progress to overall progress across N acts. */
export function computeOverallProgress(actIndex: number, actCount: number, actProgress: number): number {
  return (actIndex + actProgress) / actCount
}

export interface ScrollProgressUpdate {
  actId: string
  actIndex: number
  actProgress: number
  overallProgress: number
}

export function initScrollProgress(
  sections: HTMLElement[],
  onUpdate: (update: ScrollProgressUpdate) => void
): () => void {
  const actCount = sections.length
  let activeIndex = 0
  let ticking = false

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeIndex = sections.indexOf(entry.target as HTMLElement)
        }
      }
    },
    { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
  )
  sections.forEach((section) => observer.observe(section))

  function tick(): void {
    ticking = false
    const rect = sections[activeIndex].getBoundingClientRect()
    const actProgress = computeActProgress(rect, window.innerHeight)
    const overallProgress = computeOverallProgress(activeIndex, actCount, actProgress)
    document.documentElement.style.setProperty('--progress', overallProgress.toFixed(4))
    onUpdate({
      actId: sections[activeIndex].dataset.act ?? '',
      actIndex: activeIndex,
      actProgress,
      overallProgress
    })
  }

  function onScroll(): void {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(tick)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  tick()

  return () => {
    window.removeEventListener('scroll', onScroll)
    observer.disconnect()
  }
}
