import type { QuizQuestion, QuizResult } from './types'

let quiz: QuizQuestion[] | undefined

export function peekQuiz(): QuizQuestion[] | undefined {
  return quiz
}

/** the questions live in their own chunk, loaded on the first visit to #/predict */
export function loadQuiz(): Promise<QuizQuestion[]> {
  return import('./quiz').then((m) => (quiz = m.QUIZ))
}

/** what a pick list is compared against; a choice is the index of its option */
export function answerIds(q: QuizQuestion): string[] {
  return q.type === 'choice' ? [String(q.answer)] : q.answer
}

/** exact-set scoring: correct only when nothing is missed and nothing extra is picked */
export function scoreQuestion(q: QuizQuestion, picks: string[]): QuizResult {
  const want = new Set(answerIds(q)), got = new Set(picks)
  const hits = [...got].filter((id) => want.has(id))
  const missed = [...want].filter((id) => !got.has(id))
  const extra = [...got].filter((id) => !want.has(id))
  return { correct: missed.length === 0 && extra.length === 0, hits, missed, extra }
}
