# ⚡ Client vs Server Components - Rendering Patterns

This guide covers the strategic use of Next.js App Router's Server and Client Components, helping you choose the right rendering pattern for optimal performance and user experience.

> **New to Next.js?** Read the [official Server Components guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components) first to understand the basics.

## 🎯 Rendering Strategy Philosophy

### 1. **Server-First Approach**

Default to Server Components and only use Client Components when interactive features are needed. This follows Next.js [best practices](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#when-to-use-server-and-client-components).

### 2. **Performance by Default**

Minimize client-side JavaScript while maximizing initial page load performance. Learn more about [Core Web Vitals](https://web.dev/vitals/).

### 3. **Progressive Enhancement**

Build experiences that work without JavaScript and enhance with interactivity. See the [MDN Progressive Enhancement guide](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement).

### 4. **Clear Boundaries**

Establish explicit boundaries between server and client rendering contexts.

## 🏗️ Component Types Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Server Components (Default)    │  Client Components        │
│  ┌─── Static Rendering          │  ┌─── Interactive UI      │
│  ├─── Data Fetching             │  ├─── Event Handlers     │
│  ├─── SEO Optimization          │  ├─── State Management   │
│  ├─── Security (No Client JS)   │  ├─── Browser APIs       │
│  └─── Direct Database Access    │  └─── Real-time Updates  │
└─────────────────────────────────────────────────────────────┘
```

## 🖥️ Server Components

> **What are Server Components?** Components that render on the server and send HTML to the client. They don't run in the browser. [Learn more](https://react.dev/reference/rsc/server-components).

### **When to Use Server Components**

- Static content display (text, images, layouts)
- Initial data fetching from databases or APIs
- SEO-critical pages (blog posts, product pages)
- Security-sensitive operations (API keys, database queries)
- Component composition and layouts

### **Advantages**

- **Zero Client Bundle**: No JavaScript sent to client = faster page loads
- **Better Performance**: Faster initial page loads and better [Largest Contentful Paint (LCP)](https://web.dev/lcp/)
- **SEO Friendly**: Fully rendered HTML for search engine crawlers
- **Security**: Database queries and API keys stay on server
- **Caching**: Effective server-side and [CDN caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#caching-data)

### **Limitations**

- No event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- No browser APIs (`localStorage`, `window`, `navigator`, etc.)
- No React hooks (`useState`, `useEffect`, `useRef`, etc.)
- No real-time updates or client-side interactivity

### **Server Component Examples**

#### **1. Data Display Component**

```tsx
// app/users/components/user-list-server.tsx
import { UserService } from '@/services/user.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ✅ Server Component - fetches data directly on the server
export default async function UserListServer() {
	// Direct service call - no API overhead, runs on server
	const { users } = await UserService.getMany({ limit: 10 })

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Recent Users</h2>
			{users.map(user => (
				<Card key={user.id}>
					<CardHeader>
						<CardTitle>{user.name || user.email}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600">{user.email}</p>
						<p className="text-sm text-gray-500">Joined {user.createdAt.toLocaleDateString()}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
```

#### **2. Layout Component**

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

// ✅ Server Component - perfect for layouts and static content
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Header />
				<main className="min-h-screen">{children}</main>
				<Footer />
			</body>
		</html>
	)
}
```

#### **3. SEO-Optimized Page**

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
	params: { slug: string }
}

// Generate metadata for SEO (runs on server)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const post = await getPost(params.slug)

	if (!post) {
		return {
			title: 'Post Not Found',
		}
	}

	return {
		title: post.title,
		description: post.excerpt,
		openGraph: {
			title: post.title,
			description: post.excerpt,
			images: [post.featuredImage],
		},
	}
}

// ✅ Server Component with optimal SEO - fully rendered HTML
export default async function BlogPost({ params }: Props) {
	const post = await getPost(params.slug)

	if (!post) {
		notFound() // Next.js built-in 404 handling
	}

	return (
		<article className="max-w-4xl mx-auto px-4 py-8">
			<header>
				<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
				<time className="text-gray-600">{post.publishedAt}</time>
			</header>
			<div className="prose prose-lg mt-8">{post.content}</div>
		</article>
	)
}
```

## 💻 Client Components

> **What are Client Components?** Components that run in the browser and can use React hooks, event handlers, and browser APIs. Mark them with `'use client'` directive. [Learn more](https://nextjs.org/docs/app/building-your-application/rendering/client-components).

### **When to Use Client Components**

- User interactions (forms, buttons, dropdowns)
- State management ([useState](https://react.dev/reference/react/useState), [useReducer](https://react.dev/reference/react/useReducer))
- Event handlers (click, submit, change events)
- Browser APIs (localStorage, geolocation, notifications)
- Real-time features (WebSockets, polling)
- Third-party libraries requiring browser environment

### **Advantages**

- **Full Interactivity**: Complete React functionality and hooks
- **Real-time Updates**: Live data and WebSocket connections
- **Rich UX**: Complex user interactions and animations
- **Browser Integration**: Access to [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

### **Trade-offs**

- **Bundle Size**: JavaScript sent to client increases page weight
- **Initial Load**: Slower first paint due to hydration
- **SEO Challenges**: Content not in initial HTML (though Next.js helps with SSR)
- **Complexity**: [Hydration](https://nextjs.org/docs/app/building-your-application/rendering/client-components#how-are-client-components-rendered) and state synchronization

### **Client Component Examples**

#### **1. Interactive Form**

```tsx
// components/example/user-form.tsx
'use client' // ⚠️ Required directive for Client Components

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createUser } from '@/lib/api/users'

export function UserForm() {
	// ✅ useState works in Client Components
	const [formData, setFormData] = useState({
		email: '',
		name: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	// ✅ Event handlers work in Client Components
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError('')

		try {
			await createUser(formData)
			setFormData({ email: '', name: '' }) // Reset form
			// You could add a success toast here
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create user')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				type="email"
				placeholder="Email"
				value={formData.email}
				onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
				disabled={isLoading}
				required
			/>
			<Input
				type="text"
				placeholder="Name"
				value={formData.name}
				onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
				disabled={isLoading}
			/>
			{error && <p className="text-red-600 text-sm">{error}</p>}
			<Button type="submit" disabled={isLoading}>
				{isLoading ? 'Creating...' : 'Create User'}
			</Button>
		</form>
	)
}
```

#### **2. Real-time Data Component**

```tsx
// components/example/live-user-count.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LiveUserCount() {
	const [count, setCount] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchCount = async () => {
			try {
				const response = await fetch('/api/users/stats')
				const data = await response.json()
				setCount(data.totalUsers)
			} catch (error) {
				console.error('Failed to fetch user count:', error)
			} finally {
				setIsLoading(false)
			}
		}

		// Initial fetch
		fetchCount()

		// ✅ Set up polling for real-time updates
		const interval = setInterval(fetchCount, 30000) // Every 30 seconds

		// ✅ Cleanup function - important for preventing memory leaks
		return () => clearInterval(interval)
	}, [])

	return (
		<Card>
			<CardHeader>
				<CardTitle>Live User Count</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="animate-pulse">Loading...</div>
				) : (
					<p className="text-2xl font-bold text-blue-600">{count?.toLocaleString()} users</p>
				)}
			</CardContent>
		</Card>
	)
}
```

## 🔄 Composition Patterns

> **Key Concept**: Server Components can import and render Client Components, but Client Components cannot import Server Components. [Learn about composition patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns).

### **1. Server Component Composing Client Components**

```tsx
// app/dashboard/page.tsx (Server Component)
import { UserService } from '@/services/user.service'
import { UserForm } from '@/components/example/user-form' // Client Component
import { LiveUserCount } from '@/components/example/live-user-count' // Client Component

