import { expect, test } from './fixtures'
import { eyebrow, watchErrors } from './helpers'

test('keyboard only: step with arrows, Home and End, then switch journey through the menu', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/#/journey/app-initial/1')
  await expect(eyebrow(page)).toContainText('step 1 of 22')

  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()

  // each press waits for the rendered step as well as the URL, so the next press never races the render
  const pressAndExpect = async (key: string, n: number) => {
    await page.keyboard.press(key)
    await expect(eyebrow(page)).toContainText(`step ${n} of 22`)
    await expect(page).toHaveURL(new RegExp(`#/journey/app-initial/${n}$`))
  }
  await pressAndExpect('ArrowRight', 2)
  await pressAndExpect('ArrowRight', 3)
  await pressAndExpect('ArrowLeft', 2)
  await pressAndExpect('End', 22)
  await pressAndExpect('Home', 1)

  // reach the Journeys menu by Tab alone
  const trigger = page.getByRole('button', { name: /^Journey:/ })
  for (let i = 0; i < 10 && !(await trigger.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
  await expect(trigger).toBeFocused()

  await page.keyboard.press('Enter')
  const list = page.getByRole('listbox', { name: 'Journey' })
  await expect(list).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await expect(list).toHaveCount(0)
  await expect(page).toHaveURL(/#\/journey\/app-navigation\/1$/)
  await expect(eyebrow(page)).toContainText('App Router: prefetch and navigation')
  await expect(trigger).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/journey\/app-navigation\/2$/)
  errors.assertClean()
})

test('keyboard only: Escape closes the Journeys menu without changing the route', async ({ page }) => {
  await page.goto('/#/journey/app-initial/1')
  const trigger = page.getByRole('button', { name: /^Journey:/ })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox', { name: 'Journey' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox', { name: 'Journey' })).toHaveCount(0)
  await expect(page).toHaveURL(/#\/journey\/app-initial\/1$/)
})

test('keyboard only: Space on a focused predict option answers it and does not start autoplay', async ({ page }) => {
  await page.goto('/#/journey/app-initial/7')
  await expect(eyebrow(page)).toContainText('step 7 of 22')
  const option = page.locator('.predict button').first()
  for (let i = 0; i < 200 && !(await option.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
  await expect(option).toBeFocused()

  await page.keyboard.press('Space')
  await expect(option).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.predict .why')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'false')
  await expect(eyebrow(page)).toContainText('step 7 of 22')
  await expect(page).toHaveURL(/#\/journey\/app-initial\/7$/)
})

/** spec §11: keyboard-only runs for J5, J6 and J7, through the predict step and the closing check */
for (const { slug, steps, predictAt } of [
  { slug: 'app-initial', steps: 22, predictAt: 7 },
  { slug: 'app-navigation', steps: 18, predictAt: 7 },
  { slug: 'server-actions', steps: 17, predictAt: 11 }
]) {
  test(`keyboard only: ${slug} predict and check`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(`/#/journey/${slug}/1`)
    await expect(eyebrow(page)).toContainText(`step 1 of ${steps}`)
    const tabTo = async (target: ReturnType<typeof page.locator>) => {
      for (let i = 0; i < 200 && !(await target.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
      await expect(target).toBeFocused()
    }

    for (let n = 2; n <= predictAt; n++) {
      await page.keyboard.press('ArrowRight')
      await expect(eyebrow(page)).toContainText(`step ${n} of ${steps}`)
    }
    const option = page.locator('.predict button').first()
    await tabTo(option)
    await page.keyboard.press('Space')
    await expect(option).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.predict .why')).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`#/journey/${slug}/${predictAt}$`))

    await page.keyboard.press('End')
    await expect(eyebrow(page)).toContainText(`step ${steps} of ${steps}`)
    const check = page.locator('.check').first()
    const yes = check.getByRole('button', { name: 'True' })
    await tabTo(yes)
    await page.keyboard.press('Enter')
    await expect(yes).toHaveAttribute('aria-pressed', 'true')
    await expect(check.locator('.why')).toContainText(/Correct\.|Incorrect\./)
    errors.assertClean()
  })
}
