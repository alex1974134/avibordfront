import { useNavigate } from 'react-router-dom'
import { Calendar, ListTodo } from 'lucide-react'
import type { Project, ProjectStatus, User } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { formatShortDate } from '../../utils/format'
import { projectStatusText } from '../../utils/labels'
import { AvatarGroup } from '../../components/ui/Avatar'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'

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

export function ProjectCard({ project, users }: { project: Project; users: User[] }) {
  const navigate = useNavigate()
  const setProjectFilter = useAppStore((state) => state.setProjectFilter)
  const { locale, t } = useI18n()
  const members = project.memberIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user))

  return (
    <button
      type="button"
      onClick={() => {
        setProjectFilter(project.id)
        navigate('/tasks')
      }}
      className="flex h-full cursor-pointer flex-col rounded-xl border border-line bg-white p-4 text-left shadow-[0_1px_2px_rgb(22_24_29/0.04)] transition-colors hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-ink">{localized(locale, `project.${project.id}.name`, project.name)}</h3>
        <Badge tone={statusTone[project.status]}>{projectStatusText(project.status, locale)}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{localized(locale, `project.${project.id}.description`, project.description)}</p>
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
    </button>
  )
}
