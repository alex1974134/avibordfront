import { useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import type { ProjectStatus } from '../../types'
import { projectStatusLabel, projectStatuses } from '../../utils/labels'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterChips } from '../../components/ui/FilterChips'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { ProjectCard } from '../../features/dashboard/ProjectCard'

export function ProjectsPage() {
  const { projects, members, searchQuery } = useWorkspaceData()
  const [status, setStatus] = useState<'all' | ProjectStatus>('all')
  const visible = status === 'all' ? projects : projects.filter((project) => project.status === status)

  return (
    <Page>
      <PageIntro
        title="Проекты"
        description="Текущие инициативы, их темп и кто их ведёт."
      />
      <FilterChips
        label="Статус проекта"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: 'Все' },
          ...projectStatuses.map((item) => ({ value: item, label: projectStatusLabel[item] })),
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          title="В этом виде проектов нет"
          description={searchQuery ? 'Ничего не совпало с поиском.' : 'Сейчас проектов с таким статусом нет.'}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} users={members} />
          ))}
        </div>
      )}
    </Page>
  )
}
