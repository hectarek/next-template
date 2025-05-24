# 🧪 Testing Strategy

This guide outlines our comprehensive testing approach across all application layers. Our testing strategy ensures reliability, maintainability, and confidence in code changes through automated testing at every level.

## 🎯 Testing Philosophy

### 1. **Testing Pyramid**

- **Unit Tests (70%)**: Fast, isolated tests for individual functions and components
- **Integration Tests (20%)**: Test interactions between components and systems
- **End-to-End Tests (10%)**: Full user journey testing

### 2. **Test-Driven Development (TDD)**

Write tests first to define expected behavior, then implement the functionality.

### 3. **Confidence-Driven Testing**

Focus on tests that provide the most confidence in critical application functionality.

### 4. **Maintainable Tests**

Tests should be easy to read, modify, and debug.

## 🏗️ Testing Architecture

```
tests/
├── components/              # UI component tests
│   ├── example/            # Feature component tests
│   │   ├── user-form.test.tsx
│   │   └── user-list.test.tsx
│   └── ui/                 # Base UI component tests
│       └── confirmation-dialog.test.tsx
├── services/               # Service layer tests
│   └── user.service.test.ts
├── api/                    # API route tests
│   └── users.test.ts
├── unit/                   # Utility function tests
│   └── utils.test.ts
├── integration/            # Integration tests
│   └── user-workflow.test.ts
└── e2e/                   # End-to-end tests
    └── user-management.spec.ts
```

## ⚙️ Testing Setup

### **Configuration** (`vitest.config.ts`)

```tsx
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
})
```

### **Test Setup** (`tests/setup.ts`)

```tsx
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
	cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => '/',
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({ src, alt, width, height, className }: any) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt} width={width} height={height} className={className} />
	),
}))
```

## 🧩 Component Testing

### **Client Component Testing** (`user-form.test.tsx`)

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { UserForm } from '@/components/example/user-form'

// Mock API functions
const mockCreateUser = vi.fn()
vi.mock('@/lib/api/users', () => ({
	createUser: mockCreateUser,
}))

describe('UserForm', () => {
	const user = userEvent.setup()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Form Rendering', () => {
		it('renders all form fields', () => {
			render(<UserForm />)

			expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
			expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
			expect(screen.getByLabelText(/avatar url/i)).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
		})

		it('has proper accessibility attributes', () => {
			render(<UserForm />)

			const emailInput = screen.getByLabelText(/email/i)
			const submitButton = screen.getByRole('button', { name: /create user/i })

			expect(emailInput).toHaveAttribute('type', 'email')
			expect(emailInput).toHaveAttribute('required')
			expect(submitButton).toHaveAttribute('type', 'submit')
		})
	})

	describe('Form Validation', () => {
		it('shows validation errors for invalid email', async () => {
			render(<UserForm />)

			const emailInput = screen.getByLabelText(/email/i)
			await user.type(emailInput, 'invalid-email')
			await user.click(screen.getByRole('button', { name: /create user/i }))

			await waitFor(() => {
				expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
			})
		})

		it('requires email field', async () => {
			render(<UserForm />)

			await user.click(screen.getByRole('button', { name: /create user/i }))

			await waitFor(() => {
				expect(screen.getByText(/email is required/i)).toBeInTheDocument()
			})
		})
	})

	describe('Form Submission', () => {
		it('successfully creates user with valid data', async () => {
			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'USER' as const,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockCreateUser.mockResolvedValueOnce(mockUser)

			render(<UserForm />)

			await user.type(screen.getByLabelText(/email/i), 'test@example.com')
			await user.type(screen.getByLabelText(/name/i), 'Test User')
			await user.click(screen.getByRole('button', { name: /create user/i }))

			await waitFor(() => {
				expect(screen.getByText(/user created successfully/i)).toBeInTheDocument()
			})

			expect(mockCreateUser).toHaveBeenCalledWith({
				email: 'test@example.com',
				name: 'Test User',
				avatar: '',
			})
		})

		it('handles API errors gracefully', async () => {
			mockCreateUser.mockRejectedValueOnce(new Error('Email already exists'))

			render(<UserForm />)

			await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
			await user.click(screen.getByRole('button', { name: /create user/i }))

			await waitFor(() => {
				expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
			})
		})

		it('shows loading state during submission', async () => {
			mockCreateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

			render(<UserForm />)

			await user.type(screen.getByLabelText(/email/i), 'test@example.com')

			const submitButton = screen.getByRole('button', { name: /create user/i })
			await user.click(submitButton)

			expect(screen.getByText(/creating.../i)).toBeInTheDocument()
			expect(submitButton).toBeDisabled()
		})
	})
})
```

### **Server Component Testing**

```tsx
// Note: Server components are tested through integration tests
// since they can't be rendered in isolation with client-side testing tools

