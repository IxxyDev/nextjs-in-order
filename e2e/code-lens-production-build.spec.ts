import { expect, test } from './fixtures'
import { afterPanes, expectNoHorizontalScroll, eyebrow, lens, openStep, watchErrors } from './helpers'

/** the lens along J1 (docs/code-lens/production-build.md) */

test('j1-3 opens on ProfileForm.js with the marker comment and the ✂ type', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'production-build', 3, 18)
  const pane = afterPanes(page).last()
  await expect(pane).toContainText('ProfileForm.js')
  await expect(pane).toContainText('__next_internal_client_entry_do_not_use__')
  await expect(pane.locator('.lens-cut')).toContainText('{ name: string }')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('j1-4 splits actions.js into a server registration and a browser reference', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'production-build', 4, 18)
  await expect(afterPanes(page)).toHaveCount(2)
  await expect(afterPanes(page).first()).toContainText('registerServerReference(updateProfile')
  await expect(afterPanes(page).last()).toContainText('createServerReference(')
  errors.assertClean()
})

test('j1-17 prints the route summary; j1-18 has no lens', async ({ page }) => {
  await openStep(page, 'production-build', 17, 18)
  await expect(afterPanes(page).first()).toContainText('◐ /dashboard/billing')
  await page.keyboard.press('ArrowRight')
  await expect(eyebrow(page)).toContainText('step 18 of 18')
  await expect(lens(page)).toHaveCount(0)
})
