import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - should be auto-logged in by auth.setup
    await page.goto('/dashboard');
  });

  test('should display dashboard title', async ({ page }) => {
    await expect(page.getByText(/Dashboard/i)).toBeVisible();
  });

  test('should navigate to market', async ({ page }) => {
    await page.getByRole('link', { name: /Market/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/market/);
  });

  test('should navigate to profile', async ({ page }) => {
    await page.getByRole('link', { name: /Profile/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/profile/);
  });

  test('should display correct token balance', async ({ page }) => {
    // Every new user starts with 100 ERTC by our ensureUserExists logic
    await expect(page.getByText(/100 ERTC/i)).toBeVisible();
  });
});
