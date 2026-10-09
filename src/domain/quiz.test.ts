import { describe, it, expect } from 'vitest'
import { QUIZ } from './quiz'
import { validateQuiz } from './validate'
import { loadQuiz, peekQuiz, scoreQuestion } from './predict'
import { JOURNEY_CATALOG, loadAllJourneys, peekJourney } from './journeys'
import type { QuizQuestion } from './types'

const byId = (id: string) => QUIZ.find((q) => q.id === id)!

describe('predict the machine', () => {
  it('holds the ten reviewer questions, then one scenario per journey J0–J11', () => {
    expect(QUIZ).toHaveLength(22)
    expect(QUIZ.filter((q) => q.source === 'reviewer').map((q) => q.id)).toEqual(['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10'])
    expect(QUIZ.filter((q) => q.source === 'scenario').map((q) => q.journey)).toEqual(JOURNEY_CATALOG.map((e) => e.slug))
  })
  it('uses every answer type', () => {
    expect(new Set(QUIZ.map((q) => q.type))).toEqual(new Set(['entities', 'regions', 'choice']))
  })
  it('every reference exists and every replay resolves to a journey step', async () => {
    await loadAllJourneys()
    expect(validateQuiz(QUIZ, peekJourney)).toEqual([])
    for (const q of QUIZ) expect(q.replays.length, q.id).toBeGreaterThan(0)
  })
  it('avoids retired names and the article-era claims of concept-model §7', () => {
    const text = QUIZ.flatMap((q) => [q.prompt, q.why, ...(q.type === 'choice' ? q.options : [])]).join('\n')
    for (const bad of ['Full Route Cache', 'Router Cache', 'binary format', 'Edge Runtime', 'experimental.ppr']) expect(text, bad).not.toContain(bad)
  })
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
  it('loads lazily', async () => {
    expect(await loadQuiz()).toBe(QUIZ)
    expect(peekQuiz()).toBe(QUIZ)
  })
  it('reports broken questions', async () => {
    await loadAllJourneys()
    const broken: QuizQuestion[] = [
      { id: 'x', source: 'scenario', journey: 'ghost', type: 'entities', title: 't', prompt: 'p', why: 'w', candidates: ['nope', 'swc'], answer: [], replays: [] },
      { id: 'x', source: 'reviewer', type: 'regions', title: 't', prompt: 'p', why: 'w', candidates: ['build'], answer: ['source'], replays: [{ journey: 'app-initial', step: 99 }] },
      { id: 'y', source: 'reviewer', type: 'choice', title: 't', prompt: ' ', why: 'w', options: ['a'], answer: 3, highlight: ['nobody'], replays: [{ journey: 'gone', step: 1 }] }
    ]
    const errors = validateQuiz(broken, peekJourney)
    expect(errors).toEqual([
      'quiz x: scenario without a known journey',
      'quiz x: unknown entity nope',
      'quiz x: empty answer',
      'quiz x: no replay',
      'quiz x: duplicate id',
      'quiz x: answer source is not a candidate',
      'quiz x: no distractors',
      'quiz x: app-initial has no step 99',
      'quiz y: empty text',
      'quiz y: needs 2–4 options',
      'quiz y: answer out of range',
      'quiz y: unknown entity nobody',
      'quiz y: unknown journey gone'
    ])
  })
})
