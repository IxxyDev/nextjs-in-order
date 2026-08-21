import { describe, it, expect } from 'vitest'
import { computeActProgress, computeOverallProgress } from './scroll-progress'

describe('computeActProgress', () => {
  it('is 0 when the section top is at the bottom of the viewport', () => {
    expect(computeActProgress({ top: 800, height: 1200 }, 800)).toBe(0)
  })

  it('is 1 when the section bottom has exited the top of the viewport', () => {
    expect(computeActProgress({ top: -1200, height: 1200 }, 800)).toBe(1)
  })

  it('is 0.5 at the section midpoint', () => {
    const height = 1200
    const viewportHeight = 800
    const midTop = viewportHeight - (viewportHeight + height) / 2
    expect(computeActProgress({ top: midTop, height }, viewportHeight)).toBeCloseTo(0.5)
  })

  it('clamps outside the 0-1 range', () => {
    expect(computeActProgress({ top: 5000, height: 1200 }, 800)).toBe(0)
    expect(computeActProgress({ top: -5000, height: 1200 }, 800)).toBe(1)
  })
})

describe('computeOverallProgress', () => {
  it('splits progress evenly across acts', () => {
    expect(computeOverallProgress(0, 10, 0)).toBeCloseTo(0)
    expect(computeOverallProgress(0, 10, 1)).toBeCloseTo(0.1)
    expect(computeOverallProgress(5, 10, 0.5)).toBeCloseTo(0.55)
    expect(computeOverallProgress(9, 10, 1)).toBeCloseTo(1)
  })
})