describe('Server Component Integration', () => {
	it('renders page with server-fetched data', async () => {
		// Mock service layer
		const mockStats = {
			totalUsers: 100,
			activeUsers: 85,
			newUsersThisMonth: 12,
		}

		vi.spyOn(UserService, 'getStats').mockResolvedValueOnce(mockStats)

		// Test through API or integration test
		const response = await fetch('/api/users/stats')
		const data = await response.json()

		expect(data).toEqual(mockStats)
	})
})
```

## 🔧 Service Layer Testing

### **Service Testing with Mocked Dependencies**

```tsx
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { UserService } from '@/services/user.service'

// Mock Prisma client
const mockPrisma = {
	user: {
		create: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		count: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}

vi.mock('@/lib/prisma', () => ({
	prisma: mockPrisma,
}))

describe('UserService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('create', () => {
		it('creates a new user successfully', async () => {
			const userData = {
				email: 'test@example.com',
				name: 'Test User',
			}

			const expectedUser = {
				id: '1',
				...userData,
				role: 'USER',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.create.mockResolvedValueOnce(expectedUser)

			const result = await UserService.create(userData)

			expect(mockPrisma.user.create).toHaveBeenCalledWith({
				data: userData,
			})
			expect(result).toEqual(expectedUser)
		})

		it('handles duplicate email error', async () => {
			const userData = { email: 'existing@example.com' }

			const prismaError = {
				code: 'P2002',
				message: 'Unique constraint failed',
			}

			mockPrisma.user.create.mockRejectedValueOnce(prismaError)

			await expect(UserService.create(userData)).rejects.toThrow('A user with this email already exists')
		})
	})

	describe('getMany', () => {
		it('returns paginated users with filters', async () => {
			const mockUsers = [
				{
					id: '1',
					email: 'user1@example.com',
					name: 'User 1',
					role: 'USER',
					isActive: true,
					_count: { posts: 2, comments: 5 },
				},
			]

			mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers)
			mockPrisma.user.count.mockResolvedValueOnce(1)

			const result = await UserService.getMany({
				page: 1,
				limit: 10,
				search: 'user1',
			})

			expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
				where: {
					OR: [
						{ name: { contains: 'user1', mode: 'insensitive' } },
						{ email: { contains: 'user1', mode: 'insensitive' } },
					],
				},
				skip: 0,
				take: 10,
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})

			expect(result).toEqual({
				users: mockUsers,
				total: 1,
				hasMore: false,
			})
		})
	})
})
```

## 🌐 API Route Testing

### **Next.js Route Handler Testing**

```tsx
import { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { GET, POST } from '@/app/api/users/route'
import { UserService } from '@/services/user.service'

// Mock the UserService
vi.mock('@/services/user.service', () => ({
	UserService: {
		getMany: vi.fn(),
		create: vi.fn(),
	},
}))

const mockUserService = vi.mocked(UserService)

describe('/api/users', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('GET /api/users', () => {
		it('returns users with default pagination', async () => {
			const mockResult = {
				users: [
					{
						id: '1',
						email: 'user@example.com',
						name: 'User',
						role: 'USER',
						isActive: true,
						_count: { posts: 2, comments: 5 },
					},
				],
				total: 1,
				hasMore: false,
			}

			mockUserService.getMany.mockResolvedValueOnce(mockResult)

			const request = new NextRequest('http://localhost:3000/api/users')
			const response = await GET(request)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual(mockResult)
			expect(mockUserService.getMany).toHaveBeenCalledWith({})
		})

		it('handles query parameters correctly', async () => {
			mockUserService.getMany.mockResolvedValueOnce({
				users: [],
				total: 0,
				hasMore: false,
			})

			const request = new NextRequest('http://localhost:3000/api/users?page=2&limit=5&search=john')
			const response = await GET(request)

			expect(response.status).toBe(200)
			expect(mockUserService.getMany).toHaveBeenCalledWith({
				page: 2,
				limit: 5,
				search: 'john',
			})
		})

		it('handles service errors', async () => {
			mockUserService.getMany.mockRejectedValueOnce(new Error('Database error'))

			const request = new NextRequest('http://localhost:3000/api/users')
			const response = await GET(request)
			const data = await response.json()

			expect(response.status).toBe(500)
			expect(data).toEqual({
				error: 'Internal server error',
			})
		})
	})

	describe('POST /api/users', () => {
		it('creates a new user successfully', async () => {
			const userData = {
				email: 'newuser@example.com',
				name: 'New User',
			}

			const createdUser = {
				id: '1',
				...userData,
				role: 'USER',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockUserService.create.mockResolvedValueOnce(createdUser)

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(userData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(createdUser)
			expect(mockUserService.create).toHaveBeenCalledWith(userData)
		})

		it('validates required fields', async () => {
			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: 'User without email' }),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toContain('email')
			expect(mockUserService.create).not.toHaveBeenCalled()
		})
	})
})
```

## 🔗 Integration Testing

### **User Workflow Integration Test**

```tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { UserService } from '@/services/user.service'

