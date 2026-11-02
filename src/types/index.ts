export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

export type ProjectStatus = 'on_track' | 'at_risk' | 'paused' | 'completed'

export type ActivityType =
  | 'task_created'
  | 'task_completed'
  | 'status_changed'
  | 'member_added'
  | 'comment'

export type DocumentCategory = 'Product' | 'Engineering' | 'Design' | 'Research'

export type PreferenceKey = 'product' | 'comments' | 'ai'

export interface User {
  id: string
  name: string
  role: string
  email: string
  initials: string
  color: string
  workspaceIds: string[]
}

export interface Workspace {
  id: string
  name: string
  plan: string
  projectTrend: string
}

export interface Project {
  id: string
  workspaceId: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  taskCount: number
  deadline: string
  memberIds: string[]
}

export interface Task {
  id: string
  workspaceId: string
  projectId: string
  title: string
  assigneeId: string
  priority: TaskPriority
  status: TaskStatus
  deadline: string
  createdAt: string
}

export interface Activity {
  id: string
  workspaceId: string
  type: ActivityType
  userId: string
  target: string
  meta?: string
  detail?: string
  timestamp: string
}

export interface AppNotification {
  id: string
  workspaceId: string
  title: string
  body: string
  timestamp: string
  read: boolean
  href: string
}

export interface KnowledgeDocument {
  id: string
  workspaceId: string
  name: string
  category: DocumentCategory
  size: string
  updatedAt: string
  ownerId: string
}

export interface GeneratedTask {
  id: string
  title: string
  detail: string
  assigneeId: string
  priority: TaskPriority
  estimate: string
}

export interface AiTurn {
  id: string
  prompt: string
  summary: string
  createdAt: string
  tasks: GeneratedTask[]
}

export interface ToastMessage {
  id: string
  message: string
}

export interface Preferences {
  product: boolean
  comments: boolean
  ai: boolean
}

export interface NewTaskInput {
  title: string
  projectId: string
  assigneeId: string
  priority: TaskPriority
  deadline: string
  workspaceId: string
}
