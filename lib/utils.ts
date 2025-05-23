import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Format a name to display format (First Last)
 */
export function formatName(firstName: string, lastName: string): string {
	if (!firstName && !lastName) return 'Anonymous'
	if (!firstName) return lastName
	if (!lastName) return firstName
	return `${firstName} ${lastName}`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

/**
 * Format currency to display format
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount)
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
	return name
		.split(' ')
		.map(part => part.charAt(0).toUpperCase())
		.slice(0, 2)
		.join('')
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text
	return `${text.slice(0, maxLength)}...`
}
