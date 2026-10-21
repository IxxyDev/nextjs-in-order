import type { SpecimenFile } from '../../types'
import { SERVER_ONLY, SPLIT, frame } from './fates'

/** pages/posts/[id].tsx: ● SSG with ISR; HTML + JSON at build, regenerated after 60 s */
export const FILE: SpecimenFile = {
  path: 'pages/posts/[id].tsx', component: 'PostPage', entity: 'pages-post-page',
  lines: [
    { id: 'PO1', text: "import Image from 'next/image'", fate: SPLIT, journeys: ['j11'] },
    { id: 'PO2', text: "import { db } from '@/lib/data'", fate: SERVER_ONLY, journeys: ['j3'] },
    { id: 'PO3', text: 'export async function getStaticPaths() {', fate: SERVER_ONLY, mark: 'static-shell', journeys: ['j1', 'j3', 'j8'], note: 'runs at build: which ids to prerender' },
    { id: 'PO4', text: "  return { paths: [{ params: { id: '7' } }], fallback: 'blocking' }", fate: SERVER_ONLY, mark: 'static-shell', journeys: ['j3', 'j8'], note: 'an id not listed: the first visitor waits (J8 step 8)' },
    frame('PO5', '}'),
    { id: 'PO6', text: 'export async function getStaticProps({ params }: { params: { id: string } }) {', fate: SERVER_ONLY, mark: 'static-shell', journeys: ['j1', 'j3', 'j4', 'j8'], note: '●: at build, then on regeneration' },
    { id: 'PO7', text: "  const post = await db.find('post', params.id)", fate: SERVER_ONLY, mark: 'static-shell', journeys: ['j1', 'j3', 'j4', 'j8'] },
    { id: 'PO8', text: '  return { props: { post }, revalidate: 60 }', fate: SERVER_ONLY, mark: 'cached', journeys: ['j1', 'j3', 'j4', 'j8', 'j11'], note: 'ISR: stale after 60 s, regenerated behind' },
    frame('PO9', '}'),
    { id: 'PO10', text: 'export default function PostPage({ post }: { post: { title: string } }) {', fate: SPLIT, mark: 'static-shell', journeys: ['j1', 'j3', 'j4'], note: 'HTML at build; code crosses all the same' },
    frame('PO11', '  return ('),
    { id: 'PO12', text: '    <article>', fate: SPLIT, journeys: ['j4'] },
    { id: 'PO13', text: '      <Image src="/hero.jpg" width={1280} height={720} sizes="100vw" alt="" />', fate: SPLIT, journeys: ['j11'], note: 'box reserved; srcset lists every device width at /_next/image' },
    { id: 'PO14', text: '      <h1>{post.title}</h1>', fate: SPLIT, journeys: ['j4'] },
    frame('PO15', '    </article>'),
    frame('PO16', '  )'),
    frame('PO17', '}')
  ]
}
