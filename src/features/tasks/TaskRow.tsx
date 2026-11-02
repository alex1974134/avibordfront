import type { Task, TaskStatus, User } from '../../types'
import { formatDeadline } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Avatar } from '../../components/ui/Avatar'
import { PriorityBadge, priorityDot } from './PriorityBadge'
import { StatusMenu } from './StatusMenu'

export function TaskRow({
  task,
  projectName,
  assignee,
  onStatus,
}: {
  task: Task
  projectName: string
  assignee: User
  onStatus: (status: TaskStatus) => void
}) {
  const deadline = formatDeadline(task.deadline)
  const overdue = deadline.overdue && task.status !== 'done'

  return (
    <div className="flex gap-3 py-3">
      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', priorityDot[task.priority])} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-5 font-medium text-ink">{task.title}</p>
          <p className={cn('shrink-0 text-xs tabular-nums', overdue ? 'font-medium text-rose-600' : 'text-faint')}>
            {overdue ? `Просрочено · ${deadline.label}` : deadline.label}
          </p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">{projectName}</span>
          <span className="text-faint" aria-hidden="true">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Avatar user={assignee} size="xs" />
            {assignee.name}
          </span>
          <PriorityBadge priority={task.priority} />
          <StatusMenu status={task.status} onChange={onStatus} />
        </div>
      </div>
    </div>
  )
}
