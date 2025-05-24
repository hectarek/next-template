# 🎨 Component Development Guide

This guide covers our component development patterns, best practices, and conventions for building maintainable, reusable React components in our Next.js application.

## 🎯 Component Philosophy

### 1. **Composition over Inheritance**

Build complex UIs by composing smaller, focused components rather than creating large monolithic components.

### 2. **Server vs Client Components**

Choose the right rendering strategy based on component requirements and user experience goals.

### 3. **Accessibility First**

All components should be accessible by default with proper ARIA attributes and keyboard navigation.

### 4. **Type Safety**

Full TypeScript coverage with proper prop types and interfaces.

### 5. **Testability**

Components should be easy to test in isolation with clear, predictable behavior.

## 🏗️ Component Architecture

### **Component Hierarchy**

```
components/
├── ui/                     # Base UI components (universal)
│   ├── button.tsx         # Basic interactive elements
│   ├── card.tsx           # Layout components
│   ├── dialog.tsx         # Modal components
│   └── confirmation-dialog.tsx # Complex interactive components
├── example/               # Feature-specific components
│   ├── user-form.tsx      # Client components with state
│   └── user-list.tsx      # Client components with data fetching
└── layout/                # Layout components (server)
    ├── header.tsx
    ├── footer.tsx
    └── sidebar.tsx
```

### **Component Categories**

#### **1. Server Components** (Default)

- Static content and layouts
- Initial data display
- SEO-critical content
- Composition of client components

#### **2. Client Components** (`'use client'`)

- Interactive features
- Form handling
- Real-time updates
- Browser API usage

#### **3. Universal Components**

- UI components that work in both contexts
- No hooks or browser-specific features
- Pure presentation components

## 🔧 Component Patterns

### **1. Basic UI Component** (`components/ui/button.tsx`)

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
	}
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### **2. Client Component with State** (`components/example/user-form.tsx`)

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createUser } from '@/lib/api/users'

interface FormData {
	email: string
	name: string
	avatar: string
}

interface FormErrors {
	email?: string
	name?: string
	avatar?: string
	submit?: string
}

export function UserForm() {
	const [formData, setFormData] = useState<FormData>({
		email: '',
		name: '',
		avatar: '',
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [isLoading, setIsLoading] = useState(false)
	const [successMessage, setSuccessMessage] = useState('')

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {}

		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address'
		}

		// Avatar URL validation
		if (formData.avatar) {
			try {
				new URL(formData.avatar)
			} catch {
				newErrors.avatar = 'Please enter a valid URL'
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) return

		setIsLoading(true)
		setErrors({})
		setSuccessMessage('')

		try {
			await createUser({
				email: formData.email.trim(),
				name: formData.name.trim() || undefined,
				avatar: formData.avatar.trim() || undefined,
			})

			setSuccessMessage('User created successfully!')
			setFormData({ email: '', name: '', avatar: '' })
		} catch (error) {
			setErrors({
				submit: error instanceof Error ? error.message : 'Failed to create user',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [field]: e.target.value }))
		// Clear field error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: undefined }))
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New User</CardTitle>
				<CardDescription>Add a new user to the system with basic information.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Email Field */}
					<div className="space-y-2">
						<Label htmlFor="email">Email *</Label>
						<Input
							id="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange('email')}
							disabled={isLoading}
							required
							aria-describedby={errors.email ? 'email-error' : undefined}
						/>
						{errors.email && (
							<p id="email-error" className="text-sm text-red-600">
								{errors.email}
							</p>
						)}
					</div>

					{/* Name Field */}
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							type="text"
							value={formData.name}
							onChange={handleInputChange('name')}
							disabled={isLoading}
							placeholder="Enter full name"
						/>
					</div>

					{/* Avatar Field */}
					<div className="space-y-2">
						<Label htmlFor="avatar">Avatar URL</Label>
						<Input
							id="avatar"
							type="url"
							value={formData.avatar}
							onChange={handleInputChange('avatar')}
							disabled={isLoading}
							placeholder="https://example.com/avatar.jpg"
							aria-describedby={errors.avatar ? 'avatar-error' : undefined}
						/>
						{errors.avatar && (
							<p id="avatar-error" className="text-sm text-red-600">
								{errors.avatar}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<Button type="submit" disabled={isLoading} className="w-full">
						{isLoading ? 'Creating...' : 'Create User'}
					</Button>

					{/* Error Messages */}
					{errors.submit && (
						<p className="text-sm text-red-600" role="alert">
							{errors.submit}
						</p>
					)}

					{/* Success Message */}
					{successMessage && (
						<p className="text-sm text-green-600" role="status">
							{successMessage}
						</p>
					)}
				</form>
			</CardContent>
		</Card>
	)
}
```

### **3. Server Component with Data Fetching**

```tsx
// app/demo/server-data/components/user-stats.tsx
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserService } from '@/services/user.service'

// Server Component that fetches data
async function UserStatsContent() {
	try {
		const stats = await UserService.getStats()

		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
						<p className="text-sm text-gray-500">Total Users</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
						<p className="text-sm text-gray-500">Active Users</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth}</div>
						<p className="text-sm text-gray-500">New This Month</p>
					</CardContent>
				</Card>
			</div>
		)
	} catch (error) {
		return (
			<div className="text-center p-8">
				<p className="text-red-600">Failed to load statistics</p>
				<p className="text-sm text-gray-500 mt-2">Please check your database connection</p>
			</div>
		)
	}
}

