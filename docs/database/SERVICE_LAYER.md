# 🗄️ Database & Service Layer

This guide covers our database architecture using Prisma ORM, service layer patterns, and data access strategies. The service layer provides a clean abstraction between your API routes and database operations.

## 🎯 Design Principles

### 1. **Single Responsibility**

Each service class handles operations for one entity or domain.

### 2. **Type Safety**

Full TypeScript integration from database schema to service methods.

### 3. **Business Logic Centralization**

All business rules and validations are contained within service methods.

### 4. **Database Abstraction**

Services provide a clean interface that hides Prisma implementation details.

### 5. **Error Handling**

Consistent error handling and meaningful error messages across all operations.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
├─────────────────────────────────────────────────────────┤
│  ┌─── UserService      ├─── PostService                 │
│  ├─── Business Logic   ├─── Validation                  │
│  ├─── Error Handling   ├─── Data Transformation       │
│  └─── Type Definitions └─── Complex Operations          │
├─────────────────────────────────────────────────────────┤
│                    Prisma ORM                           │
├─────────────────────────────────────────────────────────┤
│  ┌─── Generated Client ├─── Type Safety                 │
│  ├─── Query Builder    ├─── Migrations                  │
│  └─── Connection Pool  └─── Schema Management           │
├─────────────────────────────────────────────────────────┤
│                   PostgreSQL                            │
└─────────────────────────────────────────────────────────┘
```

## 📊 Database Schema Design

### **Schema Definition** (`prisma/schema.prisma`)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts    Post[]
  comments Comment[]

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@map("posts")
}

model Comment {
  id       String   @id @default(cuid())
  content  String
  postId   String
  authorId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("comments")
}

enum Role {
  USER
  MODERATOR
  ADMIN
}
```

### **Database Connection** (`lib/prisma.ts`)

```tsx
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 🔧 Service Layer Implementation

### **User Service** (`services/user.service.ts`)

```tsx
import { Prisma, User, Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// Type definitions for service layer
export interface CreateUserInput {
	email: string
	name?: string
	avatar?: string
}

export interface UpdateUserInput {
	email?: string
	name?: string
	avatar?: string
	role?: Role
	isActive?: boolean
	metadata?: Record<string, any>
}

export interface GetManyUsersInput {
	page?: number
	limit?: number
	search?: string
	role?: Role
	isActive?: boolean
}

export interface UserWithCounts extends User {
	_count: {
		posts: number
		comments: number
	}
}

export class UserService {
	/**
	 * Create a new user
	 */
	static async create(data: CreateUserInput): Promise<User> {
		try {
			return await prisma.user.create({
				data,
			})
		} catch (error) {
			// Handle Prisma-specific errors
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new Error('A user with this email already exists')
				}
			}
			throw error
		}
	}

	/**
	 * Get user by ID
	 */
	static async getById(id: string, includeRelations = false): Promise<User | null> {
		const include = includeRelations
			? {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				}
			: undefined

		return await prisma.user.findUnique({
			where: { id },
			include,
		})
	}

	/**
	 * Get user by email
	 */
	static async getByEmail(email: string): Promise<User | null> {
		return await prisma.user.findUnique({
			where: { email },
		})
	}

	/**
	 * Get multiple users with filtering and pagination
	 */
	static async getMany(options: GetManyUsersInput = {}): Promise<{
		users: UserWithCounts[]
		total: number
		hasMore: boolean
	}> {
		const { page = 1, limit = 10, search, role, isActive } = options

		// Build where clause
		const where: Prisma.UserWhereInput = {}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ email: { contains: search, mode: 'insensitive' } },
			]
		}

		if (role) {
			where.role = role
		}

		if (isActive !== undefined) {
			where.isActive = isActive
		}

		// Calculate pagination
		const skip = (page - 1) * limit
		const take = limit

		// Execute queries in parallel
		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
				take,
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			}) as Promise<UserWithCounts[]>,
			prisma.user.count({ where }),
		])

		const hasMore = total > skip + users.length

		return {
			users,
			total,
			hasMore,
		}
	}

	/**
	 * Update user by ID
	 */
	static async update(id: string, data: UpdateUserInput): Promise<User> {
		try {
			return await prisma.user.update({
				where: { id },
				data,
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new Error('User not found')
				}
			}
			throw error
		}
	}

	/**
	 * Delete user (soft delete by default)
	 */
	static async delete(id: string, soft = true): Promise<User> {
		try {
			if (soft) {
				// Soft delete - mark as inactive
				return await prisma.user.update({
					where: { id },
					data: { isActive: false },
				})
			} else {
				// Hard delete
				return await prisma.user.delete({
					where: { id },
				})
			}
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new Error('User not found')
				}
			}
			throw error
		}
	}

	/**
	 * Get user statistics
	 */
	static async getStats(): Promise<{
		totalUsers: number
		activeUsers: number
		newUsersThisMonth: number
	}> {
		const now = new Date()
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

		const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
			prisma.user.count(),
			prisma.user.count({
				where: { isActive: true },
			}),
			prisma.user.count({
				where: { createdAt: { gte: startOfMonth } },
			}),
		])

		return {
			totalUsers,
			activeUsers,
			newUsersThisMonth,
		}
	}

	/**
	 * Bulk operations
	 */
	static async createMany(users: CreateUserInput[]): Promise<{ count: number }> {
		return await prisma.user.createMany({
			data: users,
			skipDuplicates: true,
		})
	}

	/**
	 * Advanced search with full-text search
	 */
	static async search(query: string, limit = 10): Promise<UserWithCounts[]> {
		return (await prisma.user.findMany({
			where: {
				OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }],
				isActive: true,
			},
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				_count: {
					select: {
						posts: true,
						comments: true,
					},
				},
			},
		})) as UserWithCounts[]
	}
}
```

## 🔄 Advanced Patterns

### **1. Transaction Management**

```tsx
// services/user.service.ts
static async createUserWithProfile(
  userData: CreateUserInput,
  profileData: any
): Promise<User> {
  return await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: userData,
    })

    // Create associated profile
    await tx.profile.create({
      data: {
        ...profileData,
        userId: user.id,
      },
    })

    return user
  })
}
```

### **2. Complex Queries with Raw SQL**

```tsx
static async getUsersWithComplexStats(): Promise<any[]> {
  return await prisma.$queryRaw`
    SELECT
      u.*,
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT c.id) as comment_count,
      AVG(p.views) as avg_post_views
    FROM users u
    LEFT JOIN posts p ON u.id = p.author_id
    LEFT JOIN comments c ON u.id = c.author_id
    WHERE u.is_active = true
    GROUP BY u.id
    ORDER BY post_count DESC
    LIMIT 10
  `
}
```

### **3. Optimistic Concurrency Control**

```tsx
static async updateUserWithVersion(
  id: string,
  data: UpdateUserInput,
  version: number
): Promise<User> {
  try {
    return await prisma.user.update({
      where: {
        id,
        version, // Ensure version hasn't changed
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('User was modified by another process')
      }
    }
    throw error
  }
}
```

### **4. Soft Delete with Restore**

```tsx
static async restoreUser(id: string): Promise<User> {
  return await prisma.user.update({
    where: { id },
    data: {
      isActive: true,
      deletedAt: null
    },
  })
}

static async permanentlyDelete(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Delete related records first
    await tx.comment.deleteMany({ where: { authorId: id } })
    await tx.post.deleteMany({ where: { authorId: id } })

    // Delete user
    await tx.user.delete({ where: { id } })
  })
}
```

## 🚀 Database Migrations

### **Migration Workflow**

```bash
# Generate migration after schema changes
bun run db:migrate:dev

