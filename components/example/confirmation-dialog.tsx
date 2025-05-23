'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

export interface ConfirmationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	confirmText?: string
	cancelText?: string
	variant?: 'default' | 'destructive'
	onConfirm: () => void | Promise<void>
	isLoading?: boolean
}

export default function ConfirmationDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'default',
	onConfirm,
	isLoading = false,
}: ConfirmationDialogProps) {
	const [internalLoading, setInternalLoading] = useState(false)
	const isDisabled = isLoading || internalLoading

	const handleConfirm = async () => {
		if (isDisabled) return // Prevent multiple calls

		setInternalLoading(true)
		try {
			await onConfirm()
			onOpenChange(false)
		} catch (error) {
			console.error('Confirmation action failed:', error)
			// Don't close dialog on error - let parent handle it
		} finally {
			setInternalLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]" data-testid="confirmation-dialog">
				<DialogHeader>
					<DialogTitle data-testid="dialog-title">{title}</DialogTitle>
					<DialogDescription data-testid="dialog-description">{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDisabled}
						data-testid="cancel-button"
					>
						{cancelText}
					</Button>
					<Button variant={variant} onClick={handleConfirm} disabled={isDisabled} data-testid="confirm-button">
						{isDisabled ? 'Loading...' : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
