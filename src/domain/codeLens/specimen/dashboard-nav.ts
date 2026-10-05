import type { SpecimenFile } from '../../types'
import { B, X, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'components/DashboardNav.tsx', component: 'DashboardNav', entity: 'src-dashboard-nav',
  lines: [
    { id: 'DN1', text: "'use client'", fate: B },
    { id: 'DN2', text: "import Link from 'next/link'", fate: X },
    { id: 'DN3', text: "import { usePathname } from 'next/navigation'", fate: X },
    { id: 'DN4', text: "import { useState } from 'react'", fate: X },
    { id: 'DN5', text: 'export default function DashboardNav() {', fate: X },
    { id: 'DN6', text: '  const [open, setOpen] = useState<boolean>(false)', fate: X, mark: 'shared-layout', note: 'state survives j0-10; <boolean> is the ✂ demo' },
    { id: 'DN7', text: '  const pathname = usePathname()', fate: X },
    frame('DN8', '  return ('),
    { id: 'DN9', text: '    <nav data-open={open}>', fate: X },
    { id: 'DN10', text: '      <button onClick={() => setOpen(!open)}>Menu</button>', fate: X, note: 'handler exists only after hydration' },
    { id: 'DN11', text: "      <Link href=\"/dashboard/settings\" aria-current={pathname === '/dashboard/settings'}>Settings</Link>", fate: X },
    { id: 'DN12', text: '      <Link href="/dashboard/billing">Billing</Link>', fate: X, note: 'J6: the prefetched link' },
    frame('DN13', '    </nav>'),
    frame('DN14', '  )'),
    frame('DN15', '}')
  ]
}
