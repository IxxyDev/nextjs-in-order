// src/domain/codeLens/optimizations.ts
import type { LensStep } from '../types'
import { source } from './specimen'

const off = (step: string): LensStep => ({ step, mode: 'off', panes: [], links: [], motion: [] })

/**
 * the lens along J11: one entry per journey step, in order (docs/code-lens.md §10, details in docs/code-lens/optimizations.md).
 */
export const STEPS: LensStep[] = [
  {
    step: 'j11-1', mode: 'peek', form: 'files',
    summary: ['○ /dashboard/settings · SP4 renders once at build because SP5 is ▤ "use cache" → settings.html · settings.rsc · settings.meta, served from the server cache'],
    panes: [{ title: 'app/dashboard/settings/page.tsx', entity: 'src-settings-page', abridged: true, rows: source(['SP4', 'SP5']) }],
    links: [
      { fate: 'static-shell', entities: ['prerendered-outputs'] },
      { fate: 'cached', entities: ['server-cache'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j11-2', mode: 'peek', form: 'files',
    summary: ['● /posts/7 · pages/posts/7.html + 7.json · PO8 revalidate: 60 → stale after 60 s, regenerated behind the stale copy'],
    panes: [{ title: 'pages/posts/[id].tsx', entity: 'pages-post-page', abridged: true, rows: source(['PO8']) }],
    links: [{ fate: 'cached', entities: ['server-cache', 'isr-regeneration'] }],
    motion: [], reduced: 'static'
  },
  {
    step: 'j11-3', mode: 'peek', form: 'html',
    summary: ['◐ /dashboard/billing · ○ BP6, BP7, BP13 in the shell (<h1>, the skeleton) · ⌛ BP8 → IL4 cookies(): the hole, computed per request'],
    panes: [{ title: 'app/dashboard/billing/page.tsx', entity: 'src-billing-page', abridged: true, rows: source(['BP6', 'BP7', 'BP8']) }],
    links: [
      { fate: 'static-shell', entities: ['ppr-shell'] },
      { fate: 'suspended', entities: ['suspense-hole'] }
    ],
    motion: [], reduced: 'static'
  },
  {
    step: 'j11-4', mode: 'peek', form: 'files',
    summary: ['static/chunks/ · framework-a1b2c3.js (react, react-dom, next) · webpack-9c0d.js (runtime) · app/dashboard/layout-3c4d.js · app/dashboard/billing/page-7a8b.js (one per route)'],
    panes: [], links: [], motion: []
  },
  {
    step: 'j11-5', mode: 'open', form: 'js',
    panes: [
      {
        title: 'next.config.js · components/ProfileForm.tsx', entity: 'src-profile-form', abridged: true,
        rows: [
          ...source(['NC5']).map((l) => ({ ...l, note: 'context: next.config.js' })),
          ...source(['PB1'])
        ]
      },
      {
        title: 'components/ProfileForm.js', hint: 'as compiled with --webpack; Turbopack (the default) keeps the import and skips the unused re-exports', abridged: true,
        rows: [
          { text: 'import { Button } from "__barrel_optimize__?names=Button!=!ui-kit";', from: ['PB1'], fate: 'split', change: 'same', morph: 'Button', note: 'only the name Button is asked for' },
          { text: 'export { Button } from "./button.js"', from: ['PB1'], fate: 'split', change: 'new', note: "the barrel as the bundler now sees it: one line" },
          { fold: 1, label: "the rest of ui-kit's re-exports: never reached", change: 'gone' }
        ]
      }
    ],
    links: [
      { fate: 'split', entities: ['swc', 'src-profile-form'] },
      { fate: 'server-only', entities: ['swc'], from: ['NC5'] }
    ],
    motion: ['transform'], reduced: 'static'
  },
  {
    step: 'j11-6', mode: 'open', form: 'files',
    panes: [
      { title: 'app/dashboard/settings/page.tsx', entity: 'src-settings-page', badge: 'what if', hint: 'J11: ProfileForm behind next/dynamic', abridged: true, rows: source(['SD1', 'SD2']) },
      {
        title: '.next/static/chunks/', entity: 'next-dynamic', abridged: true,
        rows: [
          { text: 'app/dashboard/settings/page-5e6f.js', from: ['SD2'], fate: 'client-boundary', change: 'same', note: 'no ProfileForm code in it any more' },
          { text: '1f2e….js', from: ['PF2', 'PF4', 'PF5', 'PF7', 'PF8', 'PF9'], fate: 'split', change: 'new', note: "ProfileForm's own chunk: the import() is the boundary" },
          { text: '<p>Loading form…</p>', from: ['SD2'], fate: 'client-boundary', change: 'new', note: 'the fallback while that chunk loads' }
        ]
      }
    ],
    links: [
      { fate: 'client-boundary', entities: ['next-dynamic', 'suspense-hole'] },
      { fate: 'server-only', entities: ['next-dynamic'], from: ['SD1'] },
      { fate: 'split', entities: ['split-chunks', 'client-components'] }
    ],
    motion: ['split'], reduced: 'static'
  },
  {
    step: 'j11-7', mode: 'open', form: 'html',
    panes: [
      { title: 'pages/posts/[id].tsx', entity: 'pages-post-page', abridged: true, rows: source(['PO13']) },
      {
        title: 'GET /posts/7 · the <img> · then its request', entity: 'next-image', abridged: true,
        rows: [
          { text: '<img alt="" loading="lazy" width="1280" height="720" decoding="async" data-nimg="1" style="color:transparent"', from: ['PO13'], fate: 'split', change: 'new', note: 'width + height: the box is reserved' },
          { text: '  sizes="100vw" srcset="/_next/image?url=%2Fhero.jpg&w=640&q=75 640w, …&w=750&q=75 750w, … 3840w"', from: ['PO13'], fate: 'split', change: 'new', note: 'sizes: every device width (without it, only 1x and 2x)' },
          { text: '  src="/_next/image?url=%2Fhero.jpg&w=3840&q=75">', from: ['PO13'], fate: 'split', change: 'new', note: 'the largest, for a browser without srcset' },
          { text: 'GET /_next/image?url=%2Fhero.jpg&w=640&q=75 · Accept: image/avif,image/webp,…', from: ['PO13'], change: 'new', morph: 'w=640', note: 'a phone picks 640 · not React: the optimizer' },
          { text: '200 · Content-Type: image/webp', change: 'new', note: 'sharp resized it; the cache key hashes /hero.jpg, 640, 75, image/webp' }
        ]
      }
    ],
    links: [{ fate: 'split', entities: ['next-image', 'dom'] }],
    motion: ['fade-in'], reduced: 'static'
  },
  {
    step: 'j11-8', mode: 'open', form: 'css',
    panes: [
      { title: 'app/layout.tsx', entity: 'src-root-layout', abridged: true, rows: source(['RL4', 'RL5']) },
      {
        title: 'brand font CSS · generated at build', hint: 'family names stay as written; only the class is hashed (CSS modules); Turbopack hashes the class its own way', abridged: true,
        rows: [
          { text: "@font-face { font-family: 'brand';", from: ['RL5'], fate: 'server-only', change: 'new', morph: 'brand', note: 'the family keeps the variable name' },
          { text: "  src: url(/_next/static/media/4e5f6a-s.p.woff2) format('woff2'); font-display: swap; }", from: ['RL5'], fate: 'server-only', change: 'new', note: 'brand.woff2, copied under a hashed name' },
          { fold: 1, label: "1 rule: the 'brand Fallback' face (step 10)" },
          { text: ".__className_a1b2c3 { font-family: 'brand', 'brand Fallback'; }", from: ['RL5'], fate: 'server-only', change: 'new', note: 'brand.className, set on <html>: the only hashed name' }
        ]
      }
    ],
    links: [{ fate: 'server-only', entities: ['font-loader', 'font-css'] }],
    motion: ['transform'], reduced: 'static'
  },
  {
    step: 'j11-9', mode: 'peek', form: 'css',
    summary: ['next/font/google (not in the sample app) · next build fetches the stylesheet and font files from Google and writes them to static/media · the browser only asks /_next/static/media/…'],
    panes: [], links: [], motion: []
  },
  {
    step: 'j11-10', mode: 'peek', form: 'css',
    summary: ["@font-face { font-family: 'brand Fallback'; src: local(\"Arial\"); ascent-override · descent-override · line-gap-override · size-adjust } · from brand.woff2's metrics (RL5)"],
    panes: [{
      title: 'brand font CSS · the fallback face', abridged: true,
      rows: [{ text: "@font-face { font-family: 'brand Fallback'; src: local(\"Arial\"); ascent-override: …; descent-override: …; line-gap-override: …; size-adjust: …%; }", from: ['RL5'], fate: 'server-only', note: 'Arial, resized to the web font: no jump on swap' }]
    }],
    links: [{ fate: 'server-only', entities: ['font-css', 'dom'] }],
    motion: [], reduced: 'static'
  },
  {
    step: 'j11-11', mode: 'peek', form: 'html',
    summary: ['AP8 strategy="lazyOnload" · not in the HTML · after window load, in requestIdleCallback: <script src="https://example.com/analytics.js" data-nscript="lazyOnload"> appended to <body>'],
    panes: [{ title: 'pages/_app.tsx', entity: 'pages-app', abridged: true, rows: source(['AP2', 'AP8']) }],
    links: [{ fate: 'split', entities: ['next-script'] }],
    motion: [], reduced: 'static'
  },
  {
    step: 'j11-12', mode: 'peek', form: 'json',
    summary: ['.next/server/app/dashboard/settings/page.js.nft.json · { "version": 1, "files": ["…/node_modules/next/…", …] } · NC6 output: "standalone" copies only these'],
    panes: [{ title: 'next.config.js', abridged: true, rows: source(['NC6']) }],
    links: [{ fate: 'server-only', entities: ['tracing', 'standalone'] }],
    motion: [], reduced: 'static'
  },
  off('j11-13'),
  off('j11-14'),
  off('j11-15'),
  off('j11-16')
]
