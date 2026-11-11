import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { DeleteBoardModal } from '../../features/boards/DeleteBoardModal'
import { EditBoardModal } from '../../features/boards/EditBoardModal'
import { BoardAiDecomposeChat } from '../../features/board-ai/BoardAiDecomposeChat'
import { ProjectBoard } from '../../features/projects/ProjectBoard'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/Button'
import { FilterChips } from '../../components/ui/FilterChips'
import { Page, PageIntro } from '../../components/ui/PageIntro'

export function ProjectBoardPage() {
  const { projectId } = useParams()
  const { allProjects, members, currentUser, workspace } = useWorkspaceData()
  const tasks = useAppStore((state) => state.tasks)
  const openTaskModal = useAppStore((state) => state.openTaskModal)
  const storeUsers = useAppStore((state) => state.users)
  const { locale, t } = useI18n()
  const [scope, setScope] = useState<'mine' | 'all'>('all')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const project = allProjects.find((item) => item.id === projectId)
  if (!project) return <Navigate to="/projects" replace />

  const name = localized(locale, `project.${project.id}.name`, project.name)
  const description = localized(locale, `project.${project.id}.description`, project.description)
  const onBoard = tasks.filter((task) => task.workspaceId === workspace.id && task.projectId === project.id)
  const visible = scope === 'mine' ? onBoard.filter((task) => task.assigneeId === currentUser.id) : onBoard

  return (
    <Page>
      <Link to="/projects" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        {t('backToProjects')}
      </Link>
      <PageIntro
        title={name}
        description={description}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => setEditing(true)}
            >
              {t('editBoard')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setDeleting(true)}
            >
              {t('deleteBoard')}
            </Button>
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openTaskModal}>
              {t('newTask')}
            </Button>
          </>
        }
      />
      <FilterChips
        label={t('filterAssignee')}
        value={scope}
        onChange={setScope}
        options={[
          { value: 'all', label: t('all') },
          { value: 'mine', label: t('assignedToMe') },
        ]}
      />
      <ProjectBoard
        tasks={visible}
        users={members}
        memberIds={project.memberIds}
        projectId={project.id}
        workspaceId={workspace.id}
      />
      <EditBoardModal project={project} open={editing} onClose={() => setEditing(false)} />
      <DeleteBoardModal project={project} open={deleting} onClose={() => setDeleting(false)} />
      <BoardAiDecomposeChat
        projectId={project.id}
        workspaceId={workspace.id}
        memberIds={project.memberIds}
        users={storeUsers}
      />
    </Page>
  )
}
