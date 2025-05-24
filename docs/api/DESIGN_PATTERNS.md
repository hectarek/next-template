# 🌐 API Design Patterns

This guide outlines the REST API conventions, patterns, and best practices used throughout our Next.js application. Following these patterns ensures consistency, maintainability, and excellent developer experience.

## 🎯 API Design Principles

### 1. **RESTful Resource Design**

APIs follow REST conventions with clear resource hierarchies and HTTP methods.

### 2. **Consistent Response Format**

Standardized response structure across all endpoints for predictable integration.

### 3. **Comprehensive Error Handling**

Detailed error responses with proper HTTP status codes and helpful messages.

### 4. **Type Safety**

Full TypeScript support from request validation to response types.

### 5. **Performance Optimization**

Efficient data fetching with pagination, filtering, and selective field loading.

## 🛣️ Route Structure

### **Resource-Based URLs**

```
/api/users                    # Collection operations
/api/users/[id]               # Individual resource operations
/api/users/[id]/posts         # Nested resource operations
/api/users/stats              # Collection-level operations
```

### **HTTP Methods**

- **GET**: Retrieve data (collection or individual)
- **POST**: Create new resources
- **PATCH**: Update existing resources (partial)
- **PUT**: Replace entire resources (full update)
- **DELETE**: Remove resources

## 📁 File Organization

### **Next.js App Router Structure**

```
app/api/
├── users/
│   ├── route.ts              # GET /api/users, POST /api/users
│   ├── [id]/
│   │   └── route.ts          # GET /api/users/[id], PATCH, DELETE
│   └── stats/
│       └── route.ts          # GET /api/users/stats
├── posts/
│   ├── route.ts
│   └── [id]/
└── global-handlers.ts        # Shared middleware & helpers
```

## 🔧 Implementation Patterns

### **1. Basic CRUD Operations**

#### **Collection Endpoint** (`/api/users/route.ts`)

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/user.service'

// GET /api/users - List users with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		// Extract query parameters
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '10')
		const search = searchParams.get('search') || undefined
		const role = searchParams.get('role') as 'USER' | 'ADMIN' | 'MODERATOR' | undefined
		const isActive =
			searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined

		// Validate parameters
		if (limit > 100) {
			return NextResponse.json({ error: 'Limit cannot exceed 100' }, { status: 400 })
		}

		// Call service layer
		const result = await UserService.getMany({
			page,
			limit,
			search,
			role,
			isActive,
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('GET /api/users error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Validate required fields
		if (!body.email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 })
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(body.email)) {
			return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
		}

		// Call service layer
		const user = await UserService.create({
			email: body.email,
			name: body.name,
			avatar: body.avatar,
		})

		return NextResponse.json(user, { status: 201 })
	} catch (error) {
		console.error('POST /api/users error:', error)

		// Handle known business logic errors
		if (error instanceof Error && error.message.includes('already exists')) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
```

#### **Individual Resource Endpoint** (`/api/users/[id]/route.ts`)

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/user.service'

interface RouteParams {
	params: { id: string }
}

// GET /api/users/[id] - Get individual user
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { searchParams } = new URL(request.url)
		const includeRelations = searchParams.get('include') === 'relations'

		const user = await UserService.getById(params.id, includeRelations)

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		return NextResponse.json(user)
	} catch (error) {
		console.error(`GET /api/users/${params.id} error:`, error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const body = await request.json()

		// Validate email format if provided
		if (body.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(body.email)) {
				return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
			}
		}

		const user = await UserService.update(params.id, body)
		return NextResponse.json(user)
	} catch (error) {
		console.error(`PATCH /api/users/${params.id} error:`, error)

		if (error instanceof Error && error.message === 'User not found') {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { searchParams } = new URL(request.url)
		const hard = searchParams.get('hard') === 'true'

		await UserService.delete(params.id, !hard)
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error(`DELETE /api/users/${params.id} error:`, error)

		if (error instanceof Error && error.message === 'User not found') {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
```

### **2. Query Parameter Patterns**

#### **Pagination**

```tsx
// Standard pagination parameters
const page = parseInt(searchParams.get('page') || '1')
const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
const offset = (page - 1) * limit

// Response includes pagination metadata
return NextResponse.json({
	data: items,
	pagination: {
		page,
		limit,
		total,
		hasMore: total > offset + items.length,
		totalPages: Math.ceil(total / limit),
	},
})
```

#### **Filtering**

```tsx
// Type-safe filtering
const filters = {
	search: searchParams.get('search') || undefined,
	role: searchParams.get('role') as 'USER' | 'ADMIN' | undefined,
	isActive:
		searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
	createdAfter: searchParams.get('createdAfter') ? new Date(searchParams.get('createdAfter')!) : undefined,
}

// Remove undefined values
const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined))
```

#### **Field Selection**

```tsx
// Allow clients to specify which fields to include
const fields = searchParams.get('fields')?.split(',')
const include = {
	posts: fields?.includes('posts') || false,
	comments: fields?.includes('comments') || false,
	_count: fields?.includes('counts') || false,
}
```

### **3. Response Formats**

#### **Success Responses**

```tsx
// Single resource
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}

// Collection with pagination
{
  "users": [...],
  "total": 150,
  "hasMore": true,
  "page": 1,
  "limit": 10
}

// Operation success
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### **Error Responses**

```tsx
// Validation error (400)
{
  "error": "Email is required",
  "code": "VALIDATION_ERROR",
  "field": "email"
}

// Not found (404)
{
  "error": "User not found",
  "code": "RESOURCE_NOT_FOUND",
  "resource": "user",
  "id": "user_123"
}

// Server error (500)
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "requestId": "req_abc123"
}
```

### **4. HTTP Status Codes**

#### **Success Codes**

- **200 OK**: Successful GET, PATCH, DELETE operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful operations with no response body

#### **Client Error Codes**

- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Resource conflicts (e.g., duplicate email)
- **422 Unprocessable Entity**: Semantic validation errors

#### **Server Error Codes**

- **500 Internal Server Error**: Unexpected server errors
- **502 Bad Gateway**: External service errors
- **503 Service Unavailable**: Temporary service issues

## 🛡️ Error Handling Patterns

### **Centralized Error Handler**

```tsx
// lib/api/error-handler.ts
export function handleApiError(error: unknown, context: string) {
	console.error(`${context} error:`, error)

	// Handle known Prisma errors
	if (error && typeof error === 'object' && 'code' in error) {
		switch (error.code) {
			case 'P2002':
				return NextResponse.json({ error: 'A record with this data already exists' }, { status: 409 })
			case 'P2025':
				return NextResponse.json({ error: 'Record not found' }, { status: 404 })
		}
	}

	// Handle business logic errors
	if (error instanceof Error) {
		if (error.message.includes('not found')) {
			return NextResponse.json({ error: error.message }, { status: 404 })
		}
		if (error.message.includes('already exists')) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}
	}

	// Default server error
	return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

