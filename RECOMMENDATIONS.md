# Project Recommendations for Pyro

An analysis of the Pyro codebase with prioritized recommendations for improving
code quality, reliability, and developer experience.

---

## Current State Summary

Pyro is a well-structured TypeScript SPA built with Vite and CodeMirror 6 for
browser-based VPython editing with GlowScript 3D visualization. The codebase is
clean and modular (~1,200 lines across 9 TypeScript modules), uses strict
TypeScript with near-complete type coverage, and deploys via GitHub Actions to
GitHub Pages.

**What's working well:**
- Clean module separation (editor, executor, sidebar, UI, types)
- Strict TypeScript with `noUnusedLocals`, `noUnusedParameters` enforced
- Proper XSS protection via `escapeHtml()` for user-facing content
- Sandboxed iframe execution for user code
- CI/CD pipeline with automated deployment
- Good inline documentation (JSDoc comments, sectioned CSS)

**Key gaps:**
- No automated tests
- No linting or formatting tools
- No pre-commit hooks
- Legacy files still present (`css/style.css`, `js/main.js`)

---

## Priority 1 -- Testing Infrastructure

### Add Vitest for unit and integration testing

Vitest is the natural choice for a Vite project -- zero additional bundler
configuration, native TypeScript support, and a Jest-compatible API.

```bash
npm install -D vitest jsdom @testing-library/dom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**What to test first:**

1. **`ui.ts` -- pure utility functions.** `escapeHtml()` and `showNotification()`
   are self-contained and easy to test without mocking.

2. **`completions.ts` -- data integrity.** Verify all completion entries have
   required fields (`label`, `type`, `info`) and that there are no duplicates.

3. **`examples.ts` -- data integrity.** Verify all example keys exist and
   contain non-empty code strings.

4. **`executor.ts` -- iframe message handling.** Test the `message` event
   listener logic by dispatching synthetic `MessageEvent` objects. Verify that
   console output, errors, and completion signals are routed correctly.

5. **`editor.ts` -- initialization.** Verify that `initEditor()` creates a
   CodeMirror instance with the expected extensions (Python language, One Dark
   theme, autocomplete).

### Add a test step to CI

Update `.github/workflows/deploy.yml` to run tests before the build:

```yaml
- name: Run tests
  run: npm test
```

This ensures broken code cannot be deployed.

---

## Priority 2 -- Linting and Formatting

### Add ESLint with TypeScript support

```bash
npm install -D eslint @eslint/js typescript-eslint
```

Create `eslint.config.js` using the flat config format with
`typescript-eslint`'s recommended rules. Focus on catching real bugs rather
than style nitpicks -- the TypeScript compiler already handles many issues via
strict mode.

Key rules to enable beyond the defaults:
- `no-console` (warn) -- catch accidental debug logs
- `@typescript-eslint/no-explicit-any` (error) -- enforce type safety
- `@typescript-eslint/consistent-type-imports` -- use `import type` where applicable

### Add Prettier for formatting

```bash
npm install -D prettier
```

Create `.prettierrc`:
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 90
}
```

Add scripts:
```json
"lint": "eslint src/",
"format": "prettier --write src/",
"format:check": "prettier --check src/"
```

### Add both to CI

```yaml
- name: Lint
  run: npm run lint
- name: Check formatting
  run: npm run format:check
```

---

## Priority 3 -- Remove Legacy Files

The repository contains two files from the pre-TypeScript version that are no
longer referenced anywhere:

- `css/style.css` -- superseded by `src/styles/main.css`
- `js/main.js` -- superseded by `src/main.ts` and other modules

These should be deleted to avoid confusing contributors. Verify with:

```bash
grep -r "css/style.css\|js/main.js" . --include="*.html" --include="*.ts"
```

If no references are found, delete both files and their parent directories if
empty.

---

## Priority 4 -- Dependency Management

### Pin dependency versions

The current `package.json` uses caret (`^`) ranges for all dependencies. While
`package-lock.json` provides deterministic installs, pinning exact versions
adds an explicit layer of protection against unexpected updates.

Change:
```json
"codemirror": "^6.0.1"
```
To:
```json
"codemirror": "6.0.1"
```

Use `npm outdated` periodically to review available updates and upgrade
intentionally.

### Add automated dependency auditing

Add to CI:
```yaml
- name: Audit dependencies
  run: npm audit --audit-level=moderate
```

This catches known vulnerabilities before deployment.

---

## Priority 5 -- Pre-commit Hooks

### Set up Husky and lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

Configure `lint-staged` in `package.json`:
```json
"lint-staged": {
  "src/**/*.ts": ["eslint --fix", "prettier --write"],
  "src/**/*.css": ["prettier --write"]
}
```

This ensures every commit meets quality standards without requiring developers
to remember to run linters manually.

---

## Priority 6 -- Developer Experience

### Add an `.editorconfig` file

Standardize editor behavior across IDEs:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### Add a `CONTRIBUTING.md` guide

Document the development workflow:
- How to set up a local development environment
- How to run tests and linting
- Branch naming conventions and PR process
- Code style expectations

---

## Priority 7 -- Accessibility Improvements

The application currently lacks accessibility considerations. Key improvements:

1. **Add ARIA labels** to interactive elements (run/stop buttons, sidebar
   toggle, theme toggle, example selector).

2. **Ensure keyboard navigation** works for all controls. The CodeMirror editor
   has good built-in keyboard support, but the custom sidebar and toolbar
   buttons may not be reachable via Tab.

3. **Add `role` attributes** to landmark regions (sidebar as `navigation`,
   main content area as `main`, console output as `log`).

4. **Announce state changes** using `aria-live` regions for notifications,
   error messages, and console output so screen readers communicate status
   updates.

---

## Priority 8 -- Performance and Resilience

### CDN fallback for GlowScript

GlowScript libraries are loaded from a GitHub Pages CDN
(`https://openphysics.github.io/glowscript/...`). If that origin is
unreachable, the entire application breaks silently.

Options:
- Bundle the GlowScript files locally as part of the build
- Add a `load` error handler that displays a clear message to the user
- Use a fallback CDN (e.g., jsDelivr mirroring the GitHub Pages URL)

### Lazy-load the GlowScript compiler

The compiler (`RScompiler.3.2.min.js`) is already loaded dynamically, which is
good. Consider lazy-loading the runtime and core libraries as well -- they're
only needed when the user clicks "Run," not on initial page load.

---

## Summary

| Priority | Recommendation | Effort | Impact |
|----------|---------------|--------|--------|
| 1 | Add Vitest testing infrastructure | Medium | High |
| 2 | Add ESLint + Prettier | Low | High |
| 3 | Remove legacy `css/` and `js/` files | Low | Low |
| 4 | Pin dependencies, add `npm audit` to CI | Low | Medium |
| 5 | Add pre-commit hooks (Husky + lint-staged) | Low | Medium |
| 6 | Add `.editorconfig` and `CONTRIBUTING.md` | Low | Medium |
| 7 | Accessibility (ARIA, keyboard nav) | Medium | High |
| 8 | CDN resilience for GlowScript | Medium | Medium |
