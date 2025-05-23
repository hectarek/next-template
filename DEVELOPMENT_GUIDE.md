# Development Guide

> **Comprehensive guidelines for consistent, high-quality code in our Next.js project**

## 📋 Table of Contents

- [ESLint Configuration](#eslint-configuration)
- [File Naming Conventions](#file-naming-conventions)
- [Code Style & Best Practices](#code-style--best-practices)
- [shadcn/ui Component Usage & Atomic Design](#shadcnui-component-usage--atomic-design)
- [Import Organization](#import-organization)
- [State Management in Next.js](#state-management-in-nextjs)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pre-commit Hooks](#pre-commit-hooks)

---

## 🔧 ESLint Configuration

Our project uses a comprehensive ESLint setup to catch bugs, enforce best practices, and maintain code consistency.

### Code Quality & Bug Prevention

| Rule                   | Level | Description                                      | Example                                           |
| ---------------------- | ----- | ------------------------------------------------ | ------------------------------------------------- |
| `no-console`           | warn  | Only allow `console.warn` and `console.error`    | ❌ `console.log()` ✅ `console.error()`           |
| `no-debugger`          | error | No debugger statements in production             | ❌ `debugger;`                                    |
| `no-unreachable`       | error | Code after return/throw/etc                      | ❌ Code after `return`                            |
| `no-duplicate-case`    | error | Duplicate case labels in switch                  | ❌ Two `case 'a':`                                |
| `eqeqeq`               | error | Require `===` and `!==` instead of `==` and `!=` | ❌ `if (a == b)` ✅ `if (a === b)`                |
| `no-implicit-coercion` | error | Disallow implicit type conversions               | ❌ `!!value` ✅ `Boolean(value)`                  |
| `no-magic-numbers`     | warn  | Warn about unexplained numbers                   | ❌ `setTimeout(fn, 5000)` ✅ `const DELAY = 5000` |

### Modern JavaScript Best Practices

| Rule                    | Level | Description                                    | Example                                              |
| ----------------------- | ----- | ---------------------------------------------- | ---------------------------------------------------- |
| `prefer-const`          | error | Use `const` when variable isn't reassigned     | ❌ `let name = 'John'` ✅ `const name = 'John'`      |
| `no-var`                | error | Use `let`/`const` instead of `var`             | ❌ `var x = 1` ✅ `const x = 1`                      |
| `object-shorthand`      | error | Use shorthand object syntax                    | ❌ `{name: name}` ✅ `{name}`                        |
| `prefer-arrow-callback` | error | Prefer arrow functions as callbacks            | ❌ `arr.map(function(x) {})` ✅ `arr.map(x => {})`   |
| `prefer-template`       | error | Use template literals instead of concatenation | ❌ `'Hello ' + name` ✅ `` `Hello ${name}` ``        |
| `no-nested-ternary`     | error | Disallow nested ternary expressions            | ❌ `a ? b ? c : d : e` ✅ Use if/else                |
| `prefer-destructuring`  | error | Prefer destructuring for objects               | ❌ `const name = user.name` ✅ `const {name} = user` |

### TypeScript Specific Rules

| Rule                                           | Level | Description                            | Example                                                                 |
| ---------------------------------------------- | ----- | -------------------------------------- | ----------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`           | warn  | Discourage `any` type                  | ❌ `const data: any = {}` ✅ `const data: User = {}`                    |
| `@typescript-eslint/prefer-optional-chain`     | error | Use optional chaining                  | ❌ `user && user.profile && user.profile.name` ✅ `user?.profile?.name` |
| `@typescript-eslint/prefer-nullish-coalescing` | error | Use `??` instead of `\|\|`             | ❌ `name \|\| 'default'` ✅ `name ?? 'default'`                         |
| `@typescript-eslint/no-non-null-assertion`     | warn  | Discourage `!` operator                | ❌ `user!.name` ✅ `user?.name`                                         |
| `@typescript-eslint/no-unused-vars`            | error | No unused variables (allow `_` prefix) | ✅ `const _unusedVar = getData()`                                       |

### React Best Practices

| Rule                        | Level | Description                      | Example                                                                   |
| --------------------------- | ----- | -------------------------------- | ------------------------------------------------------------------------- |
| `react/jsx-key`             | error | Require key prop in lists        | ❌ `items.map(item => <div>)` ✅ `items.map(item => <div key={item.id}>)` |
| `react/jsx-no-target-blank` | error | Security: require rel="noopener" | ❌ `<a target="_blank">` ✅ `<a target="_blank" rel="noopener">`          |
| `react/no-array-index-key`  | warn  | Discourage array index as key    | ❌ `key={index}` ✅ `key={item.id}`                                       |
| `react/jsx-boolean-value`   | error | Prefer implicit true values      | ❌ `<Component enabled={true} />` ✅ `<Component enabled />`              |

### Next.js Specific Rules

| Rule                                | Level | Description                 | Example                                          |
| ----------------------------------- | ----- | --------------------------- | ------------------------------------------------ |
| `@next/next/no-img-element`         | error | Use Next.js Image component | ❌ `<img src="...">` ✅ `<Image src="...">`      |
| `@next/next/no-html-link-for-pages` | error | Use Next.js Link component  | ❌ `<a href="/about">` ✅ `<Link href="/about">` |

---

## 📁 File Naming Conventions

**⚠️ IMPORTANT: All files in `app/` and `components/` folders must use kebab-case and lowercase.**

### ✅ Correct Examples:

- `user-profile.tsx`
- `navigation-menu.tsx`
- `api-client.ts`
- `loading-spinner.tsx`
- `[user-id].tsx` (Next.js dynamic routes are allowed)

### ❌ Incorrect Examples:

- `UserProfile.tsx` (PascalCase)
- `user_profile.tsx` (snake_case)
- `userProfile.tsx` (camelCase)
- `USER-PROFILE.tsx` (UPPERCASE)

### Special Cases:

- **Next.js special files**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **Dynamic routes**: `[id].tsx`, `[...slug].tsx`, `[[...optional]].tsx`
- **Route groups**: `(auth)/login.tsx`

---

## 🎨 Code Style & Best Practices

### Component Structure

```tsx
// ✅ Good component structure
import React from 'react'
import { cn } from '@/lib/utils'

interface UserProfileProps {
	user: User
	className?: string
}

export default function UserProfile({ user, className }: UserProfileProps) {
	const handleClick = () => {
		// Handler logic
	}

	return (
		<div className={cn('user-profile', className)}>
			<h2>{user.name}</h2>
			<button onClick={handleClick}>Edit Profile</button>
		</div>
	)
}
```

### TypeScript Best Practices

```tsx
// ✅ Use proper types
interface User {
	id: string
	name: string
	email?: string // Optional with ?
}

// ✅ Use const assertions
const STATUSES = ['pending', 'approved', 'rejected'] as const
type Status = (typeof STATUSES)[number]

// ✅ Use generic constraints
function updateUser<T extends Partial<User>>(id: string, updates: T): User {
	// Implementation
}
```

### State Management

```tsx
// ✅ Use proper state destructuring
const [user, setUser] = useState<User | null>(null)
const [isLoading, setIsLoading] = useState(false)

// ✅ Use custom hooks for complex logic
function useUserData(userId: string) {
	const [user, setUser] = useState<User | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Hook logic...

	return { user, error }
}
```

### Example Components

This project includes realistic component examples that demonstrate best practices for building and testing UI components with shadcn/ui:

#### TaskCard Component (`components/task-card.tsx`)

A comprehensive task management card that showcases:

- **Multiple shadcn/ui components**: Card, Badge, Button, Avatar
- **Complex state management**: Status transitions, conditional styling
- **TypeScript interfaces**: Proper typing for props and data structures
- **Accessibility**: Test IDs, proper ARIA labels, keyboard navigation
- **Responsive design**: Mobile-friendly layout

**Key Features:**

- Task status progression (todo → in-progress → completed)
- Priority indicators with color coding
- Due date highlighting (overdue tasks get destructive styling)
- Assignee avatars with fallback initials
- Tag system for categorization
- Action buttons (edit, delete) with optional callbacks

#### SettingsForm Component (`components/settings-form.tsx`)

A realistic settings form demonstrating:

- **Form state management**: React state with change tracking
- **Multiple input types**: Switches, textarea, validation
- **Async operations**: Save/reset with loading states
- **User feedback**: Unsaved changes indicator, success/error handling

**Key Features:**

- Notification preferences (email, push, dark mode)
- Bio text area with character count
- Auto-save preference toggle
- Form validation and submission
- Reset functionality

#### ConfirmationDialog Component (`components/confirmation-dialog.tsx`)

A reusable confirmation modal that demonstrates:

- **Modal patterns**: Proper dialog implementation with shadcn/ui
- **Async handling**: Promise-based confirmations with loading states
- **Accessibility**: Keyboard navigation, focus management
- **Flexible API**: Customizable text, variants, callbacks

**Key Features:**

- Destructive vs. default variants
- Async confirmation handling
- Loading state management
- Error handling without closing dialog
- Customizable button text and styling

### Testing Examples

Each component includes comprehensive test suites that demonstrate:

#### Unit Testing (`tests/components/`)

- **Component rendering**: Props, conditional content, styling
- **User interactions**: Clicks, form inputs, state changes
- **Edge cases**: Empty states, error conditions, boundary values
- **Accessibility**: Test IDs, ARIA attributes, keyboard navigation

#### Integration Testing

- **Form workflows**: Multi-step processes, validation flows
- **State synchronization**: Parent-child component communication
- **API interactions**: Mocking external dependencies

#### End-to-End Testing (`tests/e2e/component-interactions.spec.ts`)

- **Complete workflows**: Task management, settings changes
- **Cross-component interactions**: Dialog confirmations, form submissions
- **Mobile responsiveness**: Touch interactions, viewport changes
- **Accessibility testing**: Keyboard navigation, screen reader compatibility

### Best Practices Demonstrated

1. **Component Architecture**:

   - Single responsibility principle
   - Proper prop interfaces with TypeScript
   - Flexible APIs with optional callbacks
   - Consistent naming conventions

2. **State Management**:

   - Local state for UI concerns
   - Lifting state up when needed
   - Proper cleanup and error handling

3. **Styling**:

   - Utility-first with Tailwind CSS
   - Conditional classes with `cn()` helper
   - Responsive design patterns
   - Consistent spacing and typography

4. **Testing**:
   - Test behavior, not implementation
   - Comprehensive coverage including edge cases
   - Accessibility testing with proper queries
   - Realistic user interactions

---

## 🧩 shadcn/ui Component Usage & Atomic Design

**⚠️ CRITICAL: Always use existing shadcn/ui components before creating custom ones. Consistency is more important than perfect customization.**

### 🎯 Why Component Consistency Matters

#### The Problem Without Standards

```tsx
// ❌ Different developers creating similar buttons
function DeleteButton() {
	return <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
}

function RemoveButton() {
	return <button className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700">Remove</button>
}

function CancelButton() {
	return <button className="bg-red-400 text-white p-2 rounded-lg hover:bg-red-500">Cancel</button>
}
```

**Problems:**

- 🔴 **Inconsistent spacing** (px-4 vs px-3 vs p-2)
- 🔴 **Different red shades** (500 vs 600 vs 400)
- 🔴 **Inconsistent border radius** (rounded vs rounded-md vs rounded-lg)
- 🔴 **No accessibility** features
- 🔴 **No loading states** or disabled states
- 🔴 **Maintenance nightmare** - need to update 3+ places for style changes

#### The Solution: shadcn/ui Components

```tsx
// ✅ One consistent button component for all use cases
import { Button } from '@/components/ui/button'

function UserActions() {
	return (
		<div className="space-x-2">
			<Button variant="destructive">Delete</Button>
			<Button variant="destructive">Remove</Button>
			<Button variant="destructive">Cancel</Button>
		</div>
	)
}
```

**Benefits:**

- ✅ **Consistent styling** across entire app
- ✅ **Built-in accessibility** (ARIA labels, keyboard navigation)
- ✅ **Loading and disabled states** included
- ✅ **Theme integration** (dark/light mode support)
- ✅ **Single source of truth** for style updates

---

### 🏗️ Atomic Design in Next.js

Our component architecture follows atomic design principles with Next.js-specific considerations:

#### **Level 1: Atoms** (shadcn/ui components)

**Never modify these directly. Use them as-is or compose them.**

```tsx
// ✅ Use shadcn/ui atoms directly
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ❌ Don't create custom atoms when shadcn/ui exists
function CustomButton() {
	return <button className="...">Button</button> // Don't do this!
}
```

#### **Level 2: Molecules** (Composed UI patterns)

**Combine atoms into reusable patterns.**

```tsx
// ✅ Good molecule: SearchInput
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchInputProps {
	placeholder?: string
	onSearch: (value: string) => void
	className?: string
}

export default function SearchInput({ placeholder, onSearch, className }: SearchInputProps) {
	const [value, setValue] = useState('')

	return (
		<div className={cn('flex gap-2', className)}>
			<Input
				type="search"
				placeholder={placeholder}
				value={value}
				onChange={e => setValue(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && onSearch(value)}
			/>
			<Button size="icon" variant="secondary" onClick={() => onSearch(value)}>
				<Search className="h-4 w-4" />
			</Button>
		</div>
	)
}
```

#### **Level 3: Organisms** (Complex components)

**Business logic components that use molecules and atoms.**

```tsx
// ✅ Good organism: UserCard (from your examples)
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface UserCardProps {
	user: User
	onEdit?: () => void
	onDelete?: () => void
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
	return (
		<Card className="w-full max-w-md">
			<CardHeader className="flex flex-row items-center gap-4">
				<Avatar>
					<AvatarImage src={user.avatar} alt={user.name} />
					<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div>
					<h3 className="font-semibold">{user.name}</h3>
					<Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex gap-2">
				{onEdit && (
					<Button variant="outline" size="sm" onClick={onEdit}>
						Edit
					</Button>
				)}
				{onDelete && (
					<Button variant="destructive" size="sm" onClick={onDelete}>
						Delete
					</Button>
				)}
			</CardContent>
		</Card>
	)
}
```

#### **Level 4: Templates** (Next.js layouts)

**Page layouts using Next.js patterns.**

```tsx
// ✅ Good template: DashboardLayout
interface DashboardLayoutProps {
	children: React.ReactNode
	sidebar?: React.ReactNode
	header?: React.ReactNode
}

export default function DashboardLayout({ children, sidebar, header }: DashboardLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			{header && <header className="border-b">{header}</header>}
			<div className="flex">
				{sidebar && <aside className="w-64 border-r">{sidebar}</aside>}
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	)
}
```

#### **Level 5: Pages** (Next.js pages/routes)

**Complete pages that compose everything together.**

```tsx
// app/dashboard/page.tsx
import DashboardLayout from '@/components/layouts/dashboard-layout'
import UserCard from '@/components/user-card'
import SearchInput from '@/components/search-input'

export default async function DashboardPage() {
	const users = await getUsers()

	return (
		<DashboardLayout header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
			<div className="space-y-6">
				<SearchInput placeholder="Search users..." onSearch={query => console.log(query)} />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{users.map(user => (
						<UserCard
							key={user.id}
							user={user}
							onEdit={() => console.log('Edit', user.id)}
							onDelete={() => console.log('Delete', user.id)}
						/>
					))}
				</div>
			</div>
		</DashboardLayout>
	)
}
```

---

### 🎨 shadcn/ui Component Guidelines

#### **1. Use Variants Instead of Custom Styles**

```tsx
// ❌ Don't: Custom styling
<Button className="bg-green-500 hover:bg-green-600 text-white">
  Success
</Button>

// ✅ Do: Use existing variants or extend them
<Button variant="default" className="bg-green-500 hover:bg-green-600">
  Success
</Button>

// 🏆 Even better: Extend the component properly
// In your button component file, add new variants:
const buttonVariants = cva(
  "...", // base classes
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        outline: "...",
        secondary: "...",
        ghost: "...",
        link: "...",
        success: "bg-green-500 hover:bg-green-600 text-white", // Add custom variant
      },
    },
  }
)
```

#### **2. Compose Components, Don't Rebuild Them**

```tsx
// ❌ Don't: Recreate existing functionality
function CustomDialog({ children, title }: { children: React.ReactNode; title: string }) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
			<div className="bg-white p-6 rounded-lg">
				<h2 className="text-lg font-semibold mb-4">{title}</h2>
				{children}
			</div>
		</div>
	)
}

// ✅ Do: Use shadcn/ui Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function ConfirmDialog({ children, title, trigger }: ConfirmDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	)
}
```

#### **3. Create Composed Components for Common Patterns**

```tsx
// ✅ Create reusable composed components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Common pattern: Status card with actions
interface StatusCardProps {
	title: string
	status: 'success' | 'warning' | 'error'
	children: React.ReactNode
	actions?: React.ReactNode
}

