import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { UserList } from '@/components/example/user-list'
import * as userApi from '@/lib/api/users'

// Mock the API functions
vi.mock('@/lib/api/users', () => ({
	getUsers: vi.fn(),
	getUserStats: vi.fn(),
}))

const mockGetUsers = vi.mocked(userApi.getUsers)
const mockGetUserStats = vi.mocked(userApi.getUserStats)

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({ src, alt, width, height, className }: any) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt} width={width} height={height} className={className} />
	),
}))

const mockUsers = [
	{
		id: '1',
		email: 'admin@example.com',
		name: 'Admin User',
		avatar: 'https://example.com/admin.jpg',
		role: 'ADMIN' as const,
		isActive: true,
		metadata: null,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		_count: {
			posts: 5,
			comments: 12,
		},
	},
	{
		id: '2',
		email: 'user@example.com',
		name: 'Regular User',
		avatar: null,
		role: 'USER' as const,
		isActive: true,
		metadata: null,
		createdAt: new Date('2024-01-02'),
		updatedAt: new Date('2024-01-02'),
		_count: {
			posts: 2,
			comments: 8,
		},
	},
	{
		id: '3',
		email: 'mod@example.com',
		name: null,
		avatar: 'https://example.com/mod.jpg',
		role: 'MODERATOR' as const,
		isActive: true,
		metadata: null,
		createdAt: new Date('2024-01-03'),
		updatedAt: new Date('2024-01-03'),
		_count: {
			posts: 3,
			comments: 15,
		},
	},
]

const mockStats = {
	totalUsers: 150,
	activeUsers: 142,
	newUsersThisMonth: 23,
}

