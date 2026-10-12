import { describe, it, expect } from 'vitest'
import { PROGRESS_KEY, checkId, createProgress, journeyId, quizId, type StorageLike } from './progress'
import type { Journey, Step } from './types'

const fake = (init?: string) => {
  const m = new Map<string, string>(init === undefined ? [] : [[PROGRESS_KEY, init]])
  const s: StorageLike & { m: Map<string, string> } = { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v) } }
  return s
}
const step = (id: string, q: boolean, checks: number) => ({ id, ...(q ? { question: {} } : {}), ...(checks ? { checks: Array.from({ length: checks }, () => ({})) } : {}) }) as unknown as Step
const journey = { slug: 'j', steps: [step('a', true, 2), step('b', false, 0), step('c', true, 0)] } as Journey
const throwing: StorageLike = { getItem: () => { throw new Error('no') }, setItem: () => { throw new Error('no') } }

describe('progress', () => {
  it('records and gets answers', () => {
    const p = createProgress(() => fake())
    expect(p.get('x')).toBeUndefined()
    p.record('x', false)
    expect(p.get('x')).toMatchObject({ correct: false })
  })
  it('keeps the first answer when the same question is answered again', () => {
    const p = createProgress(() => fake())
    p.record('x', false)
    p.record('x', true)
    expect(p.get('x')?.correct).toBe(false)
  })
  it('summarises a journey over its questions and checks', () => {
    const p = createProgress(() => fake())
    expect(p.summaryForJourney(journey)).toEqual({ answered: 0, correct: 0, total: 4 })
    p.record(journeyId('j', 'a'), true)
    p.record(checkId('a', 1), false)
    p.record(journeyId('other', 'c'), true)
    expect(p.summaryForJourney(journey)).toEqual({ answered: 2, correct: 1, total: 4 })
  })
  it('summarises a quiz', () => {
    const p = createProgress(() => fake())
    p.record(quizId('r1'), true)
    p.record(quizId('r2'), false)
    expect(p.summaryForQuiz(['r1', 'r2', 'r3'])).toEqual({ answered: 2, correct: 1, total: 3 })
  })
  it('round-trips through storage', () => {
    const s = fake()
    createProgress(() => s).record('x', true)
    expect(createProgress(() => s).get('x')?.correct).toBe(true)
  })
  it('degrades on corrupt or malformed storage', () => {
    for (const raw of ['{bad', '[]', 'null', '{"x":{"correct":"yes"}}']) {
      const p = createProgress(() => fake(raw))
      expect(p.get('x')).toBeUndefined()
      p.record('y', true)
      expect(p.get('y')?.correct).toBe(true)
    }
  })
  it('survives throwing or missing storage, keeping answers in memory', () => {
    for (const s of [throwing, undefined]) {
      const p = createProgress(() => s)
      expect(() => p.record('x', true)).not.toThrow()
      expect(p.get('x')?.correct).toBe(true)
      expect(() => p.reset()).not.toThrow()
    }
  })
  it('resets memory and storage', () => {
    const s = fake()
    const p = createProgress(() => s)
    p.record('x', true)
    p.reset()
    expect(p.get('x')).toBeUndefined()
    expect(createProgress(() => s).get('x')).toBeUndefined()
  })
})
