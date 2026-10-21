import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, SPLIT, frame } from './fates'

/** pages/products/[id].tsx: ƒ, getServerSideProps per request; the whole page component is browser code */
export const FILE: SpecimenFile = {
  path: 'pages/products/[id].tsx', component: 'ProductPage', entity: 'pages-product-page',
  lines: [
    { id: 'PR1', text: "import Link from 'next/link'", fate: SPLIT, journeys: ['j3', 'j4'] },
    { id: 'PR2', text: "import { db } from '@/lib/data'", fate: SERVER_ONLY, journeys: ['j3'], note: 'only getServerSideProps uses it: cut from the browser build too' },
    { id: 'PR3', text: 'export async function getServerSideProps({ params }: { params: { id: string } }) {', fate: SERVER_ONLY, journeys: ['j1', 'j3', 'j4'], note: 'ƒ: runs per request; a hole in the browser chunk' },
    { id: 'PR4', text: "  const product = await db.find('product', params.id)", fate: SERVER_ONLY, journeys: ['j3', 'j4'] },
    { id: 'PR5', text: '  return { props: { product } }', fate: SERVER_ONLY, journeys: ['j3', 'j4'], note: 'crosses as JSON: __NEXT_DATA__ or /_next/data' },
    frame('PR6', '}'),
    { id: 'PR7', text: 'export default function ProductPage({ product }: { product: { name: string } }) {', fate: SPLIT, journeys: ['j1', 'j2', 'j3', 'j4'], note: 'the whole page is browser code' },
    frame('PR8', '  return ('),
    { id: 'PR9', text: '    <article>', fate: SPLIT, journeys: ['j3', 'j4'] },
    { id: 'PR10', text: '      <h1>{product.name}</h1>', fate: SPLIT, journeys: ['j3', 'j4'] },
    { id: 'PR11', text: '      <Link href="/posts/7">Read the post</Link>', fate: SPLIT, journeys: ['j3', 'j4'], note: 'J4: prefetched when it scrolls into view' },
    frame('PR12', '    </article>'),
    frame('PR13', '  )'),
    frame('PR14', '}')
  ]
}
