import { expect, test } from '@playwright/test'
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
