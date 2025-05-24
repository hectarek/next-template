# ⚡ Performance & Optimization

This guide covers performance optimization strategies across all layers of our Next.js application, from database queries to client-side rendering, ensuring excellent user experience and efficient resource usage.

> **New to performance optimization?** Start with [Web.dev Performance](https://web.dev/performance/) to understand the fundamentals, then explore [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing) for framework-specific optimizations.

## 🎯 Performance Philosophy

### 1. **Measure First**

Always measure before optimizing. Use data to guide optimization decisions. [Learn about performance measurement](https://web.dev/user-centric-performance-metrics/).

### 2. **Progressive Enhancement**

Build fast experiences that work for everyone, then enhance for capable devices. See [Progressive Enhancement Guide](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement).

### 3. **User-Centric Metrics**

Focus on metrics that directly impact user experience ([Core Web Vitals](https://web.dev/vitals/)).

### 4. **Sustainable Performance**

Implement optimizations that scale with application growth.

## 📊 Core Web Vitals

> **What are Core Web Vitals?** Google's essential metrics for measuring user experience on the web. [Learn more](https://web.dev/vitals/).

### **Target Metrics**

- **[Largest Contentful Paint (LCP)](https://web.dev/lcp/)**: < 2.5s - When main content loads
- **[First Input Delay (FID)](https://web.dev/fid/)**: < 100ms - How quickly page responds to interaction
- **[Cumulative Layout Shift (CLS)](https://web.dev/cls/)**: < 0.1 - How much page layout shifts

### **Measurement Tools**

```typescript
// lib/performance.ts
export function measureWebVitals() {
	if (typeof window !== 'undefined') {
		// ✅ Measure Core Web Vitals automatically
		import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
			getCLS(console.log) // Logs layout shift data
			getFID(console.log) // Logs input delay data
			getLCP(console.log) // Logs content load data
		})
	}
}

// app/layout.tsx
;('use client')
import { useEffect } from 'react'
import { measureWebVitals } from '@/lib/performance'

export default function PerformanceProvider({ children }) {
	useEffect(() => {
		measureWebVitals()
	}, [])

	return children
}
```

> **Additional Tools**: Use [Google PageSpeed Insights](https://pagespeed.web.dev/), [Lighthouse](https://developer.chrome.com/docs/lighthouse/), or [WebPageTest](https://www.webpagetest.org/) for detailed analysis.

## 🗄️ Database Performance

> **Database Optimization Basics**: Learn about [database indexing](https://use-the-index-luke.com/) and [SQL performance](https://sql-performance-explained.com/).

### **Query Optimization**

#### **1. Efficient Prisma Queries**

```typescript
// ❌ Bad - N+1 Query Problem (makes many database calls)
export async function getUsersWithPosts() {
	const users = await prisma.user.findMany()

	// This creates a separate query for each user!
	for (const user of users) {
		user.posts = await prisma.post.findMany({
			where: { authorId: user.id },
		})
	}

	return users
}

// ✅ Good - Single Query with Include (one database call)
export async function getUsersWithPosts() {
	return await prisma.user.findMany({
		include: {
			posts: {
				select: {
					id: true,
					title: true,
					createdAt: true,
				},
			},
			_count: {
				select: {
					posts: true,
					comments: true,
				},
			},
		},
	})
}
```

> **N+1 Problem Explained**: When you make 1 query to get a list, then N additional queries for related data. [Learn more about N+1 queries](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance#solving-n1-problems-with-include).

#### **2. Selective Field Loading**

```typescript
// services/user.service.ts
export class UserService {
	static async getMany(
		options: {
			fields?: ('posts' | 'comments' | 'counts')[]
			limit?: number
		} = {}
	) {
		const { fields = [], limit = 10 } = options

		return await prisma.user.findMany({
			take: limit,
			select: {
				// ✅ Always select only what you need
				id: true,
				email: true,
				name: true,
				avatar: true,
				createdAt: true,

				// ✅ Conditionally include related data based on needs
				posts: fields.includes('posts')
					? {
							select: {
								id: true,
								title: true,
								published: true,
							},
						}
					: false,
				comments: fields.includes('comments')
					? {
							select: {
								id: true,
								content: true,
								createdAt: true,
							},
						}
					: false,
				_count: fields.includes('counts')
					? {
							select: {
								posts: true,
								comments: true,
							},
						}
					: false,
			},
		})
	}
}
```

#### **3. Database Indexes**

```prisma
// prisma/schema.prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String?
  isActive Boolean  @default(true)
  role     Role     @default(USER)
  createdAt DateTime @default(now())

  // ✅ Indexes for common query patterns
  @@index([isActive])        // Filter by active status
  @@index([role])           // Filter by user role
  @@index([createdAt])      // Sort by creation date
  @@index([isActive, role]) // Combined filter (composite index)
  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())

  author User @relation(fields: [authorId], references: [id])

  // ✅ Indexes for filtering and sorting
  @@index([published])              // Published posts only
  @@index([authorId])              // Posts by author
  @@index([createdAt])             // Sort by date
  @@index([published, createdAt])  // Published posts by date
  @@map("posts")
}
```

> **Index Guidelines**: Add indexes for fields you filter, sort, or join on frequently. But don't over-index as it slows down writes. [Learn about database indexes](https://use-the-index-luke.com/).

#### **4. Connection Pooling**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	})

// ✅ Connection pooling configuration in DATABASE_URL
// postgresql://user:password@localhost:5432/db?connection_limit=20&pool_timeout=20
```

> **Connection Pooling**: Reuses database connections instead of creating new ones for each request. [Learn about Prisma connection pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management).

## 🌐 API Performance

### **1. Response Optimization**

#### **Efficient Pagination**

```typescript
// app/api/users/route.ts
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)

	// ✅ Validate and limit pagination parameters
	const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
	const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
	const offset = (page - 1) * limit

	// ✅ Parallel queries for data and count (faster than sequential)
	const [users, total] = await Promise.all([UserService.getMany({ page, limit }), UserService.count()])

	return NextResponse.json({
		users,
		pagination: {
			page,
			limit,
			total,
			hasMore: total > offset + users.length,
			totalPages: Math.ceil(total / limit),
		},
	})
}
```

#### **Response Compression**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const response = NextResponse.next()

	// ✅ Enable compression for API routes (reduces response size)
	if (request.nextUrl.pathname.startsWith('/api/')) {
		response.headers.set('Content-Encoding', 'gzip')
		response.headers.set('Vary', 'Accept-Encoding')
	}

	return response
}
```

### **2. Caching Strategies**

> **Caching Fundamentals**: Learn about [HTTP caching](https://web.dev/http-cache/) and [caching strategies](https://web.dev/offline-cookbook/).

#### **Server-Side Caching**

```typescript
// lib/cache.ts
interface CacheItem<T> {
	data: T
	timestamp: number
	ttl: number // Time to live in milliseconds
}

class SimpleCache {
	private cache = new Map<string, CacheItem<any>>()

	set<T>(key: string, data: T, ttl = 300000): void {
		// 5 min default TTL
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		})
	}

	get<T>(key: string): T | null {
		const item = this.cache.get(key)

		if (!item) return null

		// ✅ Check if cache item has expired
		if (Date.now() - item.timestamp > item.ttl) {
			this.cache.delete(key)
			return null
		}

		return item.data
	}

	clear(): void {
		this.cache.clear()
	}
}

export const cache = new SimpleCache()

// Usage in service layer
export class UserService {
	static async getStats(): Promise<UserStats> {
		const cacheKey = 'user-stats'
		const cached = cache.get<UserStats>(cacheKey)

		if (cached) return cached

		const stats = await this.calculateStats()
		cache.set(cacheKey, stats, 300000) // Cache for 5 minutes

		return stats
	}
}
```

#### **HTTP Caching Headers**

```typescript
// app/api/users/stats/route.ts
export async function GET() {
	const stats = await UserService.getStats()

	return NextResponse.json(stats, {
		headers: {
			// ✅ Cache for 5 minutes publicly, 10 minutes stale-while-revalidate
			'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
			'CDN-Cache-Control': 'public, s-maxage=300',
			Vary: 'Accept-Encoding',
		},
	})
}
```

> **Cache Headers Explained**: `s-maxage` sets cache time, `stale-while-revalidate` serves stale content while fetching fresh data. [Learn about Cache-Control](https://web.dev/http-cache/#cache-control).

## ⚛️ Client-Side Performance

### **1. Component Optimization**

#### **Memoization**

> **What is Memoization?** Caching expensive calculations so they don't run on every render. [Learn about React.memo](https://react.dev/reference/react/memo).

```tsx
// components/example/user-list.tsx
'use client'

import { memo, useMemo, useCallback } from 'react'

interface User {
	id: string
	name: string
	email: string
	isActive: boolean
}

// ✅ Memoize expensive filtering logic
function useFilteredUsers(users: User[], searchTerm: string, activeOnly: boolean) {
	return useMemo(() => {
		return users.filter(user => {
			const matchesSearch =
				!searchTerm ||
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase())

			const matchesActive = !activeOnly || user.isActive

			return matchesSearch && matchesActive
		})
	}, [users, searchTerm, activeOnly]) // Only recalculate when these change
}

// ✅ Memoize components to prevent unnecessary re-renders
const UserCard = memo(function UserCard({ user, onEdit }: { user: User; onEdit: (id: string) => void }) {
	// ✅ Memoize callback to prevent child re-renders
	const handleEdit = useCallback(() => {
		onEdit(user.id)
	}, [user.id, onEdit])

	return (
		<div className="p-4 border rounded">
			<h3>{user.name}</h3>
			<p>{user.email}</p>
			<button onClick={handleEdit}>Edit</button>
		</div>
	)
})

export function UserList({ users }: { users: User[] }) {
	const [searchTerm, setSearchTerm] = useState('')
	const [activeOnly, setActiveOnly] = useState(false)

	const filteredUsers = useFilteredUsers(users, searchTerm, activeOnly)

	const handleUserEdit = useCallback((id: string) => {
		// Handle edit logic
	}, [])

	return (
		<div>
			<input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search users..." />

			{filteredUsers.map(user => (
				<UserCard key={user.id} user={user} onEdit={handleUserEdit} />
			))}
		</div>
	)
}
```

#### **Virtual Scrolling for Large Lists**

> **Virtual Scrolling**: Only renders visible items in long lists, improving performance with thousands of items. [Learn more](https://web.dev/virtualize-long-lists-react-window/).

```tsx
// components/virtual-user-list.tsx
'use client'

import { FixedSizeList as List } from 'react-window'

interface VirtualUserListProps {
	users: User[]
	height: number
}

// ✅ Individual row component (only visible rows are rendered)
function UserRow({ index, style, data }: { index: number; style: React.CSSProperties; data: User[] }) {
	const user = data[index]

	return (
		<div style={style} className="flex items-center p-4 border-b">
			<div>
				<h3 className="font-semibold">{user.name}</h3>
				<p className="text-gray-600">{user.email}</p>
			</div>
		</div>
	)
}

export function VirtualUserList({ users, height }: VirtualUserListProps) {
	return (
		<List
			height={height}
			itemCount={users.length}
			itemSize={80} // Height of each item
			itemData={users}
		>
			{UserRow}
		</List>
	)
}
```

### **2. Bundle Optimization**

#### **Dynamic Imports**

> **Code Splitting**: Load JavaScript only when needed, reducing initial bundle size. [Learn about code splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading).

```tsx
// components/dashboard.tsx
'use client'

import { lazy, Suspense } from 'react'

// ✅ Lazy load heavy components (not loaded until used)
const UserAnalytics = lazy(() => import('./user-analytics'))
const UserCharts = lazy(() => import('./user-charts'))

export function Dashboard() {
	const [activeTab, setActiveTab] = useState('overview')

	return (
		<div>
			<nav>
				<button onClick={() => setActiveTab('overview')}>Overview</button>
				<button onClick={() => setActiveTab('analytics')}>Analytics</button>
				<button onClick={() => setActiveTab('charts')}>Charts</button>
			</nav>

			{/* ✅ Only load analytics component when tab is active */}
			{activeTab === 'analytics' && (
				<Suspense fallback={<div>Loading analytics...</div>}>
					<UserAnalytics />
				</Suspense>
			)}

			{/* ✅ Only load charts component when tab is active */}
			{activeTab === 'charts' && (
				<Suspense fallback={<div>Loading charts...</div>}>
					<UserCharts />
				</Suspense>
			)}
		</div>
	)
}
```

#### **Image Optimization**

> **Image Optimization**: Automatically optimize images for different screen sizes and formats. [Learn about Next.js Image](https://nextjs.org/docs/app/api-reference/components/image).

```tsx
// components/user-avatar.tsx
import Image from 'next/image'

interface UserAvatarProps {
	user: {
		name: string
		avatar?: string
	}
	size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
	sm: 32,
	md: 48,
	lg: 64,
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
	const dimensions = sizeMap[size]

	return (
		<div className="relative">
			{user.avatar ? (
				<Image
					src={user.avatar}
					alt={`${user.name} avatar`}
					width={dimensions}
					height={dimensions}
					className="rounded-full"
					priority={size === 'lg'} // ✅ Prioritize important images
					placeholder="blur" // ✅ Show blur while loading
					blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHR4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7UTVDNlJeILvTHK..."
				/>
			) : (
				// ✅ Fallback for users without avatars
				<div
					className="rounded-full bg-gray-300 flex items-center justify-center text-gray-600"
					style={{ width: dimensions, height: dimensions }}
				>
					{user.name.charAt(0).toUpperCase()}
				</div>
			)}
		</div>
	)
}
```

## 🚀 Server Performance

### **1. Next.js Optimizations**

#### **Static Generation**

> **Static Generation**: Pre-render pages at build time for maximum performance. [Learn about Static Generation](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default).

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // ✅ Pre-generate common blog posts at build time
  const posts = await getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
  }
}

// ✅ This page will be statically generated at build time
export default async function BlogPost({ params }: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

#### **Streaming & Suspense**

> **Streaming**: Send HTML to browser progressively as it's ready. [Learn about Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming).

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

// ✅ Fast component renders immediately
function QuickStats() {
	return (
		<div className="grid grid-cols-3 gap-4">
			<div>Total Users: 1,234</div>
			{/* Other quick stats */}
		</div>
	)
}

// ✅ Slow component streams in when ready (doesn't block fast content)
async function DetailedAnalytics() {
	await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate slow query
	const analytics = await getDetailedAnalytics()

	return <div>{/* Complex analytics data */}</div>
}

export default function Dashboard() {
	return (
		<div>
			{/* ✅ Shows immediately */}
			<QuickStats />

			{/* ✅ Shows loading state, then streams in content when ready */}
			<Suspense fallback={<div>Loading detailed analytics...</div>}>
				<DetailedAnalytics />
			</Suspense>
		</div>
	)
}
```

### **2. Error Boundary Performance**

```tsx
// components/performance-error-boundary.tsx
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	errorId?: string
}

export class PerformanceErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			errorId: Math.random().toString(36),
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// ✅ Log performance impact of errors for monitoring
		console.error('Performance Error:', {
			error: error.message,
			componentStack: errorInfo.componentStack,
			timestamp: Date.now(),
			userAgent: navigator.userAgent,
			url: window.location.href,
		})
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="p-4 border border-red-200 bg-red-50 rounded">
						<p>Something went wrong. Please refresh the page.</p>
						<button
							onClick={() => this.setState({ hasError: false })}
							className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
						>
							Retry
						</button>
					</div>
				)
			)
		}

		return this.props.children
	}
}
```

## 📈 Performance Monitoring

### **1. Real User Monitoring (RUM)**

> **RUM vs Synthetic**: RUM measures real user experiences, synthetic testing measures lab conditions. Both are important. [Learn about RUM](https://web.dev/user-centric-performance-metrics/).

```typescript
// lib/performance-monitoring.ts
interface PerformanceMetric {
	name: string
	value: number
	timestamp: number
	url: string
	userAgent: string
}

class PerformanceMonitor {
	private metrics: PerformanceMetric[] = []

	recordMetric(name: string, value: number) {
		const metric: PerformanceMetric = {
			name,
			value,
			timestamp: Date.now(),
			url: window.location.href,
			userAgent: navigator.userAgent,
		}

		this.metrics.push(metric)

		// ✅ Send to analytics service (e.g., Google Analytics, DataDog)
		this.sendMetric(metric)
	}

	private async sendMetric(metric: PerformanceMetric) {
		try {
			await fetch('/api/analytics/performance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(metric),
			})
		} catch (error) {
			console.error('Failed to send performance metric:', error)
		}
	}

	// ✅ Automatically measure API call performance
	measureApiCall<T>(promise: Promise<T>, endpoint: string): Promise<T> {
		const start = performance.now()

		return promise
			.then(result => {
				const duration = performance.now() - start
				this.recordMetric(`api.${endpoint}`, duration)
				return result
			})
			.catch(error => {
				const duration = performance.now() - start
				this.recordMetric(`api.${endpoint}.error`, duration)
				throw error
			})
	}
}

export const performanceMonitor = new PerformanceMonitor()

// Usage in API client
export async function getUsers(): Promise<User[]> {
	return performanceMonitor.measureApiCall(
		fetch('/api/users').then(res => res.json()),
		'users'
	)
}
```

### **2. Performance Dashboard**

```tsx
// components/performance-dashboard.tsx
'use client'

import { useState, useEffect } from 'react'

interface PerformanceData {
	avgResponseTime: number
	errorRate: number
	throughput: number
	activeUsers: number
}

export function PerformanceDashboard() {
	const [data, setData] = useState<PerformanceData | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/api/performance/metrics')
				const metrics = await response.json()
				setData(metrics)
			} catch (error) {
				console.error('Failed to fetch performance data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
		const interval = setInterval(fetchData, 30000) // Update every 30s

		return () => clearInterval(interval)
	}, [])

	if (isLoading) {
		return <div>Loading performance metrics...</div>
	}

	if (!data) {
		return <div>Failed to load performance data</div>
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div className="p-4 border rounded">
				<h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
				<p className="text-2xl font-bold">{data.avgResponseTime}ms</p>
			</div>
			<div className="p-4 border rounded">
				<h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
				<p className="text-2xl font-bold">{(data.errorRate * 100).toFixed(1)}%</p>
			</div>
			<div className="p-4 border rounded">
				<h3 className="text-sm font-medium text-gray-500">Throughput</h3>
				<p className="text-2xl font-bold">{data.throughput}/min</p>
			</div>
			<div className="p-4 border rounded">
				<h3 className="text-sm font-medium text-gray-500">Active Users</h3>
				<p className="text-2xl font-bold">{data.activeUsers}</p>
			</div>
		</div>
	)
}
```

## 📋 Performance Checklist

### **✅ Database Optimization**

- [ ] Use appropriate indexes for frequently queried fields
- [ ] Implement efficient pagination patterns
- [ ] Avoid N+1 query problems with includes/joins
- [ ] Use selective field loading (don't fetch unnecessary data)
- [ ] Configure connection pooling for production

### **✅ API Optimization**

- [ ] Implement response compression (gzip)
- [ ] Use appropriate HTTP caching headers
- [ ] Optimize JSON payload size (remove unused fields)
- [ ] Implement rate limiting to prevent abuse
- [ ] Use parallel processing where possible

### **✅ Client Optimization**

- [ ] Use React.memo for expensive components
- [ ] Implement virtual scrolling for large lists (100+ items)
- [ ] Optimize images with Next.js Image component
- [ ] Use dynamic imports for code splitting
- [ ] Monitor and minimize bundle size

### **✅ Server Optimization**

- [ ] Use Server Components by default
- [ ] Implement streaming with Suspense for slow operations
- [ ] Use static generation where possible
- [ ] Optimize server-side caching strategies
- [ ] Monitor performance metrics and Core Web Vitals

### **✅ General Best Practices**

- [ ] Measure performance regularly with real user data
- [ ] Set performance budgets (e.g., bundle size limits)
- [ ] Monitor Core Web Vitals in production
- [ ] Test on various devices and network conditions
- [ ] Implement error boundaries for graceful failures

## 🔍 Performance Testing

### **Load Testing**

> **Load Testing**: Simulate many users to test how your app performs under stress. [Learn about load testing](https://web.dev/performance-budgets-101/).

```bash
# Using artillery for API load testing
npm install -g artillery

# Create artillery config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60      # Test for 60 seconds
      arrivalRate: 10   # 10 new users per second
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/users"
      - post:
          url: "/api/users"
          json:
            email: "test{{ \$randomInt(1, 1000) }}@example.com"
            name: "Test User {{ \$randomInt(1, 1000) }}"
EOF

# Run load test
artillery run load-test.yml
```

### **Bundle Analysis**

```bash
# Install bundle analyzer
npm install -g @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your Next.js config
})

# Generate bundle analysis report
ANALYZE=true npm run build
```

## 📚 Related Documentation & Resources

### **Our Documentation**

- **[Architecture Overview](../architecture/OVERVIEW.md)** - System design context
- **[Client vs Server Components](../architecture/RENDERING_PATTERNS.md)** - Rendering optimization
- **[Database & Service Layer](../database/SERVICE_LAYER.md)** - Database optimization
- **[Testing Strategy](../testing/STRATEGY.md)** - Performance testing

### **External Resources**

- **[Web.dev Performance](https://web.dev/performance/)** - Comprehensive performance guide
- **[Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)** - Framework-specific optimizations
- **[Core Web Vitals](https://web.dev/vitals/)** - Essential performance metrics
- **[React Performance](https://react.dev/learn/render-and-commit)** - React-specific optimizations
- **[Database Performance](https://use-the-index-luke.com/)** - SQL and database optimization

### **Tools & Resources**

- **[Lighthouse](https://developer.chrome.com/docs/lighthouse/)** - Performance auditing tool
- **[WebPageTest](https://www.webpagetest.org/)** - Real-world performance testing
- **[Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)** - Analyze JavaScript bundles
- **[React Profiler](https://react.dev/reference/react/Profiler)** - Profile React component performance

---

Performance optimization is an ongoing process. Regular monitoring, measurement, and optimization ensure your application delivers excellent user experience at scale.

**Next Steps**: Start by measuring your current performance with Lighthouse, then implement the optimizations most relevant to your bottlenecks!
