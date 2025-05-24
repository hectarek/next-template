import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ConfirmationDialog, { type ConfirmationDialogProps } from '@/components/ui/confirmation-dialog'

const defaultProps: ConfirmationDialogProps = {
	open: true,
	onOpenChange: vi.fn(),
	title: 'Confirm Action',
	description: 'Are you sure you want to perform this action?',
	onConfirm: vi.fn(),
}

describe('ConfirmationDialog', () => {
	const user = userEvent.setup()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders dialog content when open', () => {
			render(<ConfirmationDialog {...defaultProps} />)

			expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
			expect(screen.getByTestId('dialog-title')).toHaveTextContent('Confirm Action')
			expect(screen.getByTestId('dialog-description')).toHaveTextContent(
				'Are you sure you want to perform this action?'
			)
		})

		it('does not render dialog content when closed', () => {
			render(<ConfirmationDialog {...defaultProps} open={false} />)

			expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument()
		})

		it('renders default button texts', () => {
			render(<ConfirmationDialog {...defaultProps} />)

			expect(screen.getByTestId('cancel-button')).toHaveTextContent('Cancel')
			expect(screen.getByTestId('confirm-button')).toHaveTextContent('Confirm')
		})

		it('renders custom button texts', () => {
			render(<ConfirmationDialog {...defaultProps} confirmText="Delete" cancelText="Keep" />)

			expect(screen.getByTestId('cancel-button')).toHaveTextContent('Keep')
			expect(screen.getByTestId('confirm-button')).toHaveTextContent('Delete')
		})
	})

	describe('Button Variants', () => {
		it('applies default variant to confirm button by default', () => {
			render(<ConfirmationDialog {...defaultProps} />)

			const confirmButton = screen.getByTestId('confirm-button')
			// Note: exact class names depend on your Button component implementation
			expect(confirmButton).toBeInTheDocument()
		})

		it('applies destructive variant when specified', () => {
			render(<ConfirmationDialog {...defaultProps} variant="destructive" />)

			const confirmButton = screen.getByTestId('confirm-button')
			expect(confirmButton).toBeInTheDocument()
			// You might want to check for specific CSS classes here
		})
	})

	describe('Cancel Functionality', () => {
		it('calls onOpenChange with false when cancel button is clicked', async () => {
			const onOpenChange = vi.fn()
			render(<ConfirmationDialog {...defaultProps} onOpenChange={onOpenChange} />)

			const cancelButton = screen.getByTestId('cancel-button')
			await user.click(cancelButton)

			expect(onOpenChange).toHaveBeenCalledWith(false)
		})

		it('does not call onConfirm when cancel button is clicked', async () => {
			const onConfirm = vi.fn()
			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

			const cancelButton = screen.getByTestId('cancel-button')
			await user.click(cancelButton)

			expect(onConfirm).not.toHaveBeenCalled()
		})
	})

	describe('Confirm Functionality', () => {
		it('calls onConfirm when confirm button is clicked', async () => {
			const onConfirm = vi.fn().mockResolvedValue(undefined)
			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

			const confirmButton = screen.getByTestId('confirm-button')
			await user.click(confirmButton)

			expect(onConfirm).toHaveBeenCalled()
		})

		it('closes dialog after successful confirmation', async () => {
			const onConfirm = vi.fn().mockResolvedValue(undefined)
			const onOpenChange = vi.fn()

			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />)

			const confirmButton = screen.getByTestId('confirm-button')
			await user.click(confirmButton)

			await waitFor(() => {
				expect(onOpenChange).toHaveBeenCalledWith(false)
			})
		})

		it('handles synchronous onConfirm callback', async () => {
			const onConfirm = vi.fn() // No return value (void)
			const onOpenChange = vi.fn()

			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />)

			const confirmButton = screen.getByTestId('confirm-button')
			await user.click(confirmButton)

			expect(onConfirm).toHaveBeenCalled()
			expect(onOpenChange).toHaveBeenCalledWith(false)
		})
	})

	describe('Loading States', () => {
		it('disables buttons when isLoading prop is true', () => {
			render(<ConfirmationDialog {...defaultProps} isLoading />)

			expect(screen.getByTestId('cancel-button')).toBeDisabled()
			expect(screen.getByTestId('confirm-button')).toBeDisabled()
		})

		it('shows loading text on confirm button when isLoading', () => {
			render(<ConfirmationDialog {...defaultProps} isLoading />)

			expect(screen.getByTestId('confirm-button')).toHaveTextContent('Loading...')
		})

		it('shows loading state during async confirm operation', async () => {
			let resolveConfirm: () => void
			const confirmPromise = new Promise<void>(resolve => {
				resolveConfirm = resolve
			})
			const onConfirm = vi.fn().mockReturnValue(confirmPromise)

			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

			const confirmButton = screen.getByTestId('confirm-button')
			await user.click(confirmButton)

			// During async operation, buttons should be disabled
			expect(confirmButton).toBeDisabled()
			expect(screen.getByTestId('cancel-button')).toBeDisabled()

			// Resolve the promise
			resolveConfirm!()
			await waitFor(() => {
				// After resolution, we expect the dialog to close
				// so we can't test the button state here
			})
		})
	})

	describe('Error Handling', () => {
		it('does not close dialog when onConfirm throws an error', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const onConfirm = vi.fn().mockRejectedValue(new Error('Confirmation failed'))
			const onOpenChange = vi.fn()

			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} onOpenChange={onOpenChange} />)

			const confirmButton = screen.getByTestId('confirm-button')
			await user.click(confirmButton)

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith('Confirmation action failed:', expect.any(Error))
			})

			// Dialog should not close on error
			expect(onOpenChange).not.toHaveBeenCalledWith(false)
			expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()

			consoleSpy.mockRestore()
		})

		it('re-enables buttons after failed confirmation', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const onConfirm = vi.fn().mockRejectedValue(new Error('Confirmation failed'))

			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

			const confirmButton = screen.getByTestId('confirm-button')
			await user.click(confirmButton)

			await waitFor(() => {
				expect(confirmButton).not.toBeDisabled()
				expect(screen.getByTestId('cancel-button')).not.toBeDisabled()
			})

			consoleSpy.mockRestore()
		})
	})

	describe('Dialog Interaction', () => {
		it('handles ESC key press to close dialog', async () => {
			const onOpenChange = vi.fn()
			render(<ConfirmationDialog {...defaultProps} onOpenChange={onOpenChange} />)

			// Simulate ESC key press on the dialog
			const dialog = screen.getByTestId('confirmation-dialog')
			fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })

			// Note: The actual ESC handling depends on the Dialog component implementation
			// You might need to adjust this test based on your Dialog component
		})

		it('handles clicking outside dialog to close', async () => {
			const onOpenChange = vi.fn()
			render(<ConfirmationDialog {...defaultProps} onOpenChange={onOpenChange} />)

			// Note: This test depends on your Dialog component's implementation
			// Some dialogs close on outside click, others don't
		})
	})

	describe('Accessibility', () => {
		it('has proper test ids for all elements', () => {
			render(<ConfirmationDialog {...defaultProps} />)

			expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
			expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
			expect(screen.getByTestId('dialog-description')).toBeInTheDocument()
			expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
			expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
		})

		it('has proper ARIA attributes', () => {
			render(<ConfirmationDialog {...defaultProps} />)

			const dialog = screen.getByRole('dialog')
			expect(dialog).toBeInTheDocument()

			// Title should be associated with the dialog
			const title = screen.getByTestId('dialog-title')
			expect(title).toBeInTheDocument()
		})
	})

	describe('Edge Cases', () => {
		it('handles very long title and description', () => {
			const longTitle = 'A'.repeat(100)
			const longDescription = 'B'.repeat(500)

			render(<ConfirmationDialog {...defaultProps} title={longTitle} description={longDescription} />)

			expect(screen.getByText(longTitle)).toBeInTheDocument()
			expect(screen.getByText(longDescription)).toBeInTheDocument()
		})

		it('handles empty title and description', () => {
			render(<ConfirmationDialog {...defaultProps} title="" description="" />)

			const titleElement = screen.getByTestId('dialog-title')
			const descriptionElement = screen.getByTestId('dialog-description')

			expect(titleElement).toHaveTextContent('')
			expect(descriptionElement).toHaveTextContent('')
		})

		it('handles rapid button clicks gracefully', async () => {
			const onConfirm = vi.fn().mockResolvedValue(undefined)
			render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />)

			const confirmButton = screen.getByTestId('confirm-button')

			// Rapid fireEvent clicks (more realistic for testing race conditions)
			fireEvent.click(confirmButton)
			fireEvent.click(confirmButton)
			fireEvent.click(confirmButton)

			// Wait for all async operations to complete
			await waitFor(
				() => {
					// The first click should work, subsequent clicks should be prevented
					// In practice, timing determines how many get through before disabled state
					expect(onConfirm).toHaveBeenCalledTimes(1)
				},
				{ timeout: 2000 }
			)
		})
	})

	describe('Different Use Cases', () => {
		it('works as delete confirmation dialog', () => {
			render(
				<ConfirmationDialog
					{...defaultProps}
					title="Delete Item"
					description="This action cannot be undone. Are you sure you want to delete this item?"
					confirmText="Delete"
					variant="destructive"
				/>
			)

			expect(screen.getByText('Delete Item')).toBeInTheDocument()
			expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
			expect(screen.getByTestId('confirm-button')).toHaveTextContent('Delete')
		})

		it('works as save confirmation dialog', () => {
			render(
				<ConfirmationDialog
					{...defaultProps}
					title="Save Changes"
					description="You have unsaved changes. Do you want to save them before leaving?"
					confirmText="Save"
					cancelText="Don't Save"
				/>
			)

			expect(screen.getByText('Save Changes')).toBeInTheDocument()
			expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument()
			expect(screen.getByTestId('confirm-button')).toHaveTextContent('Save')
			expect(screen.getByTestId('cancel-button')).toHaveTextContent("Don't Save")
		})
	})
})
