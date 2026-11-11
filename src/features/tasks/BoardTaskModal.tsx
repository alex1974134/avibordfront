import { useEffect, useMemo, useState } from 'react'
import { localized } from '../../i18n/content'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../store/useAppStore'
import type { Task, TaskPriority, TaskStatus, User } from '../../types'
import { plusDays } from '../../utils/format'
import { priorities, priorityText, statusText, taskStatuses } from '../../utils/labels'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'

export function BoardTaskModal({
  open,
  onClose,
  projectId,
  workspaceId,
  members,
  task,
  status,
}: {
  open: boolean
  onClose: () => void
  projectId: string
  workspaceId: string
  members: User[]
  task: Task | null
  status: TaskStatus
}) {
  const addTask = useAppStore((state) => state.addTask)
  const updateTask = useAppStore((state) => state.updateTask)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const users = useAppStore((state) => state.users)
  const { locale, t } = useI18n()
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [deadline, setDeadline] = useState(plusDays(7))
  const [column, setColumn] = useState<TaskStatus>(status)
  const [titleError, setTitleError] = useState('')
  const [assigneeError, setAssigneeError] = useState('')

  useEffect(() => {
    if (!open) return
    const preferred = members.some((user) => user.id === currentUserId) ? currentUserId : (members[0]?.id ?? '')
    setTitle(task ? localized(locale, `task.${task.id}.title`, task.title) : '')
    setAssigneeId(task?.assigneeId ?? preferred)
    setPriority(task?.priority ?? 'medium')
    setDeadline(task?.deadline ?? plusDays(7))
    setColumn(task?.status ?? status)
    setTitleError('')
    setAssigneeError('')
  }, [open, task, status, currentUserId, locale])

  const options = useMemo(() => {
    if (members.some((user) => user.id === assigneeId)) return members
    const extra = users.find((user) => user.id === assigneeId)
    return extra ? [extra, ...members] : members
  }, [members, users, assigneeId])

  const submit = () => {
    const nextTitle = title.trim()
    const nextTitleError = nextTitle ? '' : t('taskTitleRequired')
    const nextAssigneeError = assigneeId ? '' : t('assigneeRequired')
    setTitleError(nextTitleError)
    setAssigneeError(nextAssigneeError)
    if (nextTitleError || nextAssigneeError) return
    if (task) {
      const unchanged = nextTitle === localized(locale, `task.${task.id}.title`, task.title)
      updateTask(task.id, {
        title: unchanged ? task.title : nextTitle,
        assigneeId,
        priority,
        deadline,
        status: column,
      })
    } else {
      addTask({
        title: nextTitle,
        projectId,
        assigneeId,
        priority,
        deadline,
        workspaceId,
        status: column,
      })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title={task ? t('editTask') : t('newTask')}
      description={task ? t('editTaskHint') : t('assigneeHint')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="board-task-form" disabled={members.length === 0 && !assigneeId}>
            {task ? t('saveTask') : t('createTask')}
          </Button>
        </>
      }
    >
      <form
        id="board-task-form"
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        {members.length === 0 && !assigneeId ? <p className="text-sm text-muted">{t('noBoardMembers')}</p> : null}
        <Field label={t('taskTitle')} error={titleError || undefined}>
          <Input
            value={title}
            autoFocus
            placeholder={t('taskTitlePlaceholder')}
            onChange={(event) => {
              setTitle(event.target.value)
              if (titleError) setTitleError('')
            }}
          />
        </Field>
        <Field label={t('assignee')} hint={t('assigneeHint')} error={assigneeError || undefined}>
          <Select
            value={assigneeId}
            onChange={(event) => {
              setAssigneeId(event.target.value)
              if (assigneeError) setAssigneeError('')
            }}
          >
            {options.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('column')}>
            <Select value={column} onChange={(event) => setColumn(event.target.value as TaskStatus)}>
              {taskStatuses.map((item) => (
                <option key={item} value={item}>
                  {statusText(item, locale)}
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
        <Field label={t('deadline')}>
          <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}
