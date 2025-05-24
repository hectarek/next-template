import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Starting database seed...')

	// Create sample users
	const users = await Promise.all([
		prisma.user.upsert({
			where: { email: 'admin@example.com' },
			update: {},
			create: {
				email: 'admin@example.com',
				name: 'Admin User',
				role: 'ADMIN',
				avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
			},
		}),
		prisma.user.upsert({
			where: { email: 'john@example.com' },
			update: {},
			create: {
				email: 'john@example.com',
				name: 'John Doe',
				role: 'USER',
				avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
			},
		}),
		prisma.user.upsert({
			where: { email: 'jane@example.com' },
			update: {},
			create: {
				email: 'jane@example.com',
				name: 'Jane Smith',
				role: 'MODERATOR',
				avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
			},
		}),
	])

	console.log(`✅ Created ${users.length} users`)

	// Create sample categories
	const categories = await Promise.all([
		prisma.category.upsert({
			where: { slug: 'technology' },
			update: {},
			create: {
				name: 'Technology',
				slug: 'technology',
				description: 'All things tech and innovation',
				color: '#3B82F6',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'design' },
			update: {},
			create: {
				name: 'Design',
				slug: 'design',
				description: 'UI/UX and visual design',
				color: '#8B5CF6',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'business' },
			update: {},
			create: {
				name: 'Business',
				slug: 'business',
				description: 'Business strategy and entrepreneurship',
				color: '#10B981',
			},
		}),
	])

	console.log(`✅ Created ${categories.length} categories`)

	// Create sample posts
	const posts = await Promise.all([
		prisma.post.upsert({
			where: { slug: 'getting-started-with-nextjs' },
			update: {},
			create: {
				title: 'Getting Started with Next.js',
				slug: 'getting-started-with-nextjs',
				content: 'Next.js is a powerful React framework that makes building web applications a breeze...',
				excerpt: 'Learn the basics of Next.js and start building modern web applications.',
				published: true,
				authorId: users[1].id, // John Doe
				categories: {
					connect: [{ id: categories[0].id }], // Technology
				},
			},
		}),
		prisma.post.upsert({
			where: { slug: 'design-systems-101' },
			update: {},
			create: {
				title: 'Design Systems 101',
				slug: 'design-systems-101',
				content: 'A design system is a collection of reusable components and guidelines...',
				excerpt: 'Understanding the fundamentals of design systems.',
				published: true,
				authorId: users[2].id, // Jane Smith
				categories: {
					connect: [{ id: categories[1].id }], // Design
				},
			},
		}),
		prisma.post.upsert({
			where: { slug: 'building-a-startup' },
			update: {},
			create: {
				title: 'Building a Startup from Scratch',
				slug: 'building-a-startup',
				content: 'Starting a business is challenging but rewarding...',
				excerpt: 'Key insights for aspiring entrepreneurs.',
				published: false, // Draft post
				authorId: users[0].id, // Admin
				categories: {
					connect: [{ id: categories[2].id }], // Business
				},
			},
		}),
	])

	console.log(`✅ Created ${posts.length} posts`)

	// Create sample comments
	const comments = await Promise.all([
		prisma.comment.create({
			data: {
				content: 'Great article! Very helpful for beginners.',
				authorId: users[2].id, // Jane Smith
				postId: posts[0].id,
			},
		}),
		prisma.comment.create({
			data: {
				content: 'Thanks for sharing this. Looking forward to more content!',
				authorId: users[0].id, // Admin
				postId: posts[0].id,
			},
		}),
		prisma.comment.create({
			data: {
				content: 'Design systems are crucial for scaling design teams.',
				authorId: users[1].id, // John Doe
				postId: posts[1].id,
			},
		}),
	])

	// Create a reply to the first comment
	await prisma.comment.create({
		data: {
			content: 'Glad you found it helpful!',
			authorId: users[1].id, // John Doe (original author)
			postId: posts[0].id,
			parentId: comments[0].id, // Reply to Jane's comment
		},
	})

	console.log(`✅ Created ${comments.length + 1} comments (including 1 reply)`)

	console.log('🎉 Database seeded successfully!')
}

main()
	.catch(e => {
		console.error('❌ Error seeding database:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
