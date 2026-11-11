import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import type { TaskPriority } from '../../types'
import { plusDays } from '../../utils/format'
import { priorities, priorityText } from '../../utils/labels'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

export function NewTaskModal() {
  const open = useAppStore((state) => state.taskModalOpen)
  const closeTaskModal = useAppStore((state) => state.closeTaskModal)
  const addTask = useAppStore((state) => state.addTask)
  const workspaceId = useAppStore((state) => state.workspaceId)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const projects = useAppStore((state) => state.projects)
  const remoteProjects = useAppStore((state) => state.remoteProjects)
  const projectFilterId = useAppStore((state) => state.projectFilterId)
  const users = useAppStore((state) => state.users)
  const { locale, t } = useI18n()
  const routeProjectId = /^\/projects\/([^/]+)$/.exec(useLocation().pathname)?.[1]

  const workspaceProjects = useMemo(
    () => [...remoteProjects, ...projects].filter((project) => project.workspaceId === workspaceId),
    [remoteProjects, projects, workspaceId],
  )
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [assigneeId, setAssigneeId] = useState(currentUserId)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [deadline, setDeadline] = useState(plusDays(7))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const preferred = routeProjectId ?? projectFilterId
    const firstProject = workspaceProjects.find((item) => item.id === preferred) ?? workspaceProjects[0]
    setTitle('')
    setError('')
    setPriority('medium')
    setDeadline(plusDays(7))
    setProjectId(firstProject?.id ?? '')
    const memberIds = firstProject?.memberIds ?? []
    setAssigneeId(memberIds.includes(currentUserId) ? currentUserId : (memberIds[0] ?? currentUserId))
  }, [open, currentUserId, workspaceProjects, routeProjectId, projectFilterId])

  const project = workspaceProjects.find((item) => item.id === projectId)
  const assignees = users.filter((user) => project?.memberIds.includes(user.id))

  const submit = () => {
    if (!title.trim()) {
      setError(t('taskTitleRequired'))
      return
    }
    if (!projectId || !assigneeId) {
      setError(t('pickProjectAssignee'))
      return
    }
    addTask({
      title,
      projectId,
      assigneeId,
      priority,
      deadline,
      workspaceId,
    })
  }

  return (
    <Modal
      open={open}
      title={t('newTask')}
      description={t('newTaskHint')}
      onClose={closeTaskModal}
      footer={
        <>
          <Button variant="secondary" onClick={closeTaskModal}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="new-task-form">
            {t('createTask')}
          </Button>
        </>
      }
    >
      <form
        id="new-task-form"
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <Field label={t('taskTitle')} error={error}>
          <Input
            value={title}
            autoFocus
            placeholder={t('taskTitlePlaceholder')}
            onChange={(event) => {
              setTitle(event.target.value)
              if (error) setError('')
            }}
          />
        </Field>
        <Field label={t('project')}>
          <Select
            value={projectId}
            onChange={(event) => {
              const nextId = event.target.value
              setProjectId(nextId)
              const nextProject = workspaceProjects.find((item) => item.id === nextId)
              const memberIds = nextProject?.memberIds ?? []
              if (!memberIds.includes(assigneeId)) {
                setAssigneeId(memberIds.includes(currentUserId) ? currentUserId : (memberIds[0] ?? ''))
              }
            }}
          >
            {workspaceProjects.map((item) => (
              <option key={item.id} value={item.id}>
                {localized(locale, `project.${item.id}.name`, item.name)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('assignee')}>
            <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('priority')}>
            <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {priorityText(item, locale)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t('deadline')} hint={t('deadlineHint')}>
          <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}
