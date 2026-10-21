import type { SpecimenFile } from '../../types'
import { CLIENT_BOUNDARY, SPLIT, ACTION, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'components/ProfileForm.tsx', component: 'ProfileForm', entity: 'src-profile-form',
  lines: [
    { id: 'PF1', text: "'use client'", fate: CLIENT_BOUNDARY },
    { id: 'PF2', text: "import { useActionState } from 'react'", fate: SPLIT },
    { id: 'PF3', text: "import { updateProfile } from '@/app/actions'", fate: ACTION, note: 'browser layer: createServerReference stub' },
    { id: 'PF4', text: 'export default function ProfileForm({ name }: { name: string }) {', fate: SPLIT },
    { id: 'PF5', text: '  const [state, formAction] = useActionState(updateProfile, null)', fate: SPLIT, journeys: ['j7'] },
    frame('PF6', '  return ('),
    { id: 'PF7', text: '    <form action={formAction}>', fate: SPLIT },
    { id: 'PF8', text: '      <input name="name" defaultValue={name} />', fate: SPLIT },
    { id: 'PF9', text: "      <button>Save</button> {state?.ok && 'Saved'}", fate: SPLIT, journeys: ['j7'] },
    frame('PF10', '    </form>'),
    frame('PF11', '  )'),
    frame('PF12', '}')
  ]
}
