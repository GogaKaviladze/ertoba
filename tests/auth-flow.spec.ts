import { test, expect } from '@playwright/test'

test('Full anonymous key generation, registration, and subsequent login', async ({ page }) => {
  await page.goto('/login')

  // 1. Switch to registration view
  const switchBtn = page.getByRole('button', { name: /გასაღების შექმნა|Switch to Sign Up|Schlüssel erstellen|Sign Up/i })
  await expect(switchBtn).toBeVisible()
  await switchBtn.click()

  // 2. Click "Generate Private Key" button
  const generateBtn = page.getByRole('button', { name: /Generate|Schlüssel generieren|გენერირება/i })
  await expect(generateBtn).toBeVisible()
  await generateBtn.click()

  // 3. Verify key is generated
  const codeEl = page.locator('code')
  await expect(codeEl).toBeVisible()
  const key = (await codeEl.innerText()).trim()
  expect(key).toContain('ertoba-key-')
  console.log('1. Generated Key:', key)

  // 4. Submit registration
  const continueBtn = page.getByRole('button', { name: /შევინახე|Saved|Gespeichert/i })
  await expect(continueBtn).toBeVisible()
  await continueBtn.click()

  // 5. Verify redirected to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 8000 })
  console.log('2. Successfully registered and redirected to dashboard!')

  // 6. Navigate back to /login and log in with the existing key
  await page.goto('/login')
  const keyInput = page.getByPlaceholder(/გასაღები|Access Key|Schlüssel/i)
  await expect(keyInput).toBeVisible()
  await keyInput.fill(key)

  const signInBtn = page.getByRole('button', { name: /შესვლა|Sign In|Anmelden/i })
  await signInBtn.click()

  // 7. Verify redirected to dashboard after login
  await page.waitForURL(/\/dashboard/, { timeout: 8000 })
  console.log('3. Successfully logged in with existing key!')
})
