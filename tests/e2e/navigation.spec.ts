import { test, expect } from '@playwright/test';

// Basic navigation through pages using next/prev buttons
// and switching sections or jumping/searching via UI controls.

test.describe('navigation flow', () => {
  test('next and previous page navigation', async ({ page }) => {
    await page.goto('/');

    const pageNumber = page.locator('[data-testid="page-number"]');
    const initial = await pageNumber.textContent();

    await page.getByRole('button', { name: /next/i }).click();
    await expect(pageNumber).not.toHaveText(initial ?? '');

    await page.getByRole('button', { name: /prev/i }).click();
    await expect(pageNumber).toHaveText(initial ?? '');
  });

  test('section switching and jump/search', async ({ page }) => {
    await page.goto('/');

    // switch section via select
    await page.getByRole('combobox').selectOption('2');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('2');

    // jump directly to a page
    await page.locator('input[type="number"]').nth(0).fill('1');
    await page.locator('input[type="number"]').nth(1).fill('3');
    await page.getByRole('button', { name: /^Go$/ }).click();
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Section 1');

    // search for a page
    await page.getByPlaceholder('Search').fill('dawn');
    await page.getByRole('button', { name: /^Search$/ }).click();
    await expect(page.getByRole('list')).toBeVisible();
  });
});

test.describe('display and theme', () => {
  test('symbol rendering and retro theme classes', async ({ page }) => {
    await page.goto('/');

    // symbol is shown for current section
    const symbol = page.locator('img[src*="/the-corpus/symbols/"]');
    await expect(symbol).toBeVisible();

    // hauntological theme colors
    await expect(page.locator('body')).toHaveClass(/bg-black/);
    await expect(page.locator('body')).toHaveClass(/text-terminal-green/);
  });

  test('section color updates borders', async ({ page }) => {
    await page.goto('/');

    const container = page.locator('[data-testid="app-root"]');
    const initial = await container.evaluate(el => getComputedStyle(el).borderTopColor);

    await page.getByRole('combobox').first().selectOption('2');
    const changed = await container.evaluate(el => getComputedStyle(el).borderTopColor);
    expect(changed).not.toBe(initial);
  });
});