export default function StatusCard({ title, status, children, actions }: StatusCardProps) {
	const statusColors = {
		success: 'bg-green-50 border-green-200',
		warning: 'bg-yellow-50 border-yellow-200',
		error: 'bg-red-50 border-red-200',
	}

	return (
		<Card className={cn('border-2', statusColors[status])}>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-lg">{title}</CardTitle>
				<Badge variant={status === 'success' ? 'default' : 'destructive'}>{status}</Badge>
			</CardHeader>
			<CardContent>
				{children}
				{actions && <div className="flex gap-2 mt-4">{actions}</div>}
			</CardContent>
		</Card>
	)
}

// Usage
;<StatusCard
	title="Deployment Status"
	status="success"
	actions={
		<Button variant="outline" size="sm">
			View Details
		</Button>
	}
>
	<p>Deployment completed successfully at 2:30 PM</p>
</StatusCard>
```

---

### 🏛️ Next.js Component Architecture Patterns

#### **1. Server vs Client Component Boundaries**

```tsx
// ✅ Good: Server component for data, client for interactions
// app/users/page.tsx (Server Component)
import { getUsers } from '@/lib/data'
import UserList from '@/components/user-list'

export default async function UsersPage() {
	const users = await getUsers() // Server-side data fetching

	return (
		<div>
			<h1>Users</h1>
			<UserList users={users} /> {/* Pass data to client component */}
		</div>
	)
}

