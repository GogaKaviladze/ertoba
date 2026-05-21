import { test, expect } from '@playwright/test'

test.describe('Daily Feedback Survey route', () => {
  test('renders the daily survey page', async ({ page }) => {
    await page.goto('/dashboard/surveys/daily')
    await expect(page.getByTestId('daily-survey-page')).toBeVisible()
  })

  test('shows one of: survey form, result, or empty state', async ({ page }) => {
    await page.goto('/dashboard/surveys/daily')
    const form = page.getByTestId('daily-survey-form')
    const result = page.getByTestId('daily-result')
    const empty = page.getByTestId('daily-survey-empty')
    await expect(form.or(result).or(empty)).toBeVisible()
  })

  test('if the survey form is shown, choosing a framing enables Next', async ({ page }) => {
    await page.goto('/dashboard/surveys/daily')
    const form = page.getByTestId('daily-survey-form')
    if (!(await form.isVisible().catch(() => false))) {
      test.skip(true, 'Survey already completed today or no headlines available')
    }
    const nextBtn = page.getByTestId('survey-next-button')
    await expect(nextBtn).toBeDisabled()
    await page.getByTestId('survey-framing-option-institutional').click()
    await expect(nextBtn).toBeEnabled()
  })
})

test.describe('Surveys page wiring', () => {
  test('Start Survey navigates to the daily survey route', async ({ page }) => {
    await page.goto('/dashboard/surveys')
    await page.getByTestId('start-survey-link').click()
    await expect(page).toHaveURL(/\/dashboard\/surveys\/daily/)
    await expect(page.getByTestId('daily-survey-page')).toBeVisible()
  })

  test('View history link navigates to the history route', async ({ page }) => {
    await page.goto('/dashboard/surveys')
    await page.getByTestId('survey-history-link').click()
    await expect(page).toHaveURL(/\/dashboard\/surveys\/history/)
  })
})
