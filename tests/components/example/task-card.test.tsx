import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import TaskCard, { type Task, type User } from '@/components/example/task-card'

// Mock data
const mockUser: User = {
	id: '1',
	name: 'John Doe',
	avatar: 'https://example.com/avatar.jpg',
}

const mockTask: Task = {
	id: 'task-1',
	title: 'Implement user authentication',
	description: 'Add login and registration functionality with JWT tokens',
	status: 'in-progress',
	priority: 'high',
	assignee: mockUser,
	dueDate: '2024-12-31',
	tags: ['frontend', 'security', 'urgent'],
}

const overdueMockTask: Task = {
	...mockTask,
	id: 'task-2',
	title: 'Fix critical bug',
	dueDate: '2024-01-01', // Past date
}

describe('TaskCard', () => {
	describe('Rendering', () => {
		it('renders task information correctly', () => {
			render(<TaskCard task={mockTask} />)

			expect(screen.getByText('Implement user authentication')).toBeInTheDocument()
			expect(screen.getByText('Add login and registration functionality with JWT tokens')).toBeInTheDocument()
			expect(screen.getByText('John Doe')).toBeInTheDocument()
			expect(screen.getByTestId('due-date-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('due-date-task-1')).toHaveTextContent(/Due:/)
		})

		it('renders status badge with correct variant', () => {
			render(<TaskCard task={mockTask} />)

			const statusBadge = screen.getByTestId('status-badge-task-1')
			expect(statusBadge).toHaveTextContent('In Progress')
		})

		it('renders priority badge with correct variant', () => {
			render(<TaskCard task={mockTask} />)

			const priorityBadge = screen.getByTestId('priority-badge-task-1')
			expect(priorityBadge).toHaveTextContent('High')
		})

		it('renders all tags', () => {
			render(<TaskCard task={mockTask} />)

			expect(screen.getByTestId('tag-frontend')).toHaveTextContent('frontend')
			expect(screen.getByTestId('tag-security')).toHaveTextContent('security')
			expect(screen.getByTestId('tag-urgent')).toHaveTextContent('urgent')
		})

		it('renders assignee avatar with fallback', () => {
			render(<TaskCard task={mockTask} />)

			// Avatar fallback should show "JO" for "John Doe"
			const avatarFallback = screen.getByText('JO')
			expect(avatarFallback).toBeInTheDocument()

			// Name should be displayed
			expect(screen.getByText('John Doe')).toBeInTheDocument()
		})
	})

	describe('Due Date Handling', () => {
		it('highlights overdue tasks', () => {
			render(<TaskCard task={overdueMockTask} />)

			const dueDateElement = screen.getByTestId('due-date-task-2')
			expect(dueDateElement).toHaveClass('text-destructive')
		})

		it('shows normal styling for future due dates', () => {
			// Use a definitely future date
			const futureTask = { ...mockTask, dueDate: '2025-12-31' }
			render(<TaskCard task={futureTask} />)

			const dueDateElement = screen.getByTestId('due-date-task-1')
			expect(dueDateElement).toHaveClass('text-muted-foreground')
			expect(dueDateElement).not.toHaveClass('text-destructive')
		})

		it('handles tasks without due dates', () => {
			const taskWithoutDueDate = { ...mockTask, dueDate: undefined }
			render(<TaskCard task={taskWithoutDueDate} />)

			expect(screen.queryByTestId('due-date-task-1')).not.toBeInTheDocument()
		})
	})

	describe('Status Management', () => {
		it('shows correct button text for different statuses', () => {
			// Todo status
			const todoTask = { ...mockTask, status: 'todo' as const }
			const { rerender } = render(<TaskCard task={todoTask} />)
			expect(screen.getByText('Mark Complete')).toBeInTheDocument()

			// In-progress status
			const inProgressTask = { ...mockTask, status: 'in-progress' as const }
			rerender(<TaskCard task={inProgressTask} />)
			expect(screen.getByText('Mark Complete')).toBeInTheDocument()

			// Completed status
			const completedTask = { ...mockTask, status: 'completed' as const }
			rerender(<TaskCard task={completedTask} />)
			expect(screen.getByText('Reopen')).toBeInTheDocument()
		})

		it('calls onStatusChange with correct next status', () => {
			const onStatusChange = vi.fn()
			render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)

			const statusButton = screen.getByTestId('status-toggle-task-1')
			fireEvent.click(statusButton)

			expect(onStatusChange).toHaveBeenCalledWith('task-1', 'completed')
		})

		it('handles status progression correctly', () => {
			const onStatusChange = vi.fn()

			// Todo -> In Progress
			const todoTask = { ...mockTask, status: 'todo' as const }
			const { rerender } = render(<TaskCard task={todoTask} onStatusChange={onStatusChange} />)
			fireEvent.click(screen.getByTestId('status-toggle-task-1'))
			expect(onStatusChange).toHaveBeenCalledWith('task-1', 'in-progress')

			// Completed -> Todo (reopen)
			const completedTask = { ...mockTask, status: 'completed' as const }
			rerender(<TaskCard task={completedTask} onStatusChange={onStatusChange} />)
			fireEvent.click(screen.getByTestId('status-toggle-task-1'))
			expect(onStatusChange).toHaveBeenCalledWith('task-1', 'todo')
		})

		it('does not call onStatusChange when callback is not provided', () => {
			render(<TaskCard task={mockTask} />)

			const statusButton = screen.getByTestId('status-toggle-task-1')
			// Should not throw an error
			fireEvent.click(statusButton)
		})
	})

	describe('Action Buttons', () => {
		it('shows edit button when onEdit is provided', () => {
			const onEdit = vi.fn()
			render(<TaskCard task={mockTask} onEdit={onEdit} />)

			const editButton = screen.getByTestId('edit-button-task-1')
			expect(editButton).toBeInTheDocument()

			fireEvent.click(editButton)
			expect(onEdit).toHaveBeenCalledWith('task-1')
		})

		it('shows delete button when onDelete is provided', () => {
			const onDelete = vi.fn()
			render(<TaskCard task={mockTask} onDelete={onDelete} />)

			const deleteButton = screen.getByTestId('delete-button-task-1')
			expect(deleteButton).toBeInTheDocument()

			fireEvent.click(deleteButton)
			expect(onDelete).toHaveBeenCalledWith('task-1')
		})

		it('hides action buttons when callbacks are not provided', () => {
			render(<TaskCard task={mockTask} />)

			expect(screen.queryByTestId('edit-button-task-1')).not.toBeInTheDocument()
			expect(screen.queryByTestId('delete-button-task-1')).not.toBeInTheDocument()
		})

		it('shows both buttons when both callbacks are provided', () => {
			const onEdit = vi.fn()
			const onDelete = vi.fn()
			render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />)

			expect(screen.getByTestId('edit-button-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('delete-button-task-1')).toBeInTheDocument()
		})
	})

	describe('Assignee Handling', () => {
		it('handles tasks without assignees', () => {
			const taskWithoutAssignee = { ...mockTask, assignee: undefined }
			render(<TaskCard task={taskWithoutAssignee} />)

			expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
			expect(screen.queryByAltText(/avatar/)).not.toBeInTheDocument()
		})

		it('shows assignee initials in avatar fallback', () => {
			const taskWithUserNoAvatar = {
				...mockTask,
				assignee: { ...mockUser, avatar: undefined },
			}
			render(<TaskCard task={taskWithUserNoAvatar} />)

			// Avatar fallback should show "JO" for "John Doe"
			const avatarFallback = screen.getByText('JO')
			expect(avatarFallback).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('has proper test ids for all interactive elements', () => {
			const onStatusChange = vi.fn()
			const onEdit = vi.fn()
			const onDelete = vi.fn()

			render(<TaskCard task={mockTask} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />)

			// Test IDs for testing and automation
			expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('status-badge-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('priority-badge-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('status-toggle-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('edit-button-task-1')).toBeInTheDocument()
			expect(screen.getByTestId('delete-button-task-1')).toBeInTheDocument()
		})

		it('applies custom className correctly', () => {
			render(<TaskCard task={mockTask} className="custom-class" />)

			const taskCard = screen.getByTestId('task-card-task-1')
			expect(taskCard).toHaveClass('custom-class')
		})
	})

	describe('Priority Variants', () => {
		it('renders low priority correctly', () => {
			const lowPriorityTask = { ...mockTask, priority: 'low' as const }
			render(<TaskCard task={lowPriorityTask} />)

			const priorityBadge = screen.getByTestId('priority-badge-task-1')
			expect(priorityBadge).toHaveTextContent('Low')
		})

		it('renders medium priority correctly', () => {
			const mediumPriorityTask = { ...mockTask, priority: 'medium' as const }
			render(<TaskCard task={mediumPriorityTask} />)

			const priorityBadge = screen.getByTestId('priority-badge-task-1')
			expect(priorityBadge).toHaveTextContent('default')
		})

		it('renders high priority correctly', () => {
			const highPriorityTask = { ...mockTask, priority: 'high' as const }
			render(<TaskCard task={highPriorityTask} />)

			const priorityBadge = screen.getByTestId('priority-badge-task-1')
			expect(priorityBadge).toHaveTextContent('High')
		})
	})

	describe('Edge Cases', () => {
		it('handles empty tags array', () => {
			const taskWithoutTags = { ...mockTask, tags: [] }
			render(<TaskCard task={taskWithoutTags} />)

			// No tags should be rendered
			expect(screen.queryByTestId(/tag-/)).not.toBeInTheDocument()
		})

		it('handles very long task titles and descriptions', () => {
			const longTask = {
				...mockTask,
				title: 'A'.repeat(100),
				description: 'B'.repeat(500),
			}
			render(<TaskCard task={longTask} />)

			expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
			expect(screen.getByText('B'.repeat(500))).toBeInTheDocument()
		})
	})
})