// components/user-list.tsx (Client Component)
;('use client')
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import UserCard from './user-card'

interface UserListProps {
	users: User[]
}

export default function UserList({ users }: UserListProps) {
	const [search, setSearch] = useState('')

	const filteredUsers = users.filter(user => user.name.toLowerCase().includes(search.toLowerCase()))

	return (
		<div>
			<Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
				{filteredUsers.map(user => (
					<UserCard key={user.id} user={user} />
				))}
			</div>
		</div>
	)
}
```

#### **2. Proper Component Nesting Hierarchy**

```tsx
// ✅ Good: Clear hierarchy and separation of concerns

// Level 1: Layout (app/layout.tsx)
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html>
			<body>
				<NavBar />
				<main>{children}</main>
				<Footer />
			</body>
		</html>
	)
}

// Level 2: Page (app/dashboard/page.tsx)
export default function DashboardPage() {
	return (
		<DashboardLayout>
			<DashboardHeader />
			<DashboardContent />
		</DashboardLayout>
	)
}

// Level 3: Page Sections (components/dashboard-content.tsx)
export default function DashboardContent() {
	return (
		<div className="space-y-6">
			<StatsSection />
			<ChartsSection />
			<RecentActivity />
		</div>
	)
}

// Level 4: Feature Components (components/stats-section.tsx)
export default function StatsSection() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<StatCard title="Users" value="1,234" />
			<StatCard title="Orders" value="567" />
			<StatCard title="Revenue" value="$12,345" />
			<StatCard title="Growth" value="12%" />
		</div>
	)
}

