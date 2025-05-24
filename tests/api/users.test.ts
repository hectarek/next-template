import { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { GET, POST } from '@/app/api/users/route'
import { UserService } from '@/services/user.service'
import type { UserWithCounts } from '@/services/user.service'

// Mock the UserService
vi.mock('@/services/user.service', () => ({
	UserService: {
		getMany: vi.fn(),
		create: vi.fn(),
	},
}))

const mockUserService = vi.mocked(UserService)

describe('/api/users', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('GET /api/users', () => {
		it('returns users with default pagination', async () => {
			const mockUsers: UserWithCounts[] = [
				{
					id: '1',
					email: 'user1@example.com',
					name: 'User 1',
					avatar: null,
					role: 'USER',
					isActive: true,
					metadata: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					_count: { posts: 2, comments: 5 },
				},
			]

			mockUserService.getMany.mockResolvedValueOnce({
				users: mockUsers,
				total: 1,
				hasMore: false,
			})

			const request = new NextRequest('http://localhost:3000/api/users')
			const response = await GET(request)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({
				users: mockUsers,
				total: 1,
				hasMore: false,
			})
			expect(mockUserService.getMany).toHaveBeenCalledWith({})
		})

		it('handles pagination parameters', async () => {
			const mockUsers: UserWithCounts[] = []
			mockUserService.getMany.mockResolvedValueOnce({
				users: mockUsers,
				total: 0,
				hasMore: false,
			})

			const request = new NextRequest('http://localhost:3000/api/users?page=2&limit=5')
			const response = await GET(request)

			expect(response.status).toBe(200)
			expect(mockUserService.getMany).toHaveBeenCalledWith({
				page: 2,
				limit: 5,
			})
		})

		it('handles search and filter parameters', async () => {
			const mockUsers: UserWithCounts[] = []
			mockUserService.getMany.mockResolvedValueOnce({
				users: mockUsers,
				total: 0,
				hasMore: false,
			})

			const request = new NextRequest('http://localhost:3000/api/users?search=john&role=ADMIN&isActive=true')
			const response = await GET(request)

			expect(response.status).toBe(200)
			expect(mockUserService.getMany).toHaveBeenCalledWith({
				search: 'john',
				role: 'ADMIN',
				isActive: true,
			})
		})

		it('handles service errors', async () => {
			mockUserService.getMany.mockRejectedValueOnce(new Error('Database error'))

			const request = new NextRequest('http://localhost:3000/api/users')
			const response = await GET(request)
			const data = await response.json()

			expect(response.status).toBe(500)
			expect(data).toEqual({
				error: 'Internal server error',
			})
		})

		it('validates boolean parameters correctly', async () => {
			const mockUsers: UserWithCounts[] = []
			mockUserService.getMany.mockResolvedValueOnce({
				users: mockUsers,
				total: 0,
				hasMore: false,
			})

			// Test with string 'false'
			const request = new NextRequest('http://localhost:3000/api/users?isActive=false')
			const response = await GET(request)

			expect(response.status).toBe(200)
			expect(mockUserService.getMany).toHaveBeenCalledWith({
				isActive: false,
			})
		})
	})

	describe('POST /api/users', () => {
		it('creates a new user successfully', async () => {
			const userData = {
				email: 'newuser@example.com',
				name: 'New User',
				avatar: 'https://example.com/avatar.jpg',
			}

			const createdUser = {
				id: '1',
				...userData,
				role: 'USER' as const,
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockUserService.create.mockResolvedValueOnce(createdUser)

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(createdUser)
			expect(mockUserService.create).toHaveBeenCalledWith(userData)
		})

		it('validates required email field', async () => {
			const invalidData = {
				name: 'User without email',
			}

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(invalidData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toContain('email')
			expect(mockUserService.create).not.toHaveBeenCalled()
		})

		it('validates email format', async () => {
			const invalidData = {
				email: 'invalid-email',
				name: 'Test User',
			}

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(invalidData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toContain('valid email')
			expect(mockUserService.create).not.toHaveBeenCalled()
		})

		it('handles duplicate email error from service', async () => {
			const userData = {
				email: 'existing@example.com',
				name: 'Test User',
			}

			mockUserService.create.mockRejectedValueOnce(new Error('A user with this email already exists'))

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toBe('A user with this email already exists')
		})

		it('handles service errors', async () => {
			const userData = {
				email: 'test@example.com',
				name: 'Test User',
			}

			mockUserService.create.mockRejectedValueOnce(new Error('Database connection failed'))

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(500)
			expect(data.error).toBe('Internal server error')
		})

		it('handles malformed JSON', async () => {
			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: 'invalid json',
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toContain('Invalid JSON')
		})

		it('creates user with minimal data', async () => {
			const minimalData = {
				email: 'minimal@example.com',
			}

			const createdUser = {
				id: '1',
				email: 'minimal@example.com',
				name: null,
				avatar: null,
				role: 'USER' as const,
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockUserService.create.mockResolvedValueOnce(createdUser)

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(minimalData),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(createdUser)
			expect(mockUserService.create).toHaveBeenCalledWith(minimalData)
		})
	})

	describe('Error handling edge cases', () => {
		it('handles empty request body for POST', async () => {
			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: '',
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toContain('Invalid JSON')
		})

		it('handles missing Content-Type header', async () => {
			const userData = {
				email: 'test@example.com',
				name: 'Test User',
			}

			const request = new NextRequest('http://localhost:3000/api/users', {
				method: 'POST',
				body: JSON.stringify(userData),
			})

			const response = await POST(request)

			// Should still work as JSON.parse can handle the body
			expect(response.status).toBeLessThan(500)
		})
	})
})
