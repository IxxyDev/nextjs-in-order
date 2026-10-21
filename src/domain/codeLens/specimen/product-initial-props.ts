import type { SpecimenFile } from '../../types'
import { SPLIT, frame } from './fates'

/** J3 step 5 / J4 step 6: the older data function; its code stays in the page chunk and runs in the browser on navigation */
export const FILE: SpecimenFile = {
  path: 'pages/products/[id].tsx', component: 'ProductPage', entity: 'pages-product-page',
  variant: 'J3, J4: getInitialProps instead of getServerSideProps', abridged: 'the page component as in the app',
  lines: [
    { id: 'PI1', text: 'ProductPage.getInitialProps = async ({ query }: { query: { id: string } }) => {', fate: SPLIT, journeys: ['j3', 'j4'], note: 'server for the document, browser on navigation' },
    { id: 'PI2', text: '  const res = await fetch(`https://api.example.com/products/${query.id}`)', fate: SPLIT, journeys: ['j3', 'j4'], note: 'anything it reads ships in the chunk' },
    { id: 'PI3', text: '  return { product: await res.json() }', fate: SPLIT, journeys: ['j3', 'j4'] },
    frame('PI4', '}')
  ]
}
