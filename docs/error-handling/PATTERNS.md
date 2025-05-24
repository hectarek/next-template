# 🛡️ Error Handling Patterns

This guide outlines comprehensive error handling strategies across all layers of our Next.js application, ensuring consistent, user-friendly error management and debugging capabilities.

## 🎯 Error Handling Philosophy

### 1. **Fail Fast, Recover Gracefully**

Detect errors early but provide graceful fallbacks for users.

### 2. **Consistent Error Format**

Standardized error structure across all application layers.

### 3. **User-Friendly Messages**

Never expose technical errors to end users.

### 4. **Comprehensive Logging**

Detailed error information for debugging while maintaining security.

### 5. **Progressive Enhancement**

Applications should degrade gracefully when errors occur.

## 🏗️ Error Classification

### **Error Types**

```typescript
// Error classification for proper handling
enum ErrorType {
	VALIDATION = 'VALIDATION_ERROR',
	NOT_FOUND = 'NOT_FOUND',
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',
	CONFLICT = 'CONFLICT',
	RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
	SERVER = 'INTERNAL_SERVER_ERROR',
	NETWORK = 'NETWORK_ERROR',
	TIMEOUT = 'TIMEOUT_ERROR',
}

// Standardized error interface
interface AppError {
	type: ErrorType
	message: string
	code?: string
	field?: string
	details?: Record<string, any>
	statusCode?: number
	timestamp: Date
	requestId?: string
}
```

## 🔧 Layer-Specific Error Handling

### **1. Database Layer (Prisma)**

#### **Service Layer Error Handling**

```typescript
// services/user.service.ts
import { Prisma, User } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export class UserService {
	static async create(data: CreateUserInput): Promise<User> {
		try {
			return await prisma.user.create({ data })
		} catch (error) {
			// Handle Prisma-specific errors
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				switch (error.code) {
					case 'P2002':
						throw new AppError({
							type: ErrorType.CONFLICT,
							message: 'A user with this email already exists',
							field: 'email',
							code: 'DUPLICATE_EMAIL',
							statusCode: 409,
						})
					case 'P2025':
						throw new AppError({
							type: ErrorType.NOT_FOUND,
							message: 'User not found',
							code: 'USER_NOT_FOUND',
							statusCode: 404,
						})
					default:
						console.error('Prisma error:', error)
						throw new AppError({
							type: ErrorType.SERVER,
							message: 'Database operation failed',
							statusCode: 500,
						})
				}
			}

			// Handle validation errors
			if (error instanceof Prisma.PrismaClientValidationError) {
				throw new AppError({
					type: ErrorType.VALIDATION,
					message: 'Invalid data provided',
					details: { validation: error.message },
					statusCode: 400,
				})
			}

			// Unknown error
			console.error('Unexpected error in UserService.create:', error)
			throw new AppError({
				type: ErrorType.SERVER,
				message: 'An unexpected error occurred',
				statusCode: 500,
			})
		}
	}

	static async getById(id: string): Promise<User | null> {
		try {
			// Validate ID format
			if (!id || typeof id !== 'string') {
				throw new AppError({
					type: ErrorType.VALIDATION,
					message: 'Valid user ID is required',
					field: 'id',
					statusCode: 400,
				})
			}

			return await prisma.user.findUnique({ where: { id } })
		} catch (error) {
			if (error instanceof AppError) {
				throw error
			}

			console.error('Error fetching user:', error)
			throw new AppError({
				type: ErrorType.SERVER,
				message: 'Failed to fetch user',
				statusCode: 500,
			})
		}
	}
}

// Custom error class
export class AppError extends Error {
	public readonly type: ErrorType
	public readonly statusCode: number
	public readonly code?: string
	public readonly field?: string
	public readonly details?: Record<string, any>
	public readonly timestamp: Date
	public readonly requestId?: string

	constructor(params: {
		type: ErrorType
		message: string
		statusCode?: number
		code?: string
		field?: string
		details?: Record<string, any>
		requestId?: string
	}) {
		super(params.message)

		this.name = 'AppError'
		this.type = params.type
		this.statusCode = params.statusCode || 500
		this.code = params.code
		this.field = params.field
		this.details = params.details
		this.timestamp = new Date()
		this.requestId = params.requestId

		// Maintains proper stack trace for where error was thrown
		Error.captureStackTrace(this, AppError)
	}

	toJSON() {
		return {
			type: this.type,
			message: this.message,
			code: this.code,
			field: this.field,
			details: this.details,
			statusCode: this.statusCode,
			timestamp: this.timestamp,
			requestId: this.requestId,
		}
	}
}
```

### **2. API Layer Error Handling**

#### **Centralized API Error Handler**

