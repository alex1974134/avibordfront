import { create } from 'zustand'
import { activities as seedActivities } from '../data/mockActivity'
import { documents as seedDocuments } from '../data/mockDocuments'
import { notifications as seedNotifications } from '../data/mockNotifications'
import { projects as seedProjects } from '../data/mockProjects'
import { tasks as seedTasks } from '../data/mockTasks'
import { CURRENT_USER_ID, users as seedUsers } from '../data/mockUsers'
import { workspaces } from '../data/workspaces'
import type {
  Activity,
  AiTurn,
  AppNotification,
  GeneratedTask,
  KnowledgeDocument,
  NewTaskInput,
  PreferenceKey,
  Preferences,
  Project,
  Task,
  TaskStatus,
  ToastMessage,
  User,
} from '../types'
import { plural, plusDays } from '../utils/format'
import { initialsFromName } from '../utils/initials'
import { taskStatusLabel } from '../utils/labels'

const memberColors = ['#0f766e', '#1d4ed8', '#9a3412', '#6d28d9', '#0369a1', '#9d174d']

let toastTimer: number | undefined

function uid(): string {
  return crypto.randomUUID()
}

interface AppState {
  currentUserId: string
  workspaceId: string
  sidebarOpen: boolean
  searchQuery: string
  projectFilterId: string | null
  taskModalOpen: boolean
  users: User[]
  projects: Project[]
  tasks: Task[]
  activities: Activity[]
  notifications: AppNotification[]
  documents: KnowledgeDocument[]
  aiTurns: AiTurn[]
  aiDraft: string
  activeAiTurnId: string | null
  telegramConnected: boolean
  preferences: Preferences
  toast: ToastMessage | null
  setWorkspace: (id: string) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setProjectFilter: (id: string | null) => void
  openTaskModal: () => void
  closeTaskModal: () => void
  addTask: (input: NewTaskInput) => void
  addGeneratedTasks: (input: { projectId: string; tasks: GeneratedTask[]; workspaceId: string }) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addDocuments: (docs: KnowledgeDocument[]) => void
  addAiTurn: (turn: AiTurn) => void
  setActiveAiTurn: (id: string) => void
  setAiDraft: (value: string) => void
  setTelegramConnected: (connected: boolean) => void
  togglePreference: (key: PreferenceKey) => void
  updateCurrentUser: (patch: Pick<User, 'name' | 'role' | 'email'>) => void
  inviteMember: (input: { name: string; email: string; role: string }) => void
  showToast: (message: string) => void
  dismissToast: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUserId: CURRENT_USER_ID,
  workspaceId: 'ws-studio',
  sidebarOpen: false,
  searchQuery: '',
  projectFilterId: null,
  taskModalOpen: false,
  users: seedUsers,
  projects: seedProjects,
  tasks: seedTasks,
  activities: seedActivities,
  notifications: seedNotifications,
  documents: seedDocuments,
  aiTurns: [],
  aiDraft: '',
  activeAiTurnId: null,
  telegramConnected: false,
  preferences: { product: true, comments: true, ai: false },
  toast: null,

