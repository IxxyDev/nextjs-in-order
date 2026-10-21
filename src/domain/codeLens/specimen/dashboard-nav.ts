import type { SpecimenFile } from '../../types'
import { CLIENT_BOUNDARY, SPLIT, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'components/DashboardNav.tsx', component: 'DashboardNav', entity: 'src-dashboard-nav',
  lines: [
    { id: 'DN1', text: "'use client'", fate: CLIENT_BOUNDARY },
    { id: 'DN2', text: "import Link from 'next/link'", fate: SPLIT },
    { id: 'DN3', text: "import { usePathname } from 'next/navigation'", fate: SPLIT },
    { id: 'DN4', text: "import { useState } from 'react'", fate: SPLIT },
    { id: 'DN5', text: 'export default function DashboardNav() {', fate: SPLIT },
    { id: 'DN6', text: '  const [open, setOpen] = useState<boolean>(false)', fate: SPLIT, mark: 'shared-layout', note: 'state survives j0-10; <boolean> is the ✂ demo' },
    { id: 'DN7', text: '  const pathname = usePathname()', fate: SPLIT },
    frame('DN8', '  return ('),
    { id: 'DN9', text: '    <nav data-open={open}>', fate: SPLIT },
    { id: 'DN10', text: '      <button onClick={() => setOpen(!open)}>Menu</button>', fate: SPLIT, note: 'handler exists only after hydration' },
    { id: 'DN11', text: "      <Link href=\"/dashboard/settings\" aria-current={pathname === '/dashboard/settings'}>Settings</Link>", fate: SPLIT },
    { id: 'DN12', text: '      <Link href="/dashboard/billing">Billing</Link>', fate: SPLIT, note: 'J6: the prefetched link' },
    frame('DN13', '    </nav>'),
    frame('DN14', '  )'),
    frame('DN15', '}')
  ]
}