```typescript
// lib/api/error-handler.ts
import { NextResponse } from 'next/server'
import { AppError, ErrorType } from './errors'

export interface ApiErrorResponse {
	error: string
	code?: string
	field?: string
	details?: Record<string, any>
	timestamp: string
	requestId?: string
}

export function handleApiError(error: unknown, context: string, requestId?: string): NextResponse<ApiErrorResponse> {
	console.error(`${context} error:`, error)

	// Handle our custom AppError
	if (error instanceof AppError) {
		return NextResponse.json(
			{
				error: error.message,
				code: error.code,
				field: error.field,
				details: error.details,
				timestamp: error.timestamp.toISOString(),
				requestId: error.requestId || requestId,
			},
			{ status: error.statusCode }
		)
	}

	// Handle Prisma errors that escaped service layer
	if (error && typeof error === 'object' && 'code' in error) {
		const prismaError = error as any
		switch (prismaError.code) {
			case 'P2002':
				return NextResponse.json(
					{
						error: 'Resource already exists',
						code: 'DUPLICATE_RESOURCE',
						timestamp: new Date().toISOString(),
						requestId,
					},
					{ status: 409 }
				)
			case 'P2025':
				return NextResponse.json(
					{
						error: 'Resource not found',
						code: 'RESOURCE_NOT_FOUND',
						timestamp: new Date().toISOString(),
						requestId,
					},
					{ status: 404 }
				)
		}
	}

	// Handle validation errors
	if (error instanceof TypeError && error.message.includes('validation')) {
		return NextResponse.json(
			{
				error: 'Invalid request data',
				code: 'VALIDATION_ERROR',
				timestamp: new Date().toISOString(),
				requestId,
			},
			{ status: 400 }
		)
	}

	// Default server error
	return NextResponse.json(
		{
			error: 'Internal server error',
			code: 'INTERNAL_ERROR',
			timestamp: new Date().toISOString(),
			requestId,
		},
		{ status: 500 }
	)
}

// Request validation helper
export function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>): T {
	try {
		return schema.parse(data)
	} catch (error) {
		if (error instanceof z.ZodError) {
			const firstError = error.errors[0]
			throw new AppError({
				type: ErrorType.VALIDATION,
				message: firstError.message,
				field: firstError.path.join('.'),
				code: 'VALIDATION_ERROR',
				details: { errors: error.errors },
				statusCode: 400,
			})
		}
		throw error
	}
}
```

#### **API Route Implementation**

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UserService } from '@/services/user.service'
import { handleApiError, validateRequest } from '@/lib/api/error-handler'

// Request validation schema
const CreateUserSchema = z.object({
	email: z.string().email('Invalid email format'),
	name: z.string().min(1, 'Name is required').optional(),
	avatar: z.string().url('Invalid URL format').optional(),
})

export async function POST(request: NextRequest) {
	const requestId = crypto.randomUUID()

	try {
		// Parse and validate request body
		const body = await request.json().catch(() => {
			throw new AppError({
				type: ErrorType.VALIDATION,
				message: 'Invalid JSON in request body',
				code: 'INVALID_JSON',
				statusCode: 400,
				requestId,
			})
		})

		const userData = validateRequest(body, CreateUserSchema)

		// Create user through service layer
		const user = await UserService.create(userData)

		return NextResponse.json(user, { status: 201 })
	} catch (error) {
		return handleApiError(error, 'POST /api/users', requestId)
	}
}

export async function GET(request: NextRequest) {
	const requestId = crypto.randomUUID()

	try {
		const { searchParams } = new URL(request.url)

		// Validate query parameters
		const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
		const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))

		const result = await UserService.getMany({ page, limit })

		return NextResponse.json(result)
	} catch (error) {
		return handleApiError(error, 'GET /api/users', requestId)
	}
}
```

### **3. Client-Side Error Handling**

#### **API Client with Error Handling**

```typescript
// lib/api/client.ts
export class ApiClient {
	private baseUrl: string

