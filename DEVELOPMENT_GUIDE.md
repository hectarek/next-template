# Development Guide

> **Comprehensive guidelines for consistent, high-quality code in our Next.js project**

## 📋 Table of Contents

- [ESLint Configuration](#eslint-configuration)
- [File Naming Conventions](#file-naming-conventions)
- [Code Style & Best Practices](#code-style--best-practices)
- [Import Organization](#import-organization)
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

## 📝 Commit Guidelines

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
- Test functionality

### Questions?

- Check this guide first
- Ask in team chat
- Create an issue for unclear guidelines

---

**Happy coding! 🎉**
