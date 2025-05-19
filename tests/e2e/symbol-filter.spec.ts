import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

// Seed the database once before the suite so symbol data is available
// for the SymbolFilter component to query.
test.beforeAll(() => {
  execSync('bun run packages/db/seed/index.ts', { stdio: 'inherit' });
});

test.describe('SymbolFilter UI', () => {
  test('filters pages by selected symbol', async ({ page }) => {
    await page.goto('/');

    // select a known symbol
    await page.getByRole('combobox').selectOption('glyph_marrow');

    // expect resulting list to show pages from that symbol's section
    const listItems = page.locator('ul > li');
    await expect(listItems.first()).toContainText('Section 3');
  });
});
