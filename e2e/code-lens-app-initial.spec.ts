import { expect, test } from './fixtures'
import { expectNoHorizontalScroll, glyph, lens, openStep, panes, watchErrors } from './helpers'

test('j5-8 opens the manifest lookup next to the row it writes; a line lights the manifest', async ({ page }) => {
  const errors = watchErrors(page)
  await openStep(page, 'app-initial', 8, 22)
  await expect(panes(page)).toHaveCount(2)
  await expect(panes(page).first()).toContainText('page_client-reference-manifest.js')
  await expect(panes(page).last()).toContainText('1:I[')
  await panes(page).last().locator('.lens-row').first().hover()
  await expect(glyph(page, 'client-reference-manifest')).toHaveClass(/is-linked/)
  await expect(lens(page)).not.toContainText('off-map')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})
