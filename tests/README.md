# E2E Testing with Playwright

This directory contains end-to-end tests for the MockA application using Playwright.

## Test Files

- `login-form.spec.ts` - Comprehensive tests for the login form functionality

## Running Tests

### Prerequisites

Make sure you have all dependencies installed:
```bash
pnpm install
```

### Running Tests

1. **Run all e2e tests:**
   ```bash
   pnpm test:e2e
   ```

2. **Run tests with UI mode (interactive):**
   ```bash
   pnpm test:e2e:ui
   ```

3. **Run tests in headed mode (see browser):**
   ```bash
   pnpm test:e2e:headed
   ```

4. **Debug tests:**
   ```bash
   pnpm test:e2e:debug
   ```

5. **Run specific test file:**
   ```bash
   pnpm test:e2e tests/login-form.spec.ts
   ```

6. **Run tests in a specific browser:**
   ```bash
   pnpm test:e2e --project=chromium
   pnpm test:e2e --project=firefox
   pnpm test:e2e --project=webkit
   ```

### Test Development Server

The tests are configured to automatically start the development server before running tests. The configuration in `playwright.config.ts` includes:

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

This means you don't need to manually start the dev server before running tests.

## Login Form Tests

The `login-form.spec.ts` file includes comprehensive tests for:

### Functionality Tests
- ✅ Display of all form elements
- ✅ Form validation (empty fields, invalid email)
- ✅ Email/password login flow
- ✅ Google sign-in button
- ✅ Error handling and success scenarios
- ✅ Loading states and button disabling
- ✅ Navigation to sign-up page

### Accessibility Tests
- ✅ Proper form labels and attributes
- ✅ Keyboard navigation
- ✅ Screen reader compatibility

### Responsive Design Tests
- ✅ Mobile viewport compatibility
- ✅ Form layout on different screen sizes

### User Experience Tests
- ✅ Form submission with Enter key
- ✅ Tab navigation through form elements
- ✅ Loading indicators during authentication

## Writing New Tests

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Use descriptive test names that explain what is being tested
3. Group related tests using `test.describe()`
4. Use `test.beforeEach()` for common setup
5. Mock external API calls to avoid dependencies on external services
6. Test both success and error scenarios
7. Include accessibility and responsive design tests

## Test Reports

After running tests, you can view the HTML report:
```bash
npx playwright show-report
```

The report includes:
- Test results and screenshots
- Failed test traces
- Performance metrics
- Browser compatibility results
