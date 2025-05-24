import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { UserForm } from '@/components/example/user-form'

// Mock the API module
const mockCreateUser = vi.fn()
vi.mock('@/lib/api/users', () => ({
	createUser: mockCreateUser,
}))

describe('UserForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders form fields correctly', () => {
		render(<UserForm />)

		expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/avatar url/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
	})

	it('shows validation errors for invalid email', async () => {
		render(<UserForm />)

		const emailInput = screen.getByLabelText(/email/i)
		const submitButton = screen.getByRole('button', { name: /create user/i })

		fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
		fireEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
		})
	})

	it('requires email field', async () => {
		render(<UserForm />)

		const submitButton = screen.getByRole('button', { name: /create user/i })
		fireEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/email is required/i)).toBeInTheDocument()
		})
	})

	it('successfully creates user with valid data', async () => {
		const mockUser = {
			id: '1',
			email: 'test@example.com',
			name: 'Test User',
			avatar: 'https://example.com/avatar.jpg',
			role: 'USER' as const,
			isActive: true,
			metadata: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		mockCreateUser.mockResolvedValueOnce(mockUser)

		render(<UserForm />)

		const emailInput = screen.getByLabelText(/email/i)
		const nameInput = screen.getByLabelText(/name/i)
		const avatarInput = screen.getByLabelText(/avatar url/i)
		const submitButton = screen.getByRole('button', { name: /create user/i })

		fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
		fireEvent.change(nameInput, { target: { value: 'Test User' } })
		fireEvent.change(avatarInput, { target: { value: 'https://example.com/avatar.jpg' } })

		fireEvent.click(submitButton)

		// Check loading state
		await waitFor(() => {
			expect(screen.getByText(/creating.../i)).toBeInTheDocument()
		})

		// Check success state
		await waitFor(() => {
			expect(screen.getByText(/user created successfully/i)).toBeInTheDocument()
		})

		// Verify API was called with correct data
		expect(mockCreateUser).toHaveBeenCalledWith({
			email: 'test@example.com',
			name: 'Test User',
			avatar: 'https://example.com/avatar.jpg',
		})

		// Form should be reset
		expect(emailInput).toHaveValue('')
		expect(nameInput).toHaveValue('')
		expect(avatarInput).toHaveValue('')
	})

	it('handles API errors gracefully', async () => {
		const errorMessage = 'A user with this email already exists'
		mockCreateUser.mockRejectedValueOnce(new Error(errorMessage))

		render(<UserForm />)

		const emailInput = screen.getByLabelText(/email/i)
		const submitButton = screen.getByRole('button', { name: /create user/i })

		fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
		fireEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument()
		})

		// Button should be enabled again
		expect(submitButton).toBeEnabled()
	})

	it('disables form during submission', async () => {
		mockCreateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

		render(<UserForm />)

		const emailInput = screen.getByLabelText(/email/i)
		const submitButton = screen.getByRole('button', { name: /create user/i })

		fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
		fireEvent.click(submitButton)

		// Form should be disabled during submission
		expect(submitButton).toBeDisabled()
		expect(emailInput).toBeDisabled()
	})

	it('allows creating user with only email', async () => {
		const mockUser = {
			id: '1',
			email: 'minimal@example.com',
			name: null,
			avatar: null,
			role: 'USER' as const,
			isActive: true,
			metadata: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		mockCreateUser.mockResolvedValueOnce(mockUser)

		render(<UserForm />)

		const emailInput = screen.getByLabelText(/email/i)
		const submitButton = screen.getByRole('button', { name: /create user/i })

		fireEvent.change(emailInput, { target: { value: 'minimal@example.com' } })
		fireEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/user created successfully/i)).toBeInTheDocument()
		})

		expect(mockCreateUser).toHaveBeenCalledWith({
			email: 'minimal@example.com',
			name: '',
			avatar: '',
		})
	})

	it('shows proper accessibility attributes', () => {
		render(<UserForm />)

		const emailInput = screen.getByLabelText(/email/i)
		const nameInput = screen.getByLabelText(/name/i)
		const avatarInput = screen.getByLabelText(/avatar url/i)

		expect(emailInput).toHaveAttribute('type', 'email')
		expect(emailInput).toHaveAttribute('required')
		expect(nameInput).toHaveAttribute('type', 'text')
		expect(avatarInput).toHaveAttribute('type', 'url')
	})

	describe('Form validation edge cases', () => {
		it('trims whitespace from inputs', async () => {
			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User',
				avatar: null,
				role: 'USER' as const,
				isActive: true,
				metadata: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			mockCreateUser.mockResolvedValueOnce(mockUser)

			render(<UserForm />)

			const emailInput = screen.getByLabelText(/email/i)
			const nameInput = screen.getByLabelText(/name/i)
			const submitButton = screen.getByRole('button', { name: /create user/i })

			fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } })
			fireEvent.change(nameInput, { target: { value: '  Test User  ' } })
			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/user created successfully/i)).toBeInTheDocument()
			})

			expect(mockCreateUser).toHaveBeenCalledWith({
				email: 'test@example.com',
				name: 'Test User',
				avatar: '',
			})
		})

		it('validates avatar URL format', async () => {
			render(<UserForm />)

			const avatarInput = screen.getByLabelText(/avatar url/i)
			const submitButton = screen.getByRole('button', { name: /create user/i })

			fireEvent.change(avatarInput, { target: { value: 'not-a-url' } })
			fireEvent.click(submitButton)

			await waitFor(() => {
				expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
			})
		})
	})
})