	constructor(baseUrl = '') {
		this.baseUrl = baseUrl
	}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`

		try {
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				...options,
			})

			// Handle HTTP errors
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))

				throw new ClientError({
					message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
					statusCode: response.status,
					code: errorData.code,
					field: errorData.field,
					details: errorData.details,
				})
			}

			return await response.json()
		} catch (error) {
			if (error instanceof ClientError) {
				throw error
			}

			// Network or other errors
			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new ClientError({
					message: 'Network error - please check your connection',
					code: 'NETWORK_ERROR',
					statusCode: 0,
				})
			}

			throw new ClientError({
				message: 'An unexpected error occurred',
				code: 'UNKNOWN_ERROR',
				statusCode: 500,
			})
		}
	}
}

// Client-side error class
export class ClientError extends Error {
	public readonly statusCode: number
	public readonly code?: string
	public readonly field?: string
	public readonly details?: Record<string, any>

	constructor(params: {
		message: string
		statusCode: number
		code?: string
		field?: string
		details?: Record<string, any>
	}) {
		super(params.message)

		this.name = 'ClientError'
		this.statusCode = params.statusCode
		this.code = params.code
		this.field = params.field
		this.details = params.details
	}

	get isNetworkError() {
		return this.statusCode === 0 || this.code === 'NETWORK_ERROR'
	}

	get isValidationError() {
		return this.statusCode === 400 || this.code === 'VALIDATION_ERROR'
	}

	get isNotFoundError() {
		return this.statusCode === 404 || this.code === 'NOT_FOUND'
	}

	get isServerError() {
		return this.statusCode >= 500
	}
}

// API client instance
export const apiClient = new ApiClient()
```

### **4. Component Error Handling**

#### **React Error Boundary**

```typescript
// components/error-boundary.tsx
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // this.logErrorToService(error, errorInfo)
    }

    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
            <CardDescription>
              We're sorry, but something unexpected happened.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <details className="text-sm text-gray-600">
                <summary>Error details (development only)</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="w-full"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
```

#### **Component with Error Handling**

```typescript
// components/example/user-form.tsx
'use client'

import { useState } from 'react'
import { ClientError } from '@/lib/api/client'
import { createUser } from '@/lib/api/users'

export function UserForm() {
  const [formData, setFormData] = useState({ email: '', name: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      await createUser(formData)

      // Success handling
      setFormData({ email: '', name: '' })
      // Show success message

    } catch (error) {
      if (error instanceof ClientError) {
        // Handle specific error types
        if (error.isValidationError && error.field) {
          setErrors({ [error.field]: error.message })
        } else if (error.isNetworkError) {
          setErrors({
            submit: 'Network error. Please check your connection and try again.'
          })
        } else if (error.statusCode === 409) {
          setErrors({
            email: 'A user with this email already exists'
          })
        } else {
          setErrors({
            submit: 'Failed to create user. Please try again.'
          })
        }
      } else {
        setErrors({
          submit: 'An unexpected error occurred. Please try again.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
          <p className="text-red-700 text-sm" role="alert">
            {errors.submit}
          </p>
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

## 🔍 Error Monitoring & Logging

### **Development Logging**

```typescript
// lib/logger.ts
export const logger = {
	error: (message: string, error?: any, context?: Record<string, any>) => {
		console.error(`[ERROR] ${message}`, {
			error: error?.message || error,
			stack: error?.stack,
			timestamp: new Date().toISOString(),
			...context,
		})
	},

	warn: (message: string, context?: Record<string, any>) => {
		console.warn(`[WARN] ${message}`, {
			timestamp: new Date().toISOString(),
			...context,
		})
	},

	info: (message: string, context?: Record<string, any>) => {
		console.info(`[INFO] ${message}`, {
			timestamp: new Date().toISOString(),
			...context,
		})
	},
}
```

### **Production Error Tracking**

```typescript
// lib/error-tracking.ts
export function trackError(error: Error, context?: Record<string, any>) {
	if (process.env.NODE_ENV === 'production') {
		// Send to external error tracking service
		// e.g., Sentry, LogRocket, Bugsnag
		console.error('Production error:', {
			message: error.message,
			stack: error.stack,
			context,
			timestamp: new Date().toISOString(),
			userAgent: navigator?.userAgent,
			url: window?.location?.href,
		})
	}
}
```

## 📋 Error Handling Best Practices

### **✅ Do's**

- Always handle errors at the appropriate layer
- Provide meaningful error messages to users
- Log detailed error information for debugging
- Use consistent error formats across the application
- Implement proper fallback UI for errors
- Validate input data early and comprehensively
- Use TypeScript for better error prevention
- Test error scenarios in your test suite

### **❌ Don'ts**

- Don't expose sensitive information in error messages
- Don't ignore or suppress errors silently
- Don't use generic error messages for all scenarios
- Don't let errors crash the entire application
- Don't forget to handle async operation errors
- Don't rely only on client-side validation
- Don't log sensitive data in error messages

### **🎯 Error Handling Guidelines**

#### **User Experience**

```typescript
// ✅ Good - User-friendly error messages
'Please enter a valid email address'
'This email is already registered. Try signing in instead.'
'Unable to save your changes. Please try again.'

// ❌ Bad - Technical error messages
'ValidationError: email must match regex pattern'
'Prisma error P2002: Unique constraint violation'
"TypeError: Cannot read property 'id' of undefined"
```

#### **Error Recovery**

```typescript
// ✅ Good - Provide recovery options
function SubmitButton({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-2">
      <p className="text-red-600">Failed to submit form</p>
      <Button onClick={onRetry}>Try Again</Button>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  )
}
```

## 📚 Related Documentation

- **[API Design Patterns](../api/DESIGN_PATTERNS.md)** - API error response patterns
- **[Testing Strategy](../testing/STRATEGY.md)** - Testing error scenarios
- **[Component Development](../components/DEVELOPMENT_GUIDE.md)** - Component error handling
- **[Database & Service Layer](../database/SERVICE_LAYER.md)** - Service layer error patterns

---

Consistent error handling across all layers ensures a robust, maintainable application with excellent user experience and debugging capabilities.
