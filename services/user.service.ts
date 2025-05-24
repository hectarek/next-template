import { User, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

// Types for API layer
export type CreateUserInput = {
	email: string
	name?: string
	avatar?: string
}

export type UpdateUserInput = {
	name?: string
	avatar?: string
	role?: 'USER' | 'MODERATOR' | 'ADMIN'
	isActive?: boolean
	metadata?: Prisma.InputJsonValue
}

export type UserWithCounts = User & {
	_count: {
		posts: number
		comments: number
	}
}

// User Service - Core business logic
export class UserService {
	/**
	 * Create a new user
	 */
	static async create(data: CreateUserInput): Promise<User> {
		try {
			return await prisma.user.create({
				data: {
					email: data.email,
					name: data.name,
					avatar: data.avatar,
				},
			})
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
				throw new Error('A user with this email already exists')
			}
			throw error
		}
	}

	/**
	 * Get user by ID with optional relations
	 */
	static async getById(id: string, includeRelations = false): Promise<User | UserWithCounts | null> {
		if (includeRelations) {
			return await prisma.user.findUnique({
				where: { id },
				include: {
					_count: {
						select: {
							posts: true,
							comments: true,
						},
					},
				},
			})
		}

		return await prisma.user.findUnique({
			where: { id },
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
	 * Get all users with pagination
	 */
	static async getMany(
		options: {
			page?: number
			limit?: number
			search?: string
			role?: 'USER' | 'MODERATOR' | 'ADMIN'
			isActive?: boolean
		} = {}
	): Promise<{ users: UserWithCounts[]; total: number; hasMore: boolean }> {
		const { page = 1, limit = 10, search, role, isActive } = options

		const skip = (page - 1) * limit

		// Build where clause
		const where: Prisma.UserWhereInput = {
			...(search && {
				OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
			}),
			...(role && { role }),
			...(isActive !== undefined && { isActive }),
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
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
			}),
			prisma.user.count({ where }),
		])

		return {
			users,
			total,
			hasMore: total > skip + users.length,
		}
	}

	/**
	 * Update user
	 */
	static async update(id: string, data: UpdateUserInput): Promise<User> {
		try {
			return await prisma.user.update({
				where: { id },
				data,
			})
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
				throw new Error('User not found')
			}
			throw error
		}
	}

	/**
	 * Delete user (soft delete by setting isActive to false)
	 */
	static async delete(id: string, soft = true): Promise<User> {
		if (soft) {
			return await this.update(id, { isActive: false })
		}

		try {
			return await prisma.user.delete({
				where: { id },
			})
		} catch (error: unknown) {
			if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
				throw new Error('User not found')
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
			prisma.user.count({ where: { isActive: true } }),
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
}