export default async function DashboardPage() {
	// ✅ Server-side data fetching - fast and secure
	const { users } = await UserService.getMany({ limit: 5 })

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* ✅ Server-rendered static content - fast initial load */}
			<div>
				<h1 className="text-3xl font-bold mb-6">User Management</h1>
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Recent Users</h2>
					{users.map(user => (
						<div key={user.id} className="p-4 border rounded">
							<p className="font-medium">{user.name || user.email}</p>
							<p className="text-sm text-gray-600">{user.email}</p>
						</div>
					))}
				</div>
			</div>

			{/* ✅ Client Components for interactivity - hydrated on client */}
			<div className="space-y-6">
				<UserForm />
				<LiveUserCount />
			</div>
		</div>
	)
}
```

### **2. Sharing Data Between Server and Client**

```tsx
// app/users/[id]/page.tsx
interface Props {
	params: { id: string }
}

export default async function UserPage({ params }: Props) {
	// ✅ Fetch data on server - fast and secure
	const user = await UserService.getById(params.id)

	if (!user) {
		notFound()
	}

	return (
		<div>
			{/* ✅ Server Component - static display, no JavaScript needed */}
			<header className="mb-8">
				<h1 className="text-3xl font-bold">{user.name}</h1>
				<p className="text-gray-600">{user.email}</p>
			</header>

			{/* ✅ Client Component - pass server data as props */}
			<UserEditForm initialData={user} />
		</div>
	)
}

