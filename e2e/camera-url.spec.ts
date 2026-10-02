import { expect, test, type Page } from '@playwright/test'
import { watchErrors } from './helpers'

/** the world group's transform is translate(w/2 h/2) scale(zoom) translate(-x -y) */
async function camera(page: Page) {
  const t = (await page.locator('svg.world > g').first().getAttribute('transform')) ?? ''
  const [, , zoom, x, y] = (t.match(/-?[\d.]+/g) ?? []).map(Number)
  return { x: -x, y: -y, zoom }
}

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
