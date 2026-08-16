import { test, expect } from '@playwright/test';

test.describe('Compliance & Legal Navigation Tests', () => {
  test('privacy page renders data controller and key-based anonymous policy', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/contact@ertoba.info/i).first()).toBeVisible();
  });

  test('homepage footer links to privacy and contact without impressum', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Privacy/i }).or(page.getByText('კონფიდენციალურობა')).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i }).or(page.getByText('კონტაქტი')).first()).toBeVisible();
    // Impressum must not be present in footer
    await expect(page.getByRole('link', { name: /Impressum|იმპრესუმი/i })).toHaveCount(0);
  });
});
