import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
			<div className="mx-auto max-w-6xl space-y-12">
				{/* Header */}
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold text-gray-900">Next.js Template with Prisma ORM</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						A complete API-first architecture demonstration featuring Prisma ORM, TypeScript, and modern React patterns
						for scalable applications.
					</p>
				</div>

				{/* Architecture Overview */}
				<section className="space-y-6">
					<h2 className="text-2xl font-semibold text-gray-800">🏗️ Architecture Overview</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span>🗄️</span> Database Layer
								</CardTitle>
								<CardDescription>Prisma ORM with PostgreSQL</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-gray-600">
									<li>• Type-safe database operations</li>
									<li>• Automatic migrations</li>
									<li>• Relation management</li>
									<li>• Query optimization</li>
								</ul>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span>⚡</span> Service Layer
								</CardTitle>
								<CardDescription>Business logic & validation</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-gray-600">
									<li>• Centralized business logic</li>
									<li>• Error handling</li>
									<li>• Data validation</li>
									<li>• Reusable operations</li>
								</ul>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span>🌐</span> API Layer
								</CardTitle>
								<CardDescription>RESTful endpoints</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm text-gray-600">
									<li>• RESTful API design</li>
									<li>• Type-safe responses</li>
									<li>• Error standardization</li>
									<li>• Client abstraction</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Demo Pages */}
				<section className="space-y-6">
					<h2 className="text-2xl font-semibold text-gray-800">🚀 Interactive Demos</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									User Management Demo
									<Badge variant="default">Client Components</Badge>
								</CardTitle>
								<CardDescription>
									Complete CRUD operations with real-time data fetching, form handling, and error management.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-sm text-gray-600">Demonstrates:</p>
									<ul className="space-y-1 text-sm text-gray-600">
										<li>• API client usage patterns</li>
										<li>• Form validation & submission</li>
										<li>• Real-time data updates</li>
										<li>• Error handling strategies</li>
										<li>• Loading states management</li>
									</ul>
									<Link
										href="/demo/users"
										className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
									>
										View User Demo →
									</Link>
								</div>
							</CardContent>
						</Card>

						<Card className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									Server Component Demo
									<Badge variant="secondary">Server Components</Badge>
								</CardTitle>
								<CardDescription>
									Server-side data fetching with direct service layer access and streaming with Suspense.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-sm text-gray-600">Features:</p>
									<ul className="space-y-1 text-sm text-gray-600">
										<li>• Direct service layer calls</li>
										<li>• Server-side rendering</li>
										<li>• Suspense & streaming</li>
										<li>• SEO-friendly content</li>
										<li>• Performance comparison</li>
									</ul>
									<Link
										href="/demo/server-data"
										className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
									>
										View Server Demo →
									</Link>
								</div>
							</CardContent>
						</Card>

						<Card className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									API Testing Playground
									<Badge variant="outline">Interactive</Badge>
								</CardTitle>
								<CardDescription>
									Test API endpoints directly in the browser with real-time request/response inspection.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-sm text-gray-600">Features:</p>
									<ul className="space-y-1 text-sm text-gray-600">
										<li>• Live API endpoint testing</li>
										<li>• Request/response inspection</li>
										<li>• Error simulation</li>
										<li>• Performance monitoring</li>
										<li>• Code generation</li>
									</ul>
									<Link
										href="/demo/api-playground"
										className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-full"
									>
										Open Playground →
									</Link>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Rendering Pattern Comparison */}
					<div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Server vs Client Components</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-medium text-green-700 mb-2">🖥️ Server Components</h4>
								<p className="text-sm text-gray-600 mb-2">Rendered on the server, great for static content</p>
								<ul className="text-xs text-gray-600 space-y-1">
									<li>• Direct database/service access</li>
									<li>• SEO-friendly</li>
									<li>• Faster initial loads</li>
									<li>• No client-side JavaScript</li>
								</ul>
							</div>
							<div>
								<h4 className="font-medium text-blue-700 mb-2">💻 Client Components</h4>
								<p className="text-sm text-gray-600 mb-2">Interactive components with state and events</p>
								<ul className="text-xs text-gray-600 space-y-1">
									<li>• useState, useEffect hooks</li>
									<li>• Event handlers</li>
									<li>• Real-time interactions</li>
									<li>• Browser APIs</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Technical Stack */}
				<section className="space-y-6">
					<h2 className="text-2xl font-semibold text-gray-800">��️ Technical Stack</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[
							{ name: 'Next.js 15', description: 'React framework with App Router' },
							{ name: 'Prisma ORM', description: 'Type-safe database toolkit' },
							{ name: 'TypeScript', description: 'Static type checking' },
							{ name: 'Tailwind CSS', description: 'Utility-first styling' },
							{ name: 'PostgreSQL', description: 'Relational database' },
							{ name: 'Radix UI', description: 'Accessible components' },
							{ name: 'ESLint', description: 'Code quality & consistency' },
							{ name: 'Vitest', description: 'Testing framework' },
						].map(tech => (
							<Card key={tech.name} className="text-center">
								<CardContent className="pt-6">
									<div className="space-y-2">
										<h3 className="font-semibold text-sm">{tech.name}</h3>
										<p className="text-xs text-gray-500">{tech.description}</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Quick Links */}
				<section className="space-y-6">
					<h2 className="text-2xl font-semibold text-gray-800">📚 Documentation</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Link href="/docs/PRISMA_SETUP.md" className="block">
							<Card className="hover:shadow-md transition-shadow h-full">
								<CardContent className="pt-6">
									<h3 className="font-semibold mb-2">Prisma Setup Guide</h3>
									<p className="text-sm text-gray-600">
										Complete setup instructions, schema design, and migration guides.
									</p>
								</CardContent>
							</Card>
						</Link>

						<Link href="/DEVELOPMENT_GUIDE.md" className="block">
							<Card className="hover:shadow-md transition-shadow h-full">
								<CardContent className="pt-6">
									<h3 className="font-semibold mb-2">Development Guide</h3>
									<p className="text-sm text-gray-600">Coding standards, best practices, and team conventions.</p>
								</CardContent>
							</Card>
						</Link>

						<div className="block">
							<Card className="hover:shadow-md transition-shadow h-full">
								<CardContent className="pt-6">
									<h3 className="font-semibold mb-2">API Reference</h3>
									<p className="text-sm text-gray-600">
										Explore available endpoints, request/response formats, and examples.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
