import { useMemo, useState } from 'react'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Task, TaskStatus, User } from '../../types'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import { formatDeadline } from '../../utils/format'
import { cn } from '../../utils/cn'
import { statusText, taskStatuses } from '../../utils/labels'
import { IconButton } from '../../components/ui/IconButton'
import { PriorityBadge } from '../tasks/PriorityBadge'
import { StatusMenu } from '../tasks/StatusMenu'
import { AssigneeMenu } from '../tasks/AssigneeMenu'
import { BoardTaskModal } from '../tasks/BoardTaskModal'
import { DeleteTaskModal } from '../tasks/DeleteTaskModal'

const columnTone: Record<TaskStatus, string> = {
  todo: 'bg-zinc-300',
  in_progress: 'bg-accent',
  review: 'bg-amber-500',
  done: 'bg-emerald-600',
}

export function ProjectBoard({
  tasks,
  users,
  memberIds,
  projectId,
  workspaceId,
}: {
  tasks: Task[]
  users: User[]
  memberIds: string[]
  projectId: string
  workspaceId: string
}) {
  const setTaskStatus = useAppStore((state) => state.setTaskStatus)
  const updateTask = useAppStore((state) => state.updateTask)
  const { locale, t } = useI18n()
  const [over, setOver] = useState<TaskStatus | null>(null)
  const [creating, setCreating] = useState<TaskStatus | null>(null)
  const [editing, setEditing] = useState<Task | null>(null)
  const [removing, setRemoving] = useState<Task | null>(null)

  const members = useMemo(
    () =>
      memberIds
        .map((id) => users.find((user) => user.id === id))
        .filter((user): user is User => Boolean(user)),
    [memberIds, users],
  )

  return (
    <>
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
        {taskStatuses.map((status) => {
          const column = tasks.filter((task) => task.status === status)
          return (
            <section
              key={status}
              aria-label={statusText(status, locale)}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setOver(status)
              }}
              onDrop={(event) => {
                event.preventDefault()
                const id = event.dataTransfer.getData('text/plain')
                if (id) setTaskStatus(id, status)
                setOver(null)
              }}
              className={cn(
                'flex min-h-64 flex-col rounded-xl border border-line bg-zinc-50/80 p-2',
                over === status && 'border-accent bg-accent-soft/50',
              )}
            >
              <header className="flex items-center gap-2 px-1 py-1">
                <span className={cn('h-2 w-2 rounded-full', columnTone[status])} />
                <h2 className="text-xs font-medium text-ink">{statusText(status, locale)}</h2>
                <span className="text-xs tabular-nums text-faint">{column.length}</span>
                <IconButton
                  label={t('addColumnTask')}
                  className="ml-auto h-6 w-6"
                  onClick={() => setCreating(status)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </IconButton>
              </header>
              <div className="mt-1 flex flex-1 flex-col gap-2">
                {column.length === 0 ? (
                  <p className="px-1.5 py-6 text-center text-xs text-faint">{t('dropTaskHere')}</p>
                ) : null}
                {column.map((task) => {
                  const assignee = users.find((user) => user.id === task.assigneeId)
                  const deadline = formatDeadline(task.deadline, new Date(), locale)
                  const overdue = deadline.overdue && task.status !== 'done'
                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        if (event.target instanceof Element && event.target.closest('[data-no-drag]')) {
                          event.preventDefault()
                          return
                        }
                        event.dataTransfer.setData('text/plain', task.id)
                        event.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => setOver(null)}
                      className="cursor-grab rounded-lg border border-line bg-white p-2.5 shadow-[0_1px_2px_rgb(22_24_29/0.04)] active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-1.5">
                        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                        <p className="min-w-0 flex-1 text-sm leading-5 font-medium text-ink">
                          {localized(locale, `task.${task.id}.title`, task.title)}
                        </p>
                        <div data-no-drag className="flex shrink-0">
                          <IconButton
                            label={t('editTask')}
                            className="h-6 w-6"
                            onClick={() => setEditing(task)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton
                            label={t('deleteTask')}
                            className="h-6 w-6 hover:text-rose-700"
                            onClick={() => setRemoving(task)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <AssigneeMenu
                          assignee={assignee}
                          users={members}
                          onChange={(assigneeId) => updateTask(task.id, { assigneeId })}
                        />
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-[11px] tabular-nums',
                            overdue ? 'font-medium text-rose-600' : 'text-faint',
                          )}
                        >
                          {overdue ? t('overdue', { date: deadline.label }) : deadline.label}
                        </span>
                        <div data-no-drag>
                          <StatusMenu status={task.status} onChange={(next) => setTaskStatus(task.id, next)} />
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <BoardTaskModal
        open={creating !== null}
        onClose={() => setCreating(null)}
        projectId={projectId}
        workspaceId={workspaceId}
        members={members}
        task={null}
        status={creating ?? 'todo'}
      />
      <BoardTaskModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        projectId={projectId}
        workspaceId={workspaceId}
        members={members}
        task={editing}
        status={editing?.status ?? 'todo'}
      />
      <DeleteTaskModal task={removing} open={removing !== null} onClose={() => setRemoving(null)} />
    </>
  )
}
