import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { BoardCard } from '../../features/boards/BoardCard'
import { BoardActionsMenu } from '../../features/boards/BoardActionsMenu'
import { DeleteBoardModal } from '../../features/boards/DeleteBoardModal'
import { EditBoardModal } from '../../features/boards/EditBoardModal'
import { NewBoardModal } from '../../features/boards/NewBoardModal'
import { TaskRow } from '../../features/tasks/TaskRow'
import { useWorkspaceData } from '../../hooks/useWorkspaceData'
import { useAppStore } from '../../store/useAppStore'
import type { Project, TaskStatus } from '../../types'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { statusText, taskStatuses } from '../../utils/labels'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { FilterChips } from '../../components/ui/FilterChips'
import { Page, PageIntro } from '../../components/ui/PageIntro'

export function TasksPage() {
  const data = useWorkspaceData()
  const tasks = useAppStore((state) => state.tasks)
  const setProjectFilter = useAppStore((state) => state.setProjectFilter)
  const setTaskStatus = useAppStore((state) => state.setTaskStatus)
  const openTaskModal = useAppStore((state) => state.openTaskModal)
  const [scope, setScope] = useState<'mine' | 'all'>('all')
  const [status, setStatus] = useState<'all' | TaskStatus>('all')
  const [boardOpen, setBoardOpen] = useState(false)
  const [boardFormKey, setBoardFormKey] = useState(0)
  const [editBoard, setEditBoard] = useState<Project | null>(null)
  const [deleteBoard, setDeleteBoard] = useState<Project | null>(null)
  const { locale, t } = useI18n()

  const openBoardView = (project: Project) => {
    setScope('all')
    setStatus('all')
    setProjectFilter(project.id)
  }

  const openBoard = data.allProjects.find((project) => project.id === data.projectFilterId)

  const openNewBoardDialog = () => {
    setBoardFormKey((key) => key + 1)
    setBoardOpen(true)
  }

  const newBoardButton = (
    <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openNewBoardDialog}>
      {t('newBoard')}
    </Button>
  )

  const boardModal = <NewBoardModal open={boardOpen} formKey={boardFormKey} onClose={() => setBoardOpen(false)} />
  const editModal = (
    <EditBoardModal
      project={editBoard}
      open={Boolean(editBoard)}
      onClose={() => setEditBoard(null)}
    />
  )
  const deleteModal = (
    <DeleteBoardModal
      project={deleteBoard}
      open={Boolean(deleteBoard)}
      onClose={() => setDeleteBoard(null)}
    />
  )

  if (!openBoard) {
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
              {newBoardButton}
            </>
          }
        />
        {boards.length === 0 ? (
          <EmptyState
            title={t('noBoards')}
            description={data.searchQuery ? t('noBoardsSearch') : t('noBoardsHint')}
            action={
              data.searchQuery ? undefined : newBoardButton
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
                onOpen={() => openBoardView(project)}
                onEdit={() => setEditBoard(project)}
                onDelete={() => setDeleteBoard(project)}
              />
            ))}
          </div>
        )}
        {boardModal}
        {editModal}
        {deleteModal}
      </Page>
    )
  }

  const onBoard = tasks.filter((task) => task.workspaceId === data.workspace.id && task.projectId === openBoard.id)
  const matchedIds = new Set(data.tasks.map((task) => task.id))
  const pool =
    data.searchQuery && onBoard.some((task) => matchedIds.has(task.id))
      ? onBoard.filter((task) => matchedIds.has(task.id))
      : onBoard
  const boardTasks = scope === 'mine' ? pool.filter((task) => task.assigneeId === data.currentUser.id) : pool
  const visible = status === 'all' ? boardTasks : boardTasks.filter((task) => task.status === status)
  const boardName = localized(locale, `project.${openBoard.id}.name`, openBoard.name)

  return (
    <Page>
      <button
        type="button"
        onClick={() => setProjectFilter(null)}
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('allBoards')}
      </button>
      <PageIntro
        title={boardName}
        description={
          localized(locale, `project.${openBoard.id}.description`, openBoard.description) || t('boardTasksIntro')
        }
        actions={
          <>
            <BoardActionsMenu
              align="left"
              onEdit={() => setEditBoard(openBoard)}
              onDelete={() => setDeleteBoard(openBoard)}
            />
            <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={openNewBoardDialog}>
              {t('newBoard')}
            </Button>
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openTaskModal}>
              {t('newTask')}
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-3">
        <FilterChips
          label={t('filterAssignee')}
          value={scope}
          onChange={setScope}
          options={[
            { value: 'mine', label: t('assignedToMe') },
            { value: 'all', label: t('all') },
          ]}
        />
        <FilterChips
          label={t('filterStatus')}
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: t('all') }, ...taskStatuses.map((item) => ({ value: item, label: statusText(item, locale) }))]}
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title={t('noTasksFound')}
          description={t('noTasksFoundHint')}
          action={
            <Button size="sm" variant="secondary" onClick={openTaskModal}>
              {t('newTask')}
            </Button>
          }
        />
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-line px-4">
            {visible.map((task) => {
              const assignee = data.members.find((user) => user.id === task.assigneeId)
              if (!assignee) return null
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  assignee={assignee}
                  projectName={boardName}
                  onStatus={(next) => setTaskStatus(task.id, next)}
                />
              )
            })}
          </div>
        </Card>
      )}
      {boardModal}
      {editModal}
      {deleteModal}
    </Page>
  )
}