// Loading fallback component
function UserStatsLoading() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{[...Array(3)].map((_, i) => (
				<Card key={i}>
					<CardContent className="pt-6">
						<div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
						<div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

// Main component with Suspense
export function UserStats() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>User Statistics</CardTitle>
				<CardDescription>Real-time statistics fetched on the server</CardDescription>
			</CardHeader>
			<CardContent>
				<Suspense fallback={<UserStatsLoading />}>
					<UserStatsContent />
				</Suspense>
			</CardContent>
		</Card>
	)
}
```

### **4. Complex Interactive Component** (`components/ui/confirmation-dialog.tsx`)

```tsx
'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	onConfirm: () => void | Promise<void>
	confirmText?: string
	cancelText?: string
	variant?: 'default' | 'destructive'
	isLoading?: boolean
}

export default function ConfirmationDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'default',
	isLoading: externalLoading = false,
}: ConfirmationDialogProps) {
	const [internalLoading, setInternalLoading] = useState(false)

	const isLoading = externalLoading || internalLoading

	const handleConfirm = async () => {
		try {
			setInternalLoading(true)
			await onConfirm()
			onOpenChange(false)
		} catch (error) {
			console.error('Confirmation action failed:', error)
			// Don't close dialog on error - let user try again
		} finally {
			setInternalLoading(false)
		}
	}

	const handleCancel = () => {
		if (!isLoading) {
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]" data-testid="confirmation-dialog">
				<DialogHeader>
					<DialogTitle data-testid="dialog-title">{title}</DialogTitle>
					<DialogDescription data-testid="dialog-description">{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isLoading} data-testid="cancel-button">
						{cancelText}
					</Button>
					<Button variant={variant} onClick={handleConfirm} disabled={isLoading} data-testid="confirm-button">
						{isLoading ? 'Loading...' : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
```

## 🎨 Styling Patterns

### **1. Using Class Variance Authority (CVA)**

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva('rounded-lg border bg-card text-card-foreground shadow-sm', {
	variants: {
		variant: {
			default: 'border-border',
			outlined: 'border-2 border-primary',
			elevated: 'shadow-lg border-0',
		},
		size: {
			sm: 'p-4',
			md: 'p-6',
			lg: 'p-8',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'md',
	},
})

interface CardProps extends VariantProps<typeof cardVariants> {
	children: React.ReactNode
	className?: string
}

export function Card({ variant, size, className, children }: CardProps) {
	return <div className={cn(cardVariants({ variant, size }), className)}>{children}</div>
}
```

### **2. Conditional Styling with cn()**

```tsx
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
	status: 'active' | 'inactive' | 'pending'
	children: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
	return (
		<span
			className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', {
				'bg-green-100 text-green-800': status === 'active',
				'bg-red-100 text-red-800': status === 'inactive',
				'bg-yellow-100 text-yellow-800': status === 'pending',
			})}
		>
			{children}
		</span>
	)
}
```

## ♿ Accessibility Patterns

### **1. Form Accessibility**

```tsx
export function AccessibleForm() {
	const [errors, setErrors] = useState<Record<string, string>>({})

	return (
		<form>
			<div>
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					required
					aria-describedby={errors.email ? 'email-error' : undefined}
					aria-invalid={!!errors.email}
				/>
				{errors.email && (
					<p id="email-error" role="alert" className="text-red-600">
						{errors.email}
					</p>
				)}
			</div>
		</form>
	)
}
```

### **2. Loading States**

```tsx
export function DataComponent() {
	const [isLoading, setIsLoading] = useState(true)

	return (
		<div>
			{isLoading ? (
				<div role="status" aria-live="polite">
					<span className="sr-only">Loading...</span>
					<Spinner />
				</div>
			) : (
				<div role="main">{/* Content */}</div>
			)}
		</div>
	)
}
```

### **3. Interactive Elements**

```tsx
export function AccessibleButton() {
	return (
		<Button aria-label="Delete user account" aria-describedby="delete-warning" onClick={handleDelete}>
			Delete
			<span id="delete-warning" className="sr-only">
				This action cannot be undone
			</span>
		</Button>
	)
}
```

## 🧪 Component Testing Patterns

### **1. Testing Props and Rendering**

```tsx
describe('Button Component', () => {
	it('renders with correct variant classes', () => {
		render(<Button variant="destructive">Delete</Button>)

		const button = screen.getByRole('button', { name: /delete/i })
		expect(button).toHaveClass('bg-destructive')
	})

	it('handles click events', async () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Click me</Button>)

		await userEvent.click(screen.getByRole('button'))
		expect(handleClick).toHaveBeenCalledOnce()
	})
})
```

### **2. Testing Forms**

```tsx
describe('UserForm', () => {
	it('validates email format', async () => {
		render(<UserForm />)

		await userEvent.type(screen.getByLabelText(/email/i), 'invalid')
		await userEvent.click(screen.getByRole('button', { name: /create/i }))

		expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
	})
})
```

## 📋 Component Best Practices

### **✅ Do's**

- Use descriptive component and prop names
- Implement proper TypeScript interfaces
- Add accessibility attributes by default
- Handle loading and error states gracefully
- Use React.forwardRef for components that need refs
- Include data-testid attributes for testing
- Document complex components with JSDoc
- Use composition over complex prop drilling

### **❌ Don'ts**

- Don't create overly complex components
- Don't use any types - always be specific
- Don't ignore accessibility concerns
- Don't forget error boundaries for complex components
- Don't put business logic in UI components
- Don't use inline styles - prefer Tailwind classes
- Don't create components that do too many things

### **🎯 Component Guidelines**

#### **Single Responsibility**

Each component should have one clear purpose:

```tsx
// ✅ Good - focused responsibility
function UserAvatar({ user, size = 'md' }) {
	return (
		<img
			src={user.avatar || '/default-avatar.png'}
			alt={`${user.name} avatar`}
			className={size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'}
		/>
	)
}

// ❌ Bad - too many responsibilities
function UserComponent({ user, onEdit, onDelete, showPosts }) {
	// Handles avatar, profile info, actions, and posts
}
```

#### **Prop Interface Design**

```tsx
// ✅ Good - clear, typed interface
interface UserCardProps {
	user: User
	variant?: 'compact' | 'detailed'
	onEdit?: (user: User) => void
	onDelete?: (userId: string) => void
	className?: string
}

// ❌ Bad - unclear, loose typing
interface UserCardProps {
	data: any
	type?: string
	handlers?: Record<string, Function>
}
```

## 🔄 State Management Patterns

### **1. Local Component State**

```tsx
function SearchInput() {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState([])
	const [isLoading, setIsLoading] = useState(false)

	const debouncedSearch = useMemo(
		() =>
			debounce(async (searchQuery: string) => {
				if (!searchQuery) {
					setResults([])
					return
				}

				setIsLoading(true)
				try {
					const data = await searchUsers(searchQuery)
					setResults(data)
				} catch (error) {
					console.error('Search failed:', error)
					setResults([])
				} finally {
					setIsLoading(false)
				}
			}, 300),
		[]
	)

	useEffect(() => {
		debouncedSearch(query)
	}, [query, debouncedSearch])

	return (
		<div>
			<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users..." />
			{isLoading && <Spinner />}
			<SearchResults results={results} />
		</div>
	)
}
```

### **2. Lifting State Up**

```tsx
function UserManagement() {
	const [users, setUsers] = useState<User[]>([])
	const [selectedUser, setSelectedUser] = useState<User | null>(null)

	const handleUserCreate = (newUser: User) => {
		setUsers(prev => [...prev, newUser])
	}

	const handleUserUpdate = (updatedUser: User) => {
		setUsers(prev => prev.map(user => (user.id === updatedUser.id ? updatedUser : user)))
		setSelectedUser(updatedUser)
	}

	return (
		<div className="grid grid-cols-2 gap-4">
			<UserForm onSubmit={handleUserCreate} />
			<UserList
				users={users}
				selectedUser={selectedUser}
				onUserSelect={setSelectedUser}
				onUserUpdate={handleUserUpdate}
			/>
		</div>
	)
}
```

## 📚 Related Documentation

- **[Architecture Overview](../architecture/OVERVIEW.md)** - How components fit in the system
- **[Client vs Server Components](../RENDERING_PATTERNS.md)** - Rendering strategy guide
- **[Testing Strategy](../testing/STRATEGY.md)** - Component testing patterns
- **[API Design Patterns](../api/DESIGN_PATTERNS.md)** - API integration in components

---

Following these component development patterns ensures consistency, maintainability, and excellent user experience across your application.