# Reset database (development only)
bun run db:reset

# Deploy migrations to production
bun run db:migrate:deploy

# Generate Prisma client
bun run db:generate
```

### **Seed Data** (`prisma/seed.ts`)

```tsx
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	// Create admin user
	const admin = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			email: 'admin@example.com',
			name: 'Admin User',
			role: Role.ADMIN,
			avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
		},
	})

	// Create sample users
	const users = await Promise.all([
		prisma.user.upsert({
			where: { email: 'john@example.com' },
			update: {},
			create: {
				email: 'john@example.com',
				name: 'John Doe',
				role: Role.USER,
			},
		}),
		prisma.user.upsert({
			where: { email: 'jane@example.com' },
			update: {},
			create: {
				email: 'jane@example.com',
				name: 'Jane Smith',
				role: Role.MODERATOR,
			},
		}),
	])

	// Create sample posts
	for (const user of users) {
		await prisma.post.create({
			data: {
				title: `Sample Post by ${user.name}`,
				content: 'This is a sample post content.',
				published: true,
				authorId: user.id,
			},
		})
	}

	console.log('Database seeded successfully')
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
```

## 📋 Best Practices

### **✅ Service Layer Do's**

- Keep service methods focused on single responsibilities
- Use descriptive method names that explain the business operation
- Handle errors at the service layer with meaningful messages
- Use TypeScript interfaces for all input/output types
- Implement proper validation before database operations
- Use transactions for multi-step operations
- Include comprehensive JSDoc comments

### **❌ Service Layer Don'ts**

- Don't expose Prisma client directly to other layers
- Don't put business logic in API routes
- Don't ignore error handling
- Don't return Prisma errors directly to clients
- Don't perform database operations outside services
- Don't create overly complex service methods

### **🗄️ Database Best Practices**

- Use appropriate indexes for frequently queried fields
- Implement proper foreign key constraints
- Use enum types for limited value sets
- Design normalized schemas to avoid data duplication
- Use meaningful table and column names
- Implement soft deletes for important data
- Use database-level defaults where appropriate

### **⚡ Performance Optimization**

- Use `select` to limit returned fields when possible
- Implement pagination for large datasets
- Use parallel queries with `Promise.all()` when safe
- Consider database indexes for filter fields
- Use connection pooling in production
- Monitor query performance with Prisma metrics

## 🔍 Debugging & Monitoring

### **Query Logging**

```tsx
// Enable query logging in development
const prisma = new PrismaClient({
	log: ['query', 'info', 'warn', 'error'],
})
```

### **Query Analysis**

```tsx
// Use Prisma's explain functionality
const query = prisma.user.findMany({
	where: { isActive: true },
	include: { _count: true },
})

// Log the generated SQL
console.log(await query.toString())
```

## 🧪 Testing Services

### **Service Testing Example**

```tsx
// tests/services/user.service.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { UserService } from '@/services/user.service'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
	prisma: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			count: vi.fn(),
		},
	},
}))

describe('UserService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('creates a user successfully', async () => {
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
})
```

## 📚 Related Documentation

- **[API Design Patterns](../api/DESIGN_PATTERNS.md)** - How services integrate with API routes
- **[Testing Strategy](../testing/STRATEGY.md)** - Testing service layer patterns
- **[Error Handling Patterns](../error-handling/PATTERNS.md)** - Service-level error handling
- **[Architecture Overview](../architecture/OVERVIEW.md)** - How services fit in the overall architecture

---

This service layer approach provides a robust foundation for data operations while maintaining clean separation of concerns and excellent developer experience.
