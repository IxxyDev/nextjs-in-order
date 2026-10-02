import { expect, test } from './fixtures'
import { expectNoHorizontalScroll, eyebrow, stepTitle, watchErrors } from './helpers'

const JOURNEYS = [
  { slug: 'app-initial', steps: 22 },
  { slug: 'app-navigation', steps: 18 },
  { slug: 'server-actions', steps: 17 }
]

for (const { slug, steps } of JOURNEYS) {
  test(`${slug}: ArrowRight walks all ${steps} steps, predict and check feedback appear`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(`/#/journey/${slug}/1`)
    await expect(eyebrow(page)).toContainText(`step 1 of ${steps}`)
    let predicts = 0
    let checks = 0

    for (let n = 1; n <= steps; n++) {
      await expect(eyebrow(page)).toContainText(`step ${n} of ${steps}`)
      expect(new URL(page.url()).hash).toBe(`#/journey/${slug}/${n}`)
      await expect(stepTitle(page)).not.toBeEmpty()

      const predict = page.locator('.predict')
      if (await predict.count()) {
        predicts++
        await expect(predict.locator('.why')).toHaveCount(0)
        await predict.getByRole('button').first().click()
        await expect(predict.locator('.why')).toBeVisible()
        await expect(predict.locator('.why')).toContainText(/^(Right|Not quite)\./)
        await expect(predict.getByRole('button').first()).toHaveAttribute('aria-pressed', 'true')
      }

      const check = page.locator('.check')
      const checkCount = await check.count()
      for (let i = 0; i < checkCount; i++) {
        checks++
        await check.nth(i).getByRole('button', { name: 'True' }).click()
        await expect(check.nth(i).locator('.why')).toContainText(/Correct\.|Incorrect\./)
      }

      if (n < steps) {
        const before = await eyebrow(page).innerText()
        await page.keyboard.press('ArrowRight')
        await expect(eyebrow(page)).not.toHaveText(before)
      }
    }

    expect(predicts, 'journey has at least one predict step').toBeGreaterThan(0)
    expect(checks, 'journey has at least one check statement').toBeGreaterThan(0)
    await expect(page.getByRole('button', { name: 'Next step' })).toBeDisabled()
    await expectNoHorizontalScroll(page)
    errors.assertClean()
  })
}
