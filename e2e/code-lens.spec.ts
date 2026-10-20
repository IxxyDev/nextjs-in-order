import { expect, test, type Page } from './fixtures'
import { eyebrow, expectNoHorizontalScroll, glyph, lens, openStep, panes, watchErrors } from './helpers'

/** the J0 lens: every step here is a whole-lifecycle step */
const open = (page: Page, step: number) => openStep(page, 'whole-lifecycle', step, 10)

test('j0-3 opens the lens with fate chips, glyphs and an abridged pane', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 3)
  await expect(lens(page)).toBeVisible()
  await expect(lens(page).getByRole('button', { name: 'Hide code' })).toHaveAttribute('aria-expanded', 'true')
  const pane = panes(page).last()
  await expect(pane).toContainText('DashboardNav.js')
  await expect(pane.locator('.lens-flag', { hasText: 'abridged' })).toBeVisible()
  await expect(pane.locator('.lens-chip', { hasText: 'client boundary · data + refs' })).toHaveCount(1)
  await expect(pane.locator('.lens-chip', { hasText: 'split · code' })).toHaveCount(1)
  await expect(pane.locator('.lens-cut')).toContainText('<boolean>')
  await expectNoHorizontalScroll(page)
  errors.assertClean()
})

test('j0-2 is a peek strip that expands on click and stays expanded for the session', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 2)
  const strip = lens(page).locator('.lens-strip')
  await expect(strip).toContainText('DashboardNav.tsx · 15 lines')
  await expect(strip).toHaveAttribute('aria-expanded', 'false')
  await expect(panes(page)).toHaveCount(0)
  await strip.click()
  await expect(panes(page)).toHaveCount(1)
  await expect(panes(page).first()).toContainText("'use client'")
  await page.reload()
  await expect(eyebrow(page)).toContainText('step 2 of 10')
  await expect(panes(page)).toHaveCount(1)
  errors.assertClean()
})

test('collapsing keeps open steps to the strip, across steps and a reload', async ({ page }) => {
  await open(page, 3)
  await lens(page).getByRole('button', { name: 'Hide code' }).click()
  await expect(panes(page)).toHaveCount(0)
  await expect(lens(page).locator('.lens-strip')).toContainText('DashboardNav.js')
  await page.keyboard.press('ArrowRight')
  await expect(eyebrow(page)).toContainText('step 4 of 10')
  await expect(panes(page)).toHaveCount(0)
  await page.reload()
  await expect(eyebrow(page)).toContainText('step 4 of 10')
  await expect(lens(page).locator('.lens-strip')).toBeVisible()
  await expect(panes(page)).toHaveCount(0)
})

test('code ↔ map: a line lights its entities; a map entity or selection lights its lines', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 3)
  const marker = panes(page).last().locator('.lens-row').first()
  await expect(glyph(page, 'swc')).not.toHaveClass(/is-linked/)
  await marker.hover()
  await expect(glyph(page, 'swc')).toHaveClass(/is-linked/)
  await expect(glyph(page, 'src-dashboard-nav')).toHaveClass(/is-linked/)
  await page.mouse.move(0, 0)
  await expect(glyph(page, 'swc')).not.toHaveClass(/is-linked/)

  /** the map side: hover the glyph, then select it from its label (the inspector keeps working) */
  await page.locator('svg.world [data-entity="src-dashboard-nav"] .shape').first().hover()
  await expect(marker).toHaveClass(/is-lit/)
  await expect(panes(page).last().locator('.lens-row.is-lit')).toHaveCount(1)
  await page.mouse.move(0, 0)
  await expect(panes(page).last().locator('.lens-row.is-lit')).toHaveCount(0)
  await page.locator('button.label[data-entity="swc"]').click()
  await expect(page.getByRole('complementary', { name: /^Inspector:/ })).toBeVisible()
  await expect(panes(page).last().locator('.lens-row.is-lit')).toHaveCount(6)
  errors.assertClean()
})

test('lines are one tab stop with ↑/↓ between them; ←/→ still step', async ({ page }) => {
  await open(page, 3)
  const rows = panes(page).last().locator('[data-lens-row]')
  await rows.first().focus()
  await expect(glyph(page, 'swc')).toHaveClass(/is-linked/)
  await page.keyboard.press('ArrowDown')
  await expect(rows.nth(1)).toBeFocused()
  await expect(rows.nth(0)).toHaveAttribute('tabindex', '-1')
  await expect(rows.nth(1)).toHaveAttribute('tabindex', '0')
  await page.keyboard.press('ArrowRight')
  await expect(eyebrow(page)).toContainText('step 4 of 10')
})

