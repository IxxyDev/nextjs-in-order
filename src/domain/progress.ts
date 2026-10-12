import { signal } from '@preact/signals'
import type { Journey } from './types'

export const PROGRESS_KEY = 'nextjs-in-order:progress:v1'

export interface Answer { correct: boolean; at: number }
export type ProgressData = Record<string, Answer>
export interface Summary { answered: number; correct: number; total: number }
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export const journeyId = (slug: string, stepId: string) => `journey:${slug}:${stepId}`
export const checkId = (stepId: string, index: number) => `check:${stepId}:${index}`
export const quizId = (questionId: string) => `quiz:${questionId}`

function defaultStorage(): StorageLike | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage } catch { return undefined }
}

function load(storage: StorageLike | undefined): ProgressData {
  try {
    const raw = storage?.getItem(PROGRESS_KEY)
    const data = raw ? JSON.parse(raw) : {}
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    const out: ProgressData = {}
    for (const [id, a] of Object.entries<Answer>(data)) if (a && typeof a.correct === 'boolean' && typeof a.at === 'number') out[id] = { correct: a.correct, at: a.at }
    return out
  } catch { return {} }
}

/** answers live in a signal, mirrored to storage; storage failures leave an in-memory store */
export function createProgress(getStorage: () => StorageLike | undefined = defaultStorage) {
  const data = signal<ProgressData>(load(getStorage()))
  const save = () => { try { getStorage()?.setItem(PROGRESS_KEY, JSON.stringify(data.value)) } catch { /* in-memory only */ } }
  const summarize = (ids: string[]): Summary => {
    const got = ids.map((id) => data.value[id]).filter(Boolean)
    return { answered: got.length, correct: got.filter((a) => a.correct).length, total: ids.length }
  }
  return {
    /** the first answer counts: a later one still gets feedback in the UI but does not rewrite progress */
    record(id: string, correct: boolean) {
      if (data.value[id]) return
      data.value = { ...data.value, [id]: { correct, at: Date.now() } }
      save()
    },
    get: (id: string): Answer | undefined => data.value[id],
    summaryForJourney: (j: Journey) => summarize(j.steps.flatMap((s) => [...(s.question ? [journeyId(j.slug, s.id)] : []), ...(s.checks ?? []).map((_, i) => checkId(s.id, i))])),
    summaryForQuiz: (ids: string[]) => summarize(ids.map(quizId)),
    reset() { data.value = {}; save() }
  }
}

export const progress = createProgress()
