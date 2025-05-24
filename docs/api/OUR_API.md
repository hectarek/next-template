# 🌐 Our API Reference

This guide covers the **specific REST API endpoints** implemented in this Next.js template, including our Users API, patterns used, and how to extend them.

## 🎯 Current API Endpoints

Our template includes a complete Users API as a working example that you can study and extend.

### **Users API**

| Endpoint           | Method | Description                          | Example                                         |
| ------------------ | ------ | ------------------------------------ | ----------------------------------------------- |
| `/api/users`       | GET    | List users with pagination/filtering | `?page=1&limit=10&search=john`                  |
| `/api/users`       | POST   | Create new user                      | `{"email": "user@example.com", "name": "John"}` |
| `/api/users/[id]`  | GET    | Get specific user                    | `/api/users/cm123abc`                           |
| `/api/users/[id]`  | PATCH  | Update user                          | `{"name": "Updated Name"}`                      |
| `/api/users/[id]`  | DELETE | Delete user                          | `?hard=true` for permanent delete               |
| `/api/users/stats` | GET    | User statistics                      | Returns counts and metrics                      |
| `/api/health`      | GET    | Health check                         | Simple endpoint for monitoring                  |

## 📁 Our File Structure

```
app/api/
├── users/
│   ├── route.ts              # GET /api/users, POST /api/users
│   ├── [id]/
│   │   └── route.ts          # GET /api/users/[id], PATCH, DELETE
│   └── stats/
│       └── route.ts          # GET /api/users/stats
└── health/
    └── route.ts              # GET /api/health
```

## 🔧 Our Implementation Patterns

### **Query Parameters We Support**

#### **Pagination (all GET collection endpoints)**

```
GET /api/users?page=2&limit=20
```

#### **Filtering (users endpoint)**

```
GET /api/users?search=john&role=ADMIN&isActive=true
```

#### **Field Selection (users endpoint)**

```
GET /api/users/123?include=relations  # Include posts and comments
```

### **Response Format We Use**

#### **Single Resource**

```json
{
	"id": "cm123abc",
	"email": "user@example.com",
	"name": "John Doe",
	"role": "USER",
	"isActive": true,
	"createdAt": "2024-01-01T00:00:00Z",
	"updatedAt": "2024-01-01T00:00:00Z"
}
```

#### **Collection with Pagination**

```json
{
  "users": [...],
  "total": 150,
  "hasMore": true,
  "page": 1,
  "limit": 10
}
```

#### **Error Response**

```json
{
	"error": "User not found",
	"code": "RESOURCE_NOT_FOUND"
}
```

## 🧪 Testing Our API

### **Using curl**

```bash
# List users
curl http://localhost:3000/api/users

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Update user
curl -X PATCH http://localhost:3000/api/users/cm123abc \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete user (soft delete)
curl -X DELETE http://localhost:3000/api/users/cm123abc

# Get statistics
curl http://localhost:3000/api/users/stats
```

### **In Browser**

- **[User List](http://localhost:3000/api/users)** - See all users
- **[User Stats](http://localhost:3000/api/users/stats)** - View statistics
- **[Health Check](http://localhost:3000/api/health)** - API status

## 🔧 How We Handle Errors

### **Validation Errors (400)**

```json
{
	"error": "Email is required"
}
```

### **Not Found (404)**

```json
{
	"error": "User not found"
}
```

### **Server Errors (500)**

```json
{
	"error": "Internal server error"
}
```

## 🚀 Extending Our API

### **Adding New Endpoints**

1. **Create route file**: `app/api/posts/route.ts`
2. **Import service**: Use our service layer pattern
3. **Follow our patterns**: Copy from users API implementation

Example for Posts API:

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PostService } from '@/services/post.service'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '10')

		const result = await PostService.getMany({ page, limit })
		return NextResponse.json(result)
	} catch (error) {
		console.error('GET /api/posts error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const post = await PostService.create(body)
		return NextResponse.json(post, { status: 201 })
	} catch (error) {
		console.error('POST /api/posts error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
```

### **Adding New Service Layer**

```typescript
// services/post.service.ts
import { prisma } from '@/lib/prisma'

export class PostService {
	static async getMany(options: { page: number; limit: number }) {
		const offset = (options.page - 1) * options.limit

		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				skip: offset,
				take: options.limit,
				include: { author: true },
				orderBy: { createdAt: 'desc' },
			}),
			prisma.post.count(),
		])

		return {
			posts,
			total,
			hasMore: total > offset + posts.length,
			page: options.page,
			limit: options.limit,
		}
	}

	static async create(data: { title: string; content: string; authorId: string }) {
		return prisma.post.create({
			data,
			include: { author: true },
		})
	}
}
```

## 🎨 Client-Side Usage

### **Using Our API Client Functions**

We provide ready-to-use client functions in `lib/api/`:

```typescript
// In your components
import { getUsers, createUser, updateUser } from '@/lib/api/users'

// Fetch users
const users = await getUsers({ page: 1, limit: 10 })

// Create user
const newUser = await createUser({
	email: 'user@example.com',
	name: 'John Doe',
})

// Update user
const updatedUser = await updateUser('cm123abc', {
	name: 'Updated Name',
})
```

### **Error Handling in Components**

```typescript
'use client'
import { useState } from 'react'
import { createUser } from '@/lib/api/users'

export function UserForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError(null)

      await createUser({
        email: data.get('email') as string,
        name: data.get('name') as string
      })

      // Success handling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </form>
  )
}
```

## 📊 Available Demo

See our API in action:

- **[User Demo Page](http://localhost:3000/demo/users)** - Complete CRUD interface
- **[API Testing](http://localhost:3000/api/users)** - Direct API calls

## 📚 Next Steps

1. **Study our Users API**: Review `app/api/users/` implementation
2. **Extend with new endpoints**: Follow our patterns for new resources
3. **Add validation**: Use Zod schemas for request validation
4. **Add tests**: Create API tests in `tests/api/`

## 🔧 Troubleshooting

### **Common Issues**

**CORS errors in browser**:

```typescript
// Add to next.config.js if needed
async headers() {
  return [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' }
      ]
    }
  ]
}
```

**Database connection errors**:

```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
bunx prisma db pull
```

---

**Learn More**: For general API design concepts, see [API Design Concepts](./CONCEPTS.md). For implementation details, explore our working code in `app/api/` and `services/`.
