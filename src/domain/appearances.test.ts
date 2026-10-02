import { describe, it, expect } from 'vitest'
import { appearancesOf, stepsByEntity } from './appearances'
import type { Journey } from './types'

const step = (states: Record<string, string>, at?: string) => ({ states, token: at ? { at } : undefined })
const journey = (id: string, steps: ReturnType<typeof step>[]) => ({ id, slug: id, steps }) as unknown as Journey

describe('appearances', () => {
  const a = journey('a', [step({}), step({ x: 'current', y: 'dimmed' }), step({ x: 'active' }, 'x'), step({}, 'z')])
  const b = journey('b', [step({ y: 'new' }), step({}, 'x')])
  it('indexes the steps that list an entity or carry the token to it, once per step', () => {
    const index = stepsByEntity(a)
    expect(index.get('x')).toEqual([1, 2])
    expect(index.get('y')).toEqual([1])
    expect(index.get('z')).toEqual([3])
  })
  it('builds the index once per journey', () => {
    expect(stepsByEntity(a)).toBe(stepsByEntity(a))
  })
  it('lists appearances across journeys in order', () => {
    expect(appearancesOf([a, b], 'x').map(({ journey, step }) => `${journey.id}${step}`)).toEqual(['a1', 'a2', 'b1'])
    expect(appearancesOf([a, b], 'nope')).toEqual([])
  })
})
