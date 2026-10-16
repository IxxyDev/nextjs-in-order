import { expect, test } from './fixtures'
import { afterPanes, lens, openStep, watchErrors } from './helpers'

/** the lens along J2 (docs/code-lens/request-routing.md) */

test('j2-5 shows the Proxy decision as headers; j2-2 is a peek', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'request-routing', 5, 14)
  await expect(afterPanes(page).first()).toContainText('x-middleware-next: 1')
  await openStep(page, 'request-routing', 2, 14)
  await expect(lens(page).locator('.lens-strip')).toContainText('BUILD_ID k7Qm2xLp9')
  await expect(afterPanes(page)).toHaveCount(0)
  errors.assertClean()
})
