import type { Project, Task } from '../types'

export interface DashboardStats {
  activeProjects: number
  myTasks: number
  myInProgress: number
  completed: number
  completionRate: number
  members: number
}

export function buildStats(input: {
  tasks: Task[]
  projects: Project[]
  memberCount: number
  currentUserId: string
}): DashboardStats {
  const mine = input.tasks.filter((task) => task.assigneeId === input.currentUserId)
  const completed = input.tasks.filter((task) => task.status === 'done').length
  const completionRate = input.tasks.length === 0 ? 0 : Math.round((completed / input.tasks.length) * 100)

  return {
    activeProjects: input.projects.filter((project) => project.status === 'on_track' || project.status === 'at_risk').length,
    myTasks: mine.length,
    myInProgress: mine.filter((task) => task.status === 'in_progress').length,
    completed,
    completionRate,
    members: input.memberCount,
  }
}
