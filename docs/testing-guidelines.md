# Testing Guidelines

## Unit Tests

- Use **Jest** to test individual functions and React components in isolation.
- File naming convention: `*.test.js` or `*.test.ts`.
- Backend unit tests: `packages/backend/__tests__/`
- Frontend unit tests: `packages/frontend/src/__tests__/`
- Name test files to match what they test (e.g., `app.test.js` for `app.js`).

## Integration Tests

- Use **Jest + Supertest** to test backend API endpoints with real HTTP requests.
- File naming convention: `*.test.js` or `*.test.ts`.
- Location: `packages/backend/__tests__/integration/`
- Name integration test files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints).

## End-to-End (E2E) Tests

- Use **Playwright** (required framework) to test complete UI workflows through browser automation.
- File naming convention: `*.spec.js` or `*.spec.ts`.
- Location: `tests/e2e/`
- Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`).
- Use **one browser only** in Playwright configuration.
- All E2E tests must use the **Page Object Model (POM)** pattern for maintainability.
- Limit to **5–8 tests** covering critical user journeys — focus on happy paths and key edge cases, not exhaustive coverage.

## Port Configuration

- Always use environment variables with sensible defaults for port configuration.
- Backend: `const PORT = process.env.PORT || 3030;`
- Frontend: React's default port is `3000`, overridable via the `PORT` environment variable.
- This allows CI/CD workflows to dynamically detect ports.

## General Principles

- All tests must be **isolated and independent** — each test sets up its own data and does not rely on other tests.
- **Setup and teardown hooks are required** — tests must succeed on repeated runs without manual cleanup.
- All new features must include appropriate tests (unit and/or integration and/or E2E as applicable).
- Tests should be maintainable, readable, and follow established best practices.
