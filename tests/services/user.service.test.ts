import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'

import { prisma } from '@/lib/prisma'
import { UserService } from '@/services/user.service'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
	prisma: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findMany: vi.fn(),
			count: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}))

const mockPrisma = prisma as any

describe('UserService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('create', () => {
		it('creates a new user successfully', async () => {
			const userData = {
				email: 'test@example.com',
				name: 'Test User',
				avatar: 'https://example.com/avatar.jpg',
			}

			const expectedUser = {
				id: '1',
				...userData,
				role: 'USER',
				isActive: true,
				metadata: null,
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

		it('handles duplicate email error', async () => {
			const userData = {
				email: 'existing@example.com',
				name: 'Test User',
			}

			const prismaError = {
				code: 'P2002',
				message: 'Unique constraint failed',
			}

			mockPrisma.user.create.mockRejectedValueOnce(prismaError)

			await expect(UserService.create(userData)).rejects.toThrow('A user with this email already exists')
		})

		it('handles unknown errors', async () => {
			const userData = {
				email: 'test@example.com',
			}

			const unknownError = new Error('Database connection failed')
			mockPrisma.user.create.mockRejectedValueOnce(unknownError)

			await expect(UserService.create(userData)).rejects.toThrow(unknownError)
		})
	})

	describe('getById', () => {
		it('gets user by id without relations', async () => {
			const userId = '1'
			const expectedUser = {
				id: userId,
				email: 'test@example.com',
				name: 'Test User',
				role: 'USER',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.findUnique.mockResolvedValueOnce(expectedUser)

			const result = await UserService.getById(userId)

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: userId },
			})
			expect(result).toEqual(expectedUser)
		})

		it('gets user by id with relations', async () => {
			const userId = '1'
			const expectedUser = {
				id: userId,
				email: 'test@example.com',
				name: 'Test User',
				role: 'USER',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				_count: {
					posts: 5,
					comments: 12,
				},
			}

			mockPrisma.user.findUnique.mockResolvedValueOnce(expectedUser)

			const result = await UserService.getById(userId, true)

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { id: userId },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})
			expect(result).toEqual(expectedUser)
		})

		it('returns null for non-existent user', async () => {
			mockPrisma.user.findUnique.mockResolvedValueOnce(null)

			const result = await UserService.getById('non-existent-id')

			expect(result).toBeNull()
		})
	})

	describe('getByEmail', () => {
		it('gets user by email successfully', async () => {
			const email = 'test@example.com'
			const expectedUser = {
				id: '1',
				email,
				name: 'Test User',
				role: 'USER',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.findUnique.mockResolvedValueOnce(expectedUser)

			const result = await UserService.getByEmail(email)

			expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
				where: { email },
			})
			expect(result).toEqual(expectedUser)
		})
	})

	describe('getMany', () => {
		const mockUsers = [
			{
				id: '1',
				email: 'user1@example.com',
				name: 'User 1',
				role: 'USER',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				_count: { posts: 2, comments: 5 },
			},
			{
				id: '2',
				email: 'user2@example.com',
				name: 'User 2',
				role: 'ADMIN',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				_count: { posts: 8, comments: 15 },
			},
		]

		it('gets users with default options', async () => {
			mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers)
			mockPrisma.user.count.mockResolvedValueOnce(2)

			const result = await UserService.getMany()

			expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
				where: {},
				skip: 0,
				take: 10,
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})

			expect(result).toEqual({
				users: mockUsers,
				total: 2,
				hasMore: false,
			})
		})

		it('gets users with custom pagination', async () => {
			mockPrisma.user.findMany.mockResolvedValueOnce([mockUsers[0]])
			mockPrisma.user.count.mockResolvedValueOnce(2)

			const result = await UserService.getMany({
				page: 2,
				limit: 1,
			})

			expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
				where: {},
				skip: 1, // (page 2 - 1) * limit 1
				take: 1,
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})

			expect(result).toEqual({
				users: [mockUsers[0]],
				total: 2,
				hasMore: false,
			})
		})

		it('gets users with search filter', async () => {
			mockPrisma.user.findMany.mockResolvedValueOnce([mockUsers[0]])
			mockPrisma.user.count.mockResolvedValueOnce(1)

			const result = await UserService.getMany({
				search: 'User 1',
			})

			expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
				where: {
					OR: [
						{ name: { contains: 'User 1', mode: 'insensitive' } },
						{ email: { contains: 'User 1', mode: 'insensitive' } },
					],
				},
				skip: 0,
				take: 10,
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})

			expect(result).toEqual({
				users: [mockUsers[0]],
				total: 1,
				hasMore: false,
			})
		})

		it('gets users with role and isActive filters', async () => {
			mockPrisma.user.findMany.mockResolvedValueOnce([mockUsers[1]])
			mockPrisma.user.count.mockResolvedValueOnce(1)

			const result = await UserService.getMany({
				role: 'ADMIN',
				isActive: true,
			})

			expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
				where: {
					role: 'ADMIN',
					isActive: true,
				},
				skip: 0,
				take: 10,
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})

			expect(result).toEqual({
				users: [mockUsers[1]],
				total: 1,
				hasMore: false,
			})
		})

		it('calculates hasMore correctly', async () => {
			mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers)
			mockPrisma.user.count.mockResolvedValueOnce(15) // More than returned

			const result = await UserService.getMany({ limit: 2 })

			expect(result.hasMore).toBe(true)
		})
	})

	describe('update', () => {
		it('updates user successfully', async () => {
			const userId = '1'
			const updateData = {
				name: 'Updated Name',
				role: 'MODERATOR' as const,
			}

			const updatedUser = {
				id: userId,
				email: 'test@example.com',
				name: 'Updated Name',
				role: 'MODERATOR',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.update.mockResolvedValueOnce(updatedUser)

			const result = await UserService.update(userId, updateData)

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: userId },
				data: updateData,
			})
			expect(result).toEqual(updatedUser)
		})

		it('handles user not found error', async () => {
			const prismaError = {
				code: 'P2025',
				message: 'Record not found',
			}

			mockPrisma.user.update.mockRejectedValueOnce(prismaError)

			await expect(UserService.update('non-existent', { name: 'New Name' })).rejects.toThrow('User not found')
		})
	})

	describe('delete', () => {
		it('performs soft delete by default', async () => {
			const userId = '1'
			const softDeletedUser = {
				id: userId,
				email: 'test@example.com',
				name: 'Test User',
				role: 'USER',
				isActive: false, // Soft deleted
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.update.mockResolvedValueOnce(softDeletedUser)

			const result = await UserService.delete(userId)

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: userId },
				data: { isActive: false },
			})
			expect(result).toEqual(softDeletedUser)
		})

		it('performs hard delete when specified', async () => {
			const userId = '1'
			const deletedUser = {
				id: userId,
				email: 'test@example.com',
				name: 'Test User',
				role: 'USER',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.delete.mockResolvedValueOnce(deletedUser)

			const result = await UserService.delete(userId, false)

			expect(mockPrisma.user.delete).toHaveBeenCalledWith({
				where: { id: userId },
			})
			expect(result).toEqual(deletedUser)
		})

		it('handles user not found error for hard delete', async () => {
			const prismaError = {
				code: 'P2025',
				message: 'Record not found',
			}

			mockPrisma.user.delete.mockRejectedValueOnce(prismaError)

			await expect(UserService.delete('non-existent', false)).rejects.toThrow('User not found')
		})
	})

	describe('getStats', () => {
		it('calculates user statistics correctly', async () => {
			const now = new Date('2024-01-15') // Mid-month for testing
			vi.setSystemTime(now)

			mockPrisma.user.count
				.mockResolvedValueOnce(100) // totalUsers
				.mockResolvedValueOnce(85) // activeUsers
				.mockResolvedValueOnce(12) // newUsersThisMonth

			const result = await UserService.getStats()

			expect(mockPrisma.user.count).toHaveBeenCalledTimes(3)
			expect(mockPrisma.user.count).toHaveBeenNthCalledWith(1) // Total users
			expect(mockPrisma.user.count).toHaveBeenNthCalledWith(2, {
				where: { isActive: true },
			})
			expect(mockPrisma.user.count).toHaveBeenNthCalledWith(3, {
				where: { createdAt: { gte: new Date('2024-01-01') } },
			})

			expect(result).toEqual({
				totalUsers: 100,
				activeUsers: 85,
				newUsersThisMonth: 12,
			})

			vi.useRealTimers()
		})

		it('handles edge case of end of month', async () => {
			const now = new Date('2024-02-29') // Leap year end of February
			vi.setSystemTime(now)

			mockPrisma.user.count.mockResolvedValueOnce(100).mockResolvedValueOnce(85).mockResolvedValueOnce(5)

			await UserService.getStats()

			expect(mockPrisma.user.count).toHaveBeenNthCalledWith(3, {
				where: { createdAt: { gte: new Date('2024-02-01') } },
			})

			vi.useRealTimers()
		})
	})

	describe('Error handling', () => {
		it('propagates unknown Prisma errors', async () => {
			const unknownError = new Error('Connection timeout')
			mockPrisma.user.create.mockRejectedValueOnce(unknownError)

			await expect(UserService.create({ email: 'test@example.com' })).rejects.toThrow(unknownError)
		})

		it('handles null/undefined edge cases', async () => {
			// Test with minimal data
			const minimalData = { email: 'test@example.com' }
			const expectedUser = {
				id: '1',
				email: 'test@example.com',
				name: undefined,
				avatar: undefined,
				role: 'USER',
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockPrisma.user.create.mockResolvedValueOnce(expectedUser)

			const result = await UserService.create(minimalData)

			expect(mockPrisma.user.create).toHaveBeenCalledWith({
				data: minimalData,
			})
			expect(result).toEqual(expectedUser)
		})
	})
})
