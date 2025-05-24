'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ConfirmationDialog from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ApiResponse {
	status: number
	data: any
	duration: number
}

const endpoints = [
	{
		method: 'GET',
		path: '/api/users',
		description: 'Get all users with pagination',
		params: ['page', 'limit', 'search', 'role', 'isActive'],
	},
	{
		method: 'POST',
		path: '/api/users',
		description: 'Create a new user',
		body: { email: 'test@example.com', name: 'Test User' },
	},
	{
		method: 'GET',
		path: '/api/users/stats',
		description: 'Get user statistics',
		params: [],
	},
	{
		method: 'GET',
		path: '/api/users/{id}',
		description: 'Get user by ID',
		params: ['includeRelations'],
	},
	{
		method: 'PATCH',
		path: '/api/users/{id}',
		description: 'Update user',
		body: { name: 'Updated Name', role: 'MODERATOR' },
	},
	{
		method: 'DELETE',
		path: '/api/users/{id}',
		description: 'Delete user',
		params: ['soft'],
	},
]

const getBadgeVariant = (method: string) => {
	switch (method) {
		case 'GET':
			return 'secondary'
		case 'POST':
			return 'default'
		case 'DELETE':
			return 'destructive'
		default:
			return 'outline'
	}
}

const getStatusBadgeVariant = (status: number) => {
	if (status >= 200 && status < 300) return 'default'
	if (status >= 400) return 'destructive'
	return 'secondary'
}

const getImportFunction = (endpoint: (typeof endpoints)[0]) => {
	if (endpoint.method === 'GET' && endpoint.path === '/api/users') return 'getUsers'
	if (endpoint.method === 'POST') return 'createUser'
	if (endpoint.method === 'GET' && endpoint.path.includes('stats')) return 'getUserStats'
	if (endpoint.method === 'GET' && endpoint.path.includes('{id}')) return 'getUser'
	if (endpoint.method === 'PATCH') return 'updateUser'
	return 'deleteUser'
}

const generateCodeExample = (
	endpoint: (typeof endpoints)[0],
	requestParams: string,
	requestBody: string,
	userId: string
) => {
	if (endpoint.method === 'GET' && endpoint.path === '/api/users') {
		const paramsCode = requestParams
			? `{\n  ${requestParams
					.split('\n')
					.map(line => {
						const [key, value] = line.split('=')
						return `${key?.trim()}: ${isNaN(Number(value?.trim())) ? `'${value?.trim()}'` : value?.trim()}`
					})
					.join(',\n  ')}\n}`
			: ''
		return `const { users, total } = await getUsers(${paramsCode})`
	}

	if (endpoint.method === 'POST') {
		return `const user = await createUser(${requestBody || '{ email: "user@example.com", name: "Test User" }'})`
	}

	if (endpoint.method === 'GET' && endpoint.path.includes('stats')) {
		return 'const stats = await getUserStats()'
	}

	if (endpoint.method === 'GET' && endpoint.path.includes('{id}')) {
		return `const user = await getUser('${userId || 'user-id'}')`
	}

	if (endpoint.method === 'PATCH') {
		return `const user = await updateUser('${userId || 'user-id'}', ${requestBody || '{ name: "Updated Name" }'})`
	}

	return `const user = await deleteUser('${userId || 'user-id'}')`
}

