import Link from 'next/link'

import { UserForm } from '@/components/example/user-form'
import { UserList } from '@/components/example/user-list'
import { Button } from '@/components/ui/button'

// This is a Server Component by default - no 'use client' needed
// It renders static content and composes client components for interactivity
export default function UserDemoPage() {
	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-7xl space-y-8">
				{/* Header - Server rendered for SEO */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">User Management Demo</h1>
						<p className="mt-2 text-gray-600">
							Live demonstration of the API-first architecture with real database operations
						</p>
					</div>
					<Link href="/">
						<Button variant="outline">← Back to Home</Button>
					</Link>
				</div>

				{/* Demo Layout - Server rendered structure */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Form Section - Client component for interactivity */}
					<div className="lg:col-span-1">
						<div className="space-y-6">
							<div>
								<h2 className="text-xl font-semibold text-gray-800 mb-4">Create New User</h2>
								<p className="text-sm text-gray-600 mb-4">
									This form demonstrates API integration with proper error handling and loading states.
								</p>
							</div>
							{/* Client Component - handles form state and API calls */}
							<UserForm />

							{/* Code Example - Server rendered */}
							<div className="bg-gray-900 rounded-lg p-4">
								<h3 className="text-sm font-semibold text-white mb-2">Example API Usage:</h3>
								<pre className="text-xs text-green-400 overflow-x-auto">
									{`import { createUser } from '@/lib/api/users'

const user = await createUser({
  email: 'user@example.com',
  name: 'John Doe'
})`}
								</pre>
							</div>
						</div>
					</div>

					{/* List Section - Client component for data fetching */}
					<div className="lg:col-span-2">
						<div className="space-y-6">
							<div>
								<h2 className="text-xl font-semibold text-gray-800 mb-4">User Directory</h2>
								<p className="text-sm text-gray-600 mb-4">
									Real-time user list with statistics, pagination, and proper loading states.
								</p>
							</div>
							{/* Client Component - handles data fetching and state */}
							<UserList />
						</div>
					</div>
				</div>

				{/* Architecture Explanation - Server rendered for SEO */}
				<div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
					<h2 className="text-2xl font-semibold text-gray-800">🏗️ How This Works</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="space-y-3">
							<h3 className="text-lg font-medium text-blue-600">1. Service Layer</h3>
							<div className="text-sm text-gray-600 space-y-2">
								<p>
									<code className="bg-gray-100 px-1 rounded">UserService.create()</code> handles business logic
								</p>
								<p>• Validates input data</p>
								<p>• Handles database errors</p>
								<p>• Returns typed responses</p>
							</div>
						</div>

						<div className="space-y-3">
							<h3 className="text-lg font-medium text-green-600">2. API Layer</h3>
							<div className="text-sm text-gray-600 space-y-2">
								<p>
									<code className="bg-gray-100 px-1 rounded">POST /api/users</code> provides REST interface
								</p>
								<p>• HTTP status codes</p>
								<p>• Error formatting</p>
								<p>• Request validation</p>
							</div>
						</div>

						<div className="space-y-3">
							<h3 className="text-lg font-medium text-purple-600">3. Client Layer</h3>
							<div className="text-sm text-gray-600 space-y-2">
								<p>
									<code className="bg-gray-100 px-1 rounded">createUser()</code> abstracts API calls
								</p>
								<p>• Type-safe requests</p>
								<p>• Error handling</p>
								<p>• Reusable across app</p>
							</div>
						</div>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-medium text-blue-800 mb-2">💡 Key Benefits</h4>
						<ul className="text-sm text-blue-700 space-y-1">
							<li>
								• <strong>Separation of Concerns:</strong> Business logic, API, and UI are cleanly separated
							</li>
							<li>
								• <strong>Reusability:</strong> Same API can be used by web, mobile, or external applications
							</li>
							<li>
								• <strong>Type Safety:</strong> Full TypeScript support from database to UI
							</li>
							<li>
								• <strong>Future-Proof:</strong> Easy to add authentication, caching, or other services
							</li>
						</ul>
					</div>
				</div>

				{/* Code Structure - Server rendered */}
				<div className="bg-white rounded-lg shadow-sm border p-8">
					<h2 className="text-2xl font-semibold text-gray-800 mb-6">📁 File Structure</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<h3 className="font-medium text-gray-800 mb-4">Backend Files</h3>
							<div className="bg-gray-50 rounded-lg p-4">
								<pre className="text-sm text-gray-700">
									{`prisma/
  schema.prisma          ← Database schema
  seed.ts               ← Sample data
services/
  user.service.ts       ← Business logic
app/api/users/
  route.ts              ← Main endpoints
  [id]/route.ts         ← Individual user ops
  stats/route.ts        ← Statistics endpoint`}
								</pre>
							</div>
						</div>

						<div>
							<h3 className="font-medium text-gray-800 mb-4">Frontend Files</h3>
							<div className="bg-gray-50 rounded-lg p-4">
								<pre className="text-sm text-gray-700">
									{`lib/api/
  client.ts             ← Generic API client
  users.ts              ← User API functions
components/example/
  user-form.tsx         ← Client component
  user-list.tsx         ← Client component
app/demo/users/
  page.tsx              ← Server component`}
								</pre>
							</div>
						</div>
					</div>
				</div>

				{/* Rendering Pattern Explanation - Server rendered */}
				<div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-8">
					<h2 className="text-2xl font-semibold text-gray-800 mb-4">⚡ Server vs Client Components</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-medium text-green-800 mb-2">🖥️ Server Components (This Page)</h3>
							<ul className="text-sm text-green-700 space-y-1">
								<li>• Static content and layout</li>
								<li>• SEO-friendly rendering</li>
								<li>• Better initial performance</li>
								<li>• Direct database access possible</li>
							</ul>
						</div>
						<div>
							<h3 className="font-medium text-blue-800 mb-2">💻 Client Components (Form & List)</h3>
							<ul className="text-sm text-blue-700 space-y-1">
								<li>• Interactive form handling</li>
								<li>• State management (useState)</li>
								<li>• API calls and side effects</li>
								<li>• Real-time data updates</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Next Steps - Server rendered */}
				<div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-8">
					<h2 className="text-2xl font-semibold text-gray-800 mb-4">🚀 Next Steps</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-medium text-indigo-800 mb-2">Extend the Architecture</h3>
							<ul className="text-sm text-indigo-700 space-y-1">
								<li>• Add authentication (NextAuth, Clerk, etc.)</li>
								<li>• Integrate file storage (S3, Cloudinary)</li>
								<li>• Add email services (SendGrid, Resend)</li>
								<li>• Implement caching (Redis, SWR)</li>
							</ul>
						</div>
						<div>
							<h3 className="font-medium text-purple-800 mb-2">Customize for Your Needs</h3>
							<ul className="text-sm text-purple-700 space-y-1">
								<li>• Modify the database schema</li>
								<li>• Add new service methods</li>
								<li>• Create new API endpoints</li>
								<li>• Build custom UI components</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