describe('UserList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('shows loading state initially', () => {
		mockGetUsers.mockImplementation(() => new Promise(() => {})) // Never resolves
		mockGetUserStats.mockImplementation(() => new Promise(() => {}))

		render(<UserList />)

		expect(screen.getByText(/loading/i)).toBeInTheDocument()

		// Should show skeleton loading cards
		const skeletonCards = screen.getAllByRole('generic')
		expect(skeletonCards.length).toBeGreaterThan(0)
	})

	it('displays users and stats successfully', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: mockUsers,
			total: mockUsers.length,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Check stats are displayed
		expect(screen.getByText('150')).toBeInTheDocument() // Total users
		expect(screen.getByText('142')).toBeInTheDocument() // Active users
		expect(screen.getByText('23')).toBeInTheDocument() // New this month

		// Check users are displayed
		expect(screen.getByText('Admin User')).toBeInTheDocument()
		expect(screen.getByText('admin@example.com')).toBeInTheDocument()
		expect(screen.getByText('Regular User')).toBeInTheDocument()
		expect(screen.getByText('user@example.com')).toBeInTheDocument()

		// User with no name should show "No name"
		expect(screen.getByText('No name')).toBeInTheDocument()
		expect(screen.getByText('mod@example.com')).toBeInTheDocument()
	})

	it('displays user roles with correct styling', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: mockUsers,
			total: mockUsers.length,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Check role badges
		expect(screen.getByText('ADMIN')).toBeInTheDocument()
		expect(screen.getByText('USER')).toBeInTheDocument()
		expect(screen.getByText('MODERATOR')).toBeInTheDocument()

		// Check role styling classes
		const adminBadge = screen.getByText('ADMIN')
		expect(adminBadge).toHaveClass('bg-red-100', 'text-red-800')

		const userBadge = screen.getByText('USER')
		expect(userBadge).toHaveClass('bg-green-100', 'text-green-800')

		const modBadge = screen.getByText('MODERATOR')
		expect(modBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
	})

	it('displays user avatars and fallbacks correctly', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: mockUsers,
			total: mockUsers.length,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Check avatars
		const adminAvatar = screen.getByAltText('Admin User avatar')
		expect(adminAvatar).toHaveAttribute('src', 'https://example.com/admin.jpg')

		const modAvatar = screen.getByAltText('User avatar')
		expect(modAvatar).toHaveAttribute('src', 'https://example.com/mod.jpg')

		// Check fallback initial for user without avatar
		expect(screen.getByText('R')).toBeInTheDocument() // Regular User initial
	})

	it('displays user statistics (posts and comments)', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: mockUsers,
			total: mockUsers.length,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Check user activity counts
		expect(screen.getByText('5 posts, 12 comments')).toBeInTheDocument()
		expect(screen.getByText('2 posts, 8 comments')).toBeInTheDocument()
		expect(screen.getByText('3 posts, 15 comments')).toBeInTheDocument()
	})

	it('displays formatted join dates', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: mockUsers,
			total: mockUsers.length,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Check formatted dates
		expect(screen.getByText(/Joined 1\/1\/2024/)).toBeInTheDocument()
		expect(screen.getByText(/Joined 1\/2\/2024/)).toBeInTheDocument()
		expect(screen.getByText(/Joined 1\/3\/2024/)).toBeInTheDocument()
	})

	it('handles API error gracefully', async () => {
		const errorMessage = 'Failed to fetch data'
		mockGetUsers.mockRejectedValueOnce(new Error(errorMessage))
		mockGetUserStats.mockRejectedValueOnce(new Error(errorMessage))

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText(`❌ ${errorMessage}`)).toBeInTheDocument()
		})

		// Should not show loading or success content
		expect(screen.queryByText('Recent Users')).not.toBeInTheDocument()
		expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
	})

	it('handles empty user list', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: [],
			total: 0,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Should show stats but no users message
		expect(screen.getByText('150')).toBeInTheDocument() // Total users from stats
		expect(screen.getByText('No users found')).toBeInTheDocument()
	})

	it('handles partial API failures', async () => {
		// Users succeed, stats fail
		mockGetUsers.mockResolvedValueOnce({
			users: mockUsers,
			total: mockUsers.length,
			hasMore: false,
		})
		mockGetUserStats.mockRejectedValueOnce(new Error('Stats failed'))

		render(<UserList />)

		await waitFor(() => {
			expect(screen.getByText('Recent Users')).toBeInTheDocument()
		})

		// Should show users but not stats
		expect(screen.getByText('Admin User')).toBeInTheDocument()
		expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
	})

	it('calls API with correct parameters', async () => {
		mockGetUsers.mockResolvedValueOnce({
			users: [],
			total: 0,
			hasMore: false,
		})
		mockGetUserStats.mockResolvedValueOnce(mockStats)

		render(<UserList />)

		await waitFor(() => {
			expect(mockGetUsers).toHaveBeenCalledWith({ limit: 10 })
			expect(mockGetUserStats).toHaveBeenCalledWith()
		})
	})

	describe('User display logic', () => {
		beforeEach(async () => {
			mockGetUsers.mockResolvedValueOnce({
				users: mockUsers,
				total: mockUsers.length,
				hasMore: false,
			})
			mockGetUserStats.mockResolvedValueOnce(mockStats)

			render(<UserList />)

			await waitFor(() => {
				expect(screen.getByText('Recent Users')).toBeInTheDocument()
			})
		})

		it('shows email as fallback for missing name', () => {
			// User with null name should show email initial
			const userWithoutName = mockUsers.find(u => !u.name)
			if (userWithoutName) {
				expect(screen.getByText('M')).toBeInTheDocument() // mod@example.com initial
			}
		})

		it('displays proper initial letters', () => {
			expect(screen.getByText('A')).toBeInTheDocument() // Admin User
			expect(screen.getByText('R')).toBeInTheDocument() // Regular User
			expect(screen.getByText('M')).toBeInTheDocument() // mod@example.com
		})
	})

	describe('Accessibility', () => {
		it('has proper ARIA labels and structure', async () => {
			mockGetUsers.mockResolvedValueOnce({
				users: mockUsers,
				total: mockUsers.length,
				hasMore: false,
			})
			mockGetUserStats.mockResolvedValueOnce(mockStats)

			render(<UserList />)

			await waitFor(() => {
				expect(screen.getByText('Recent Users')).toBeInTheDocument()
			})

			// Images should have alt text
			const avatarImages = screen.getAllByRole('img')
			avatarImages.forEach(img => {
				expect(img).toHaveAttribute('alt')
			})
		})
	})
})
