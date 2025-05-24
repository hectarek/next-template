'use client'

import { useState } from 'react'

import { createUser } from '@/lib/api/users'

export function UserForm() {
	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setSuccess(false)

		try {
			await createUser({ email, name })
			setSuccess(true)
			setEmail('')
			setName('')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-md rounded-lg border p-6 shadow-sm">
			<h2 className="mb-4 text-xl font-semibold">Create New User</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">
						Email
					</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						placeholder="user@example.com"
					/>
				</div>

				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700">
						Name (optional)
					</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={e => setName(e.target.value)}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						placeholder="John Doe"
					/>
				</div>

				<button
					type="submit"
					disabled={loading || !email}
					className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? 'Creating...' : 'Create User'}
				</button>
			</form>

			{success && (
				<div className="mt-4 rounded-md bg-green-50 p-4">
					<p className="text-sm text-green-800">✅ User created successfully!</p>
				</div>
			)}

			{error && (
				<div className="mt-4 rounded-md bg-red-50 p-4">
					<p className="text-sm text-red-800">❌ {error}</p>
				</div>
			)}
		</div>
	)
}
