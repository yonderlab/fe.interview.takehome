# Web App

Frontend application built with Vite, React, React Router v7, and Tailwind CSS.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

### Unit Tests

Unit tests are written with Vitest and React Testing Library. Test files are located in `src/**/tests/**/*.{test,spec}.{ts,tsx}`.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### E2E Tests

End-to-end tests are written with Playwright and located in the `e2e/` directory.

**First-time setup:** Install Playwright browsers before running e2e tests:

```bash
npx playwright install
```

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run e2e tests in headed mode
npm run test:e2e:headed
```
