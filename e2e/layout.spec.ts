import { expect, test, type Page } from './fixtures'
import { eyebrow, expectNoHorizontalScroll, settle, watchErrors } from './helpers'

const transform = (page: Page) => page.locator('svg.world > g').first().getAttribute('transform')
const crumbs = (page: Page) => page.getByRole('navigation', { name: 'Camera breadcrumb' })
const follow = (page: Page) => page.getByRole('button', { name: 'Follow', exact: true })

test('breadcrumb: a crumb moves the camera and counts as a manual move', async ({ page }, info) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/7')
  await settle(page)
  const nav = crumbs(page)
  await expect(nav.getByRole('button', { name: 'World' })).toBeVisible()
  await expect(nav.getByRole('button', { name: 'RSC runtime' })).toBeVisible()
  if (info.project.name === 'phone-390') {
    await expect(nav.getByRole('button', { name: 'render-server' })).toBeHidden()
    await expect(nav.getByText('…')).toBeVisible()
    expect((await nav.getByRole('button', { name: 'World' }).boundingBox())!.height).toBeGreaterThanOrEqual(44)
  } else {
    await expect(nav.getByRole('button', { name: 'Server', exact: true })).toBeVisible()
  }
  const before = await transform(page)
  await nav.getByRole('button', { name: 'World' }).click()
  await expect.poll(() => transform(page)).not.toBe(before)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
  await expect(page).toHaveURL(/cam=/)
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('breadcrumb in the atlas walks down to the selected entity', async ({ page }) => {
  await page.goto('/#/atlas?entity=client-reference-manifest')
  await settle(page)
  const before = await transform(page)
  await crumbs(page).getByRole('button', { name: 'World' }).click()
  await expect.poll(() => transform(page)).not.toBe(before)
  await expect(page).toHaveURL(/cam=/)
})

test('internals: the step and inspector disclosures stay open across a reload', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/1')
  const details = page.locator('.panel details')
  await expect(details).not.toHaveAttribute('open')
  await details.locator('summary').click()
  await expect(details).toHaveAttribute('open')
  await page.reload()
  await expect(eyebrow(page)).toContainText('step 1 of 22')
  await expect(page.locator('.panel details')).toHaveAttribute('open')

  await page.goto('/#/atlas?entity=next-build')
  const internals = page.getByRole('complementary', { name: /^Inspector:/ }).locator('details')
  await expect(internals).not.toHaveAttribute('open')
  await internals.locator('summary', { hasText: 'Internals' }).click()
  await expect(internals).toHaveAttribute('open')
  await page.reload()
  await expect(page.getByRole('complementary', { name: /^Inspector:/ }).locator('details')).toHaveAttribute('open')
  errors.assertClean()
})

test('check step: the statements come before the open code lens, in view without scrolling the panel', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/journey/whole-lifecycle/10')
  await expect(page.getByRole('region', { name: 'Code lens' })).toBeVisible()
  await expect(page.locator('.check').first().getByRole('button', { name: 'True' })).toBeInViewport()
})