describe('User Management Integration', () => {
	beforeEach(async () => {
		// Clean up test data
		await prisma.user.deleteMany({
			where: { email: { contains: '@test.com' } },
		})
	})

	afterEach(async () => {
		// Clean up after tests
		await prisma.user.deleteMany({
			where: { email: { contains: '@test.com' } },
		})
	})

	it('completes full user creation workflow', async () => {
		// 1. Create user
		const userData = {
			email: 'integration@test.com',
			name: 'Integration User',
		}

		const createdUser = await UserService.create(userData)
		expect(createdUser.email).toBe(userData.email)
		expect(createdUser.name).toBe(userData.name)

		// 2. Fetch user by ID
		const fetchedUser = await UserService.getById(createdUser.id)
		expect(fetchedUser).toEqual(createdUser)

		// 3. Update user
		const updateData = { name: 'Updated User' }
		const updatedUser = await UserService.update(createdUser.id, updateData)
		expect(updatedUser.name).toBe(updateData.name)

		// 4. Search for user
		const searchResults = await UserService.search('integration')
		expect(searchResults).toHaveLength(1)
		expect(searchResults[0].id).toBe(createdUser.id)

		// 5. Soft delete user
		const deletedUser = await UserService.delete(createdUser.id, true)
		expect(deletedUser.isActive).toBe(false)

		// 6. Verify user is not in active search
		const activeUsers = await UserService.getMany({ isActive: true })
		expect(activeUsers.users.find(u => u.id === createdUser.id)).toBeUndefined()
	})
})
```

## 🌍 End-to-End Testing

### **Playwright E2E Tests** (`tests/e2e/user-management.spec.ts`)

```tsx
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/demo/users')
	})

	test('creates a new user through the form', async ({ page }) => {
		// Fill out the form
		await page.fill('input[type="email"]', 'e2e@test.com')
		await page.fill('input[placeholder*="name"]', 'E2E Test User')

		// Submit the form
		await page.click('button:has-text("Create User")')

		// Wait for success message
		await expect(page.locator('text=User created successfully')).toBeVisible()

		// Verify user appears in the list
		await expect(page.locator('text=E2E Test User')).toBeVisible()
		await expect(page.locator('text=e2e@test.com')).toBeVisible()
	})

	test('shows validation errors for invalid input', async ({ page }) => {
		// Submit form with invalid email
		await page.fill('input[type="email"]', 'invalid-email')
		await page.click('button:has-text("Create User")')

		// Check for validation error
		await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
	})

	test('displays user statistics', async ({ page }) => {
		// Check that stats are displayed
		await expect(page.locator('text=Total Users')).toBeVisible()
		await expect(page.locator('text=Active Users')).toBeVisible()
		await expect(page.locator('text=New This Month')).toBeVisible()
	})
})
```

## 📊 Test Coverage & Quality

### **Coverage Configuration**

```tsx
// vitest.config.ts
export default defineConfig({
	test: {
		coverage: {
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
			exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*', '**/coverage/**'],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
		},
	},
})
```

### **Test Quality Metrics**

- **Unit Test Coverage**: Aim for 90%+ on business logic
- **Integration Test Coverage**: Cover critical user paths
- **E2E Test Coverage**: Test main user journeys
- **Performance**: Tests should run in under 30 seconds
- **Reliability**: Tests should be deterministic and stable

## 🔧 Testing Utilities

### **Custom Test Utilities** (`tests/utils.tsx`)

```tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function for components that need providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<div>
			{/* Add any providers here (ThemeProvider, etc.) */}
			{children}
		</div>
	)
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
	render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockUser = (overrides = {}) => ({
	id: '1',
	email: 'test@example.com',
	name: 'Test User',
	role: 'USER' as const,
	isActive: true,
	avatar: null,
	metadata: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

export const createMockUserWithCounts = (overrides = {}) => ({
	...createMockUser(overrides),
	_count: {
		posts: 2,
		comments: 5,
		...overrides._count,
	},
})
```

## 📋 Testing Best Practices

### **✅ Do's**

- Test behavior, not implementation details
- Write descriptive test names that explain the scenario
- Use proper setup and teardown for test isolation
- Mock external dependencies appropriately
- Test edge cases and error scenarios
- Keep tests simple and focused
- Use data-testid for stable element selection

### **❌ Don'ts**

- Don't test internal component state directly
- Don't test third-party library functionality
- Don't write tests that are too brittle
- Don't ignore failing tests
- Don't test everything - focus on critical paths
- Don't mock what you own (prefer integration tests)

### **🎯 Test Strategy by Layer**

- **Components**: Focus on user interactions and prop handling
- **Services**: Test business logic and error handling
- **APIs**: Test request/response handling and validation
- **Integration**: Test layer interactions and data flow
- **E2E**: Test critical user journeys

## 🐛 Debugging Tests

### **Common Issues**

```tsx
// 1. Async operations not awaited
// ❌ Bad
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ✅ Good
await waitFor(() => {
	expect(screen.getByText('Loading...')).toBeInTheDocument()
})

// 2. Missing cleanup
// ✅ Good
afterEach(() => {
	cleanup()
	vi.clearAllMocks()
})

// 3. Proper error testing
// ✅ Good
await expect(service.invalidOperation()).rejects.toThrow('Expected error')
```

### **Debugging Tools**

```tsx
// Debug rendered component
import { screen } from '@testing-library/react'

// See what's rendered
screen.debug()

// Find element issues
screen.logTestingPlaygroundURL()
```

## 📚 Related Documentation

- **[Component Development Guide](../components/DEVELOPMENT_GUIDE.md)** - Component patterns to test
- **[API Design Patterns](../api/DESIGN_PATTERNS.md)** - API testing patterns
- **[Database & Service Layer](../database/SERVICE_LAYER.md)** - Service testing strategies
- **[Error Handling Patterns](../error-handling/PATTERNS.md)** - Testing error scenarios

---

This comprehensive testing strategy ensures code quality, reliability, and maintainability across your entire application stack.