### **Request Validation**

```tsx
// lib/api/validation.ts
import { z } from 'zod'

export const CreateUserSchema = z.object({
	email: z.string().email('Invalid email format'),
	name: z.string().min(1, 'Name is required').optional(),
	avatar: z.string().url('Invalid URL format').optional(),
})

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
	try {
		return schema.parse(data)
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(`Validation error: ${error.errors[0].message}`)
		}
		throw error
	}
}
```

## 📱 Client Integration

### **API Client Functions**

```tsx
// lib/api/users.ts
export async function getUsers(params?: {
	page?: number
	limit?: number
	search?: string
	role?: string
	isActive?: boolean
}): Promise<{ users: UserWithCounts[]; total: number; hasMore: boolean }> {
	const searchParams = new URLSearchParams()

	if (params?.page) searchParams.set('page', params.page.toString())
	if (params?.limit) searchParams.set('limit', params.limit.toString())
	if (params?.search) searchParams.set('search', params.search)
	if (params?.role) searchParams.set('role', params.role)
	if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString())

	const response = await fetch(`/api/users?${searchParams}`)

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.error || 'Failed to fetch users')
	}

	return response.json()
}

export async function createUser(data: CreateUserInput): Promise<User> {
	const response = await fetch('/api/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.error || 'Failed to create user')
	}

	return response.json()
}
```

## 📋 Best Practices

### **✅ Do's**

- Use proper HTTP status codes consistently
- Validate all inputs on the server side
- Include helpful error messages
- Use TypeScript for type safety
- Implement pagination for collections
- Log errors with context
- Use consistent naming conventions
- Return created resources with 201 status

### **❌ Don'ts**

- Don't expose sensitive data in error messages
- Don't trust client-side validation alone
- Don't use generic error messages
- Don't ignore HTTP status code conventions
- Don't return huge datasets without pagination
- Don't leak internal implementation details

### **🔒 Security**

- Always validate and sanitize inputs
- Use environment variables for sensitive data
- Implement rate limiting for public endpoints
- Don't expose stack traces in production
- Use HTTPS in production
- Validate content types

### **⚡ Performance**

- Implement efficient pagination
- Use database indexes for filtered fields
- Cache frequently accessed data
- Optimize database queries
- Use compression for large responses
- Implement request timeouts

## 📚 Related Documentation

- **[Database & Service Layer](../database/SERVICE_LAYER.md)** - Service implementation patterns
- **[Error Handling Patterns](../error-handling/PATTERNS.md)** - Comprehensive error handling
- **[Testing Strategy](../testing/STRATEGY.md)** - API testing patterns
- **[Architecture Overview](../architecture/OVERVIEW.md)** - System design context

---

Following these API design patterns ensures consistency across your application and provides an excellent developer experience for both internal and external API consumers.
