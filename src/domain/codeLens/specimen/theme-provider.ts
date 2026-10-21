import type { SpecimenFile } from '../../types'
import { SPLIT, frame } from './fates'

/** components/ThemeProvider.tsx (J3, J4): the state _app keeps across Pages navigations; no tags of its own */
export const FILE: SpecimenFile = {
  path: 'components/ThemeProvider.tsx', component: 'ThemeProvider', entity: 'pages-app',
  lines: [
    { id: 'TP1', text: "import { createContext, useState } from 'react'", fate: SPLIT, journeys: ['j3'] },
    { id: 'TP2', text: 'export const ThemeContext = createContext<unknown>(null)', fate: SPLIT, journeys: ['j3'] },
    { id: 'TP3', text: 'export function ThemeProvider({ children }: { children: React.ReactNode }) {', fate: SPLIT, journeys: ['j3', 'j4'], note: 'Pages Router: browser code like every component' },
    { id: 'TP4', text: "  const [theme, setTheme] = useState('light')", fate: SPLIT, mark: 'shared-layout', journeys: ['j3', 'j4'], note: 'the state J4 keeps when the page swaps' },
    { id: 'TP5', text: '  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>', fate: SPLIT, journeys: ['j3', 'j4'], note: 'a provider: no tags in the HTML' },
    frame('TP6', '}')
  ]
}