// Level 5: UI Components (components/stat-card.tsx)
export default function StatCard({ title, value }: StatCardProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="text-sm font-medium text-muted-foreground">{title}</div>
				<div className="text-2xl font-bold">{value}</div>
			</CardContent>
		</Card>
	)
}
```

#### **3. Component Composition Patterns**

```tsx
// ✅ Use compound components for complex UI patterns
interface DataTableProps {
	children: React.ReactNode
}

function DataTable({ children }: DataTableProps) {
	return (
		<Card>
			<Table>{children}</Table>
		</Card>
	)
}

function DataTableHeader({ children }: { children: React.ReactNode }) {
	return (
		<TableHeader>
			<TableRow>{children}</TableRow>
		</TableHeader>
	)
}

function DataTableBody({ children }: { children: React.ReactNode }) {
	return <TableBody>{children}</TableBody>
}

// Compound component pattern
DataTable.Header = DataTableHeader
DataTable.Body = DataTableBody

// Usage - clean and readable
function UsersTable({ users }: { users: User[] }) {
	return (
		<DataTable>
			<DataTable.Header>
				<TableHead>Name</TableHead>
				<TableHead>Email</TableHead>
				<TableHead>Status</TableHead>
			</DataTable.Header>
			<DataTable.Body>
				{users.map(user => (
					<TableRow key={user.id}>
						<TableCell>{user.name}</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell>
							<Badge variant={user.active ? 'default' : 'secondary'}>{user.active ? 'Active' : 'Inactive'}</Badge>
						</TableCell>
					</TableRow>
				))}
			</DataTable.Body>
		</DataTable>
	)
}
```

---

### 🚫 Common Anti-Patterns to Avoid

#### **1. Don't Create "One-Off" Styled Components**

```tsx
// ❌ Bad: Creating unique styles for similar functionality
function SpecialRedButton() {
	return (
		<button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide">
			Special Action
		</button>
	)
}

