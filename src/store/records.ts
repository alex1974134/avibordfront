import type { Activity, Project, Task, TaskPriority } from '../types'

export function uid(): string {
  return crypto.randomUUID()
}

export function makeTask(input: {
  workspaceId: string
  projectId: string
  title: string
  assigneeId: string
  priority: TaskPriority
  deadline: string
  createdAt?: string
}): Task {
  return {
    id: uid(),
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    title: input.title,
    assigneeId: input.assigneeId,
    priority: input.priority,
    status: 'todo',
    deadline: input.deadline,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
}

export function makeActivity(input: {
  workspaceId: string
  userId: string
  target: string
  timestamp: string
  type?: Activity['type']
  meta?: string
}): Activity {
  return {
    id: uid(),
    workspaceId: input.workspaceId,
    type: input.type ?? 'task_created',
    userId: input.userId,
    target: input.target,
    timestamp: input.timestamp,
    meta: input.meta,
  }
}

export function addTaskCount(projects: Project[], projectId: string, amount: number): Project[] {
  return projects.map((project) =>
    project.id === projectId ? { ...project, taskCount: project.taskCount + amount } : project,
  )
}
