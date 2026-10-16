import { expect, type Page } from '@playwright/test'

/** collects console errors and uncaught page errors; call assertClean() at the end of a test */
export function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  return { assertClean: () => expect(errors, 'console and page errors').toEqual([]) }
}

export async function expectNoHorizontalScroll(page: Page) {
  const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
  expect(m.scrollWidth, `scrollWidth ${m.scrollWidth} vs innerWidth ${m.innerWidth}`).toBeLessThanOrEqual(m.innerWidth)
}

export const eyebrow = (page: Page) => page.locator('.panel .eyebrow').first()
export const stepTitle = (page: Page) => page.locator('.panel h2').first()

/** press ArrowRight and sample the camera transform two frames later and after the tween would have finished */
export async function sampleCamera(page: Page) {
  const camera = () => page.locator('svg.world > g').first().getAttribute('transform')
  const initial = await camera()
  await page.keyboard.press('ArrowRight')
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))))
  const early = await camera()
  await page.waitForTimeout(900)
  return { initial, early, settled: await camera() }
}

export const lens = (page: Page) => page.getByRole('region', { name: 'Code lens' })
/** every lens pane, a reduced-motion before pane included */
export const panes = (page: Page) => lens(page).locator('.lens-pane')
/** the panes of this step, without a reduced-motion before pane */
export const afterPanes = (page: Page) => lens(page).locator('.lens-pane:not(.is-before)')
export const glyph = (page: Page, id: string) => page.locator(`svg.world [data-entity="${id}"] .glyph`)

/** go to a journey step and wait until the panel shows it */
export async function openStep(page: Page, slug: string, step: number, of: number) {
  await page.goto(`/#/journey/${slug}/${step}`)
  await expect(eyebrow(page)).toContainText(`step ${step} of ${of}`)
}
