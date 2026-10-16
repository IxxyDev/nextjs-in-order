import { expect, test } from './fixtures'
import { afterPanes, expectNoHorizontalScroll, openStep, watchErrors } from './helpers'

/** the lens along J10 (docs/code-lens/custom-server.md) */

test('j10-7 strikes the headers and Proxy that never ran for /healthz', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'custom-server', 7, 14)
  const pane = afterPanes(page).first()
  await expect(pane).toContainText('200 · ok')
  await expect(pane.locator('.lens-row.is-gone')).toHaveCount(2)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})
