import { test, expect } from '@playwright/test';

/**
 * Auth-Bypass Protection Tests
 *
 * Verifies that protected dashboard routes reject unauthenticated requests.
 * Related to: [CRITICAL] Auth-Bypass in user.ts
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Auth-Bypass Protection (unauthenticated)', () => {
  test('accessing /dashboard without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing /dashboard/profile without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing /dashboard/market without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/market');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing /dashboard/assessments without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/assessments');
    await expect(page).toHaveURL(/\/login/);
  });
});
