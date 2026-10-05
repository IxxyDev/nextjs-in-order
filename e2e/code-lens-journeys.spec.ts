import { expect, test, type Page } from './fixtures'
import { eyebrow, expectNoHorizontalScroll, watchErrors } from './helpers'

/** one open step per journey for J3, J4, J7, J8, J9 and J11 (docs/code-lens/<slug>.md): it renders, a line lights the map, nothing is off-map */
const lens = (page: Page) => page.getByRole('region', { name: 'Code lens' })
const panes = (page: Page) => lens(page).locator('.lens-pane:not(.is-before)')
const glyph = (page: Page, id: string) => page.locator(`svg.world [data-entity="${id}"] .glyph`)

const CASES = [
  { journey: 'J3', slug: 'pages-initial', step: 7, of: 16, shows: '<h1>Desk lamp</h1>', row: '<article>', entity: 'html' },
  { journey: 'J4', slug: 'pages-navigation', step: 8, of: 12, shows: '<PostPage post={…}>', row: '<ThemeProvider>', entity: 'pages-app' },
  { journey: 'J7', slug: 'server-actions', step: 6, of: 17, shows: 'POST /dashboard/settings', row: 'Next-Action:', entity: 'routing-ladder' },
  { journey: 'J8', slug: 'caching', step: 17, of: 20, shows: 'loading.tsx', row: '<p>Loading billing…</p>', entity: 'ppr-shell' },
  { journey: 'J9', slug: 'dev-mode', step: 9, of: 20, shows: "{open ? 'Close' : 'Menu'}", row: "{open ? 'Close' : 'Menu'}", entity: 'src-dashboard-nav' },
  { journey: 'J11', slug: 'optimizations', step: 7, of: 16, shows: '&w=640&q=75', row: 'sizes="100vw" srcset=', entity: 'next-image' }
]

for (const c of CASES) {
  test(`${c.journey} step ${c.step}: the open lens renders, a line lights ${c.entity}, nothing is off-map`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(`/#/journey/${c.slug}/${c.step}`)
    await expect(eyebrow(page)).toContainText(`step ${c.step} of ${c.of}`)
    await expect(panes(page).first()).toBeVisible()
    await expect(lens(page)).toContainText(c.shows)
    await panes(page).locator('.lens-row', { hasText: c.row }).last().hover()
    await expect(glyph(page, c.entity)).toHaveClass(/is-linked/)
    await expect(lens(page)).not.toContainText('off-map')
    await expectNoHorizontalScroll(page)
    errors.assertClean()
  })
}