// ✅ Good: Use existing Button with appropriate variant
;<Button variant="destructive" size="lg" className="font-bold uppercase tracking-wide">
	Special Action
</Button>
```

#### **2. Don't Nest Components Too Deeply**

```tsx
// ❌ Bad: Too many nested components
function Dashboard() {
	return (
		<PageWrapper>
			<ContentContainer>
				<MainSection>
					<ContentArea>
						<DataSection>
							<ContentBlock>
								<UserCard />
							</ContentBlock>
						</DataSection>
					</ContentArea>
				</MainSection>
			</ContentContainer>
		</PageWrapper>
	)
}

// ✅ Good: Flatter structure with meaningful components
function Dashboard() {
	return (
		<div className="min-h-screen bg-background">
			<DashboardHeader />
			<main className="container mx-auto py-6">
				<UserCard />
			</main>
		</div>
	)
}
```

#### **3. Don't Mix Styling Approaches**

```tsx
// ❌ Bad: Mixing shadcn/ui with custom styled components
import styled from 'styled-components'
import { Button } from '@/components/ui/button'

const CustomCard = styled.div`
	background: white;
	border-radius: 8px;
	padding: 16px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

// ✅ Good: Consistent use of shadcn/ui + Tailwind
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function UserProfile() {
	return (
		<Card>
			<CardContent className="p-4">
				<Button>Edit Profile</Button>
			</CardContent>
		</Card>
	)
}
```

---

### 📋 Component Creation Checklist

Before creating a new component, ask yourself:

#### ✅ **Use Existing Components First:**

- [ ] Can I use a shadcn/ui component as-is?
- [ ] Can I compose existing components to achieve this?
- [ ] Is there already a similar component in the codebase?

#### ✅ **When Creating New Components:**

- [ ] Does this component have a single, clear responsibility?
- [ ] Is it reusable across different parts of the app?
- [ ] Does it follow our naming conventions (kebab-case)?
- [ ] Does it use TypeScript interfaces for props?
- [ ] Does it include proper accessibility attributes?
- [ ] Does it have appropriate test coverage?

#### ✅ **Component Architecture:**

- [ ] Is it at the right abstraction level (atom/molecule/organism)?
- [ ] Does it properly separate server/client concerns?
- [ ] Does it handle loading and error states appropriately?
- [ ] Is the component tree not too deeply nested?

---

### 🎯 Team Guidelines

#### **Code Review Checklist:**

- [ ] No custom buttons/inputs when shadcn/ui alternatives exist
- [ ] Components follow atomic design principles
- [ ] Proper server/client component boundaries
- [ ] Consistent use of shadcn/ui variants
- [ ] No deeply nested component hierarchies

#### **When in Doubt:**

1. **Check existing components** in `/components/ui/`
2. **Look at shadcn/ui docs** for usage examples
3. **Ask the team** before creating new base components
4. **Prefer composition** over creating new components

