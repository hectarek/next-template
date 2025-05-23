import { test, expect } from '@playwright/test'

test.describe('Component Interactions', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to a test page that contains our components
		// You'll need to create this page in your app or use Storybook
		await page.goto('/components-demo') // Adjust URL as needed
	})

	test.describe('Task Card Component', () => {
		test('should display task information correctly', async ({ page }) => {
			// Wait for task card to be visible
			await expect(page.getByTestId('task-card-1')).toBeVisible()

			// Check task title and description
			await expect(page.getByText('Implement user authentication')).toBeVisible()
			await expect(page.getByText('Add login and registration functionality')).toBeVisible()

			// Check status and priority badges
			await expect(page.getByTestId('status-badge-1')).toContainText('In Progress')
			await expect(page.getByTestId('priority-badge-1')).toContainText('High')

			// Check assignee information
			await expect(page.getByText('John Doe')).toBeVisible()
		})

		test('should toggle task status when button is clicked', async ({ page }) => {
			const statusButton = page.getByTestId('status-toggle-1')
			const statusBadge = page.getByTestId('status-badge-1')

			// Initial status should be "In Progress"
			await expect(statusBadge).toContainText('In Progress')
			await expect(statusButton).toContainText('Mark Complete')

			// Click to mark as complete
			await statusButton.click()

			// Status should change to completed
			await expect(statusBadge).toContainText('Completed')
			await expect(statusButton).toContainText('Reopen')
		})

		test('should handle edit and delete actions', async ({ page }) => {
			const editButton = page.getByTestId('edit-button-1')
			const deleteButton = page.getByTestId('delete-button-1')

			// Edit button should be visible and clickable
			await expect(editButton).toBeVisible()
			await editButton.click()

			// You would check for edit modal or navigation here
			// await expect(page.getByText('Edit Task')).toBeVisible()

			// Delete button should trigger confirmation
			await deleteButton.click()
			// You would check for confirmation dialog here
		})

		test('should show overdue styling for past due dates', async ({ page }) => {
			// Look for an overdue task
			const overdueTask = page.getByTestId('task-card-overdue')
			await expect(overdueTask).toBeVisible()

			// Check that due date has destructive styling
			const dueDate = page.getByTestId('due-date-overdue')
			await expect(dueDate).toHaveClass(/text-destructive/)
		})
	})

	test.describe('Settings Form Component', () => {
		test('should toggle notification settings', async ({ page }) => {
			// Navigate to settings form
			await page.getByTestId('settings-form').scrollIntoViewIfNeeded()

			const emailSwitch = page.getByTestId('email-notifications-switch')
			const pushSwitch = page.getByTestId('push-notifications-switch')

			// Check initial states
			await expect(emailSwitch).toBeChecked()
			await expect(pushSwitch).not.toBeChecked()

			// Toggle email notifications
			await emailSwitch.click()
			await expect(emailSwitch).not.toBeChecked()

			// Toggle push notifications
			await pushSwitch.click()
			await expect(pushSwitch).toBeChecked()

			// Save button should be enabled after changes
			const saveButton = page.getByTestId('save-button')
			await expect(saveButton).toBeEnabled()
			await expect(page.getByText('Unsaved changes')).toBeVisible()
		})

		test('should update bio and character count', async ({ page }) => {
			const bioTextarea = page.getByTestId('bio-textarea')
			const initialText = 'Hello, I am a software developer.'

			// Clear and type new bio
			await bioTextarea.fill('')
			await expect(page.getByText('0/500 characters')).toBeVisible()

			const newBio = 'I am a full-stack developer with 5 years of experience.'
			await bioTextarea.fill(newBio)

			// Check character count updates
			await expect(page.getByText(`${newBio.length}/500 characters`)).toBeVisible()

			// Save button should be enabled
			await expect(page.getByTestId('save-button')).toBeEnabled()
		})

		test('should save settings successfully', async ({ page }) => {
			// Make a change
			await page.getByTestId('dark-mode-switch').click()

			// Save changes
			const saveButton = page.getByTestId('save-button')
			await saveButton.click()

			// Check loading state
			await expect(saveButton).toContainText('Saving...')
			await expect(saveButton).toBeDisabled()

			// Wait for save to complete
			await expect(saveButton).toContainText('Save Changes')
			await expect(saveButton).toBeDisabled() // Should be disabled after save
			await expect(page.getByText('Unsaved changes')).not.toBeVisible()
		})

		test('should reset settings to original values', async ({ page }) => {
			const emailSwitch = page.getByTestId('email-notifications-switch')
			const bioTextarea = page.getByTestId('bio-textarea')

			// Make changes
			await emailSwitch.click()
			await bioTextarea.fill('New bio content')

			// Reset should be enabled
			const resetButton = page.getByTestId('reset-button')
			await expect(resetButton).toBeEnabled()

			// Click reset
			await resetButton.click()

			// Check values are reset
			await expect(emailSwitch).toBeChecked()
			await expect(bioTextarea).toHaveValue('Hello, I am a software developer.')
			await expect(resetButton).toBeDisabled()
		})
	})

	test.describe('Confirmation Dialog Component', () => {
		test('should show and handle confirmation dialog', async ({ page }) => {
			// Trigger a delete action that opens confirmation dialog
			await page.getByTestId('delete-button-1').click()

			// Dialog should appear
			const dialog = page.getByTestId('confirmation-dialog')
			await expect(dialog).toBeVisible()

			// Check dialog content
			await expect(page.getByTestId('dialog-title')).toContainText('Delete')
			await expect(page.getByTestId('dialog-description')).toBeVisible()

			// Check buttons are present
			await expect(page.getByTestId('cancel-button')).toBeVisible()
			await expect(page.getByTestId('confirm-button')).toBeVisible()
		})

		test('should cancel dialog without action', async ({ page }) => {
			// Trigger dialog
			await page.getByTestId('delete-button-1').click()

			// Cancel the dialog
			await page.getByTestId('cancel-button').click()

			// Dialog should close
			await expect(page.getByTestId('confirmation-dialog')).not.toBeVisible()

			// Original item should still be there
			await expect(page.getByTestId('task-card-1')).toBeVisible()
		})

		test('should confirm action and close dialog', async ({ page }) => {
			// Trigger dialog
			await page.getByTestId('delete-button-1').click()

			// Confirm the action
			const confirmButton = page.getByTestId('confirm-button')
			await confirmButton.click()

			// Check loading state
			await expect(confirmButton).toContainText('Loading...')
			await expect(confirmButton).toBeDisabled()

			// Dialog should close after confirmation
			await expect(page.getByTestId('confirmation-dialog')).not.toBeVisible()

			// Check that action was performed (item removed, etc.)
			// This depends on your specific implementation
		})

		test('should handle destructive variant styling', async ({ page }) => {
			// Trigger a destructive action dialog
			await page.getByTestId('delete-button-1').click()

			const confirmButton = page.getByTestId('confirm-button')
			await expect(confirmButton).toBeVisible()

			// Check that destructive styling is applied
			// This would depend on your Button component's CSS classes
			// await expect(confirmButton).toHaveClass(/destructive/)
		})
	})

	test.describe('Cross-Component Interactions', () => {
		test('should handle complex workflow with multiple components', async ({ page }) => {
			// 1. Edit a task
			await page.getByTestId('edit-button-1').click()

			// 2. Make changes in a form (if edit opens a form)
			// This would depend on your edit implementation

			// 3. Save changes
			await page.getByTestId('save-button').click()

			// 4. Verify changes are reflected in the task card
			// await expect(page.getByTestId('task-card-1')).toContainText('Updated Task')

			// 5. Delete the task with confirmation
			await page.getByTestId('delete-button-1').click()
			await page.getByTestId('confirm-button').click()

			// 6. Verify task is removed
			// await expect(page.getByTestId('task-card-1')).not.toBeVisible()
		})

		test('should maintain state across form interactions', async ({ page }) => {
			// Navigate to settings
			await page.getByTestId('settings-form').scrollIntoViewIfNeeded()

			// Make multiple changes
			await page.getByTestId('email-notifications-switch').click()
			await page.getByTestId('dark-mode-switch').click()
			await page.getByTestId('bio-textarea').fill('Updated bio')

			// Verify all changes are tracked
			await expect(page.getByText('Unsaved changes')).toBeVisible()
			await expect(page.getByTestId('save-button')).toBeEnabled()

			// Save all changes
			await page.getByTestId('save-button').click()

			// Verify save completed
			await expect(page.getByText('Unsaved changes')).not.toBeVisible()
		})
	})

	test.describe('Mobile Responsiveness', () => {
		test('should work correctly on mobile devices', async ({ page }) => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 })

			// Test that components are still functional on mobile
			await expect(page.getByTestId('task-card-1')).toBeVisible()

			// Test touch interactions
			await page.getByTestId('status-toggle-1').tap()
			await expect(page.getByTestId('status-badge-1')).toContainText('Completed')

			// Test form interactions on mobile
			await page.getByTestId('email-notifications-switch').tap()
			await expect(page.getByTestId('save-button')).toBeEnabled()
		})
	})

	test.describe('Accessibility', () => {
		test('should be keyboard navigable', async ({ page }) => {
			// Focus on first interactive element
			await page.keyboard.press('Tab')

			// Navigate through form elements
			await page.keyboard.press('Enter') // Activate switch
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')

			// Test dialog keyboard navigation
			await page.getByTestId('delete-button-1').focus()
			await page.keyboard.press('Enter')

			// Navigate within dialog
			await page.keyboard.press('Tab') // Cancel button
			await page.keyboard.press('Tab') // Confirm button
			await page.keyboard.press('Escape') // Close dialog

			await expect(page.getByTestId('confirmation-dialog')).not.toBeVisible()
		})

		test('should have proper ARIA labels and roles', async ({ page }) => {
			// Check form elements have labels
			await expect(page.getByRole('checkbox', { name: /email notifications/i })).toBeVisible()
			await expect(page.getByRole('checkbox', { name: /push notifications/i })).toBeVisible()

			// Check dialog has proper role
			await page.getByTestId('delete-button-1').click()
			await expect(page.getByRole('dialog')).toBeVisible()
		})
	})
})
