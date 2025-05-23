import { describe, it, expect } from 'vitest'

import { cn, formatName, isValidEmail, formatCurrency, getInitials, truncateText } from '@/lib/utils'

describe('utils', () => {
	describe('cn (className merge)', () => {
		it('should merge classes correctly', () => {
			expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500')
		})

		it('should handle conflicting classes', () => {
			expect(cn('px-2', 'px-4')).toBe('px-4')
		})

		it('should handle conditional classes', () => {
			expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
			expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
		})
	})

	describe('formatName', () => {
		it('should format full name correctly', () => {
			expect(formatName('John', 'Doe')).toBe('John Doe')
		})

		it('should handle missing first name', () => {
			expect(formatName('', 'Doe')).toBe('Doe')
		})

		it('should handle missing last name', () => {
			expect(formatName('John', '')).toBe('John')
		})

		it('should return Anonymous for empty names', () => {
			expect(formatName('', '')).toBe('Anonymous')
		})
	})

	describe('isValidEmail', () => {
		it('should validate correct email formats', () => {
			expect(isValidEmail('test@example.com')).toBe(true)
			expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
			expect(isValidEmail('user+tag@example.org')).toBe(true)
		})

		it('should reject invalid email formats', () => {
			expect(isValidEmail('invalid-email')).toBe(false)
			expect(isValidEmail('test@')).toBe(false)
			expect(isValidEmail('@example.com')).toBe(false)
			expect(isValidEmail('test@.com')).toBe(false)
			expect(isValidEmail('')).toBe(false)
		})
	})

	describe('formatCurrency', () => {
		it('should format USD currency by default', () => {
			expect(formatCurrency(1234.56)).toBe('$1,234.56')
		})

		it('should format different currencies', () => {
			expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
		})

		it('should handle zero amount', () => {
			expect(formatCurrency(0)).toBe('$0.00')
		})

		it('should handle negative amounts', () => {
			expect(formatCurrency(-100)).toBe('-$100.00')
		})
	})

	describe('getInitials', () => {
		it('should get initials from full name', () => {
			expect(getInitials('John Doe')).toBe('JD')
		})

		it('should handle single name', () => {
			expect(getInitials('John')).toBe('J')
		})

		it('should handle multiple names (only first two)', () => {
			expect(getInitials('John Michael Doe')).toBe('JM')
		})

		it('should handle lowercase names', () => {
			expect(getInitials('john doe')).toBe('JD')
		})

		it('should handle empty string', () => {
			expect(getInitials('')).toBe('')
		})
	})

	describe('truncateText', () => {
		it('should truncate long text', () => {
			expect(truncateText('This is a long text', 10)).toBe('This is a ...')
		})

		it('should not truncate short text', () => {
			expect(truncateText('Short', 10)).toBe('Short')
		})

		it('should handle exact length', () => {
			expect(truncateText('Exactly10!', 10)).toBe('Exactly10!')
		})

		it('should handle empty string', () => {
			expect(truncateText('', 5)).toBe('')
		})
	})
})