/** the panes pair once the lens is ~580px wide (a container query): the wide desktop panel and the tablet sheet, not 1024px or phones */
const PAIRED = ['desktop-1440', 'tablet-768', 'reduced-motion-1440']

test('j0-4 split: server and browser side by side where each pane holds ~40 columns, stacked elsewhere', async ({ page }, info) => {
  await open(page, 4)
  const server = lens(page).locator('.lens-pane.side-server'), browser = lens(page).locator('.lens-pane.side-browser')
  await expect(server).toContainText('registerClientReference')
  await expect(browser).toContainText('layout-3c4d.js')
  await browser.scrollIntoViewIfNeeded()
  const a = (await server.boundingBox())!, b = (await browser.boundingBox())!
  if (!PAIRED.includes(info.project.name)) {
    expect(b.y).toBeGreaterThanOrEqual(a.y + a.height - 1)
    expect(Math.abs(b.x - a.x)).toBeLessThan(2)
  } else {
    expect(Math.abs(b.y - a.y)).toBeLessThan(2)
    expect(b.x).toBeGreaterThanOrEqual(a.x + a.width - 1)
  }
  await expectNoHorizontalScroll(page)
})

test('j0-8 ends with the 0 B ledger', async ({ page }) => {
  await open(page, 8)
  const ledger = lens(page).getByRole('note', { name: 'Ledger' })
  await expect(ledger).toContainText('0 B of JS in the browser')
  await expect(ledger).toContainText('1 ID')
})

test('j0-1 and a step whose lens is off render no lens', async ({ page }) => {
  await open(page, 1)
  await expect(page.locator('.lens')).toHaveCount(0)
  /** j5-1 is off (docs/code-lens.md §10) */
  await page.goto('/#/journey/app-initial/1')
  await expect(eyebrow(page)).toContainText('step 1 of 22')
  await expect(page.locator('.lens')).toHaveCount(0)
})

test('long Flight and patch rows wrap inside the panel: no horizontal page scroll', async ({ page }) => {
  const errors = watchErrors(page)
  for (const step of [7, 10]) {
    await open(page, step)
    await expect(panes(page).first()).toBeVisible()
    await expectNoHorizontalScroll(page)
    const box = (await lens(page).boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  }
  errors.assertClean()
})

test('toggles are 44px touch targets on phones', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone-390', 'phone layout only')
  await open(page, 2)
  expect((await lens(page).locator('.lens-strip').boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await lens(page).locator('.lens-strip').click()
  expect((await lens(page).getByRole('button', { name: 'Hide code' }).boundingBox())!.height).toBeGreaterThanOrEqual(44)
})

test('reduced motion: before and after drawn side by side, nothing animates', async ({ page }, info) => {
  const reduced = info.project.name.startsWith('reduced-motion')
  await open(page, 3)
  await expect(panes(page).last()).toContainText('DashboardNav.js')
  if (!reduced) {
    await expect(lens(page).locator('.lens-pane.is-before')).toHaveCount(0)
    await expect(lens(page).locator('.lens-body')).toHaveClass(/motion-transform/)
    return
  }
  const before = lens(page).locator('.lens-pane.is-before')
  await expect(before).toHaveCount(1)
  await expect(before).toContainText('useState<boolean>(false)')
  const a = (await before.boundingBox())!, b = (await panes(page).last().boundingBox())!
  expect(Math.abs(b.y - a.y)).toBeLessThan(2)
  await expect(lens(page).locator('.lens-body')).not.toHaveClass(/motion-/)
  expect(await lens(page).locator('.lens-row').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  await open(page, 4)
  await expect(lens(page).locator('.lens-pane')).toHaveCount(3)
  /** the patch's before pane is the j0-7 rows, all replaced: the header says so (seen and read), the lines are context only */
  await open(page, 10)
  const gone = lens(page).locator('.lens-pane.is-before')
  await expect(gone).toHaveCount(1)
  await expect(gone.locator('.lens-pane-head .lens-flag.is-gone')).toHaveText('replaced')
  await expect(gone.locator('.lens-pane-head')).toBeVisible()
  await expect(gone.getByText('off-map')).toHaveCount(0)
  await expect(gone.locator('.lens-row.is-context')).not.toHaveCount(0)
  await gone.locator('.lens-row.is-context').first().hover()
  await expect(page.locator('svg.world .glyph.is-linked')).toHaveCount(0)
  await page.locator('svg.world [data-entity="rsc-runtime-entity"] .shape').first().hover()
  await expect(panes(page).last().locator('.lens-row.is-lit')).not.toHaveCount(0)
  await expect(gone.locator('.lens-row.is-lit')).toHaveCount(0)
})

test('j0-4 at 1440: the panel widens for the lens and no code line wraps more than once', async ({ page }, info) => {
  test.skip(!info.project.name.endsWith('1440'), 'the wide desktop panel')
  await open(page, 4)
  expect((await page.locator('section.panel').boundingBox())!.width).toBeGreaterThanOrEqual(660)
  const lines = lens(page).locator('.lens-pane:not(.is-before) .lens-line')
  await expect(lines.first()).toBeVisible()
  const heights = await lines.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)))
  expect(heights.length).toBeGreaterThan(5)
  for (const lines of heights) expect(lines).toBeLessThanOrEqual(2.1)
})

