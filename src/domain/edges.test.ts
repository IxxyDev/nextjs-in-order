// src/domain/edges.test.ts
import { describe, it, expect } from 'vitest'
import { EDGES } from './edges'
import { entityById } from './entities'
import { regionById } from './regions'

describe('edges', () => {
  it('connects existing entities', () => {
    for (const e of EDGES) {
      expect(() => entityById(e.from), e.id).not.toThrow()
      expect(() => entityById(e.to), e.id).not.toThrow()
    }
  })
  it('labels every edge that crosses the network boundary', () => {
    for (const e of EDGES) {
      const a = regionById(entityById(e.from).region).band
      const b = regionById(entityById(e.to).region).band
      const crosses = (a === 'browser') !== (b === 'browser')
      if (crosses) expect(e.crossing, e.id).toBeDefined()
      else expect(e.crossing, e.id).toBeUndefined()
    }
  })
})
