import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { BoardCard } from '../../features/boards/BoardCard'
import { DeleteBoardModal } from '../../features/boards/DeleteBoardModal'
import { EditBoardModal } from '../../features/boards/EditBoardModal'
import { NewBoardModal } from '../../features/boards/NewBoardModal'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import type { Project } from '../../types'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Page, PageIntro } from '../../components/ui/PageIntro'

export function TasksPage() {
  const navigate = useNavigate()
  const data = useWorkspaceData()
  const tasks = useAppStore((state) => state.tasks)
  const openTaskModal = useAppStore((state) => state.openTaskModal)
  const [boardOpen, setBoardOpen] = useState(false)
  const [boardFormKey, setBoardFormKey] = useState(0)
  const [editBoard, setEditBoard] = useState<Project | null>(null)
  const [deleteBoard, setDeleteBoard] = useState<Project | null>(null)
  const { t } = useI18n()

  const openNewBoardDialog = () => {
    setBoardFormKey((key) => key + 1)
    setBoardOpen(true)
  }

  const boards = data.searchQuery
    ? data.allProjects.filter(
        (project) =>
          data.projects.some((item) => item.id === project.id) ||
          data.tasks.some((task) => task.projectId === project.id),
      )
    : data.allProjects

  return (
    <Page>
      <PageIntro
        title={t('navTasks')}
        description={t('boardsIntro')}
        actions={
          <>
            <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={openTaskModal}>
              {t('newTask')}
            </Button>
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openNewBoardDialog}>
              {t('newBoard')}
            </Button>
          </>
        }
      />
      {boards.length === 0 ? (
        <EmptyState
          title={t('noBoards')}
          description={data.searchQuery ? t('noBoardsSearch') : t('noBoardsHint')}
          action={
            data.searchQuery ? undefined : (
              <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openNewBoardDialog}>
                {t('newBoard')}
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {boards.map((project) => (
            <BoardCard
              key={project.id}
              project={project}
              users={data.members}
              tasks={tasks.filter((task) => task.workspaceId === data.workspace.id && task.projectId === project.id)}
              onOpen={() => navigate(`/projects/${project.id}`)}
              onEdit={() => setEditBoard(project)}
              onDelete={() => setDeleteBoard(project)}
            />
          ))}
        </div>
      )}
      <NewBoardModal open={boardOpen} formKey={boardFormKey} onClose={() => setBoardOpen(false)} />
      <EditBoardModal project={editBoard} open={Boolean(editBoard)} onClose={() => setEditBoard(null)} />
      <DeleteBoardModal project={deleteBoard} open={Boolean(deleteBoard)} onClose={() => setDeleteBoard(null)} />
    </Page>
  )
}
