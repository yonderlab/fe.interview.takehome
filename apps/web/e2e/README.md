# E2E Tests

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/welcome.spec.ts

# Run tests and show only skipped
npx playwright test --reporter=list | grep -A 2 "skipped"
```

## Viewing Skipped Tests

### Method 1: Console Output
When you run tests, skipped tests are shown with `-` prefix:
```
  - [chromium] › e2e/welcome.spec.ts:80:3 › Welcome Page › should navigate to customize plan when clicking on a plan
```

### Method 2: HTML Report
After running tests, open the HTML report:
```bash
npx playwright show-report
```
Skipped tests are shown in gray with a "skipped" badge.

### Method 3: List All Tests
See all tests including skipped ones:
```bash
npx playwright test --list
```

### Method 4: Filter by Status
```bash
# Show only skipped tests
npx playwright test --reporter=list --grep "skipped"

# Or use grep to filter output
npx playwright test --reporter=list 2>&1 | grep -E "skipped|Skip"
```
