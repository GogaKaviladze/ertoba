import { test, expect } from '@playwright/test'

/**
 * E2E Test: Slider UI Component Verification
 */

test.describe('Slider Component', () => {
  test('Big Five assessment page loads and slider renders without script tag console warnings', async ({ page }) => {
    const consoleErrors: string[] = []
    
    // Listen for console warnings/errors
    page.on('console', (msg) => {
      if (msg.type() === 'error' || (msg.type() === 'warning' && msg.text().includes('script tag'))) {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to Big Five assessment page
    await page.goto('/dashboard/assessments/big-five')

    // Verify slider input element is present
    const sliderInput = page.locator('input[type="range"]')
    await expect(sliderInput).toBeVisible()

    // Verify no script tag rendering warnings were thrown
    const scriptTagWarnings = consoleErrors.filter((err) => err.includes('Encountered a script tag'))
    expect(scriptTagWarnings.length).toBe(0)
  })
})
