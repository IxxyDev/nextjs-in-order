import { expect, test } from './fixtures'
import { camera, watchErrors } from './helpers'

test('cam in the URL restores the atlas camera', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/atlas?cam=1200,600,2')
  await expect(page.getByText(/entities\. Click any to inspect/)).toBeVisible()
  await page.waitForTimeout(700)
  const cam = await camera(page)
  expect(cam.zoom).toBe(2)
  expect(Math.abs(cam.x - 1200)).toBeLessThan(1)
  expect(Math.abs(cam.y - 600)).toBeLessThan(1)
  errors.assertClean()
})

test('cam in a journey URL turns Follow off until the user steps, and stepping clears it', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/3?cam=900,700,1.5')
  const follow = page.getByRole('button', { name: 'Follow', exact: true })
  await expect(follow).toHaveAttribute('aria-pressed', 'false')
  await page.waitForTimeout(700)
  expect(await camera(page)).toEqual({ x: 900, y: 700, zoom: 1.5 })

  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/journey\/app-initial\/4$/)
  await expect(follow).toHaveAttribute('aria-pressed', 'true')
  errors.assertClean()
})

test('a held URL camera does not press Whole system either', async ({ page }, info) => {
  test.skip(info.project.name === 'tablet-768' || info.project.name === 'phone-390', 'Whole system is a toggle from 1024px')
  await page.goto('/#/journey/app-initial/3?cam=900,700,1.5')
  await expect(page.getByRole('button', { name: 'Whole system' })).toHaveAttribute('aria-pressed', 'false')
})
