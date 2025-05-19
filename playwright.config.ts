import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
  },
});
