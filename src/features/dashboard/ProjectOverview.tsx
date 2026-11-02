import { Link } from 'react-router-dom'
import type { Project, User } from '../../types'
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
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Проекты</h2>
        <Link to="/projects" className="text-xs font-medium text-muted hover:text-ink">
          Все
        </Link>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title="Проектов нет"
          description={
            searchQuery
              ? 'В этом пространстве ничего не совпало с поиском.'
              : 'Проекты этого пространства появятся здесь.'
          }
        />
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
