import { NextRequest, NextResponse } from 'next/server'

import { UserService } from '@/services/user.service'

// GET /api/users - Get all users with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)

		const options = {
			page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
			limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
			search: searchParams.get('search') ?? undefined,
			role: searchParams.get('role') as 'USER' | 'MODERATOR' | 'ADMIN' | undefined,
			isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
		}

		const result = await UserService.getMany(options)

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error fetching users:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch users', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Basic validation
		if (!body.email) {
			return NextResponse.json({ error: 'Validation error', message: 'Email is required' }, { status: 400 })
		}

		const user = await UserService.create(body)

		return NextResponse.json(user, { status: 201 })
	} catch (error) {
		console.error('Error creating user:', error)

		// Handle specific errors
		if (error instanceof Error && error.message.includes('already exists')) {
			return NextResponse.json({ error: 'Conflict', message: error.message }, { status: 409 })
		}

		return NextResponse.json(
			{ error: 'Failed to create user', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}
