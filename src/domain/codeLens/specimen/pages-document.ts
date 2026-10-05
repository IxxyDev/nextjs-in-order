import type { SpecimenFile } from '../../types'
import { S, frame } from './fates'

/** pages/_document.tsx: server only; renders once per document, never on a client navigation */
export const FILE: SpecimenFile = {
  path: 'pages/_document.tsx', component: 'Document', entity: 'pages-document',
  lines: [
    { id: 'DC1', text: "import { Html, Head, Main, NextScript } from 'next/document'", fate: S, journeys: ['j3'] },
    { id: 'DC2', text: 'export default function Document() {', fate: S, journeys: ['j3', 'j4'], note: 'never in a browser chunk' },
    { id: 'DC3', text: '  return <Html><Head /><body><Main /><NextScript /></body></Html>', fate: S, journeys: ['j3'], note: '<Main/>: the app HTML; <NextScript/>: the chunk script tags' },
    frame('DC4', '}')
  ]
}