test('atlas: Environment and Region filters change the count; Clear resets them', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/atlas')
  const count = page.locator('.atlas-count')
  const text = async () => (await count.textContent())!
  const total = (await text()).split(' of ')[1]
  await expect(count).toHaveText(`${total} of ${total}`)
  await page.getByLabel('Environment').selectOption('browser')
  await expect(count).not.toHaveText(`${total} of ${total}`)
  const browser = await text()
  await page.getByLabel('Region').selectOption('client-router')
  await expect(count).not.toHaveText(browser)
  expect(parseInt(await text())).toBeLessThan(parseInt(browser))
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(count).toHaveText(`${total} of ${total}`)
  await expect(page.getByLabel('Environment')).toHaveValue('')
  await expect(page.getByLabel('Region')).toHaveValue('')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('atlas: Escape closes the inspector first, then returns a moved camera to the whole system', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/atlas?entity=client-reference-manifest')
  const inspector = page.getByRole('complementary', { name: /^Inspector:/ })
  await expect(inspector).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(inspector).toHaveCount(0)
  await expect(page).toHaveURL(/#\/atlas$/)

  await page.goto('/#/atlas?cam=1200,600,2.5')
  await settle(page)
  const zoomed = await transform(page)
  await page.keyboard.press('Escape')
  await expect.poll(() => transform(page)).not.toBe(zoomed)
  await expect(page).toHaveURL(/#\/atlas$/)
  errors.assertClean()
})

test('tablet: the step panel is a bottom sheet with the minimap in its header, and Follow is locked', async ({ page }, info) => {
  test.skip(info.project.name !== 'tablet-768', 'the sheet is the 768–1023px layout')
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/7')
  await settle(page)
  const stage = (await page.locator('.stage').boundingBox())!
  const panel = page.locator('section.panel')
  const height = async () => (await panel.boundingBox())!.height / stage.height
  expect(await height()).toBeCloseTo(0.3, 1)
  expect((await panel.boundingBox())!.y + (await panel.boundingBox())!.height).toBeCloseTo(stage.y + stage.height, 0)
  await expect(panel.locator('.sheet-head svg.minimap')).toBeVisible()
  await expect(page.locator('.stage svg.minimap')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Whole system' })).toHaveCount(0)

  const handle = page.getByRole('button', { name: 'Expand step panel' })
  expect((await handle.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await handle.click()
  await expect(page.getByRole('button', { name: 'Collapse step panel' })).toHaveAttribute('aria-expanded', 'true')
  await expect.poll(height).toBeGreaterThan(0.65)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Expand step panel' })).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(height).toBeLessThan(0.35)

  /** Escape keeps Follow on a tablet rather than switching to the whole system */
  await page.keyboard.press('Escape')
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'true')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test.describe('phone', () => {
  test.use({ hasTouch: true })
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone-390', 'the ≤767px layout'))

  test('a horizontal swipe on the step panel changes the step', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/#/journey/app-initial/7')
    await expect(eyebrow(page)).toContainText('step 7 of 22')
    const b = (await page.locator('section.panel').boundingBox())!
    const y = b.y + Math.min(60, b.height / 2)
    const cdp = await page.context().newCDPSession(page)
    const swipe = async (from: number, to: number) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y, id: 1 }] })
      for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + ((to - from) * i) / 5, y: y + i, id: 1 }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    await swipe(b.x + b.width - 40, b.x + 40)
    await expect(page).toHaveURL(/#\/journey\/app-initial\/8$/)
    await expect(eyebrow(page)).toContainText('step 8 of 22')
    await swipe(b.x + 40, b.x + b.width - 40)
    await expect(page).toHaveURL(/#\/journey\/app-initial\/7$/)
    /** a short move is not a swipe */
    await swipe(b.x + 100, b.x + 130)
    await page.waitForTimeout(200)
    await expect(page).toHaveURL(/#\/journey\/app-initial\/7$/)
    errors.assertClean()
  })

  test('Whole system opens a full-screen overlay that Escape closes, returning focus', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/#/journey/app-initial/7')
    await settle(page)
    const main = await transform(page)
    const open = page.getByRole('button', { name: 'Whole system' })
    await open.click()
    const dialog = page.getByRole('dialog', { name: 'Whole system' })
    await expect(dialog).toBeVisible()
    const box = (await dialog.boundingBox())!
    expect(box.width).toBe(390)
    expect(box.height).toBe(844)
    await expect(dialog.getByRole('button', { name: 'Close whole system' })).toBeFocused()
    await expect(dialog.locator('svg.world')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(open).toBeFocused()
    expect(await transform(page), 'the main canvas stays at Focus level').toBe(main)
    await expect(follow(page)).toHaveAttribute('aria-pressed', 'true')

    await open.click()
    await page.getByRole('button', { name: 'Close whole system' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(open).toBeFocused()
    errors.assertClean()
  })

  test('Whole system keeps Tab and Shift+Tab inside the overlay', async ({ page }) => {
    await page.goto('/#/journey/app-initial/7')
    await page.getByRole('button', { name: 'Whole system' }).click()
    const dialog = page.getByRole('dialog', { name: 'Whole system' })
    await expect(dialog.getByRole('button', { name: 'Close whole system' })).toBeFocused()
    const isInside = () => dialog.evaluate((d) => d.contains(document.activeElement))

    await page.keyboard.press('Shift+Tab')
    expect(await isInside(), 'Shift+Tab from the first control').toBe(true)
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab')
      expect(await isInside(), `Tab ${i + 1}`).toBe(true)
    }
  })
})

test('atlas: the history strip opens next build, whose inspector lists the releases in order', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/atlas')
  const releases = page.getByRole('list', { name: 'Next.js releases, oldest first' })
  await expect(releases.getByRole('listitem')).toHaveCount(5)
  await expect(releases.getByRole('listitem').first()).toContainText('getInitialProps')
  await page.getByRole('button', { name: /^Next\.js history/ }).click()
  await expect(page).toHaveURL(/entity=next-build/)
  const history = page.getByRole('complementary', { name: 'Inspector: next build · pipeline' }).locator('ol.history li strong')
  await expect(history).toHaveText(['1 · 2016', '9.3', '12', '13', '16'])
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})
