// Control for reduced-motion.spec.ts: with motion allowed, the camera tweens.
import { expect, test } from './fixtures'
import { eyebrow, sampleCamera } from './helpers'

test('camera tweens over several frames when motion is allowed', async ({ page }) => {
  await page.goto('/#/journey/app-initial/1')
  await expect(eyebrow(page)).toContainText('step 1 of 22')
  const { early, settled, initial } = await sampleCamera(page)
  expect(settled, 'the camera moved').not.toBe(initial)
  expect(early, 'mid-flight transform differs from the settled one').not.toBe(settled)
})
