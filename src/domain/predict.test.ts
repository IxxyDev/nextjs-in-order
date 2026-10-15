import { describe, it, expect } from 'vitest'
import { QUIZ } from './quiz'
import { loadQuiz, markFor, peekQuiz, scoreQuestion } from './predict'

const byId = (id: string) => QUIZ.find((q) => q.id === id)!

describe('scoreQuestion', () => {
  it('scores entity picks as an exact set with missed and extra picks', () => {
    const q = byId('r1')
    expect(scoreQuestion(q, ['client-reference-manifest', 'browser-chunks'])).toEqual({ correct: true, hits: ['client-reference-manifest', 'browser-chunks'], missed: [], extra: [] })
    expect(scoreQuestion(q, ['browser-chunks', 'server-chunks'])).toEqual({ correct: false, hits: ['browser-chunks'], missed: ['client-reference-manifest'], extra: ['server-chunks'] })
    expect(scoreQuestion(q, [])).toMatchObject({ correct: false, missed: ['browser-chunks', 'client-reference-manifest'] })
  })
  it('scores regions and choices', () => {
    expect(scoreQuestion(byId('r5'), ['artifacts', 'router-server', 'http-entry']).correct).toBe(true)
    expect(scoreQuestion(byId('r5'), ['router-server', 'http-entry', 'render-server'])).toMatchObject({ correct: false, missed: ['artifacts'], extra: ['render-server'] })
    expect(scoreQuestion(byId('r9'), ['1']).correct).toBe(true)
    expect(scoreQuestion(byId('r9'), ['0'])).toMatchObject({ correct: false, missed: ['1'], extra: ['0'] })
  })
})

describe('loadQuiz', () => {
  it('loads the question bank lazily', async () => {
    expect(await loadQuiz()).toBe(QUIZ)
    expect(peekQuiz()).toBe(QUIZ)
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
