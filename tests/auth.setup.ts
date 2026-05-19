import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  const email = 'test@example.com';
  const password = 'TestPassword123!';

  // Select the B2B (Organization) account type first, then try to login
  await page.getByRole('button', { name: /Organization/i }).click();
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();

  // Check if we reached the dashboard
  try {
    await page.waitForURL('/dashboard', { timeout: 5000 });
  } catch {
    // If we are still on login, try to Sign Up
    console.log('Login failed or timed out, attempting Sign Up...');
    await page.getByRole('button', { name: /Switch to Sign Up/i }).click();
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: /Register Org/i }).click();
    
    // Wait for the redirect (assuming email confirmation is disabled for dev/test)
    // If it fails here, we likely need to disable email confirmation in Supabase.
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  // Verify dashboard access
  await expect(page.getByText(/Dashboard/i)).toBeVisible();

  // Save state
  await page.context().storageState({ path: authFile });
});
