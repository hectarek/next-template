# 🧪 Our Testing Setup

This guide covers the **specific testing setup** in this Next.js template: Vitest for unit tests, Playwright for e2e tests, and React Testing Library for component testing.

## 🎯 Our Testing Stack

- **[Vitest](https://vitest.dev/)** - Fast unit testing (like Jest but faster)
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** - Component testing
- **[Playwright](https://playwright.dev/)** - End-to-end browser testing
- **[MSW](https://mswjs.io/)** - API mocking for tests

## ⚡ Running Tests

### **Unit Tests (Vitest)**

```bash
# Run all unit tests once
bun run test

# Watch mode (re-runs tests when files change)
bun run test:watch

# Coverage report (see what code is tested)
bun run test:coverage

# Visual UI (run tests in browser interface)
bun run test:ui
```

### **E2E Tests (Playwright)**

```bash
# Run end-to-end tests
bun run test:e2e

# Run with browser UI (see tests running)
bun run test:e2e:ui

# Debug mode (step through tests)
bun run test:e2e:debug
```

## 📁 Our Test Structure

```
tests/
├── unit/                  # Unit tests (mirror app structure)
│   ├── api/              # API route tests
│   │   └── users.test.ts
│   ├── components/       # Component tests
│   │   └── user-form.test.tsx
│   └── services/         # Service layer tests
│       └── user.service.test.ts
├── e2e/                  # End-to-end tests
│   ├── auth.spec.ts      # Authentication flows
│   ├── users.spec.ts     # User management flows
│   └── api.spec.ts       # API endpoint tests
├── fixtures/             # Test data
│   └── users.ts          # Sample user data
└── setup/               # Test configuration
    ├── vitest.setup.ts   # Unit test setup
    └── playwright.setup.ts # E2E test setup
```

## 🧪 Writing Unit Tests

### **Testing Components**

```typescript
// tests/unit/components/user-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserForm } from '@/components/example/user-form'
import { createUser } from '@/lib/api/users'

// Mock the API call
vi.mock('@/lib/api/users', () => ({
  createUser: vi.fn()
}))

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits form with valid data', async () => {
    const mockCreateUser = createUser as vi.MockedFunction<typeof createUser>
    mockCreateUser.mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test User' })

    render(<UserForm />)

    // Fill out form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Verify API was called
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User'
      })
    })
  })

  it('displays validation error for invalid email', async () => {
    render(<UserForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' }
    })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })
})
```

### **Testing API Routes**

```typescript
// tests/unit/api/users.test.ts
import { POST, GET } from '@/app/api/users/route'
import { NextRequest } from 'next/server'
import { UserService } from '@/services/user.service'

// Mock the service layer
vi.mock('@/services/user.service')

describe('/api/users', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('POST', () => {
		it('creates user with valid data', async () => {
			const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
			vi.mocked(UserService.create).mockResolvedValue(mockUser)

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				body: JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(mockUser)
			expect(UserService.create).toHaveBeenCalledWith({
				email: 'test@example.com',
				name: 'Test User',
			})
		})

		it('returns 400 for missing email', async () => {
			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				body: JSON.stringify({ name: 'Test User' }), // Missing email
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toBe('Email is required')
		})
	})

	describe('GET', () => {
		it('returns paginated users', async () => {
			const mockResult = {
				users: [{ id: '1', email: 'test@example.com', name: 'Test User' }],
				total: 1,
				hasMore: false,
				page: 1,
				limit: 10,
			}
			vi.mocked(UserService.getMany).mockResolvedValue(mockResult)

			const request = new NextRequest('http://localhost:3000/api/users?page=1&limit=10')
			const response = await GET(request)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual(mockResult)
		})
	})
})
```

### **Testing Services**

```typescript
// tests/unit/services/user.service.test.ts
import { UserService } from '@/services/user.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
	prisma: {
		user: {
			findMany: vi.fn(),
			count: vi.fn(),
			create: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}))

describe('UserService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getMany', () => {
		it('returns paginated users', async () => {
			const mockUsers = [{ id: '1', email: 'test@example.com', name: 'Test User' }]
			vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)
			vi.mocked(prisma.user.count).mockResolvedValue(1)

			const result = await UserService.getMany({ page: 1, limit: 10 })

			expect(result.users).toEqual(mockUsers)
			expect(result.total).toBe(1)
			expect(result.hasMore).toBe(false)
			expect(prisma.user.findMany).toHaveBeenCalledWith({
				skip: 0,
				take: 10,
				orderBy: { createdAt: 'desc' },
			})
		})
	})

	describe('create', () => {
		it('creates new user', async () => {
			const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
			vi.mocked(prisma.user.create).mockResolvedValue(mockUser)

			const result = await UserService.create({
				email: 'test@example.com',
				name: 'Test User',
			})

			expect(result).toEqual(mockUser)
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: { email: 'test@example.com', name: 'Test User' },
			})
		})
	})
})
```

## 🎭 Writing E2E Tests

### **Testing User Flows**

```typescript
// tests/e2e/users.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
	test('can create and view users', async ({ page }) => {
		// Go to users demo page
		await page.goto('/demo/users')

		// Fill out user form
		await page.fill('[data-testid="email-input"]', 'test@example.com')
		await page.fill('[data-testid="name-input"]', 'Test User')

		// Submit form
		await page.click('[data-testid="submit-button"]')

		// Verify user appears in list
		await expect(page.locator('text=test@example.com')).toBeVisible()
		await expect(page.locator('text=Test User')).toBeVisible()
	})

	test('displays validation error for invalid email', async ({ page }) => {
		await page.goto('/demo/users')

		await page.fill('[data-testid="email-input"]', 'invalid-email')
		await page.click('[data-testid="submit-button"]')

		await expect(page.locator('text=Invalid email format')).toBeVisible()
	})
})
```

### **Testing API Endpoints**

```typescript
// tests/e2e/api.spec.ts
import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
	test('GET /api/users returns user list', async ({ request }) => {
		const response = await request.get('/api/users')

		expect(response.status()).toBe(200)

		const data = await response.json()
		expect(data).toHaveProperty('users')
		expect(data).toHaveProperty('total')
		expect(Array.isArray(data.users)).toBe(true)
	})

	test('POST /api/users creates new user', async ({ request }) => {
		const response = await request.post('/api/users', {
			data: {
				email: 'api-test@example.com',
				name: 'API Test User',
			},
		})

		expect(response.status()).toBe(201)

		const user = await response.json()
		expect(user.email).toBe('api-test@example.com')
		expect(user.name).toBe('API Test User')
	})
})
```

## 🎯 Test Data & Fixtures

### **Using Test Fixtures**

```typescript
// tests/fixtures/users.ts
export const testUsers = {
	validUser: {
		email: 'valid@example.com',
		name: 'Valid User',
	},
	userWithAvatar: {
		email: 'avatar@example.com',
		name: 'Avatar User',
		avatar: 'https://example.com/avatar.jpg',
	},
	invalidUser: {
		email: 'invalid-email',
		name: '',
	},
}

// Use in tests
import { testUsers } from '@/tests/fixtures/users'

test('creates user with fixture data', async () => {
	const result = await UserService.create(testUsers.validUser)
	expect(result.email).toBe(testUsers.validUser.email)
})
```

## 🔧 Configuration Files

### **Vitest Config** (`vitest.config.ts`)

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup/vitest.setup.ts'],
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*'],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
})
```

### **Playwright Config** (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
	],
	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
	},
})
```

## 🎯 Testing Checklist

When adding new features, ensure:

- [ ] **Unit tests** for service layer functions
- [ ] **Component tests** for React components
- [ ] **API tests** for new endpoints
- [ ] **E2E tests** for complete user flows
- [ ] **Test data** using fixtures for consistency

## 🔧 Troubleshooting

### **Common Issues**

**Tests fail with module resolution errors**:

```bash
# Clear Vitest cache
rm -rf node_modules/.vite
bun run test
```

**Playwright browser not found**:

```bash
# Install browsers
bunx playwright install
```

**API tests fail with database errors**:

```bash
# Use test database
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
```

---

**Learn More**: For general testing concepts and strategies, see [Testing Concepts](./CONCEPTS.md). For hands-on examples, explore our test files in `tests/`.
