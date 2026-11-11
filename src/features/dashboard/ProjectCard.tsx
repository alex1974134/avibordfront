import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ListTodo } from 'lucide-react'
import type { Project, ProjectStatus, User } from '../../types'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { formatShortDate } from '../../utils/format'
import { projectStatusText } from '../../utils/labels'
import { AvatarGroup } from '../../components/ui/Avatar'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { BoardActionsMenu } from '../boards/BoardActionsMenu'

const statusTone: Record<ProjectStatus, BadgeTone> = {
  on_track: 'success',
  at_risk: 'warning',
  paused: 'neutral',
  completed: 'info',
}

const barTone: Record<ProjectStatus, string> = {
  on_track: 'bg-accent',
  at_risk: 'bg-amber-600',
  paused: 'bg-zinc-300',
  completed: 'bg-emerald-600',
}

export function ProjectCard({
  project,
  users,
  onEdit,
  onDelete,
}: {
  project: Project
  users: User[]
  onEdit?: () => void
  onDelete?: () => void
}) {
  const navigate = useNavigate()
  const { locale, t } = useI18n()
  const members = project.memberIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))
  const href = `/projects/${project.id}`

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(22_24_29/0.04)] transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <Link to={href} className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight text-ink">
            {localized(locale, `project.${project.id}.name`, project.name)}
          </h3>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Badge tone={statusTone[project.status]}>{projectStatusText(project.status, locale)}</Badge>
          {onEdit && onDelete ? (
            <BoardActionsMenu onOpen={() => navigate(href)} onEdit={onEdit} onDelete={onDelete} />
          ) : null}
        </div>
      </div>
      <Link to={href} className="mt-2 flex flex-1 flex-col">
        <p className="line-clamp-2 text-sm leading-6 text-muted">
          {localized(locale, `project.${project.id}.description`, project.description)}
        </p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-faint">
            <span>{t('progress')}</span>
            <span className="tabular-nums text-ink">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} className={barTone[project.status]} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <AvatarGroup users={members} />
          <div className="flex items-center gap-3 text-xs text-faint">
            <span className="inline-flex items-center gap-1">
              <ListTodo className="h-3.5 w-3.5" />
              {project.taskCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatShortDate(project.deadline, locale)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
