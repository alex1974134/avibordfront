import { Link } from 'react-router-dom'
import type { Project, User } from '../../types'
import { useI18n } from '../../i18n/useI18n'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProjectCard } from './ProjectCard'

export function ProjectOverview({
  projects,
  users,
  searchQuery,
}: {
  projects: Project[]
  users: User[]
  searchQuery: string
}) {
  const { t } = useI18n()
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('projects')}</h2>
        <Link to="/projects" className="text-xs font-medium text-muted hover:text-ink">
          {t('all')}
        </Link>
      </div>
      {projects.length === 0 ? (
        <EmptyState title={t('noProjects')} description={searchQuery ? t('noProjectsSearch') : t('noProjectsEmpty')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} users={users} />
          ))}
        </div>
      )}
    </section>
  )
}