export default function ApiPlaygroundPage() {
	const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0])
	const [requestParams, setRequestParams] = useState('')
	const [requestBody, setRequestBody] = useState('')
	const [response, setResponse] = useState<ApiResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [userId, setUserId] = useState('')
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleEndpointSelect = (endpoint: (typeof endpoints)[0]) => {
		setSelectedEndpoint(endpoint)
		setRequestParams('')
		setRequestBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '')
		setResponse(null)
	}

	const makeRequest = async () => {
		setLoading(true)
		const startTime = Date.now()

		try {
			// Build URL
			let url = selectedEndpoint.path.replace('{id}', userId || 'cm7a1b2c3d4e5f6g7h8i9j0k')

			// Add query parameters
			if (requestParams.trim()) {
				const params = new URLSearchParams()
				requestParams.split('\n').forEach(line => {
					const [key, value] = line.split('=')
					if (key && value) {
						params.append(key.trim(), value.trim())
					}
				})
				url += `?${params.toString()}`
			}

			// Make request
			const options: RequestInit = {
				method: selectedEndpoint.method,
				headers: {
					'Content-Type': 'application/json',
				},
			}

			if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
				options.body = requestBody
			}

			const res = await fetch(url, options)
			const data = await res.json()

			setResponse({
				status: res.status,
				data,
				duration: Date.now() - startTime,
			})
		} catch (error) {
			setResponse({
				status: 0,
				data: { error: error instanceof Error ? error.message : 'Unknown error' },
				duration: Date.now() - startTime,
			})
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteWithConfirmation = () => {
		if (selectedEndpoint.method === 'DELETE') {
			setShowDeleteDialog(true)
		} else {
			makeRequest()
		}
	}

	const confirmDelete = async () => {
		await makeRequest()
		setShowDeleteDialog(false)
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-7xl space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">API Testing Playground</h1>
						<p className="mt-2 text-gray-600">
							Interactive testing environment for all API endpoints with real-time responses
						</p>
					</div>
					<Link href="/">
						<Button variant="outline">← Back to Home</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Request Panel */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Request Configuration</CardTitle>
								<CardDescription>Select an endpoint and configure your request</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Endpoint Selection */}
								<div className="space-y-3">
									<Label>Select Endpoint</Label>
									<div className="grid gap-2">
										{endpoints.map((endpoint, index) => (
											<button
												key={index}
												onClick={() => handleEndpointSelect(endpoint)}
												className={`text-left p-3 rounded-lg border transition-colors ${
													selectedEndpoint === endpoint
														? 'border-blue-500 bg-blue-50'
														: 'border-gray-200 hover:border-gray-300'
												}`}
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Badge variant={getBadgeVariant(endpoint.method)}>{endpoint.method}</Badge>
														<code className="text-sm">{endpoint.path}</code>
													</div>
												</div>
												<p className="text-xs text-gray-500 mt-1">{endpoint.description}</p>
											</button>
										))}
									</div>
								</div>

								{/* User ID Input (for endpoints that need it) */}
								{selectedEndpoint.path.includes('{id}') && (
									<div className="space-y-2">
										<Label htmlFor="userId">User ID</Label>
										<Input
											id="userId"
											value={userId}
											onChange={e => setUserId(e.target.value)}
											placeholder="Enter user ID (leave empty for example ID)"
										/>
									</div>
								)}

								{/* Query Parameters */}
								{selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
									<div className="space-y-2">
										<Label htmlFor="params">Query Parameters (one per line: key=value)</Label>
										<Textarea
											id="params"
											value={requestParams}
											onChange={e => setRequestParams(e.target.value)}
											placeholder={selectedEndpoint.params.map(p => `${p}=example`).join('\n')}
											rows={Math.min(selectedEndpoint.params.length + 1, 4)}
										/>
									</div>
								)}

								{/* Request Body */}
								{selectedEndpoint.method !== 'GET' && selectedEndpoint.method !== 'DELETE' && (
									<div className="space-y-2">
										<Label htmlFor="body">Request Body (JSON)</Label>
										<Textarea
											id="body"
											value={requestBody}
											onChange={e => setRequestBody(e.target.value)}
											placeholder='{"email": "user@example.com", "name": "Test User"}'
											rows={6}
											className="font-mono text-sm"
										/>
									</div>
								)}

								{/* Send Request Button */}
								<Button
									onClick={handleDeleteWithConfirmation}
									disabled={loading}
									className="w-full"
									variant={selectedEndpoint.method === 'DELETE' ? 'destructive' : 'default'}
								>
									{loading ? 'Sending...' : `Send ${selectedEndpoint.method} Request`}
								</Button>
							</CardContent>
						</Card>
					</div>

					{/* Response Panel */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Response</CardTitle>
								<CardDescription>
									{response
										? `Status: ${response.status} • Duration: ${response.duration}ms`
										: 'No response yet - send a request to see results'}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{response ? (
									<div className="space-y-4">
										{/* Status Badge */}
										<div className="flex items-center gap-2">
											<Badge variant={getStatusBadgeVariant(response.status)}>
												{response.status === 0 ? 'Network Error' : `${response.status}`}
											</Badge>
											<span className="text-sm text-gray-500">{response.duration}ms</span>
										</div>

										{/* Response Body */}
										<div className="bg-gray-900 rounded-lg p-4">
											<pre className="text-sm text-green-400 overflow-auto max-h-96">
												{JSON.stringify(response.data, null, 2)}
											</pre>
										</div>
									</div>
								) : (
									<div className="text-center py-12 text-gray-500">
										<p>Send a request to see the response here</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* API Documentation */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Reference</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 text-sm">
									<div>
										<h4 className="font-medium">Common Status Codes:</h4>
										<ul className="mt-1 space-y-1 text-gray-600">
											<li>• 200: Success</li>
											<li>• 201: Created</li>
											<li>• 400: Bad Request</li>
											<li>• 404: Not Found</li>
											<li>• 409: Conflict (duplicate email)</li>
											<li>• 500: Server Error</li>
										</ul>
									</div>
									<div>
										<h4 className="font-medium">Example User Roles:</h4>
										<ul className="mt-1 space-y-1 text-gray-600">
											<li>• USER (default)</li>
											<li>• MODERATOR</li>
											<li>• ADMIN</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Code Generation */}
				{response && (
					<Card>
						<CardHeader>
							<CardTitle>Generated Code</CardTitle>
							<CardDescription>Copy and use this code in your application</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="bg-gray-900 rounded-lg p-4">
								<pre className="text-sm text-green-400 overflow-x-auto">
									{`// Using the API client
import { ${getImportFunction(selectedEndpoint)} } from '@/lib/api/users'

${generateCodeExample(selectedEndpoint, requestParams, requestBody, userId)}`}
								</pre>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title="Confirm Delete Action"
				description="This will delete the user from the database. This action may not be reversible depending on your soft delete settings."
				confirmText="Delete User"
				variant="destructive"
				onConfirm={confirmDelete}
				isLoading={loading}
			/>
		</div>
	)
}
