---
name: testing-strategies
description: Expert knowledge in testing methodologies, test patterns, and quality assurance. Use when writing tests or setting up testing infrastructure.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Testing Strategies Skill

Comprehensive testing strategies and patterns for ensuring code quality.

## Testing Pyramid

```
              /\
             /E2E\           5%  - Critical user journeys
            /------\
           / Integ  \        15% - Service boundaries
          /----------\
         /    Unit    \      80% - Component logic
        /--------------\
```

## Unit Testing Patterns

### Arrange-Act-Assert (AAA)
```typescript
describe('calculateTotal', () => {
  it('should apply discount correctly', () => {
    // Arrange
    const items = [{ price: 100, quantity: 1 }];
    const discount = 0.1;

    // Act
    const result = calculateTotal(items, discount);

    // Assert
    expect(result).toBe(90);
  });
});
```

### Test Isolation
```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepo: MockUserRepository;

  beforeEach(() => {
    // Fresh instances for each test
    mockRepo = new MockUserRepository();
    service = new UserService(mockRepo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
```

### Parameterized Tests
```typescript
describe('validateEmail', () => {
  it.each([
    ['test@example.com', true],
    ['user.name@domain.co.uk', true],
    ['invalid', false],
    ['@nodomain.com', false],
    ['no@tld', false],
  ])('validates %s as %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});
```

### Testing Edge Cases
```typescript
describe('divide', () => {
  it('should handle positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle zero dividend', () => {
    expect(divide(0, 5)).toBe(0);
  });

  it('should throw on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle floating point', () => {
    expect(divide(1, 3)).toBeCloseTo(0.333, 2);
  });
});
```

## Component Testing

### React Testing Library
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('submits with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

### Testing Hooks
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});

describe('useAsync', () => {
  it('handles async operation', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() => useAsync(mockFetch));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'test' });
  });
});
```

## Integration Testing

### API Testing with Hono
```typescript
import { testClient } from 'hono/testing';
import app from '../src/index';

describe('Users API', () => {
  const client = testClient(app);

  beforeEach(async () => {
    await db.delete(users);
  });

  it('creates and retrieves user', async () => {
    // Create
    const createRes = await client.api.v1.users.$post({
      json: { name: 'Test', email: 'test@example.com', password: 'pass123' },
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    // Retrieve
    const getRes = await client.api.v1.users[':id'].$get({
      param: { id: created.data.id },
    });
    expect(getRes.status).toBe(200);
    const retrieved = await getRes.json();

    expect(retrieved.data.email).toBe('test@example.com');
  });
});
```

### Database Testing
```typescript
describe('UserRepository', () => {
  const repo = new UserRepository();

  beforeEach(async () => {
    await db.delete(users);
  });

  it('creates and finds user', async () => {
    const created = await repo.create({
      name: 'Test User',
      email: 'test@example.com',
    });

    const found = await repo.findById(created.id);

    expect(found).toEqual(created);
  });

  it('returns null for non-existent user', async () => {
    const found = await repo.findById('non-existent-id');
    expect(found).toBeNull();
  });
});
```

## E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('complete registration and login flow', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify redirect to login
    await expect(page).toHaveURL('/login');

    // Login
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify dashboard access
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

## Mocking Strategies

### MSW (Mock Service Worker)
```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: [{ id: '1', name: 'Test User' }],
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { success: true, data: { id: '2', ...body } },
      { status: 201 }
    );
  }),
];

export const server = setupServer(...handlers);

// Setup in test file
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Vitest Mocks
```typescript
// Mock module
vi.mock('./api', () => ({
  fetchUsers: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
}));

// Mock implementation
const mockFetch = vi.fn();
mockFetch
  .mockResolvedValueOnce({ data: 'first' })
  .mockResolvedValueOnce({ data: 'second' });

// Spy on method
const spy = vi.spyOn(console, 'log');
expect(spy).toHaveBeenCalledWith('message');
```

## Coverage Goals

| Metric | Minimum | Target |
|--------|---------|--------|
| Statements | 70% | 85% |
| Branches | 65% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

## Test Organization

```
tests/
├── unit/              # Unit tests
│   ├── utils/
│   └── services/
├── integration/       # Integration tests
│   ├── api/
│   └── db/
├── e2e/              # E2E tests
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
├── fixtures/         # Test data
├── mocks/            # Mock implementations
└── setup.ts          # Global setup
```
