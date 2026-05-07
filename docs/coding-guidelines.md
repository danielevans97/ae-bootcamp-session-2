# Coding Guidelines

## General Formatting

- Use **2-space indentation** throughout all JavaScript and JSX files.
- Maximum line length is **100 characters**. Break long expressions across multiple lines for readability.
- Use **single quotes** for strings in JavaScript; JSX attribute values use double quotes.
- Always include a **trailing newline** at the end of every file.
- Remove unused variables, imports, and dead code before committing.

## Linting

- **ESLint** is the required linter. All code must pass ESLint checks with zero errors before merging.
- Follow the project's `.eslintrc` configuration; do not disable lint rules inline unless absolutely necessary, and always add a comment explaining why.
- Run `npm run lint` from the repo root before pushing changes.

## Imports

- Organize imports in the following order, separated by a blank line:
  1. Node built-in modules (e.g., `path`, `fs`)
  2. Third-party packages (e.g., `express`, `react`, `@mui/material`)
  3. Internal project modules (relative imports)
- Use named imports over default imports where the module supports it.
- Avoid wildcard imports (`import * as ...`) unless there is no alternative.

## Naming Conventions

- **Variables and functions**: `camelCase`
- **React components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE` for true compile-time constants; `camelCase` for runtime config values
- **Files**: `camelCase.js` for utilities and modules; `PascalCase.js` for React components.

## Code Quality Principles

### DRY (Don't Repeat Yourself)
Extract repeated logic into shared utility functions or custom React hooks. If the same code appears in more than one place, it belongs in a shared module.

### Single Responsibility
Each function, component, or module should do one thing well. Keep functions short — if a function requires significant scrolling to read, it should be split up.

### Explicit over implicit
Write code that is easy to read and reason about. Avoid clever one-liners that sacrifice clarity for brevity. Prefer descriptive variable names over abbreviations.

### No magic numbers or strings
Replace hard-coded values with named constants or configuration variables so their intent is self-documenting.

## Error Handling

- Always handle promise rejections — use `try/catch` in `async` functions and `.catch()` on standalone promises.
- Return meaningful HTTP error responses from the backend (correct status codes + JSON error body).
- Do not swallow errors silently; at minimum, log them.

## Comments

- Write comments to explain **why**, not **what** — the code itself should make the what obvious.
- Use JSDoc-style comments for public utility functions to document parameters and return values.
- Remove commented-out code before merging; use version control history instead.
