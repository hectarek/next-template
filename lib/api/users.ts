import { User } from '@prisma/client'

import { CreateUserInput, UpdateUserInput, UserWithCounts } from '@/services/user.service'

import { api } from './client'

// Types for API responses
export type UsersListResponse = {
	users: UserWithCounts[]
	total: number
	hasMore: boolean
}

export type UserStatsResponse = {
	totalUsers: number
	activeUsers: number
	newUsersThisMonth: number
}

// User API functions - These can be called from client components or server actions
export const usersApi = {
	/**
	 * Create a new user
	 */
	create: (data: CreateUserInput): Promise<User> => {
		return api.post<User>('/api/users', data)
	},

	/**
	 * Get a user by ID
	 */
	getById: (id: string, includeRelations = false): Promise<User | UserWithCounts> => {
		return api.get<User | UserWithCounts>(`/api/users/${id}`, { includeRelations })
	},

	/**
	 * Get all users with pagination and filtering
	 */
	getMany: (
		options: {
			page?: number
			limit?: number
			search?: string
			role?: 'USER' | 'MODERATOR' | 'ADMIN'
			isActive?: boolean
		} = {}
	): Promise<UsersListResponse> => {
		return api.get<UsersListResponse>('/api/users', options)
	},

	/**
	 * Update a user
	 */
	update: (id: string, data: UpdateUserInput): Promise<User> => {
		return api.patch<User>(`/api/users/${id}`, data)
	},

	/**
	 * Delete a user (soft delete by default)
	 */
	delete: (id: string, soft = true): Promise<User> => {
		return api.delete<User>(`/api/users/${id}?soft=${soft}`)
	},

	/**
	 * Get user statistics
	 */
	getStats: (): Promise<UserStatsResponse> => {
		return api.get<UserStatsResponse>('/api/users/stats')
	},
}

// Convenience functions (same as usersApi but shorter names)
export const createUser = usersApi.create
export const getUser = usersApi.getById
export const getUsers = usersApi.getMany
export const updateUser = usersApi.update
export const deleteUser = usersApi.delete
export const getUserStats = usersApi.getStats