// components/user-edit-form.tsx
;('use client')

interface Props {
	initialData: User // Data from Server Component
}

export function UserEditForm({ initialData }: Props) {
	const [formData, setFormData] = useState(initialData)
	// ... interactive form logic
}
```

## 🚀 Performance Optimization Patterns

### **1. Streaming with Suspense**

> **What is Streaming?** Gradually sending HTML to the browser as it's ready, improving perceived performance. [Learn about Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming).

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { UserStats } from './components/user-stats' // Slow server component
import { QuickActions } from './components/quick-actions' // Fast server component

export default function Dashboard() {
	return (
		<div>
			{/* ✅ Fast content renders immediately */}
			<QuickActions />

			{/* ✅ Slow content streams in when ready - better UX */}
			<Suspense fallback={<StatsLoading />}>
				<UserStats />
			</Suspense>
		</div>
	)
}

function StatsLoading() {
	return (
		<div className="space-y-4">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
			))}
		</div>
	)
}
```

### **2. Optimistic Updates in Client Components**

> **What are Optimistic Updates?** Immediately updating the UI before the server responds, making the app feel faster. [Learn about optimistic updates](https://react.dev/reference/react-dom/useFormStatus#pending-state-during-form-submission).

```tsx
// components/user-actions.tsx
'use client'

export function UserActions({ user }: { user: User }) {
	const [optimisticUser, setOptimisticUser] = useState(user)
	const [isPending, setIsPending] = useState(false)

	const handleToggleStatus = async () => {
		// ✅ Optimistic update - immediate UI feedback
		setOptimisticUser(prev => ({ ...prev, isActive: !prev.isActive }))
		setIsPending(true)

		try {
			const updated = await updateUser(user.id, { isActive: !user.isActive })
			setOptimisticUser(updated) // Update with server response
		} catch (error) {
			// ❌ Revert optimistic update on error
			setOptimisticUser(user)
			console.error('Failed to update user:', error)
		} finally {
			setIsPending(false)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<span className={optimisticUser.isActive ? 'text-green-600' : 'text-red-600'}>
				{optimisticUser.isActive ? 'Active' : 'Inactive'}
			</span>
			<Button onClick={handleToggleStatus} disabled={isPending} size="sm">
				{isPending ? 'Updating...' : 'Toggle Status'}
			</Button>
		</div>
	)
}
```

## 🎯 Decision Framework

### **Choose Server Components When:**

- ✅ Displaying static or semi-static content
- ✅ Initial data fetching is required
- ✅ SEO is important (blog posts, product pages)
- ✅ Security is a concern (API keys, sensitive operations)
- ✅ Minimizing client bundle size is priority
- ✅ Content doesn't need real-time updates

### **Choose Client Components When:**

- ✅ User interaction is required (forms, clicks, etc.)
- ✅ Managing component state (useState, useReducer)
- ✅ Using browser APIs (localStorage, geolocation, etc.)
- ✅ Real-time updates are needed (chat, live data)
- ✅ Complex animations or transitions
- ✅ Third-party libraries require browser environment

### **Decision Tree**

```
Does the component need user interaction (clicks, form inputs)?
├─ Yes → Client Component ('use client')
└─ No → Does it need browser APIs (localStorage, window)?
    ├─ Yes → Client Component
    └─ No → Does it need real-time updates (WebSockets, polling)?
        ├─ Yes → Client Component
        └─ No → Server Component ✅ (Default choice)
```

## 📋 Best Practices

### **✅ Do's**

- **Start with Server Components** - They're the default and most performant
- **Use Client Components sparingly** - Only when interactivity is needed
- **Keep the client-server boundary low** - Minimize Client Component usage
- **Pass serializable data** - Only JSON-serializable props between Server and Client
- **Use Suspense for streaming** - Better loading experience for slow operations
- **Optimize Client Component bundles** - Use dynamic imports for heavy components
- **Leverage static generation** - Use [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) when possible

### **❌ Don'ts**

- **Don't use Client Components unnecessarily** - They increase bundle size
- **Don't import Server Components into Client** - It won't work and will cause errors
- **Don't pass non-serializable props** - Functions, Dates, etc. can't be serialized
- **Don't forget 'use client' directive** - Required for Client Components
- **Don't mix data fetching patterns** - Be consistent with your approach
- **Don't ignore SEO implications** - Client Components aren't SEO-friendly by default

### **🔧 Migration Strategies**

#### **Server to Client Migration**

When you need to add interactivity to a Server Component:

```tsx
// Before: Server Component
export default async function UserList() {
	const users = await UserService.getMany()
	return <div>...</div>
}

// After: Client Component with data fetching
;('use client')
export default function UserList() {
	const [users, setUsers] = useState([])

	useEffect(() => {
		async function loadUsers() {
			const data = await getUsers() // API call instead of direct service
			setUsers(data.users)
		}
		loadUsers()
	}, [])

	return <div>...</div>
}
```

#### **Client to Server Migration**

When removing unnecessary interactivity:

```tsx
// Before: Client Component with static data
'use client'
export default function StaticContent() {
	const [data] = useState(staticData) // No interaction needed
	return <div>...</div>
}

// After: Server Component (remove 'use client')
export default function StaticContent() {
	return <div>...</div> // Same output, better performance
}
```

## 📊 Performance Impact

### **Server Components Benefits**

- **Bundle Size**: 0 KB JavaScript for static content
- **Initial Load**: Faster [First Contentful Paint (FCP)](https://web.dev/fcp/)
- **SEO**: Complete HTML for search engines and social media
- **Caching**: Effective server-side and CDN caching strategies

### **Client Components Benefits**

- **Interactivity**: Rich user experiences and real-time features
- **Real-time**: Live updates and dynamic content
- **Flexibility**: Full React ecosystem and browser API access

## 📚 Related Documentation & Resources

### **Our Documentation**

- **[Architecture Overview](./OVERVIEW.md)** - System design context
- **[Component Development Guide](../components/DEVELOPMENT_GUIDE.md)** - Component implementation patterns
- **[Performance Optimization](../performance/OPTIMIZATION.md)** - Performance best practices
- **[API Design Patterns](../api/DESIGN_PATTERNS.md)** - Data fetching strategies

### **External Resources**

- **[Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)** - Official documentation
- **[React Server Components](https://react.dev/reference/rsc/server-components)** - React team explanation
- **[Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)** - Composition patterns
- **[Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)** - Next.js optimization guide
- **[Web.dev Performance](https://web.dev/performance/)** - Performance fundamentals

---

Understanding when and how to use Server vs Client Components is crucial for building performant, SEO-friendly Next.js applications with excellent user experience. Start with Server Components by default, and only use Client Components when you need interactivity or browser APIs.

**Next Steps**: Try building a simple page with both Server and Client Components to see the difference in action!
