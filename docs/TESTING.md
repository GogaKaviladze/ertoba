# Testing — Ertoba Analytics

E2E testing strategy with Playwright.

---

## Test Setup

Tests located in `tests/` directory.

### Run Tests

```bash
# All E2E tests (headless)
npm run test:e2e

# Visual mode (browser opens)
npm run test:e2e -- --ui

# Debug mode (step through)
npm run test:e2e -- --debug

# Specific test file
npm run test:e2e -- tests/auth.spec.ts

# Watch mode (re-run on file changes)
npm run test:e2e -- --watch
```

### Configuration

File: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Test Structure

### Example: Assessment Submission

```typescript
// tests/assessment-submit.spec.ts
import { test, expect } from '@playwright/test';

test('User can complete Big Five assessment', async ({ page }) => {
  // Setup
  await page.goto('/dashboard');
  
  // Navigate to assessment
  await page.click('a:has-text("Big Five")');
  
  // Fill form
  await page.selectOption('[data-testid="q1-select"]', 'Strongly Disagree');
  await page.selectOption('[data-testid="q2-select"]', 'Agree');
  
  // Submit
  await page.click('[data-testid="submit-btn"]');
  
  // Verify success
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Assessment completed')).toBeVisible();
});
```

---

## Best Practices

### Use data-testid Attributes

In components, add explicit selectors:

```typescript
// src/components/features/assessments/big-five.tsx
<select data-testid="q1-select">
  <option value="strongly-disagree">Strongly Disagree</option>
  <option value="agree">Agree</option>
</select>

<button data-testid="submit-btn" type="submit">
  Submit Assessment
</button>
```

**Why:** `data-testid` is more stable than text selectors; survives UI rewrites.

### Test User Flows, Not Implementation

Good test:
```typescript
// Tests the happy path: user submits assessment → sees success
await page.click('a:has-text("Big Five")');
await page.selectOption('[data-testid="q1"]', 'Agree');
await page.click('[data-testid="submit-btn"]');
await expect(page.locator('text=Success')).toBeVisible();
```

Bad test:
```typescript
// Tests internal state, breaks on refactor
await expect(await page.evaluate(() => window.assessmentState)).toEqual({...});
```

### Isolate Tests

Each test should be independent:

```typescript
test.beforeEach(async ({ page }) => {
  // Setup: sign in as test user
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'test-password');
  await page.click('button:has-text("Login")');
});

test('Dashboard loads', async ({ page }) => {
  // Test doesn't depend on previous test state
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Check for Errors

Always verify no errors in console:

```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

// ... perform test actions ...

expect(errors).toEqual([]);
```

---

## Critical Test Coverage

These flows **must** have E2E tests before production:

| Flow | Test File | Checks |
|------|-----------|--------|
| **Auth** | `tests/auth.setup.ts` | Sign up, login, logout, session persistence |
| **Assessment Submit** | `tests/assessment-submit.spec.ts` | Form submission, encryption, success message |
| **Marketplace** | `tests/marketplace.spec.ts` | Browse items, purchase with tokens, balance update |
| **Admin Audit** | `tests/admin-audit.spec.ts` | Admin sees transactions, filtering works |
| **Error Handling** | `tests/error-handling.spec.ts` | Invalid input, network errors, 500s |

---

## Performance Testing

### Check Load Time

```typescript
test('Dashboard loads within 2.5s', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2500); // 2.5s target
});
```

### Monitor Network

```typescript
test('Assessment submit uses < 100KB', async ({ page }) => {
  let totalSize = 0;
  
  page.on('response', response => {
    totalSize += response.headers()['content-length'] || 0;
  });
  
  await page.click('[data-testid="submit-btn"]');
  
  expect(totalSize).toBeLessThan(100000); // 100KB
});
```

---

## CI/CD Integration

### GitHub Actions

File: `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          ASSESSMENT_ENCRYPTION_KEY: ${{ secrets.TEST_ENCRYPTION_KEY }}
      
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Debugging Failing Tests

### 1. Run in UI Mode

```bash
npm run test:e2e -- --ui
```

Click through test steps visually.

### 2. Add Debug Output

```typescript
test('Debug test', async ({ page }) => {
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());
  
  await page.click('[data-testid="submit-btn"]');
  await page.waitForNavigation();
});
```

### 3. Take Screenshots

```typescript
test('Assessment submit', async ({ page }) => {
  await page.goto('/dashboard');
  await page.screenshot({ path: 'screenshots/dashboard.png' });
  
  // ... perform action ...
  await page.screenshot({ path: 'screenshots/after-submit.png' });
});
```

### 4. Check Test Report

```bash
npm run test:e2e -- --reporter=html
# Opens test-results/index.html in browser
```

---

## Definition of Done (Testing)

Before merging a feature:

- [ ] New test added for feature
- [ ] Test passes locally & in CI
- [ ] User flow tested end-to-end (not just unit)
- [ ] No console errors during test
- [ ] Performance acceptable (< 2.5s LCP)
- [ ] Edge cases covered (empty state, error, loading)

---

**Last Updated:** 2026-05-19
**Maintained By:** Goga Kaviladze
