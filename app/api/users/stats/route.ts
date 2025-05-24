import { NextResponse } from 'next/server'

import { UserService } from '@/services/user.service'

// GET /api/users/stats - Get user statistics
export async function GET() {
	try {
		const stats = await UserService.getStats()

		return NextResponse.json(stats)
	} catch (error) {
		console.error('Error fetching user stats:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch user statistics', message: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		)
	}
}
