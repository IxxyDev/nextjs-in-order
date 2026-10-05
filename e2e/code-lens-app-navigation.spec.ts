import { expect, test, type Page } from './fixtures'
import { eyebrow, watchErrors } from './helpers'

const lens = (page: Page) => page.getByRole('region', { name: 'Code lens' })
const panes = (page: Page) => lens(page).locator('.lens-pane')
const open = async (page: Page, slug: string, step: number, of: number) => {
  await page.goto(`/#/journey/${slug}/${step}`)
  await expect(eyebrow(page)).toContainText(`step ${step} of ${of}`)
}

test('j6-6 shows the navigation request with the refetch-marked tree; j6-10 the patch without HTML', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 'app-navigation', 6, 18)
  await expect(panes(page).first()).toContainText('Next-Router-State-Tree')
  await expect(panes(page).first()).toContainText('"refetch"')
  await expect(panes(page).first()).toContainText('?_rsc=qR7vX2mK9pLw3sTb')
  await open(page, 'app-navigation', 10, 18)
  await expect(panes(page).first()).toContainText('text/x-component')
  await expect(panes(page).first().locator('.lens-row', { hasText: 'no rows: RootLayout' })).toHaveCount(1)
  await expect(lens(page)).not.toContainText('off-map')
  errors.assertClean()
})
