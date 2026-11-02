import type { Task, TaskStatus } from '../types'

const weight: Record<TaskStatus, number> = {
  in_progress: 0,
  review: 1,
  todo: 2,
  done: 3,
}

export function compareTasks(a: Task, b: Task): number {
  const byStatus = weight[a.status] - weight[b.status]
  if (byStatus !== 0) return byStatus
  return a.deadline.localeCompare(b.deadline)
}
