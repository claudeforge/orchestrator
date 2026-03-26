---
name: testing-strategies
description: "Writes unit tests with Vitest, component tests with React Testing Library, integration tests for Hono APIs, and E2E tests with Playwright. Configures mocks with MSW and vi.mock. Use when writing tests, fixing test failures, setting up test infrastructure, improving coverage, or mocking API responses."
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Testing Strategies Skill

## When to Use Each Test Type

| Scenario | Test type | Tool |
|----------|-----------|------|
| Pure function or service logic | Unit | Vitest |
| React component behavior | Component | React Testing Library |
| API route or DB repository | Integration | Hono testClient / real DB |
| Critical user journey | E2E | Playwright |

Aim for ~80% unit, ~15% integration, ~5% E2E.

## Unit Testing Patterns

### Arrange-Act-Assert
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
    const createRes = await client.api.v1.users.$post({
      json: { name: 'Test', email: 'test@example.com', password: 'pass123' },
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    const getRes = await client.api.v1.users[':id'].$get({
      param: { id: created.data.id },
    });
    expect(getRes.status).toBe(200);
    const retrieved = await getRes.json();
    expect(retrieved.data.email).toBe('test@example.com');
  });
});
```

## E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('complete registration and login flow', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/login');

    await page.fill('[name="email"]', 'new@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

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

// Mock implementation with sequential returns
const mockFetch = vi.fn();
mockFetch
  .mockResolvedValueOnce({ data: 'first' })
  .mockResolvedValueOnce({ data: 'second' });

// Spy on method
const spy = vi.spyOn(console, 'log');
expect(spy).toHaveBeenCalledWith('message');
```

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
