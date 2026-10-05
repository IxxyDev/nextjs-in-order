import type { SpecimenFile } from '../../types'
import { S, A, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'app/actions.ts', component: 'updateProfile', entity: 'src-actions',
  lines: [
    { id: 'AC1', text: "'use server'", fate: A },
    { id: 'AC2', text: "import { updateTag } from 'next/cache'", fate: S, journeys: ['j7'] },
    { id: 'AC3', text: "import { db } from '@/lib/data'", fate: S, journeys: ['j7'] },
    { id: 'AC4', text: 'export async function updateProfile(prevState: unknown, formData: FormData) {', fate: A, note: 'ID 603a9c1e2b44…' },
    { id: 'AC5', text: "  await db.update('profile', { name: String(formData.get('name')) })", fate: S, journeys: ['j7'], note: 'J7 step 10' },
    { id: 'AC6', text: "  updateTag('profile')", fate: S, journeys: ['j7'], note: 'J7 step 12' },
    { id: 'AC7', text: '  return { ok: true }', fate: S, journeys: ['j7'], note: 'J7: crosses as field a' },
    frame('AC8', '}')
  ]
}
