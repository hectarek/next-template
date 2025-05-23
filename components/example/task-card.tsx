import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatName, cn } from '@/lib/utils'

export interface User {
	id: string
	name: string
	avatar?: string
}

export interface Task {
	id: string
	title: string
	description: string
	status: 'todo' | 'in-progress' | 'completed'
	priority: 'low' | 'medium' | 'high'
	assignee?: User
	dueDate?: string
	tags: string[]
}

interface TaskCardProps {
	task: Task
	onStatusChange?: (taskId: string, status: Task['status']) => void
	onEdit?: (taskId: string) => void
	onDelete?: (taskId: string) => void
	className?: string
}

const statusConfig = {
	todo: { label: 'To Do', variant: 'secondary' as const },
	'in-progress': { label: 'In Progress', variant: 'default' as const },
	completed: { label: 'Completed', variant: 'outline' as const },
}

const priorityConfig = {
	low: { label: 'Low', variant: 'secondary' as const },
	medium: { label: 'default' as const, variant: 'default' as const },
	high: { label: 'High', variant: 'destructive' as const },
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete, className }: TaskCardProps) {
	const handleStatusToggle = () => {
		if (!onStatusChange) return

		const nextStatus: Task['status'] =
			task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'todo'

		onStatusChange(task.id, nextStatus)
	}

	const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

	return (
		<Card
			className={cn('w-full transition-shadow hover:shadow-md', isOverdue && 'border-destructive', className)}
			data-testid={`task-card-${task.id}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg font-semibold leading-tight">{task.title}</CardTitle>
					<div className="flex gap-2">
						<Badge variant={statusConfig[task.status].variant} data-testid={`status-badge-${task.id}`}>
							{statusConfig[task.status].label}
						</Badge>
						<Badge variant={priorityConfig[task.priority].variant} data-testid={`priority-badge-${task.id}`}>
							{priorityConfig[task.priority].label}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Description */}
				<p className="text-sm text-muted-foreground">{task.description}</p>

				{/* Tags */}
				{task.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{task.tags.map(tag => (
							<Badge key={tag} variant="outline" className="text-xs" data-testid={`tag-${tag}`}>
								{tag}
							</Badge>
						))}
					</div>
				)}

				{/* Assignee and Due Date */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						{task.assignee && (
							<>
								<Avatar className="h-6 w-6">
									<AvatarImage src={task.assignee.avatar} alt={`${task.assignee.name} avatar`} />
									<AvatarFallback className="text-xs">
										{formatName(task.assignee.name, '').slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="text-sm text-muted-foreground">{task.assignee.name}</span>
							</>
						)}
					</div>

					{task.dueDate && (
						<span
							className={cn('text-xs', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}
							data-testid={`due-date-${task.id}`}
						>
							Due: {new Date(task.dueDate).toLocaleDateString()}
						</span>
					)}
				</div>

				{/* Actions */}
				<div className="flex justify-between pt-2">
					<Button variant="outline" size="sm" onClick={handleStatusToggle} data-testid={`status-toggle-${task.id}`}>
						{task.status === 'completed' ? 'Reopen' : 'Mark Complete'}
					</Button>

					<div className="flex gap-2">
						{onEdit && (
							<Button variant="ghost" size="sm" onClick={() => onEdit(task.id)} data-testid={`edit-button-${task.id}`}>
								Edit
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={() => onDelete(task.id)}
								data-testid={`delete-button-${task.id}`}
							>
								Delete
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
