import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import SettingsForm, { type UserSettings } from '@/components/example/settings-form'

const mockInitialSettings: UserSettings = {
	emailNotifications: true,
	pushNotifications: false,
	darkMode: false,
	bio: 'Hello, I am a software developer.',
	autoSave: true,
}

describe('SettingsForm', () => {
	const user = userEvent.setup()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		it('renders all setting options', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			expect(screen.getByText('User Settings')).toBeInTheDocument()
			expect(screen.getByText('Email Notifications')).toBeInTheDocument()
			expect(screen.getByText('Push Notifications')).toBeInTheDocument()
			expect(screen.getByText('Dark Mode')).toBeInTheDocument()
			expect(screen.getByText('Auto-save')).toBeInTheDocument()
			expect(screen.getByDisplayValue('Hello, I am a software developer.')).toBeInTheDocument()
		})

		it('reflects initial settings values correctly', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const emailSwitch = screen.getByTestId('email-notifications-switch')
			const pushSwitch = screen.getByTestId('push-notifications-switch')
			const darkModeSwitch = screen.getByTestId('dark-mode-switch')
			const autoSaveSwitch = screen.getByTestId('auto-save-switch')

			expect(emailSwitch).toBeChecked()
			expect(pushSwitch).not.toBeChecked()
			expect(darkModeSwitch).not.toBeChecked()
			expect(autoSaveSwitch).toBeChecked()
		})

		it('shows save button as disabled when no changes are made', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const saveButton = screen.getByTestId('save-button')
			expect(saveButton).toBeDisabled()
		})

		it('shows reset button as disabled when no changes are made', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const resetButton = screen.getByTestId('reset-button')
			expect(resetButton).toBeDisabled()
		})
	})

	describe('Switch Interactions', () => {
		it('toggles email notifications switch', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const emailSwitch = screen.getByTestId('email-notifications-switch')
			expect(emailSwitch).toBeChecked()

			await user.click(emailSwitch)
			expect(emailSwitch).not.toBeChecked()
		})

		it('toggles push notifications switch', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const pushSwitch = screen.getByTestId('push-notifications-switch')
			expect(pushSwitch).not.toBeChecked()

			await user.click(pushSwitch)
			expect(pushSwitch).toBeChecked()
		})

		it('toggles dark mode switch', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const darkModeSwitch = screen.getByTestId('dark-mode-switch')
			expect(darkModeSwitch).not.toBeChecked()

			await user.click(darkModeSwitch)
			expect(darkModeSwitch).toBeChecked()
		})

		it('enables save and reset buttons after making changes', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const emailSwitch = screen.getByTestId('email-notifications-switch')
			await user.click(emailSwitch)

			const saveButton = screen.getByTestId('save-button')
			const resetButton = screen.getByTestId('reset-button')

			expect(saveButton).toBeEnabled()
			expect(resetButton).toBeEnabled()
			expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
		})
	})

	describe('Bio Textarea', () => {
		it('updates bio text correctly', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const bioTextarea = screen.getByTestId('bio-textarea')
			await user.clear(bioTextarea)
			await user.type(bioTextarea, 'New bio content')

			expect(bioTextarea).toHaveValue('New bio content')
		})

		it('shows character count', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const bioTextarea = screen.getByTestId('bio-textarea')
			await user.clear(bioTextarea)
			await user.type(bioTextarea, 'Test')

			expect(screen.getByText('4/500 characters')).toBeInTheDocument()
		})

		it('updates character count as user types', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const bioTextarea = screen.getByTestId('bio-textarea')
			await user.clear(bioTextarea)
			await user.type(bioTextarea, 'Hello World')

			expect(screen.getByText('11/500 characters')).toBeInTheDocument()
		})
	})

	describe('Save Functionality', () => {
		it('calls onSave with updated settings when save button is clicked', async () => {
			const onSave = vi.fn().mockResolvedValue(undefined)
			render(<SettingsForm initialSettings={mockInitialSettings} onSave={onSave} />)

			// Make a change
			const emailSwitch = screen.getByTestId('email-notifications-switch')
			await user.click(emailSwitch)

			// Save changes
			const saveButton = screen.getByTestId('save-button')
			await user.click(saveButton)

			expect(onSave).toHaveBeenCalledWith({
				...mockInitialSettings,
				emailNotifications: false,
			})
		})

		it('shows loading state during save operation', async () => {
			let resolveSave: () => void
			const savePromise = new Promise<void>(resolve => {
				resolveSave = resolve
			})
			const onSave = vi.fn().mockReturnValue(savePromise)

			render(<SettingsForm initialSettings={mockInitialSettings} onSave={onSave} />)

			// Make a change and save
			const emailSwitch = screen.getByTestId('email-notifications-switch')
			await user.click(emailSwitch)

			const saveButton = screen.getByTestId('save-button')
			await user.click(saveButton)

			// Check loading state
			expect(saveButton).toHaveTextContent('Saving...')
			expect(saveButton).toBeDisabled()

			// Resolve save operation
			resolveSave!()
			await waitFor(() => {
				expect(saveButton).toHaveTextContent('Save Changes')
			})
		})

		it('disables buttons after successful save', async () => {
			const onSave = vi.fn().mockResolvedValue(undefined)
			render(<SettingsForm initialSettings={mockInitialSettings} onSave={onSave} />)

			// Make a change and save
			const emailSwitch = screen.getByTestId('email-notifications-switch')
			await user.click(emailSwitch)

			const saveButton = screen.getByTestId('save-button')
			await user.click(saveButton)

			await waitFor(() => {
				expect(saveButton).toBeDisabled()
				expect(screen.getByTestId('reset-button')).toBeDisabled()
				expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
			})
		})

		it('handles save errors gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const onSave = vi.fn().mockRejectedValue(new Error('Save failed'))

			render(<SettingsForm initialSettings={mockInitialSettings} onSave={onSave} />)

			// Make a change and save
			const emailSwitch = screen.getByTestId('email-notifications-switch')
			await user.click(emailSwitch)

			const saveButton = screen.getByTestId('save-button')
			await user.click(saveButton)

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error))
				expect(saveButton).toHaveTextContent('Save Changes')
			})

			consoleSpy.mockRestore()
		})

		it('does not call onSave when no changes are made', async () => {
			const onSave = vi.fn()
			render(<SettingsForm initialSettings={mockInitialSettings} onSave={onSave} />)

			const saveButton = screen.getByTestId('save-button')
			// Save button should be disabled, but let's try clicking anyway
			fireEvent.click(saveButton)

			expect(onSave).not.toHaveBeenCalled()
		})
	})

	describe('Reset Functionality', () => {
		it('resets settings to initial values when reset button is clicked', async () => {
			const onReset = vi.fn()
			render(<SettingsForm initialSettings={mockInitialSettings} onReset={onReset} />)

			// Make changes
			const emailSwitch = screen.getByTestId('email-notifications-switch')
			const bioTextarea = screen.getByTestId('bio-textarea')

			await user.click(emailSwitch)
			await user.clear(bioTextarea)
			await user.type(bioTextarea, 'New bio')

			// Reset
			const resetButton = screen.getByTestId('reset-button')
			await user.click(resetButton)

			// Check that values are reset
			expect(emailSwitch).toBeChecked()
			expect(bioTextarea).toHaveValue('Hello, I am a software developer.')
			expect(onReset).toHaveBeenCalled()
		})

		it('disables buttons after reset', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			// Make a change
			const emailSwitch = screen.getByTestId('email-notifications-switch')
			await user.click(emailSwitch)

			// Reset
			const resetButton = screen.getByTestId('reset-button')
			await user.click(resetButton)

			expect(resetButton).toBeDisabled()
			expect(screen.getByTestId('save-button')).toBeDisabled()
			expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
		})
	})

	describe('Loading State', () => {
		it('disables all buttons when isLoading prop is true', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} isLoading />)

			expect(screen.getByTestId('save-button')).toBeDisabled()
			expect(screen.getByTestId('reset-button')).toBeDisabled()
		})

		it('shows loading text on save button when isLoading', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} isLoading />)

			expect(screen.getByTestId('save-button')).toHaveTextContent('Saving...')
		})
	})

	describe('Form Validation and Edge Cases', () => {
		it('handles multiple rapid changes correctly', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const emailSwitch = screen.getByTestId('email-notifications-switch')
			const pushSwitch = screen.getByTestId('push-notifications-switch')

			// Rapid toggles
			await user.click(emailSwitch)
			await user.click(pushSwitch)
			await user.click(emailSwitch)

			expect(emailSwitch).toBeChecked() // Back to original
			expect(pushSwitch).toBeChecked() // Changed from original
			expect(screen.getByTestId('save-button')).toBeEnabled()
		})

		it('handles empty bio correctly', async () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			const bioTextarea = screen.getByTestId('bio-textarea')
			await user.clear(bioTextarea)

			expect(bioTextarea).toHaveValue('')
			expect(screen.getByText('0/500 characters')).toBeInTheDocument()
			expect(screen.getByTestId('save-button')).toBeEnabled()
		})

		it('tracks changes accurately across all fields', async () => {
			const onSave = vi.fn().mockResolvedValue(undefined)
			render(<SettingsForm initialSettings={mockInitialSettings} onSave={onSave} />)

			// Change multiple settings
			await user.click(screen.getByTestId('email-notifications-switch'))
			await user.click(screen.getByTestId('push-notifications-switch'))
			await user.click(screen.getByTestId('dark-mode-switch'))

			const bioTextarea = screen.getByTestId('bio-textarea')
			await user.clear(bioTextarea)
			await user.type(bioTextarea, 'Updated bio')

			// Save and verify all changes
			await user.click(screen.getByTestId('save-button'))

			expect(onSave).toHaveBeenCalledWith({
				emailNotifications: false, // toggled
				pushNotifications: true, // toggled
				darkMode: true, // toggled
				bio: 'Updated bio', // changed
				autoSave: true, // unchanged
			})
		})
	})

	describe('Accessibility', () => {
		it('has proper labels for all form controls', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			expect(screen.getByLabelText('Email Notifications')).toBeInTheDocument()
			expect(screen.getByLabelText('Push Notifications')).toBeInTheDocument()
			expect(screen.getByLabelText('Dark Mode')).toBeInTheDocument()
			expect(screen.getByLabelText('Auto-save')).toBeInTheDocument()
			expect(screen.getByLabelText('Bio')).toBeInTheDocument()
		})

		it('has proper test ids for all interactive elements', () => {
			render(<SettingsForm initialSettings={mockInitialSettings} />)

			expect(screen.getByTestId('settings-form')).toBeInTheDocument()
			expect(screen.getByTestId('email-notifications-switch')).toBeInTheDocument()
			expect(screen.getByTestId('push-notifications-switch')).toBeInTheDocument()
			expect(screen.getByTestId('dark-mode-switch')).toBeInTheDocument()
			expect(screen.getByTestId('auto-save-switch')).toBeInTheDocument()
			expect(screen.getByTestId('bio-textarea')).toBeInTheDocument()
			expect(screen.getByTestId('save-button')).toBeInTheDocument()
			expect(screen.getByTestId('reset-button')).toBeInTheDocument()
		})
	})
})
