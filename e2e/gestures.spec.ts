import { expect, test, type Page } from './fixtures'
import { watchErrors } from './helpers'

/** the world group's transform is translate(w/2 h/2) scale(zoom) translate(-x -y) */
async function camera(page: Page, lane = 0) {
  const t = (await page.locator('svg.world > g').nth(lane).getAttribute('transform')) ?? ''
  const [, , zoom, x, y] = (t.match(/-?[\d.]+/g) ?? []).map(Number)
  return { x: -x, y: -y, zoom }
}

async function canvasBox(page: Page, lane = 0) {
  const box = await page.locator('.canvas-wrap').nth(lane).boundingBox()
  return box!
}

/** wait for the opening camera tween to finish */
const settle = (page: Page) => page.waitForTimeout(700)
const follow = (page: Page) => page.getByRole('button', { name: 'Follow', exact: true })

test('drag pans the journey camera, turns Follow off and writes cam; ArrowRight hands back to Follow', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/3')
  await settle(page)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'true')
  const before = await camera(page)
  const b = await canvasBox(page)
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx - 60, cy - 40, { steps: 6 })
  await page.mouse.up()
  const after = await camera(page)
  expect(after.zoom).toBeCloseTo(before.zoom)
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(10)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
  await expect(page).toHaveURL(/cam=/)
  await expect(page.locator('.inspector')).toHaveCount(0)

  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/journey\/app-initial\/4$/)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'true')
  errors.assertClean()
})

test('wheel over the canvas zooms at the cursor', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/3')
  await settle(page)
  const before = await camera(page)
  const b = await canvasBox(page)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.wheel(0, -300)
  await expect.poll(async () => (await camera(page)).zoom).toBeGreaterThan(before.zoom * 1.2)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
  await expect(page).toHaveURL(/cam=/)
  errors.assertClean()
})

test('a click without moving on an entity still opens the inspector', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/3')
  await settle(page)
  const before = await camera(page)
  await page.locator('.labels button.label').first().click()
  await expect(page.locator('.inspector')).toBeVisible()
  expect(await camera(page)).toEqual(before)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'true')
  errors.assertClean()
})

test('double-click on a region fits it', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/1')
  await settle(page)
  const b = await canvasBox(page)
  /** the smallest region whose center is on the canvas, so no smaller one sits under the click */
  const target = await page.locator('svg.world rect.region').evaluateAll((els, b) => els
    .map((el, i) => { const r = el.getBoundingClientRect(); return { i, x: r.x + r.width / 2, y: r.y + r.height / 2, area: r.width * r.height } })
    .filter((r) => r.x > b.x + 20 && r.x < b.x + b.width - 20 && r.y > b.y + 20 && r.y < b.y + b.height - 20)
    .sort((p, q) => p.area - q.area)[0], b)
  const region = page.locator('svg.world rect.region').nth(target.i)
  const small = (await region.boundingBox())!
  await page.mouse.dblclick(target.x, target.y)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(async () => (await region.boundingBox())!.width, { timeout: 3000 }).toBeGreaterThan(small.width * 1.05)
  await page.waitForTimeout(700)
  const fit = (await region.boundingBox())!
  expect(fit.x).toBeGreaterThanOrEqual(b.x - 2)
  expect(fit.y).toBeGreaterThanOrEqual(b.y - 2)
  expect(fit.x + fit.width).toBeLessThanOrEqual(b.x + b.width + 2)
  expect(fit.y + fit.height).toBeLessThanOrEqual(b.y + b.height + 2)
  expect(Math.max(fit.width / b.width, fit.height / b.height)).toBeGreaterThan(0.6)
  await expect(page).toHaveURL(/cam=/)
  errors.assertClean()
})

test('+ and - zoom around the center', async ({ page }) => {
  await page.goto('/#/journey/app-initial/3')
  await settle(page)
  const before = await camera(page)
  await page.keyboard.press('+')
  expect((await camera(page)).zoom).toBeGreaterThan(before.zoom)
  await page.keyboard.press('-')
  await page.keyboard.press('-')
  expect((await camera(page)).zoom).toBeLessThan(before.zoom)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
})

