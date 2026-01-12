---
name: error-recovery
description: Expert knowledge in error diagnosis, debugging strategies, and self-healing patterns. Use when tasks fail or errors occur.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Error Recovery Skill

Comprehensive strategies for diagnosing, fixing, and preventing errors.

## Error Classification

### Compile-Time Errors
| Code | Type | Common Cause |
|------|------|--------------|
| TS2322 | Type mismatch | Wrong type assigned |
| TS2345 | Argument type | Wrong parameter type |
| TS2339 | Property missing | Typo or missing interface property |
| TS2304 | Not found | Missing import or declaration |
| TS2307 | Module not found | Wrong path or missing package |
| TS7006 | Implicit any | Missing type annotation |
| TS2531 | Possibly null | Missing null check |

### Runtime Errors
| Error | Description | Common Fix |
|-------|-------------|------------|
| ReferenceError | Variable not defined | Check declaration, scope |
| TypeError | Wrong type operation | Add null check, fix type |
| RangeError | Value out of range | Validate input range |
| SyntaxError | Invalid syntax | Check JSON, string format |

### Build Errors
| Error | Description | Fix |
|-------|-------------|-----|
| Module not found | Package missing | npm install |
| Out of memory | Heap limit | Increase NODE_OPTIONS |
| Config error | Invalid config | Check tsconfig, vite.config |

### Test Failures
| Type | Cause | Fix |
|------|-------|-----|
| Assertion | Logic error | Fix implementation or expectation |
| Timeout | Async issue | Add await, increase timeout |
| Mock error | Wrong mock setup | Fix mock configuration |

## Recovery Strategies

### Strategy 1: Auto-Fix (Lint/Format)
```bash
# ESLint auto-fix
npx eslint . --fix

# Prettier format
npx prettier --write .

# TypeScript strict fixes
# Some can be auto-fixed with ts-fix
```

### Strategy 2: Dependency Fix
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update specific package
npm update package-name

# Fix peer dependencies
npm install --legacy-peer-deps
```

### Strategy 3: Type Error Fix
```typescript
// TS2322: Type mismatch
// Before
const value: string = 123;
// After
const value: number = 123;

// TS2531: Possibly null
// Before
element.innerHTML = 'text';
// After
if (element) element.innerHTML = 'text';

// TS2339: Property missing
// Before
user.email
// After
if ('email' in user) user.email
```

### Strategy 4: Runtime Error Fix
```typescript
// TypeError: Cannot read property of undefined
// Before
const name = user.profile.name;
// After
const name = user?.profile?.name ?? 'Unknown';

// ReferenceError: not defined
// Check: Is it imported?
// Check: Is it in scope?
// Check: Is it spelled correctly?
```

### Strategy 5: Test Failure Fix
```typescript
// Assertion failure - debug first
console.log('Actual:', result);
console.log('Expected:', expected);

// Async timeout
test('async test', async () => {
  // Add proper awaits
  const result = await asyncOperation();
  expect(result).toBeDefined();
}, 10000); // Increase timeout if needed

// Mock not working
vi.mock('./module', () => ({
  default: vi.fn().mockReturnValue('mocked'),
}));
```

## Recovery Protocol

```
┌─────────────────────────────────────────┐
│           ERROR DETECTED                │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         1. CLASSIFY ERROR               │
│  Syntax | Type | Runtime | Build | Test │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         2. IDENTIFY FIX                 │
│   Auto-fix | Manual | Delegate          │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         3. APPLY FIX                    │
│   Make minimal, targeted change         │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         4. VERIFY FIX                   │
│   tsc && eslint && npm test             │
└─────────────────┬───────────────────────┘
                  ▼
        ┌─────────┴─────────┐
        │ Fixed?            │
        └─────────┬─────────┘
          Yes     │     No
           │      │      │
           ▼      │      ▼
        ┌─────┐   │   ┌─────────────────┐
        │ Done│   │   │ Increment retry │
        └─────┘   │   │ (max 3)         │
                  │   └────────┬────────┘
                  │            ▼
                  │   ┌─────────────────┐
                  │   │ Retry < 3?      │
                  │   └────────┬────────┘
                  │      Yes   │   No
                  │       │    │    │
                  │       ▼    │    ▼
                  │   ┌──────┐ │ ┌────────┐
                  └───│Retry │ │ │Escalate│
                      └──────┘ │ └────────┘
```

## Prevention Strategies

1. **TypeScript Strict Mode** - Catch errors at compile time
2. **ESLint Rules** - Enforce best practices
3. **Pre-commit Hooks** - Validate before commit
4. **Unit Tests** - Catch regressions
5. **Code Review** - Human verification
