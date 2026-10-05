import { expect, test, type Page } from './fixtures'
import { eyebrow, expectNoHorizontalScroll, watchErrors } from './helpers'

const lens = (page: Page) => page.getByRole('region', { name: 'Code lens' })
const panes = (page: Page) => lens(page).locator('.lens-pane')
const glyph = (page: Page, id: string) => page.locator(`svg.world [data-entity="${id}"] .glyph`)
const open = async (page: Page, slug: string, step: number, of: number) => {
  await page.goto(`/#/journey/${slug}/${step}`)
  await expect(eyebrow(page)).toContainText(`step ${step} of ${of}`)
}

test('j5-8 opens the manifest lookup next to the row it writes; a line lights the manifest', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 'app-initial', 8, 22)
  await expect(panes(page)).toHaveCount(2)
  await expect(panes(page).first()).toContainText('page_client-reference-manifest.js')
  await expect(panes(page).last()).toContainText('1:I[')
  await panes(page).last().locator('.lens-row').first().hover()
  await expect(glyph(page, 'client-reference-manifest')).toHaveClass(/is-linked/)
  await expect(lens(page)).not.toContainText('off-map')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})
