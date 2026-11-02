import { workspaces } from '../data/workspaces'
import { useAppStore } from '../store/useAppStore'
import type { Activity, AppNotification, KnowledgeDocument, Project, Task, User, Workspace } from '../types'
import { requireUser } from '../utils/lookup'
import { filterByQuery } from '../utils/search'
import { compareTasks } from '../utils/sortTasks'
import { buildStats, type DashboardStats } from '../utils/stats'

export interface WorkspaceData {
  workspace: Workspace
  currentUser: User
  members: User[]
  projects: Project[]
  allProjects: Project[]
  tasks: Task[]
  myTasks: Task[]
  activities: Activity[]
  notifications: AppNotification[]
  documents: KnowledgeDocument[]
  stats: DashboardStats
  searchQuery: string
  projectFilterId: string | null
}

export function useWorkspaceData(): WorkspaceData {
  const workspaceId = useAppStore((state) => state.workspaceId)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const users = useAppStore((state) => state.users)
  const projects = useAppStore((state) => state.projects)
  const tasks = useAppStore((state) => state.tasks)
  const activities = useAppStore((state) => state.activities)
  const notifications = useAppStore((state) => state.notifications)
  const documents = useAppStore((state) => state.documents)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const projectFilterId = useAppStore((state) => state.projectFilterId)

  const workspace = workspaces.find((item) => item.id === workspaceId)
  if (!workspace) throw new Error('Missing workspace')

  const members = users
    .filter((user) => user.workspaceIds.includes(workspaceId))
    .sort((a, b) => {
      if (a.id === currentUserId) return -1
      if (b.id === currentUserId) return 1
      return a.name.localeCompare(b.name)
    })

  const allProjects = projects.filter((project) => project.workspaceId === workspaceId)
  const workspaceTasks = tasks.filter((task) => task.workspaceId === workspaceId)
  const searchedProjects = filterByQuery(allProjects, searchQuery, (project) => `${project.name} ${project.description}`)
  const searchedTasks = filterByQuery(workspaceTasks, searchQuery, (task) => {
    const project = allProjects.find((item) => item.id === task.projectId)
    return `${task.title} ${project?.name ?? ''}`
  }).sort(compareTasks)

  return {
    workspace,
    currentUser: requireUser(users, currentUserId),
    members,
    projects: searchedProjects,
    allProjects,
    tasks: searchedTasks,
    myTasks: searchedTasks.filter((task) => task.assigneeId === currentUserId),
    activities: activities
      .filter((item) => item.workspaceId === workspaceId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    notifications: notifications
      .filter((item) => item.workspaceId === workspaceId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    documents: documents
      .filter((item) => item.workspaceId === workspaceId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    stats: buildStats({
      tasks: workspaceTasks,
      projects: allProjects,
      memberCount: members.length,
      currentUserId,
    }),
    searchQuery,
    projectFilterId,
  }
}
