import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import type { TaskStatus } from '../../types'
import { taskStatusLabel, taskStatuses } from '../../utils/labels'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterChips } from '../../components/ui/FilterChips'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { TaskRow } from '../../features/tasks/TaskRow'

export function TasksPage() {
  const data = useWorkspaceData()
  const setProjectFilter = useAppStore((state) => state.setProjectFilter)
  const setTaskStatus = useAppStore((state) => state.setTaskStatus)
  const openTaskModal = useAppStore((state) => state.openTaskModal)
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [status, setStatus] = useState<'all' | TaskStatus>('all')

  const project = data.allProjects.find((item) => item.id === data.projectFilterId)
  const scoped = (scope === 'mine' ? data.tasks.filter((task) => task.assigneeId === data.currentUser.id) : data.tasks).filter(
    (task) => !data.projectFilterId || task.projectId === data.projectFilterId,
  )
  const visible = status === 'all' ? scoped : scoped.filter((task) => task.status === status)

  return (
    <Page>
      <PageIntro
        title="Мои задачи"
        description="Сначала ваша очередь. Переключитесь на всех, когда нужна общая доска."
        actions={
          <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openTaskModal}>
            Новая задача
          </Button>
        }
      />
      <div className="flex flex-col gap-3">
        <FilterChips
          label="Исполнитель"
          value={scope}
          onChange={setScope}
          options={[
            { value: 'mine', label: 'Назначены мне' },
            { value: 'all', label: 'Все' },
          ]}
        />
        <FilterChips
          label="Статус"
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'Все' }, ...taskStatuses.map((item) => ({ value: item, label: taskStatusLabel[item] }))]}
        />
        {project ? (
          <button
            type="button"
            onClick={() => setProjectFilter(null)}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-zinc-50"
          >
            {project.name}
            <X className="h-3.5 w-3.5 text-faint" />
          </button>
        ) : null}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="Задач не найдено"
          description="Снимите фильтр или создайте задачу в этом пространстве."
          action={
            <Button size="sm" variant="secondary" onClick={openTaskModal}>
              Новая задача
            </Button>
          }
        />
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-line px-4">
            {visible.map((task) => {
              const assignee = data.members.find((user) => user.id === task.assigneeId)
              const taskProject = data.allProjects.find((item) => item.id === task.projectId)
              if (!assignee || !taskProject) return null
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  assignee={assignee}
                  projectName={taskProject.name}
                  onStatus={(next) => setTaskStatus(task.id, next)}
                />
              )
            })}
          </div>
        </Card>
      )}
    </Page>
  )
}