---

**Remember: Consistency trumps creativity. It's better to have a slightly imperfect but consistent UI than a beautiful but inconsistent one.**

---

## 📦 Import Organization

Our ESLint configuration automatically organizes imports in this order:

```tsx
// 1. Built-in Node.js modules
import path from 'path'
import fs from 'fs'

// 2. External packages (alphabetical)
import { clsx } from 'clsx'
import React from 'react'

// 3. Internal modules (alphabetical)
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 4. Parent directory imports
import { UserType } from '../types'

// 5. Same directory imports
import { UserProfile } from './user-profile'

// 6. Index files
import './styles.css'
```

**The linter will automatically fix import order on save!**

---

## 🔄 State Management in Next.js

Understanding when and how to manage state properly in Next.js vs traditional React is crucial for building scalable applications.

> **Key Insight**: Next.js is primarily a **server-side framework** where a single app instance serves all users. This fundamentally changes how we approach state management compared to React SPAs.

### 🏗️ Why Next.js State Management is Different

#### **The Server-Side Reality**

In React SPAs, each user gets their own app instance in the browser. In Next.js:

- **Single server instance** serves all users simultaneously
- **Global state** would be shared between different users (❌ problematic!)
- **Stateless approach** is preferred - each page gets the data it needs explicitly

#### **The Best State Management is No State Management**

Instead of managing state, leverage Next.js's built-in features:

- **Server Components** for data fetching (no loading states needed)
- **URL parameters** for navigation state
- **Cookies** for user preferences
- **Built-in caching** instead of client-side data stores

### 🎯 State Classification & Guidelines

#### 1. **Component-Level State** ✅

Use React's `useState` for state within a single component.

```tsx
'use client'

function ContactForm() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({ name: '', email: '' })

	// State stays within this component only
}
```

#### 2. **Page-Level State** ✅

Use React state for data shared across components within a single page.

```tsx
'use client'

function DashboardPage() {
	const [selectedTab, setSelectedTab] = useState('overview')

	return (
		<div>
			<TabNavigation activeTab={selectedTab} onTabChange={setSelectedTab} />
			<TabContent tab={selectedTab} />
		</div>
	)
}
```

#### 3. **Cross-Page State** ⚠️ **Avoid Global State**

**Instead of global state, use URL parameters or cookies:**

```tsx
// ❌ Don't: Global state across pages
const GlobalContext = createContext()

// ✅ Do: URL parameters for navigation state
// app/products/page.tsx
interface ProductsPageProps {
	searchParams: { category?: string; sort?: string; page?: string }
}

async function ProductsPage({ searchParams }: ProductsPageProps) {
	const category = searchParams.category || 'all'
	const sort = searchParams.sort || 'name'
	const page = parseInt(searchParams.page || '1')

	// Page is stateless - gets all data it needs from URL
	const products = await fetchProducts({ category, sort, page })

	return <ProductList products={products} />
}
```

### 🚫 Why Global State is Problematic in Next.js

#### **1. Forces Client Components**

```tsx
// ❌ Global state forces everything to be client-side
'use client'
function ProductsPage() {
	const { user, cart } = useGlobalState() // Forces client component
	// Loses server-side benefits: SEO, performance, caching
}

// ✅ Server component with explicit data
async function ProductsPage() {
	const user = await getCurrentUser() // Server-side
	const cart = await getUserCart(user.id) // Server-side
	// Better performance, SEO, and caching
}
```

#### **2. Creates Tight Coupling**

```tsx
// ❌ Page depends on state set elsewhere
function CheckoutPage() {
	const { cart } = useGlobalState() // Where was this set?
	// Hard to understand without following logic across pages
}

// ✅ Page gets everything it needs explicitly
async function CheckoutPage({ searchParams }: { searchParams: { cartId: string } }) {
	const cart = await getCart(searchParams.cartId)
	// Self-contained and easy to understand
}
```

#### **3. Loses Next.js Benefits**

- **No automatic caching** (server components get automatic request deduplication)
- **Larger client bundles** (more client-side JavaScript)
- **Slower initial page loads** (rendering happens in browser)

### 🔗 The Stateless Approach: URL Parameters & Cookies

#### **URL Parameters for Shareable State**

Perfect for state users might want to bookmark or share:

```tsx
// URL: /products?category=electronics&sort=price&page=2

// Page component receives all state via URL
async function ProductsPage({ searchParams }: ProductsPageProps) {
	const filters = {
		category: searchParams.category || 'all',
		sort: searchParams.sort || 'name',
		page: parseInt(searchParams.page || '1'),
	}

	const products = await fetchProducts(filters)

	return (
		<div>
			<ProductFilters currentFilters={filters} />
			<ProductList products={products} />
			<Pagination currentPage={filters.page} />
		</div>
	)
}

// Other pages can "set state" by changing the URL
function ProductCard({ product }: { product: Product }) {
	return <Link href={`/products?category=${product.category}&sort=price`}>View Similar Products</Link>
}
```

