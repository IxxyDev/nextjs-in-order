import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, CLIENT_BOUNDARY, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'app/dashboard/layout.tsx', component: 'DashboardLayout', entity: 'src-dashboard-layout',
  lines: [
    { id: 'DL1', text: "import DashboardNav from '@/components/DashboardNav'", fate: CLIENT_BOUNDARY, note: 'rsc layer: resolves to the proxy' },
    { id: 'DL2', text: 'export default function DashboardLayout({ children }: { children: React.ReactNode }) {', fate: SERVER_ONLY, mark: 'shared-layout' },
    frame('DL3', '  return ('),
    { id: 'DL4', text: '    <section className="dashboard">', fate: SERVER_ONLY, mark: 'shared-layout' },
    { id: 'DL5', text: '      <DashboardNav />', fate: CLIENT_BOUNDARY, mark: 'shared-layout', note: 'becomes $L1 + 1:I[…]' },
    { id: 'DL6', text: '      {children}', fate: SERVER_ONLY, note: 'the slot: LayoutRouter (J5 step 5)' },
    frame('DL7', '    </section>'),
    frame('DL8', '  )'),
    frame('DL9', '}')
  ]
}
