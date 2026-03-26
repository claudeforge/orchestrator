---
name: quality-gates
description: "Configures pre-commit hooks with Husky and lint-staged, sets up ESLint and Prettier rules, defines test coverage thresholds in Vitest, creates CI quality pipelines with GitHub Actions, and runs security audits with npm audit. Use when setting up CI/CD quality checks, configuring linters, enforcing test coverage thresholds, adding pre-commit hooks, or creating PR validation gates."
allowed-tools: Read, Bash, Glob, Grep
---

# Quality Gates Skill

## Gate Progression

Run gates in order — each level includes the previous:

1. **Pre-Commit** — `npx tsc --noEmit && npx eslint . --max-warnings 0 && npx prettier --check .`
2. **Pre-Push** — + `npm test -- --passWithNoTests && npm run build`
3. **CI** — + `npm test -- --coverage` (fail if coverage < 70%)
4. **Pre-Deploy** — + `npx playwright test && npm audit --audit-level=high`

## Gate Configurations

### TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```
**Pass:** Zero errors.

### ESLint
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn"
  }
}
```
**Pass:** Zero errors, zero warnings.

### Vitest Coverage
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```
**Pass:** All tests pass, coverage meets thresholds.

## Implementation

### Husky + lint-staged
```bash
#!/bin/sh
# .husky/pre-commit
npx lint-staged
```

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### GitHub Actions
```yaml
name: Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
```

## Quality Thresholds

| Category | Metric | Threshold | Tool |
|----------|--------|-----------|------|
| Code | Type coverage | 100% | TypeScript |
| Code | Lint errors | 0 | ESLint |
| Test | Statement coverage | > 70% | Vitest |
| Test | Branch coverage | > 65% | Vitest |
| Security | Critical/high vulns | 0 | npm audit |
| Perf | Bundle size | < 500KB | Vite |
| Perf | LCP | < 2.5s | Lighthouse |

## Gate Commands

```bash
npm run quality            # Run all gates
npm run quality:types      # TypeScript
npm run quality:lint       # ESLint
npm run quality:test       # Tests
npm run quality:build      # Build
npm run quality:security   # Security audit
```

## Failure Recovery

| Gate | Auto-fix | Manual step |
|------|----------|-------------|
| TypeScript | — | Read error, fix type issue, re-run `npx tsc --noEmit` |
| ESLint | `npx eslint . --fix` | Fix remaining, re-run lint |
| Tests | — | Check output, fix code or test, re-run |
| Build | — | Check output, fix imports/config, re-run |
| Security | `npm audit fix` | Update packages manually, document exceptions |
