import Link from 'next/link'
import { Suspense } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserService } from '@/services/user.service'

// Server Component that fetches data directly
async function UserStatsServer() {
	try {
		// Direct server-side data fetching - no API call needed
		const stats = await UserService.getStats()

		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
						<p className="text-sm text-gray-500">Total Users</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
						<p className="text-sm text-gray-500">Active Users</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth}</div>
						<p className="text-sm text-gray-500">New This Month</p>
					</CardContent>
				</Card>
			</div>
		)
	} catch (error) {
		console.error('Failed to fetch stats:', error)
		return (
			<div className="text-center p-8">
				<p className="text-red-600">Failed to load statistics</p>
				<p className="text-sm text-gray-500 mt-2">Make sure your database is running and seeded</p>
			</div>
		)
	}
}

// Server Component that fetches recent users
async function RecentUsersServer() {
	try {
		// Direct service call - bypasses API layer for server components
		const result = await UserService.getMany({
			limit: 5,
		})

		return (
			<div className="space-y-3">
				{result.users.map((user: any) => (
					<div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
						<div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
							<span className="text-sm font-medium text-gray-700">
								{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">{user.name ?? 'No name'}</p>
							<p className="text-sm text-gray-500 truncate">{user.email}</p>
						</div>
						<Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>{user.role}</Badge>
					</div>
				))}
			</div>
		)
	} catch (error) {
		console.error('Failed to fetch users:', error)
		return (
			<div className="text-center p-8">
				<p className="text-red-600">Failed to load users</p>
				<p className="text-sm text-gray-500 mt-2">Make sure your database is running and seeded</p>
			</div>
		)
	}
}

// Loading components for Suspense
function StatsLoading() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{[...Array(3)].map((_, i) => (
				<Card key={i}>
					<CardContent className="pt-6">
						<div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
						<div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

function UsersLoading() {
	return (
		<div className="space-y-3">
			{[...Array(5)].map((_, i) => (
				<div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
					<div className="h-8 w-8 rounded-full bg-gray-200"></div>
					<div className="flex-1 space-y-1">
						<div className="h-4 bg-gray-200 rounded w-32"></div>
						<div className="h-3 bg-gray-200 rounded w-48"></div>
					</div>
					<div className="h-6 bg-gray-200 rounded w-16"></div>
				</div>
			))}
		</div>
	)
}

// Main Server Component page
export default function ServerDataPage() {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Server Component Demo</h1>
						<p className="mt-2 text-gray-600">Example of server-side data fetching with direct service layer access</p>
					</div>
					<Link href="/">
						<Button variant="outline">← Back to Home</Button>
					</Link>
				</div>

				{/* Stats Section with Suspense */}
				<Card>
					<CardHeader>
						<CardTitle>User Statistics (Server Rendered)</CardTitle>
						<CardDescription>
							This data is fetched on the server at request time using direct service calls
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Suspense fallback={<StatsLoading />}>
							<UserStatsServer />
						</Suspense>
					</CardContent>
				</Card>

				{/* Recent Users Section with Suspense */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Users (Server Rendered)</CardTitle>
						<CardDescription>Latest users fetched directly from the service layer, no API calls needed</CardDescription>
					</CardHeader>
					<CardContent>
						<Suspense fallback={<UsersLoading />}>
							<RecentUsersServer />
						</Suspense>
					</CardContent>
				</Card>

				{/* Comparison with Client Components */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-green-600">🖥️ Server Components</CardTitle>
							<CardDescription>What you see on this page</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="text-sm space-y-2">
								<p>
									<strong>Data Fetching:</strong> Direct service calls
								</p>
								<p>
									<strong>Rendering:</strong> Server-side at request time
								</p>
								<p>
									<strong>Performance:</strong> Faster initial load
								</p>
								<p>
									<strong>SEO:</strong> Fully crawlable content
								</p>
								<p>
									<strong>Interactivity:</strong> None (static)
								</p>
							</div>
							<div className="bg-green-50 border border-green-200 rounded p-3">
								<p className="text-xs text-green-700">
									✅ Best for: Static content, initial page loads, SEO-critical pages
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-blue-600">💻 Client Components</CardTitle>
							<CardDescription>
								<Link href="/demo/users" className="text-blue-600 hover:underline">
									See example in User Demo →
								</Link>
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="text-sm space-y-2">
								<p>
									<strong>Data Fetching:</strong> API calls with fetch
								</p>
								<p>
									<strong>Rendering:</strong> Client-side with hooks
								</p>
								<p>
									<strong>Performance:</strong> Interactive after hydration
								</p>
								<p>
									<strong>SEO:</strong> Limited (loading states only)
								</p>
								<p>
									<strong>Interactivity:</strong> Full (forms, real-time)
								</p>
							</div>
							<div className="bg-blue-50 border border-blue-200 rounded p-3">
								<p className="text-xs text-blue-700">✅ Best for: Forms, real-time data, user interactions</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Code Examples */}
				<Card>
					<CardHeader>
						<CardTitle>📝 Code Examples</CardTitle>
						<CardDescription>Comparing server vs client data fetching patterns</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h3 className="font-semibold text-green-600 mb-2">Server Component Pattern</h3>
							<div className="bg-gray-900 rounded-lg p-4">
								<pre className="text-sm text-green-400 overflow-x-auto">
									{`// Server Component (this page)
import { UserService } from '@/services/user.service'

async function UserStats() {
  // Direct service call - no API needed
  const stats = await UserService.getStats()
  return <div>{stats.totalUsers} users</div>
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserStats />
    </Suspense>
  )
}`}
								</pre>
							</div>
						</div>

						<div>
							<h3 className="font-semibold text-blue-600 mb-2">Client Component Pattern</h3>
							<div className="bg-gray-900 rounded-lg p-4">
								<pre className="text-sm text-blue-400 overflow-x-auto">
									{`// Client Component (UserList)
&apos;use client&apos;
import { useState, useEffect } from &apos;react&apos;
import { getUserStats } from &apos;@/lib/api/users&apos;

export function UserStats() {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    // API call required
    getUserStats().then(setStats)
  }, [])
  
  return <div>{stats?.totalUsers} users</div>
}`}
								</pre>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Best Practices */}
				<Card>
					<CardHeader>
						<CardTitle>🎯 Best Practices</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="font-semibold text-gray-800 mb-3">Use Server Components for:</h3>
								<ul className="text-sm space-y-1 text-gray-600">
									<li>• Static content and layouts</li>
									<li>• Initial data fetching</li>
									<li>• SEO-critical pages</li>
									<li>• Large data that doesn&apos;t change often</li>
									<li>• Authentication checks</li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold text-gray-800 mb-3">Use Client Components for:</h3>
								<ul className="text-sm space-y-1 text-gray-600">
									<li>• Forms and user input</li>
									<li>• Real-time data updates</li>
									<li>• Interactive features</li>
									<li>• Browser APIs (localStorage, etc.)</li>
									<li>• State management</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