**Benefits of URL State:**

- ✅ **Persists on page refresh**
- ✅ **Bookmarkable and shareable**
- ✅ **Works with server components**
- ✅ **SEO-friendly**

#### **Cookies for User-Specific State**

Perfect for user preferences and session data:

```tsx
// Server component can read cookies
async function HomePage() {
	const cookieStore = await cookies()
	const theme = cookieStore.get('theme')?.value || 'light'
	const language = cookieStore.get('language')?.value || 'en'

	return (
		<div data-theme={theme}>
			<Header language={language} />
		</div>
	)
}

// Client component can set cookies
;('use client')
function ThemeToggle() {
	const [theme, setTheme] = useState('light')

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)

		// Set cookie for future requests
		document.cookie = `theme=${newTheme}; path=/; max-age=${60 * 60 * 24 * 30}`
	}

	return <button onClick={toggleTheme}>Toggle Theme</button>
}
```

### ⚡ Built-in Caching Instead of Client State

Next.js provides automatic caching that replaces the need for client-side data stores:

#### **1. Request Memoization** (Automatic)

```tsx
// Multiple calls to the same endpoint are automatically deduplicated
async function ProductPage({ params }: { params: { id: string } }) {
	const product = await fetch(`/api/products/${params.id}`) // Request 1
	const reviews = await fetchProductReviews(params.id) // May call same API
	const related = await fetchRelatedProducts(params.id) // May call same API

	// Only one request made if URLs are identical
}
```

#### **2. Data Cache** (Configurable)

```tsx
// Cache API responses across requests
async function getProducts() {
	const response = await fetch('/api/products', {
		cache: 'force-cache', // Cache indefinitely
		next: { revalidate: 60 }, // Or revalidate every 60 seconds
	})
	return response.json()
}

// Invalidate cache when needed
import { revalidatePath } from 'next/cache'

async function addProduct(product: Product) {
	await saveProduct(product)
	revalidatePath('/products') // Clear cache for products page
}
```

#### **3. Full Route Cache** (Automatic for static pages)

```tsx
// Static pages are pre-rendered and cached automatically
async function AboutPage() {
	// This page will be generated at build time and cached
	return <div>About Us</div>
}
```

### 🎛️ When You Do Need Client State

Sometimes client state is still necessary:

#### **Interactive UI Components**

```tsx
'use client'
function InteractiveChart({ data }: { data: ChartData }) {
	const [selectedPeriod, setSelectedPeriod] = useState('week')
	const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null)

	// UI-only state that doesn't need to persist
	return <Chart data={data} period={selectedPeriod} onHover={setHoveredPoint} />
}
```

#### **Form State Before Submission**

```tsx
'use client'
function ContactForm() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: '',
	})

	// Temporary state until form is submitted
}
```

#### **Real-time Features**

```tsx
'use client'
function ChatComponent() {
	const [messages, setMessages] = useState<Message[]>([])

	useEffect(() => {
		const ws = new WebSocket('/api/chat')
		ws.onmessage = event => {
			const message = JSON.parse(event.data)
			setMessages(prev => [...prev, message])
		}
	}, [])
}
```

### 🎯 Migration Strategy: From Global State to Stateless

#### **Step 1: Identify State Types**

- **Navigation state** → Move to URL parameters
- **User preferences** → Move to cookies
- **Cached API data** → Use Next.js caching
- **UI-only state** → Keep as local React state

#### **Step 2: Convert Global State**

```tsx
// Before: Global state
const { currentUser, cart, filters } = useGlobalState()

// After: Explicit dependencies
async function ShopPage({
	searchParams,
	cookies,
}: {
	searchParams: { category?: string; sort?: string }
	cookies: ReadonlyRequestCookies
}) {
	const currentUser = await getCurrentUser(cookies)
	const cart = await getUserCart(currentUser.id)
	const filters = {
		category: searchParams.category || 'all',
		sort: searchParams.sort || 'name',
	}

	const products = await fetchProducts(filters)
}
```

### 🎯 Best Practices Summary

#### ✅ **Do This:**

- **Start with Server Components** for all data
- **Use URL parameters** for shareable/bookmarkable state
- **Use cookies** for user preferences
- **Keep client state minimal** and component-scoped
- **Leverage Next.js caching** instead of client data stores
- **Make pages stateless** and self-contained

#### ❌ **Avoid This:**

- Global state across pages
- Client components for static data
- Complex client-side caching
- Tight coupling between pages
- State management libraries (usually unnecessary)

#### 🧪 **Testing Stateless Pages**

```tsx
// Easy to test - just pass props
test('ProductsPage renders correctly', async () => {
	const searchParams = { category: 'electronics', page: '1' }
	const { findByText } = render(<ProductsPage searchParams={searchParams} />)

	expect(await findByText('Electronics')).toBeInTheDocument()
})
```

> **Remember**: The goal is to embrace Next.js's server-side nature, not fight it. By keeping pages stateless and leveraging built-in features, you get better performance, SEO, and maintainability.

---

