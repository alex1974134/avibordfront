import { Link } from 'react-router-dom'
import type { Project, Task, User } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { countWord } from '../../utils/format'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { TaskRow } from '../tasks/TaskRow'

export function MyTasks({
  tasks,
  total,
  users,
  projects,
  searchQuery,
}: {
  tasks: Task[]
  total: number
  users: User[]
  projects: Project[]
  searchQuery: string
}) {
  const setTaskStatus = useAppStore((state) => state.setTaskStatus)
  const { locale, t } = useI18n()

  return (
    <Card padding={false}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t('myTasks')}</h2>
          <p className="text-xs text-faint">
            {t('taskCountLine', { count: total, word: countWord(locale, total, 'task') })}
          </p>
        </div>
        <Link to="/tasks" className="text-xs font-medium text-muted hover:text-ink">
          {t('all')}
        </Link>
      </div>
      {tasks.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={t('noTasksView')}
            description={searchQuery ? t('noTasksSearch') : t('noTasksYet')}
          />
        </div>
      ) : (
        <div className="divide-y divide-line px-4">
          {tasks.map((task) => {
            const assignee = users.find((user) => user.id === task.assigneeId)
            const project = projects.find((item) => item.id === task.projectId)
            if (!assignee || !project) return null
            return (
              <TaskRow
                key={task.id}
                task={task}
                projectName={localized(locale, `project.${project.id}.name`, project.name)}
                assignee={assignee}
                onStatus={(status) => setTaskStatus(task.id, status)}
              />
            )
          })}
        </div>
      )}
    </Card>
  )
}
