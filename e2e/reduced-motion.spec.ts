// Runs only in the reduced-motion project (see playwright.config.ts).
import { expect, test } from '@playwright/test'
import { eyebrow, sampleCamera } from './helpers'

test('the media query matches', async ({ page }) => {
  await page.goto('/#/journey/app-initial/1')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
})

test('camera jumps straight to its target on a step change', async ({ page }) => {
  await page.goto('/#/journey/app-initial/1')
  await expect(eyebrow(page)).toContainText('step 1 of 22')
  const { early, settled, initial } = await sampleCamera(page)
  expect(early, 'the camera moved').not.toBe(initial)
  expect(early, 'no tween: first frames already show the final transform').toBe(settled)
})

test('the token carries no move transition', async ({ page }) => {
  await page.goto('/#/journey/app-initial/3')
  const token = page.locator('svg.world .token').first()
  await expect(token).toBeAttached()
  await expect(token).not.toHaveClass(/token-move/)
  expect(await token.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s')
})
