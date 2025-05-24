// API Client - Shared fetch wrapper for consistent API calls
// This allows the same API to be called from client components, server actions, or external apps

export type ApiResponse<T> = {
	data: T
	error?: never
	message?: string
}

export type ApiError = {
	data?: never
	error: string
	message: string
	statusCode: number
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export class ApiClient {
	private baseUrl: string

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
	}

	/**
	 * Make a generic API request
	 */
	async request<T>(
		endpoint: string,
		options: RequestInit & {
			params?: Record<string, string | number | boolean>
		} = {}
	): Promise<T> {
		const { params, ...fetchOptions } = options

		// Build URL with query parameters
		const url = new URL(`${this.baseUrl}${endpoint}`)
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, String(value))
			})
		}

		// Default headers
		const headers = {
			'Content-Type': 'application/json',
			...fetchOptions.headers,
		}

		const response = await fetch(url.toString(), {
			...fetchOptions,
			headers,
		})

		if (!response.ok) {
			const errorData = await response.text()
			let errorMessage: string

			try {
				const parsedError = JSON.parse(errorData)
				errorMessage = parsedError.message ?? parsedError.error ?? 'An error occurred'
			} catch {
				errorMessage = errorData ?? 'An error occurred'
			}

			throw new ApiClientError(errorMessage, response.status)
		}

		// Handle empty responses
		const contentType = response.headers.get('content-type')
		if (!contentType?.includes('application/json')) {
			return {} as T
		}

		return response.json()
	}

	/**
	 * GET request
	 */
	async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
		return this.request<T>(endpoint, { method: 'GET', params })
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		})
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		})
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
		})
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' })
	}
}

// Custom error class for API errors
export class ApiClientError extends Error {
	constructor(
		message: string,
		public statusCode: number
	) {
		super(message)
		this.name = 'ApiClientError'
	}
}

// Default client instance
export const apiClient = new ApiClient()

// Convenience functions using the default client
export const api = {
	get: <T>(endpoint: string, params?: Record<string, string | number | boolean>) => apiClient.get<T>(endpoint, params),
	post: <T>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data),
	put: <T>(endpoint: string, data?: unknown) => apiClient.put<T>(endpoint, data),
	patch: <T>(endpoint: string, data?: unknown) => apiClient.patch<T>(endpoint, data),
	delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
}
