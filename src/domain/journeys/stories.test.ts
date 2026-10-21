import { describe, it, expect } from 'vitest'
import { lazyAllJourneys } from './index'
import { COMPARE_CATALOG } from '../compare'

/** spec §3.1: the Level 1 story is at most 60 words */
const MAX_WORDS = 60

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

describe('Level 1 story length', () => {
  it(`every journey step story has at most ${MAX_WORDS} words`, async () => {
    const over: string[] = []
    for (const j of await lazyAllJourneys.load()) {
      for (const s of j.steps) if (words(s.story) > MAX_WORDS) over.push(`${s.id}: ${words(s.story)}`)
    }
    expect(over).toEqual([])
  })
  it(`every compare step story and lane story has at most ${MAX_WORDS} words`, async () => {
    const over: string[] = []
    for (const e of COMPARE_CATALOG) {
      const pair = await e.load()
      for (const s of pair.steps) {
        if (words(s.story) > MAX_WORDS) over.push(`${pair.slug} ${s.id}: ${words(s.story)}`)
        s.lanes.forEach((l, i) => {
          if (l.story && words(l.story) > MAX_WORDS) over.push(`${pair.slug} ${s.id} lane ${i}: ${words(l.story)}`)
        })
      }
    }
    expect(over).toEqual([])
  })
})
