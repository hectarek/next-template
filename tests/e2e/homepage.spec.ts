import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
	test('should load and display the main content', async ({ page }) => {
		// Navigate to the homepage
		await page.goto('/')

		// Check if the page loads successfully (Next.js 15 default title)
		await expect(page).toHaveTitle(/Create Next App/)

		// Check if main content is visible (Next.js uses div, not main by default)
		await expect(page.locator('body')).toBeVisible()
	})

	test('should have working navigation', async ({ page }) => {
		await page.goto('/')

		// Check if navigation elements are present and functional
		// This is a basic example - adjust based on your actual navigation
		const mainHeading = page.locator('h1, h2, p').first()
		await expect(mainHeading).toBeVisible()
	})

	test('should be responsive on mobile', async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')

		// Check that main content is still visible on mobile
		await expect(page.locator('body')).toBeVisible()
	})

	test('should have no console errors', async ({ page }) => {
		const consoleErrors: string[] = []

		// Listen for console errors
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text())
			}
		})

		await page.goto('/')

		// Wait for page to fully load
		await page.waitForLoadState('networkidle')

		// Check that there are no console errors
		expect(consoleErrors).toHaveLength(0)
	})

	test('should have proper meta tags for SEO', async ({ page }) => {
		await page.goto('/')

		// Check for essential meta tags
		await expect(page.locator('meta[name="viewport"]')).toHaveCount(1)

		// Check that the page has a title
		const title = await page.title()
		expect(title).toBeTruthy()
		expect(title.length).toBeGreaterThan(0)
	})
})
