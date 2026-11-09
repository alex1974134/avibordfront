import { useState } from 'react'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import type { ProjectStatus } from '../../types'
import { useI18n } from '../../i18n/useI18n'
import { projectStatusText, projectStatuses } from '../../utils/labels'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterChips } from '../../components/ui/FilterChips'
import { Page, PageIntro } from '../../components/ui/PageIntro'
import { ProjectCard } from '../../features/dashboard/ProjectCard'

export function ProjectsPage() {
  const { projects, members, searchQuery } = useWorkspaceData()
  const [status, setStatus] = useState<'all' | ProjectStatus>('all')
  const { locale, t } = useI18n()
  const visible = status === 'all' ? projects : projects.filter((project) => project.status === status)

  return (
    <Page>
      <PageIntro
        title={t('projects')}
        description={t('projectsIntro')}
      />
      <FilterChips
        label={t('filterProjectStatus')}
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: t('all') },
          ...projectStatuses.map((item) => ({ value: item, label: projectStatusText(item, locale) })),
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState
          title={t('noProjects')}
          description={searchQuery ? t('noProjectsQuery') : t('noProjectsStatus')}
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
