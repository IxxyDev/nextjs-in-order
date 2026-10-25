import { defineConfig, devices } from '@playwright/test'

const PORT = 5198
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'phone-390', width: 390, height: 844 }
]

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    // vite itself, not pnpm dev: pnpm dev leaves vite running after Playwright stops it
    command: `node_modules/.bin/vite --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 60_000
  },
  projects: [
    ...viewports.map(({ name, width, height }) => ({
      name,
      use: { ...devices['Desktop Chrome'], viewport: { width, height } },
      testIgnore: /reduced-motion\.spec/
    })),
    {
      name: 'reduced-motion-1440',
      // reduced-motion.spec, journeys.spec, code-lens.spec and code-lens-journeys.spec (the last also ends in journeys.spec);
      // the per-journey code-lens-<slug>.spec files run only in the viewport projects
      testMatch: /(^|\/)(reduced-motion|journeys|code-lens|code-lens-journeys)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' as const }
    }
  ]
})
