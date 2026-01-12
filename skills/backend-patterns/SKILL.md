---
name: backend-patterns
description: Expert knowledge in API design, authentication, caching, and backend best practices. Use for backend development tasks.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Backend Patterns Skill

Modern backend patterns and best practices for building scalable APIs.

## API Design Patterns

### RESTful Conventions
```
GET    /api/v1/users           # List users
GET    /api/v1/users/:id       # Get user
POST   /api/v1/users           # Create user
PUT    /api/v1/users/:id       # Replace user
PATCH  /api/v1/users/:id       # Update user
DELETE /api/v1/users/:id       # Delete user

# Nested resources
GET    /api/v1/users/:id/posts
POST   /api/v1/users/:id/posts

# Actions as resources
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/passwords/reset
```

### Response Format
```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### Status Codes
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business logic error |
| 500 | Server Error | Unexpected error |

## Authentication Patterns

### JWT Flow
```typescript
// Login - generate tokens
async function login(email: string, password: string) {
  const user = await db.users.findByEmail(email);
  if (!user || !await verifyPassword(password, user.password)) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  // Store refresh token
  await db.refreshTokens.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: addDays(new Date(), 7),
  });

  return { accessToken, refreshToken, user };
}

// Token generation
async function generateAccessToken(user: User) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Token refresh
async function refreshAccessToken(refreshToken: string) {
  const stored = await db.refreshTokens.findByToken(refreshToken);
  if (!stored || stored.expiresAt < new Date()) {
    throw new HTTPException(401, { message: 'Invalid refresh token' });
  }

  const user = await db.users.findById(stored.userId);
  return generateAccessToken(user);
}
```

### Auth Middleware
```typescript
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing token' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    c.set('userId', payload.sub);
    c.set('userRole', payload.role);
    await next();
  } catch {
    throw new HTTPException(401, { message: 'Invalid token' });
  }
}

// Role-based authorization
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole');
    if (!roles.includes(userRole)) {
      throw new HTTPException(403, { message: 'Forbidden' });
    }
    await next();
  };
}
```

## Validation Patterns

### Zod Schemas
```typescript
import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2).max(100),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
});

export const updateUserSchema = createUserSchema.partial();

// Query params
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Using with Hono
app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const data = c.req.valid('json');
  // data is fully typed
});
```

## Error Handling

### Central Error Handler
```typescript
export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: { code: 'HTTP_ERROR', message: err.message },
    }, err.status);
  }

  // Validation errors
  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    }, 400);
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return c.json({
      success: false,
      error: { code: 'CONFLICT', message: 'Resource already exists' },
    }, 409);
  }

  // Unknown errors
  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  }, 500);
}
```

## Caching Patterns

### Redis Caching
```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache-aside pattern
async function getUserById(id: string): Promise<User> {
  const cacheKey = `user:${id}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const user = await db.users.findById(id);
  if (!user) throw new HTTPException(404);

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(user));

  return user;
}

// Invalidate on update
async function updateUser(id: string, data: UpdateUserInput) {
  const user = await db.users.update(id, data);
  await redis.del(`user:${id}`);
  return user;
}
```

## Rate Limiting

```typescript
import { rateLimiter } from 'hono-rate-limiter';

// Apply rate limiting
app.use(
  '/api/*',
  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100, // 100 requests per minute
    keyGenerator: (c) => c.get('userId') || c.req.header('x-forwarded-for'),
  })
);

// Stricter limits for auth endpoints
app.use(
  '/api/auth/*',
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 attempts
  })
);
```

## Database Patterns

### Repository Pattern
```typescript
class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}
```

### Transaction Pattern
```typescript
async function createOrder(userId: string, items: OrderItem[]) {
  return db.transaction(async (tx) => {
    // Create order
    const [order] = await tx
      .insert(orders)
      .values({ userId, status: 'pending' })
      .returning();

    // Create order items
    await tx.insert(orderItems).values(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      }))
    );

    // Update inventory
    for (const item of items) {
      await tx
        .update(products)
        .set({ stock: sql`stock - ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    return order;
  });
}
```
