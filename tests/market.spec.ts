import { test, expect } from '@playwright/test';

test.describe('Market Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/market');
  });

  test('renders Rewards Marketplace heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Rewards Marketplace/i })).toBeVisible();
  });

  test('shows Coming Soon banner', async ({ page }) => {
    await expect(page.getByText(/Coming Soon/i)).toBeVisible();
  });

  test('shows descriptive copy about spending tokens', async ({ page }) => {
    await expect(page.getByText(/spend your ETC tokens/i)).toBeVisible();
  });

  test('renders without fatal console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.reload();
    // Filter out known non-fatal network errors (e.g. failed favicon fetch)
    const fatal = errors.filter(e => !e.includes('favicon'));
    expect(fatal).toHaveLength(0);
  });
});