  setWorkspace: (workspaceId) => {
    if (get().workspaceId === workspaceId) return
    const name = workspaces.find((item) => item.id === workspaceId)?.name ?? 'пространство'
    set({ workspaceId, projectFilterId: null, searchQuery: '' })
    get().showToast(`Открыто пространство «${name}»`)
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setProjectFilter: (projectFilterId) => set({ projectFilterId }),
  openTaskModal: () => set({ taskModalOpen: true }),
  closeTaskModal: () => set({ taskModalOpen: false }),

  addTask: (input) => {
    const title = input.title.trim()
    if (!title) return
    const task: Task = {
      id: uid(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      title,
      assigneeId: input.assigneeId,
      priority: input.priority,
      status: 'todo',
      deadline: input.deadline,
      createdAt: new Date().toISOString(),
    }
    const activity: Activity = {
      id: uid(),
      workspaceId: input.workspaceId,
      type: 'task_created',
      userId: get().currentUserId,
      target: title,
      timestamp: task.createdAt,
    }
    set((state) => ({
      tasks: [task, ...state.tasks],
      activities: [activity, ...state.activities],
      projects: state.projects.map((project) =>
        project.id === input.projectId ? { ...project, taskCount: project.taskCount + 1 } : project,
      ),
      taskModalOpen: false,
    }))
    get().showToast('Задача создана')
  },

  addGeneratedTasks: ({ projectId, tasks: drafts, workspaceId }) => {
    if (drafts.length === 0) return
    const createdAt = new Date().toISOString()
    const created: Task[] = drafts.map((draft, index) => ({
      id: uid(),
      workspaceId,
      projectId,
      title: draft.title,
      assigneeId: draft.assigneeId,
      priority: draft.priority,
      status: 'todo',
      deadline: plusDays(3 + index * 2),
      createdAt,
    }))
    const project = get().projects.find((item) => item.id === projectId)
    const taskWord = plural(created.length, 'задачу', 'задачи', 'задач')
    const activity: Activity = {
      id: uid(),
      workspaceId,
      type: 'task_created',
      userId: get().currentUserId,
      target: project
        ? `${created.length} ${taskWord} в проекте «${project.name}»`
        : `${created.length} ${taskWord}`,
      timestamp: createdAt,
    }
    set((state) => ({
      tasks: [...created, ...state.tasks],
      activities: [activity, ...state.activities],
      projects: state.projects.map((item) =>
        item.id === projectId ? { ...item, taskCount: item.taskCount + created.length } : item,
      ),
    }))
    get().showToast(
      project ? `Добавлено в «${project.name}»: ${created.length}` : `Добавлено задач: ${created.length}`,
    )
  },

  setTaskStatus: (id, status) => {
    const current = get().tasks.find((task) => task.id === id)
    if (!current || current.status === status) return
    const activity: Activity = {
      id: uid(),
      workspaceId: current.workspaceId,
      type: status === 'done' ? 'task_completed' : 'status_changed',
      userId: get().currentUserId,
      target: current.title,
      meta: taskStatusLabel[status],
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, status } : task)),
      activities: [activity, ...state.activities],
    }))
    get().showToast(status === 'done' ? 'Задача завершена' : `Статус: ${taskStatusLabel[status]}`)
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
    }))
  },
  markAllNotificationsRead: () => {
    const workspaceId = get().workspaceId
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.workspaceId === workspaceId ? { ...item, read: true } : item,
      ),
    }))
  },
  addDocuments: (docs) => {
    set((state) => ({ documents: [...docs, ...state.documents] }))
  },
  addAiTurn: (turn) => {
    set((state) => ({
      aiTurns: [turn, ...state.aiTurns].slice(0, 12),
      activeAiTurnId: turn.id,
    }))
  },
  setActiveAiTurn: (activeAiTurnId) => set({ activeAiTurnId }),
  setAiDraft: (aiDraft) => set({ aiDraft }),
  setTelegramConnected: (telegramConnected) => {
    set({ telegramConnected })
    get().showToast(telegramConnected ? 'Telegram подключён' : 'Telegram отключён')
  },
  togglePreference: (key) => {
    set((state) => ({
      preferences: { ...state.preferences, [key]: !state.preferences[key] },
    }))
  },
  updateCurrentUser: (patch) => {
    const id = get().currentUserId
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...patch, initials: initialsFromName(patch.name) } : user,
      ),
    }))
    get().showToast('Профиль обновлён')
  },
  inviteMember: ({ name, email, role }) => {
    const workspaceId = get().workspaceId
    const user: User = {
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Участник',
      initials: initialsFromName(name),
      color: memberColors[get().users.length % memberColors.length] ?? '#475569',
      workspaceIds: [workspaceId],
    }
    const workspaceName = workspaces.find((item) => item.id === workspaceId)?.name ?? 'пространство'
    const activity: Activity = {
      id: uid(),
      workspaceId,
      type: 'member_added',
      userId: get().currentUserId,
      target: workspaceName,
      meta: user.name,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      users: [...state.users, user],
      activities: [activity, ...state.activities],
    }))
    get().showToast(`Приглашение отправлено: ${user.name}`)
  },
  showToast: (message) => {
    window.clearTimeout(toastTimer)
    set({ toast: { id: uid(), message } })
    toastTimer = window.setTimeout(() => set({ toast: null }), 2800)
  },
  dismissToast: () => {
    window.clearTimeout(toastTimer)
    set({ toast: null })
  },
}))
