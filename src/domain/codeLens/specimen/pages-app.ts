import type { SpecimenFile } from '../../types'
import { X, frame } from './fates'

/** pages/_app.tsx: renders on the server for the document, then hydrates and stays across Pages navigations */
export const FILE: SpecimenFile = {
  path: 'pages/_app.tsx', component: 'App', entity: 'pages-app',
  lines: [
    { id: 'AP1', text: "import type { AppProps } from 'next/app'", fate: X, journeys: ['j3'], note: 'type-only: erased by the compiler' },
    { id: 'AP2', text: "import Script from 'next/script'", fate: X, journeys: ['j11'] },
    { id: 'AP3', text: "import { ThemeProvider } from '@/components/ThemeProvider'", fate: X, journeys: ['j3', 'j4'] },
    { id: 'AP4', text: 'export default function App({ Component, pageProps }: AppProps) {', fate: X, mark: 'shared-layout', journeys: ['j3', 'j4'], note: 'wraps every page' },
    frame('AP5', '  return ('),
    { id: 'AP6', text: '    <ThemeProvider>', fate: X, mark: 'shared-layout', journeys: ['j3', 'j4'], note: 'keeps its state when the page swaps (J4)' },
    { id: 'AP7', text: '      <Component {...pageProps} />', fate: X, journeys: ['j3', 'j4'], note: 'the slot: ProductPage, then PostPage' },
    { id: 'AP8', text: '      <Script src="https://example.com/analytics.js" strategy="lazyOnload" />', fate: X, journeys: ['j11'], note: 'runs in browser idle time' },
    frame('AP9', '    </ThemeProvider>'),
    frame('AP10', '  )'),
    frame('AP11', '}')
  ]
}
