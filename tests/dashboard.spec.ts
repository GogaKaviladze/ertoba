import { test, expect } from '@playwright/test';

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('renders welcome heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows token balance in compact stats bar', async ({ page }) => {
    await expect(page.getByText(/ETC/i).first()).toBeVisible();
  });

  test('shows a lightweight Ertoba Index preview with link to the full analytics page', async ({ page }) => {
    const ertobaLink = page.getByRole('link', { name: /Ertoba ინდექსის გახსნა|Open Ertoba Index|Ertoba Index öffnen/i });
    await expect(ertobaLink).toBeVisible();
    await expect(ertobaLink).toHaveAttribute('href', /\/dashboard\/ertoba/);
  });

  test('renders the dashboard shell on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');

    await expect(page.getByRole('button', { name: /Open sidebar/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /Ertoba ინდექსის გახსნა|Open Ertoba Index|Ertoba Index öffnen/i })).toBeVisible();
  });

  test('renders dashboard overview content even with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/dashboard');

    await expect(page.locator('body')).toContainText(/მოგესალმებით|Welcome|Willkommen/);
    await expect(page.locator('a[href="/dashboard/ertoba"]').first()).toHaveAttribute('href', '/dashboard/ertoba');

    await context.close();
  });

  test('renders dashboard overview with an invalid language cookie', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });

    await context.addCookies([
      {
        name: 'ertoba_lang',
        // Intentionally malformed percent-encoding to verify the cookie parser fails safely.
        value: '%E0%A4%A',
        domain: 'localhost',
        path: '/',
      },
    ]);

    const page = await context.newPage();

    await page.goto('http://localhost:3000/dashboard');

    await expect(page.locator('body')).toContainText(/მოგესალმებით|Welcome|Willkommen/);

    await context.close();
  });

  test('displays Wallet action card with link to market', async ({ page }) => {
    const walletCard = page.getByRole('link', { name: /View Balance|Browse/i }).first();
    await expect(walletCard).toBeVisible();
  });

  test('displays Active Tasks card with link to surveys', async ({ page }) => {
    const tasksLink = page.getByRole('link', { name: /Start/i }).first();
    await expect(tasksLink).toBeVisible();
    await expect(tasksLink).toHaveAttribute('href', /surveys/);
  });

  test('sidebar contains all main navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Assessments/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Surveys/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Market/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible();
  });

  test('sidebar Assessments link navigates to assessments hub', async ({ page }) => {
    await page.getByRole('link', { name: /Assessments/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/assessments/);
    await expect(page.getByRole('heading', { name: /Assessments Hub/i })).toBeVisible();
  });

  test('sidebar Market link navigates to market page', async ({ page }) => {
    await page.getByRole('link', { name: /Market/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/market/);
    await expect(page.getByRole('heading', { name: /Rewards Marketplace/i })).toBeVisible();
  });

  test('sidebar Profile link navigates to profile page', async ({ page }) => {
    await page.getByRole('link', { name: /Profile/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/profile/);
  });
});
