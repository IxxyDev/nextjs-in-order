import type { SpecimenFile } from '../../types'
import { B, X, A, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'components/ProfileForm.tsx', component: 'ProfileForm', entity: 'src-profile-form',
  lines: [
    { id: 'PF1', text: "'use client'", fate: B },
    { id: 'PF2', text: "import { useActionState } from 'react'", fate: X },
    { id: 'PF3', text: "import { updateProfile } from '@/app/actions'", fate: A, note: 'browser layer: createServerReference stub' },
    { id: 'PF4', text: 'export default function ProfileForm({ name }: { name: string }) {', fate: X },
    { id: 'PF5', text: '  const [state, formAction] = useActionState(updateProfile, null)', fate: X, journeys: ['j7'] },
    frame('PF6', '  return ('),
    { id: 'PF7', text: '    <form action={formAction}>', fate: X },
    { id: 'PF8', text: '      <input name="name" defaultValue={name} />', fate: X },
    { id: 'PF9', text: "      <button>Save</button> {state?.ok && 'Saved'}", fate: X, journeys: ['j7'] },
    frame('PF10', '    </form>'),
    frame('PF11', '  )'),
    frame('PF12', '}')
  ]
}