test('change and fate are drawn, not spelled: no NEW rows, one chip per group, folds are calm and open', async ({ page }) => {
  const errors = watchErrors(page)
  await open(page, 4)
  const server = lens(page).locator('.lens-pane.side-server')
  await expect(server.locator('.lens-row.is-new')).toHaveCount(3)
  await expect(server.locator('.lens-row.is-new .lens-sign').first()).toHaveText('+')
  await expect(server.locator('.lens-row.is-new').first()).toContainText('new line')
  await expect(server.locator('.lens-chip')).toHaveCount(1)
  const chip = (await server.locator('.lens-chip').boundingBox())!
  expect(chip.height).toBeLessThan(20)
  const fold = server.getByRole('button', { name: /10 lines of DashboardNav/ })
  await expect(fold).toHaveAttribute('aria-expanded', 'false')
  expect(await fold.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none')
  await fold.click()
  await expect(fold).toHaveAttribute('aria-expanded', 'true')
  await expect(server.locator('.lens-unfolded')).toContainText('as written in components/DashboardNav.tsx')
  await expect(server.locator('.lens-unfolded .lens-row')).toHaveCount(10)
  errors.assertClean()
})

test.describe('phone room', () => {
  test.use({ hasTouch: true })
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'phone-390', 'the ≤767px layout'))

  test('an open lens can take most of the screen; the map keeps a strip, the choice holds across open steps, a swipe still steps', async ({ page }) => {
    const errors = watchErrors(page)
    await open(page, 7)
    const panel = page.locator('section.panel'), stage = page.locator('.stage')
    const peek = (await panel.boundingBox())!.height
    const more = page.getByRole('button', { name: 'More room for code' })
    expect((await more.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await more.click()
    const less = page.getByRole('button', { name: 'More room for the map' })
    await expect(less).toHaveAttribute('aria-expanded', 'true')
    /** the peek already ends under the story, so "most of the screen" is measured against the room between breadcrumb and transport */
    await expect.poll(async () => (await panel.boundingBox())!.height).toBeGreaterThan(peek)
    const room = (await panel.boundingBox())!.height + (await stage.boundingBox())!.height
    expect((await panel.boundingBox())!.height).toBeGreaterThan(room * 0.75)
    expect((await stage.boundingBox())!.height).toBeGreaterThanOrEqual(100)
    await expect(panes(page).first()).toBeInViewport()
    await expectNoHorizontalScroll(page)

    /** a swipe on the roomy panel still steps; the next open step keeps the room */
    const b = (await panel.boundingBox())!
    const y = b.y + b.height / 2
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width - 40, y, id: 1 }] })
    for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x + b.width - 40 - ((b.width - 80) * i) / 5, y: y + i, id: 1 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(eyebrow(page)).toContainText('step 8 of 10')
    await expect(less).toBeVisible()

    /** a peek step has no toggle and gives the map its room back; Escape also gives it back */
    await open(page, 5)
    await expect(page.locator('.sheet-head.is-room')).toHaveCount(0)
    await expect(page.locator('.journey.is-roomy')).toHaveCount(0)
    await open(page, 7)
    await expect(less).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(more).toHaveAttribute('aria-expanded', 'false')
    errors.assertClean()
  })
})
