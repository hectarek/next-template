'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { getUsers, getUserStats, UserStatsResponse } from '@/lib/api/users'
import { UserWithCounts } from '@/services/user.service'

export function UserList() {
	const [users, setUsers] = useState<UserWithCounts[]>([])
	const [stats, setStats] = useState<UserStatsResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true)
				const [usersData, statsData] = await Promise.all([getUsers({ limit: 10 }), getUserStats()])

				setUsers(usersData.users)
				setStats(statsData)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch data')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/4"></div>
					<div className="space-y-2">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-16 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="mx-auto max-w-4xl">
				<div className="rounded-md bg-red-50 p-4">
					<p className="text-sm text-red-800">❌ {error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Stats Cards */}
			{stats && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<h3 className="text-sm font-medium text-gray-500">Total Users</h3>
						<p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
					</div>
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<h3 className="text-sm font-medium text-gray-500">Active Users</h3>
						<p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
					</div>
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<h3 className="text-sm font-medium text-gray-500">New This Month</h3>
						<p className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth}</p>
					</div>
				</div>
			)}

			{/* Users List */}
			<div className="rounded-lg border bg-white shadow-sm">
				<div className="border-b border-gray-200 px-6 py-4">
					<h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
				</div>

				<div className="divide-y divide-gray-200">
					{users.map(user => (
						<div key={user.id} className="flex items-center justify-between px-6 py-4">
							<div className="flex items-center space-x-4">
								{user.avatar ? (
									<Image
										src={user.avatar}
										alt={user.name ?? 'User avatar'}
										width={40}
										height={40}
										className="h-10 w-10 rounded-full object-cover"
									/>
								) : (
									<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
										<span className="text-sm font-medium text-gray-700">
											{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
										</span>
									</div>
								)}

								<div>
									<p className="text-sm font-medium text-gray-900">{user.name ?? 'No name'}</p>
									<p className="text-sm text-gray-500">{user.email}</p>
								</div>
							</div>

							<div className="flex items-center space-x-4">
								<div className="text-right">
									<p className="text-sm text-gray-500">
										{user._count.posts} posts, {user._count.comments} comments
									</p>
									<p className="text-xs text-gray-400">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
								</div>

								<span
									className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
										user.role === 'ADMIN'
											? 'bg-red-100 text-red-800'
											: user.role === 'MODERATOR'
												? 'bg-yellow-100 text-yellow-800'
												: 'bg-green-100 text-green-800'
									}`}
								>
									{user.role}
								</span>
							</div>
						</div>
					))}
				</div>

				{users.length === 0 && (
					<div className="px-6 py-8 text-center">
						<p className="text-gray-500">No users found</p>
					</div>
				)}
			</div>
		</div>
	)
}
