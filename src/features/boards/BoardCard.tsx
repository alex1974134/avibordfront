import type { Project, ProjectStatus, Task, TaskStatus, User } from '../../types'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { countWord } from '../../utils/format'
import { projectStatusText, statusText, taskStatuses } from '../../utils/labels'
import { AvatarGroup } from '../../components/ui/Avatar'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { BoardActionsMenu } from './BoardActionsMenu'

const statusTone: Record<ProjectStatus, BadgeTone> = {
  on_track: 'success',
  at_risk: 'warning',
  paused: 'neutral',
  completed: 'info',
}

const columnTone: Record<TaskStatus, string> = {
  todo: 'bg-zinc-300',
  in_progress: 'bg-accent',
  review: 'bg-amber-500',
  done: 'bg-emerald-600',
}

export function BoardCard({
  project,
  users,
  tasks,
  onOpen,
  onEdit,
  onDelete,
}: {
  project: Project
  users: User[]
  tasks: Task[]
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { locale } = useI18n()
  const members = project.memberIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
  const name = localized(locale, `project.${project.id}.name`, project.name)

  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-line bg-white text-left shadow-[0_1px_2px_rgb(22_24_29/0.04)] transition-colors hover:border-line-strong">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
        <Badge tone={statusTone[project.status]}>{projectStatusText(project.status, locale)}</Badge>
        <BoardActionsMenu onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-full cursor-pointer flex-col p-4 pt-12 text-left"
      >
      <div className="flex items-start justify-between gap-3 pr-20">
        <h3 className="text-sm font-semibold tracking-tight text-ink">{name}</h3>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
        {localized(locale, `project.${project.id}.description`, project.description)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {taskStatuses.map((status) => {
          const column = tasks.filter((task) => task.status === status)
          return (
            <div key={status} className="min-w-0 rounded-lg bg-canvas px-2 py-2">
              <span className={`mb-1.5 block h-0.5 w-5 rounded-full ${columnTone[status]}`} />
              <p className="truncate text-[11px] font-medium text-faint">{statusText(status, locale)}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-ink">{column.length}</p>
              <ul className="mt-1.5 space-y-1">
                {column.slice(0, 2).map((task) => (
                  <li key={task.id} className="truncate text-[11px] leading-4 text-muted">
                    {localized(locale, `task.${task.id}.title`, task.title)}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <AvatarGroup users={members} />
        <span className="text-xs text-faint">
          {tasks.length} {countWord(locale, tasks.length, 'task')}
        </span>
      </div>
      </button>
    </div>
  )
}
