import { expect, test } from './fixtures'
import { afterPanes, expectNoHorizontalScroll, eyebrow, lens, openStep, watchErrors } from './helpers'

/** the lens along J1, J2 and J10 (docs/code-lens/production-build.md, request-routing.md, custom-server.md) */

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

test('j2-5 shows the Proxy decision as headers; j2-2 is a peek', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'request-routing', 5, 14)
  await expect(afterPanes(page).first()).toContainText('x-middleware-next: 1')
  await openStep(page, 'request-routing', 2, 14)
  await expect(lens(page).locator('.lens-strip')).toContainText('BUILD_ID k7Qm2xLp9')
  await expect(afterPanes(page)).toHaveCount(0)
  errors.assertClean()
})

test('j10-7 strikes the headers and Proxy that never ran for /healthz', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'custom-server', 7, 14)
  const pane = afterPanes(page).first()
  await expect(pane).toContainText('200 · ok')
  await expect(pane.locator('.lens-row.is-gone')).toHaveCount(2)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})
