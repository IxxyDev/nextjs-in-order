import { expect, test } from './fixtures'
import { eyebrow, expectNoHorizontalScroll, watchErrors } from './helpers'

test('atlas: clicking an entity opens its inspector and Close dismisses it', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/atlas')
  await expect(page.getByText(/entities\. Click any to inspect/)).toBeVisible()
  await expect(page.locator('aside.inspector')).toHaveCount(0)
  // at whole-system zoom no labels are drawn; filtering by phase lights entities and labels them
  await page.getByLabel('Phase').selectOption('build')
  await page.locator('button.label').first().click()
  const inspector = page.getByRole('complementary', { name: /^Inspector:/ })
  await expect(inspector).toBeVisible()
  await expect(page).toHaveURL(/#\/atlas\?entity=/)
  await expect(inspector.getByText('Crosses to the browser')).toBeVisible()
  await inspector.getByRole('button', { name: 'Close inspector' }).click()
  await expect(inspector).toHaveCount(0)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('compare: stepping forward advances the step counter and URL', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/compare/initial-load/1')
  await expect(eyebrow(page)).toContainText('step 1 of')
  await expect(page.locator('section.lane')).toHaveCount(2)
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page).toHaveURL(/#\/compare\/initial-load\/2$/)
  await expect(eyebrow(page)).toContainText('step 2 of')
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/compare\/initial-load\/3$/)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('compare: the transport is labelled Step controls, not Journey controls', async ({ page }) => {
  await page.goto('/#/compare/initial-load/1')
  await expect(page.getByRole('toolbar', { name: 'Step controls' })).toBeVisible()
})

test('predict: choosing an answer and pressing Check shows feedback', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/predict/1')
  await expect(page.getByText(/question 1 of/)).toBeVisible()
  const check = page.getByRole('button', { name: 'Check', exact: true })
  await expect(check).toBeDisabled()
  await page.getByRole('list', { name: 'Picks' }).getByRole('button').first().click()
  await check.click()
  await expect(page.locator('.feedback')).toBeVisible()
  await expect(page.locator('.feedback')).toContainText(/Correct\.|Not quite\./)
  await expect(page.getByRole('link', { name: /^Replay:/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page).toHaveURL(/#\/predict\/2$/)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('predict: Reset progress sits outside the question controls and erases only after confirming', async ({ page }) => {
  await page.goto('/#/predict/1')
  await expect(page.getByRole('toolbar', { name: 'Question controls' }).getByRole('button', { name: 'Reset progress' })).toHaveCount(0)
  await page.getByRole('list', { name: 'Picks' }).getByRole('button').first().click()
  await page.getByRole('button', { name: 'Check', exact: true }).click()
  await expect(page.getByText(/^answered 1\//)).toBeVisible()

  page.once('dialog', (d) => d.dismiss())
  await page.getByRole('button', { name: 'Reset progress' }).click()
  await expect(page.getByText(/^answered 1\//)).toBeVisible()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Reset progress' }).click()
  await expect(page.getByText(/^answered 0\//)).toBeVisible()
})

test('predict: Clear picks empties the picks', async ({ page }) => {
  await page.goto('/#/predict/1')
  const first = page.getByRole('list', { name: 'Picks' }).getByRole('button').first()
  await first.click()
  await page.getByRole('button', { name: 'Clear picks' }).click()
  await expect(first).toHaveAttribute('aria-pressed', 'false')
})

test('journey: the canvas label and Read as text call a state by the same word', async ({ page }) => {
  await page.goto('/#/journey/whole-lifecycle/2')
  await expect(page.getByRole('button', { name: 'components/DashboardNav.tsx, now. Inspect' })).toBeVisible()
  await page.getByRole('button', { name: 'Read as text' }).click()
  await expect(page.locator('.text-equivalent')).toContainText('Now: DashboardNav.tsx.')
})

test('journeys menu: each journey shows its step count on one line with its progress mark', async ({ page }) => {
  await page.goto('/#/journey/app-initial/7')
  await page.locator('.predict button').first().click()
  await page.getByRole('button', { name: /^Journey:/ }).click()
  const option = page.getByRole('option', { name: /App Router: the initial request/ })
  await expect(option).toContainText('22 steps · 1/')
  const box = (await option.boundingBox())!
  expect(box.height, 'one line').toBeLessThan(48)
})

test('deep link: reloading #/journey/app-initial/12 keeps showing step 12', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/12')
  await expect(eyebrow(page)).toContainText('step 12 of 22')
  await page.reload()
  await expect(eyebrow(page)).toContainText('step 12 of 22')
  await expect(page).toHaveURL(/#\/journey\/app-initial\/12$/)
  errors.assertClean()
})
