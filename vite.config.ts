import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: { target: 'es2022' },
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  test: { environment: 'node', exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'] }
})
