import { NextRequest, NextResponse } from 'next/server'

import { UserService } from '@/services/user.service'

// GET /api/users/[id] - Get a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { searchParams } = new URL(request.url)
		const includeRelations = searchParams.get('includeRelations') === 'true'

		const user = await UserService.getById(params.id, includeRelations)

		if (!user) {
			return NextResponse.json({ error: 'Not found', message: 'User not found' }, { status: 404 })
		}

		return NextResponse.json(user)
	} catch (error) {
		console.error('Error fetching user:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch user', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}

// PATCH /api/users/[id] - Update a specific user
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const body = await request.json()

		const user = await UserService.update(params.id, body)

		return NextResponse.json(user)
	} catch (error) {
		console.error('Error updating user:', error)

		// Handle specific errors
		if (error instanceof Error && error.message.includes('not found')) {
			return NextResponse.json({ error: 'Not found', message: error.message }, { status: 404 })
		}

		return NextResponse.json(
			{ error: 'Failed to update user', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}

// DELETE /api/users/[id] - Delete a specific user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { searchParams } = new URL(request.url)
		const soft = searchParams.get('soft') !== 'false' // Default to soft delete

		const user = await UserService.delete(params.id, soft)

		return NextResponse.json(user)
	} catch (error) {
		console.error('Error deleting user:', error)

		// Handle specific errors
		if (error instanceof Error && error.message.includes('not found')) {
			return NextResponse.json({ error: 'Not found', message: error.message }, { status: 404 })
		}

		return NextResponse.json(
			{ error: 'Failed to delete user', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}
