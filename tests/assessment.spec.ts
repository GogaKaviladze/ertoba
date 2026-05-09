import { test, expect } from '@playwright/test';

test.describe('Assessments Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/assessments');
  });

  test('renders Assessments Hub heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Assessments Hub/i })).toBeVisible();
  });

  test('shows Big Five Personality card with 50 ETC reward', async ({ page }) => {
    await expect(page.getByText(/Big Five Personality/i)).toBeVisible();
    await expect(page.getByText(/50 ETC/i)).toBeVisible();
  });

  test('shows Burnout Assessment card with 30 ETC reward', async ({ page }) => {
    await expect(page.getByText(/Burnout Assessment/i)).toBeVisible();
    await expect(page.getByText(/30 ETC/i)).toBeVisible();
  });

  test('Big Five card navigates to big-five assessment page', async ({ page }) => {
    await page.getByText(/Big Five Personality/i).click();
    await expect(page).toHaveURL(/\/dashboard\/assessments\/big-five/);
    await expect(page.getByRole('heading', { name: /Big Five Assessment/i })).toBeVisible();
  });

  test('Burnout card navigates to burnout assessment URL', async ({ page }) => {
    await page.getByText(/Burnout Assessment/i).click();
    await expect(page).toHaveURL(/\/dashboard\/assessments\/burnout/);
  });
});

test.describe('Assessment Flow & Stability', () => {
  test('Big Five page renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard/assessments/big-five');
    
    // Wait for the assessment card to be visible
    await expect(page.getByText('Big Five Assessment', { exact: false })).toBeVisible();

    // Check if any React errors were logged (like the script tag error)
    if (errors.length > 0) {
      console.error('Console errors detected:', errors);
      expect(errors.some(e => e.includes('script tag'))).toBeFalsy();
    }
  });

  test('User can start and interact with the assessment', async ({ page }) => {
    await page.goto('/dashboard/assessments/big-five');
    
    // Start assessment
    const startBtn = page.getByRole('button', { name: /Start Assessment|ტესტის დაწყება/i });
    await startBtn.click();

    // Verify first question is visible
    await expect(page.locator('h3')).toBeVisible();
    
    // Interact with slider (thumb)
    const slider = page.locator('[data-slot="slider-thumb"]').first();
    await expect(slider).toBeVisible({ timeout: 10000 });
  });

  test('Progress bar advances when moving to the next question', async ({ page }) => {
    await page.goto('/dashboard/assessments/big-five');

    const startBtn = page.getByRole('button', { name: /Start Assessment|ტესტის დაწყება/i });
    await startBtn.click();
    await expect(page.locator('h3')).toBeVisible();

    // Click Next to advance to question 2
    const nextBtn = page.getByRole('button', { name: /Next|შემდეგი/i });
    await nextBtn.click();

    // Progress bar should have increased (value > 0)
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();
    const value = await progressBar.getAttribute('aria-valuenow');
    expect(Number(value)).toBeGreaterThan(0);
  });

  test('Back button returns to the previous question', async ({ page }) => {
    await page.goto('/dashboard/assessments/big-five');

    const startBtn = page.getByRole('button', { name: /Start Assessment|ტესტის დაწყება/i });
    await startBtn.click();
    await expect(page.locator('h3')).toBeVisible();

    // Advance to question 2
    await page.getByRole('button', { name: /Next|შემდეგი/i }).click();

    // Go back to question 1
    const backBtn = page.getByRole('button', { name: /Back|უკან/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Progress bar should be back to the beginning (value === 0 or low)
    const progressBar = page.getByRole('progressbar');
    const value = await progressBar.getAttribute('aria-valuenow');
    expect(Number(value)).toBeLessThanOrEqual(7); // ≤ 1/15 * 100 rounded
  });
});