## 🧪 Testing Guidelines

Our project uses a comprehensive testing setup designed for teams new to testing. We use **Vitest** for unit/integration tests and **Playwright** for end-to-end tests.

### Testing Stack

- **Vitest** - Fast unit testing framework (better than Jest)
- **React Testing Library** - Component testing with best practices
- **Playwright** - Reliable end-to-end testing
- **MSW** - API mocking for realistic tests

### Types of Tests

#### 1. **Unit Tests** - Test individual functions

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatName } from '@/lib/utils'

describe('formatName', () => {
	it('should format full name correctly', () => {
		expect(formatName('John', 'Doe')).toBe('John Doe')
	})

	it('should handle missing names', () => {
		expect(formatName('', '')).toBe('Anonymous')
	})
})
```

#### 2. **Component Tests** - Test React components

```typescript
// tests/components/user-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserCard from '@/components/user-card'

describe('UserCard', () => {
	const mockUser = {
		id: '1',
		firstName: 'John',
		lastName: 'Doe',
		email: 'john@example.com'
	}

	it('should render user information', () => {
		render(<UserCard user={mockUser} />)

		expect(screen.getByText('John Doe')).toBeInTheDocument()
		expect(screen.getByText('john@example.com')).toBeInTheDocument()
	})

	it('should handle button clicks', async () => {
		const user = userEvent.setup()
		const mockOnEdit = vi.fn()

		render(<UserCard user={mockUser} onEdit={mockOnEdit} />)

		await user.click(screen.getByRole('button', { name: 'Edit' }))
		expect(mockOnEdit).toHaveBeenCalledTimes(1)
	})
})
```

#### 3. **E2E Tests** - Test complete user workflows

```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('should load homepage successfully', async ({ page }) => {
	await page.goto('/')

	await expect(page).toHaveTitle(/Next.js/)
	await expect(page.locator('main')).toBeVisible()
})
```

### Available Test Commands

```bash
# Run all unit/component tests
bun run test

# Run tests in watch mode (re-runs on file changes)
bun run test:watch

# Generate test coverage report
bun run test:coverage

# Run E2E tests
bun run test:e2e

# Run all tests (unit + E2E)
bun run test:all
```

### Testing Best Practices

#### ✅ Do This:

- **Test behavior, not implementation**
- **Use descriptive test names** that explain what's being tested
- **Test edge cases** (empty inputs, null values, errors)
- **Use `data-testid`** for reliable element selection
- **Mock external dependencies** (APIs, third-party libraries)

#### ❌ Avoid This:

- Testing internal component state
- Testing CSS styles (unless critical for functionality)
- Writing tests that break with UI changes
- Overly complex test setup

### Team Testing Guidelines

#### For Beginners:

1. **Start with unit tests** - they're easiest to understand
2. **Write tests for new features** before marking them complete
3. **Use the examples** in our test files as templates

#### Code Review Checklist:

- [ ] New features have corresponding tests
- [ ] Tests are descriptive and easy to understand
- [ ] Edge cases are covered
- [ ] Tests pass locally

---

## 🎯 Commit Guidelines

We use **Conventional Commits** for consistent commit messages:

### Format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples:

```bash
# ✅ Good commits
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(ui): resolve button alignment issue"
git commit -m "docs: update development guide"
git commit -m "style(components): format user-profile component"

# ❌ Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "Update file.tsx"
```

---

## 🪝 Pre-commit Hooks

Our pre-commit hooks automatically run before each commit:

### What Runs:

1. **ESLint** - Automatically fixes code issues
2. **Prettier** - Formats code consistently
3. **TypeScript** - Type checking
4. **Commitlint** - Validates commit message format

### Files Processed:

- **JavaScript/TypeScript**: ESLint + Prettier
- **JSON/Markdown**: Prettier only

### If Hooks Fail:

- Fix the reported issues
- Stage your changes: `git add .`
- Commit again: `git commit -m "your message"`

### Running Tests Before Commit:

While tests aren't automatically run on commit (to keep commits fast), you should run them before pushing:

```bash
bun run test        # Quick unit tests
bun run test:all    # Full test suite (slower)
```

### Bypassing Hooks (Emergency Only):

```bash
# ⚠️ Only use in emergencies!
git commit --no-verify -m "emergency fix"
```

---

## 🚀 Getting Started

1. **Clone and setup**:

   ```bash
   git clone <repo>
   bun install
   ```

2. **Start development**:

   ```bash
   bun dev
   ```

3. **Before committing**:

   ```bash
   bun run lint        # Check for issues
   bun run lint:fix    # Auto-fix issues
   bun run type-check  # Check TypeScript
   bun run test        # Run tests
   bun run format      # Format code
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

---

## 🤝 Team Guidelines

### Code Reviews

- All pull requests require review
- Check that ESLint passes
- Verify naming conventions
- Ensure tests are included and passing
- Test functionality manually

### Questions?

- Check this guide first
- Ask in team chat
- Create an issue for unclear guidelines

---

**Happy coding! 🎉**
