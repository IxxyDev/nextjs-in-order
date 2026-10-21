import { describe, it, expect } from 'vitest'
import { QUIZ } from './quiz'
import { lazyQuiz, markFor, scoreQuestion } from './predict'

const byId = (id: string) => QUIZ.find((q) => q.id === id)!

describe('scoreQuestion', () => {
  it('scores the exact set of entities correct', () => {
    expect(scoreQuestion(byId('r1'), ['client-reference-manifest', 'browser-chunks'])).toEqual({ correct: true, hits: ['client-reference-manifest', 'browser-chunks'], missed: [], extra: [] })
  })
  it('reports a missed and an extra entity', () => {
    expect(scoreQuestion(byId('r1'), ['browser-chunks', 'server-chunks'])).toEqual({ correct: false, hits: ['browser-chunks'], missed: ['client-reference-manifest'], extra: ['server-chunks'] })
  })
  it('reports every answer entity missed when nothing is picked', () => {
    expect(scoreQuestion(byId('r1'), [])).toMatchObject({ correct: false, missed: ['browser-chunks', 'client-reference-manifest'] })
  })
  it('scores the exact set of regions correct', () => {
    expect(scoreQuestion(byId('r5'), ['artifacts', 'router-server', 'http-entry']).correct).toBe(true)
  })
  it('reports a missed and an extra region', () => {
    expect(scoreQuestion(byId('r5'), ['router-server', 'http-entry', 'render-server'])).toMatchObject({ correct: false, missed: ['artifacts'], extra: ['render-server'] })
  })
  it('scores the right choice correct', () => {
    expect(scoreQuestion(byId('r9'), ['1']).correct).toBe(true)
  })
  it('reports a wrong choice extra and the right one missed', () => {
    expect(scoreQuestion(byId('r9'), ['0'])).toMatchObject({ correct: false, missed: ['1'], extra: ['0'] })
  })
})

describe('lazyQuiz', () => {
  it('loads the question bank', async () => {
    expect(await lazyQuiz.load()).toBe(QUIZ)
  })
  it('peeks the question bank once it has loaded', async () => {
    await lazyQuiz.load()

    expect(lazyQuiz.peek()).toBe(QUIZ)
  })
})

describe('markFor', () => {
  const answer = new Set(['browser-chunks', 'client-reference-manifest'])

  it('marks a pick before Check', () => {
    expect(markFor('server-chunks', true, false, answer)).toBe('picked')
  })
  it('marks an unpicked candidate before Check', () => {
    expect(markFor('server-chunks', false, false, answer, true)).toBe('candidate')
  })
  it('marks a picked answer correct after Check', () => {
    expect(markFor('browser-chunks', true, true, answer)).toBe('correct')
  })
  it('marks an unpicked answer missed after Check', () => {
    expect(markFor('client-reference-manifest', false, true, answer)).toBe('missed')
  })
  it('marks a pick outside the answer extra after Check', () => {
    expect(markFor('server-chunks', true, true, answer)).toBe('extra')
  })
  it('leaves an unpicked non-answer unmarked after Check', () => {
    expect(markFor('server-chunks', false, true, answer, true)).toBeUndefined()
  })
})
