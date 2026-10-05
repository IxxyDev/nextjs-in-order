import type { SpecimenFile } from '../../types'
import { S, frame } from './fates'

export const FILE: SpecimenFile = {
  path: 'app/layout.tsx', component: 'RootLayout', entity: 'src-root-layout',
  /** RL4–RL5 sit above RL1 in the file; ids stay stable, so the new lines take the next numbers */
  lines: [
    { id: 'RL4', text: "import localFont from 'next/font/local'", fate: S, journeys: ['j11'] },
    { id: 'RL5', text: "const brand = localFont({ src: './fonts/brand.woff2' })", fate: S, journeys: ['j11'], note: 'runs at build: @font-face + a hashed file; brand.className goes on <html>' },
    { id: 'RL1', text: 'export default function RootLayout({ children }: { children: React.ReactNode }) {', fate: S, mark: 'shared-layout' },
    { id: 'RL2', text: '  return <html lang="en"><body>{children}</body></html>', fate: S, mark: 'shared-layout' },
    frame('RL3', '}')
  ]
}
