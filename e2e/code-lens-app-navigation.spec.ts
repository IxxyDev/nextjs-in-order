import { expect, test } from './fixtures'
import { lens, openStep, panes, watchErrors } from './helpers'

test('j6-6 shows the navigation request with the refetch-marked tree; j6-10 the patch without HTML', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'app-navigation', 6, 18)
  await expect(panes(page).first()).toContainText('Next-Router-State-Tree')
  await expect(panes(page).first()).toContainText('"refetch"')
  await expect(panes(page).first()).toContainText('?_rsc=qR7vX2mK9pLw3sTb')
  await openStep(page, 'app-navigation', 10, 18)
  await expect(panes(page).first()).toContainText('text/x-component')
  await expect(panes(page).first().locator('.lens-row', { hasText: 'no rows: RootLayout' })).toHaveCount(1)
  await expect(lens(page)).not.toContainText('off-map')
  errors.assertClean()
})
