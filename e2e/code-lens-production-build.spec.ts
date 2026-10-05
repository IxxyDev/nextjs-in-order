import { expect, test, type Page } from './fixtures'
import { eyebrow, expectNoHorizontalScroll, watchErrors } from './helpers'

/** the lens along J1, J2 and J10 (docs/code-lens/production-build.md, request-routing.md, custom-server.md) */
const lens = (page: Page) => page.getByRole('region', { name: 'Code lens' })
const panes = (page: Page) => lens(page).locator('.lens-pane:not(.is-before)')
const open = async (page: Page, slug: string, step: number, of: number) => {
  await page.goto(`/#/journey/${slug}/${step}`)
  await expect(eyebrow(page)).toContainText(`step ${step} of ${of}`)
}

test('j1-3 opens on ProfileForm.js with the marker comment and the ✂ type', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 'production-build', 3, 18)
  const pane = panes(page).last()
  await expect(pane).toContainText('ProfileForm.js')
  await expect(pane).toContainText('__next_internal_client_entry_do_not_use__')
  await expect(pane.locator('.lens-cut')).toContainText('{ name: string }')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('j1-4 splits actions.js into a server registration and a browser reference', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 'production-build', 4, 18)
  await expect(panes(page)).toHaveCount(2)
  await expect(panes(page).first()).toContainText('registerServerReference(updateProfile')
  await expect(panes(page).last()).toContainText('createServerReference(')
  errors.assertClean()
})

test('j1-17 prints the route summary; j1-18 has no lens', async ({ page }) => {
  await open(page, 'production-build', 17, 18)
  await expect(panes(page).first()).toContainText('◐ /dashboard/billing')
  await page.keyboard.press('ArrowRight')
  await expect(eyebrow(page)).toContainText('step 18 of 18')
  await expect(lens(page)).toHaveCount(0)
})

test('j2-5 shows the Proxy decision as headers; j2-2 is a peek', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 'request-routing', 5, 14)
  await expect(panes(page).first()).toContainText('x-middleware-next: 1')
  await open(page, 'request-routing', 2, 14)
  await expect(lens(page).locator('.lens-strip')).toContainText('BUILD_ID k7Qm2xLp9')
  await expect(panes(page)).toHaveCount(0)
  errors.assertClean()
})

test('j10-7 strikes the headers and Proxy that never ran for /healthz', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 'custom-server', 7, 14)
  const pane = panes(page).first()
  await expect(pane).toContainText('200 · ok')
  await expect(pane.locator('.lens-row.is-gone')).toHaveCount(2)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})
