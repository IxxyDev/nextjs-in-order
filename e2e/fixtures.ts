import { test as base } from '@playwright/test'

export { expect, type Locator, type Page } from '@playwright/test'

/** Google Fonts is the only network dependency; stub it so runs never depend on the network */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    await use(page)
  }
})
