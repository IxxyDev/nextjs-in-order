import type { SpecimenFile } from '../../types'
import { X } from './fates'

/** J9 step 9 (edit 1, saved during next dev) and step 12 (what loses state): lines of DashboardNav that differ from DN */
export const FILE: SpecimenFile = {
  path: 'components/DashboardNav.tsx', component: 'DashboardNav', entity: 'src-dashboard-nav',
  variant: 'J9: edits saved during next dev', abridged: 'the rest as in the app',
  lines: [
    { id: 'NE1', text: "      <button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>", fate: X, journeys: ['j9'], note: 'edit 1: DN10 with new markup, same hooks' },
    { id: 'NE2', text: '// @refresh reset', fate: X, journeys: ['j9'], note: 'remount on every edit of this file' },
    { id: 'NE3', text: '  useEffect(() => { document.title = pathname }, [pathname])', fate: X, journeys: ['j9'], note: 'a new hook: the signature no longer matches' }
  ]
}