test('compare lanes pan on their own and write no cam', async ({ page }) => {
  await page.goto('/#/compare/initial-load/1')
  await expect(page.locator('section.lane')).toHaveCount(2)
  await settle(page)
  const other = await camera(page, 1)
  const before = await camera(page, 0)
  const b = await canvasBox(page, 0)
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 50, cy + 30, { steps: 5 })
  await page.mouse.up()
  const after = await camera(page, 0)
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(10)
  expect(await camera(page, 1)).toEqual(other)
  await page.waitForTimeout(400)
  expect(page.url()).not.toContain('cam=')
})

test('compare: + zooms only the lane the pointer last entered', async ({ page }) => {
  await page.goto('/#/compare/initial-load/1')
  await expect(page.locator('section.lane')).toHaveCount(2)
  await settle(page)
  const zoom0 = (await camera(page, 0)).zoom, zoom1 = (await camera(page, 1)).zoom
  await page.locator('section.lane').nth(1).hover()
  await page.keyboard.press('+')
  await expect.poll(async () => (await camera(page, 1)).zoom).toBeGreaterThan(zoom1 * 1.1)
  expect((await camera(page, 0)).zoom).toBeCloseTo(zoom0)
})

test('predict region mode: double-click picks once and fits the region', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/predict/2')
  await settle(page)
  const b = await canvasBox(page)
  const target = await page.locator('svg.world rect.region').evaluateAll((els, b) => els
    .map((el, i) => { const r = el.getBoundingClientRect(); return { i, x: r.x + r.width / 2, y: r.y + r.height / 2, area: r.width * r.height } })
    .filter((r) => r.x > b.x + 20 && r.x < b.x + b.width - 20 && r.y > b.y + 20 && r.y < b.y + b.height - 20)
    .sort((p, q) => p.area - q.area)[0], b)
  const region = page.locator('svg.world rect.region').nth(target.i)
  const small = (await region.boundingBox())!
  const pressed = page.locator('button.region-label[aria-pressed="true"]')
  await expect(pressed).toHaveCount(0)
  await page.mouse.dblclick(target.x, target.y)
  await expect.poll(async () => (await region.boundingBox())!.width, { timeout: 3000 }).toBeGreaterThan(small.width * 1.05)
  await expect(page).toHaveURL(/cam=/)
  await expect(pressed).toHaveCount(1)
  errors.assertClean()
})

test('a minimap click turns Follow off and writes cam', async ({ page }, info) => {
  test.skip(info.project.name === 'phone-390', 'the minimap is hidden on phones')
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/3')
  await settle(page)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'true')
  expect(page.url()).not.toContain('cam=')
  const m = (await page.locator('svg.minimap').boundingBox())!
  await page.mouse.click(m.x + m.width * 0.8, m.y + m.height * 0.8)
  await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
  await expect(page).toHaveURL(/cam=/)
  errors.assertClean()
})

test.describe('touch', () => {
  test.use({ hasTouch: true })
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone-390', 'touch runs on the phone viewport'))

  test('two-finger pinch zooms the canvas and turns Follow off', async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto('/#/journey/app-initial/3')
    await settle(page)
    const before = await camera(page)
    const b = await canvasBox(page)
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2
    const cdp = await page.context().newCDPSession(page)
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', d: number) => cdp.send('Input.dispatchTouchEvent', {
      type, touchPoints: type === 'touchEnd' ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }]
    })
    await touch('touchStart', 30)
    for (const d of [45, 60, 75, 90]) await touch('touchMove', d)
    await touch('touchEnd', 0)
    const after = await camera(page)
    expect(after.zoom).toBeGreaterThan(before.zoom * 2)
    await expect(follow(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(page).toHaveURL(/cam=/)
    errors.assertClean()
  })

  test('compare on a phone: lanes own the gesture, a swipe on the ruler still scrolls the page', async ({ page }) => {
    await page.goto('/#/compare/initial-load/1')
    await expect(page.locator('section.lane')).toHaveCount(2)
    const touchAction = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).touchAction)
    expect(await touchAction('section.lane')).toBe('none')
    expect(await touchAction('.ruler')).toBe('auto')
    const box = (await page.locator('.ruler').boundingBox())!
    const scrollTop = () => page.locator('.compare').evaluate((el) => el.scrollTop)
    expect(await scrollTop()).toBe(0)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.synthesizeScrollGesture', { x: box.x + box.width / 2, y: box.y + box.height / 2, yDistance: -200, gestureSourceType: 'touch', speed: 2000 })
    await expect.poll(scrollTop).toBeGreaterThan(50)
  })
})
