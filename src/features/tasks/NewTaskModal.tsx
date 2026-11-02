import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import type { TaskPriority } from '../../types'
import { plusDays } from '../../utils/format'
import { priorities, priorityLabel } from '../../utils/labels'
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
  const users = useAppStore((state) => state.users)

  const workspaceProjects = useMemo(
    () => projects.filter((project) => project.workspaceId === workspaceId),
    [projects, workspaceId],
  )
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [assigneeId, setAssigneeId] = useState(currentUserId)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [deadline, setDeadline] = useState(plusDays(7))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const firstProject = workspaceProjects[0]
    setTitle('')
    setError('')
    setPriority('medium')
    setDeadline(plusDays(7))
    setProjectId(firstProject?.id ?? '')
    const memberIds = firstProject?.memberIds ?? []
    setAssigneeId(memberIds.includes(currentUserId) ? currentUserId : (memberIds[0] ?? currentUserId))
  }, [open, currentUserId, workspaceProjects])

  const project = workspaceProjects.find((item) => item.id === projectId)
  const assignees = users.filter((user) => project?.memberIds.includes(user.id))

  const submit = () => {
    if (!title.trim()) {
      setError('Добавьте название задачи.')
      return
    }
    if (!projectId || !assigneeId) {
      setError('Выберите проект и исполнителя.')
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
      title="Новая задача"
      description="Задача останется в этом демо-пространстве."
      onClose={closeTaskModal}
      footer={
        <>
          <Button variant="secondary" onClick={closeTaskModal}>
            Отмена
          </Button>
          <Button type="submit" form="new-task-form">
            Создать задачу
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
        <Field label="Название" error={error}>
          <Input
            value={title}
            autoFocus
            placeholder="Что нужно сделать?"
            onChange={(event) => {
              setTitle(event.target.value)
              if (error) setError('')
            }}
          />
        </Field>
        <Field label="Проект">
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
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Исполнитель">
            <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Приоритет">
            <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              {priorities.map((item) => (
                <option key={item} value={item}>
                  {priorityLabel[item]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Срок" hint="Новые задачи начинают со статуса «К выполнению».">
          <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}
