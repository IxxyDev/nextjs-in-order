/**
 * Predict the machine, the mode at #/predict (PredictView): it asks the questions of the quiz, the question bank in
 * quiz.ts. A journey step of kind 'predict' is another thing: its one question lives on the step (Step.question).
 */
import type { PickMark, QuizQuestion, QuizResult } from './types'
import { createLazyCatalog } from './lazyCatalog'

/** the question bank lives in its own chunk, loaded on the first visit to #/predict; it is the catalog's one entry */
const QUIZ_SLUG = 'quiz'
const catalog = createLazyCatalog([{ slug: QUIZ_SLUG, load: () => import('./quiz').then((m) => m.QUIZ) }])

export const peekQuiz = () => catalog.peek(QUIZ_SLUG)
export const loadQuiz = () => catalog.load(QUIZ_SLUG)

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

/** pick marks before Check, result marks after it; a choice option is marked like an entity or a region */
export function markFor(id: string, isPicked: boolean, isChecked: boolean, answer: ReadonlySet<string>, isCandidate = false): PickMark | undefined {
  if (!isChecked) return isPicked ? 'picked' : isCandidate ? 'candidate' : undefined
  if (answer.has(id)) return isPicked ? 'correct' : 'missed'
  return isPicked ? 'extra' : undefined
}
