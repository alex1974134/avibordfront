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
import { t } from '../i18n/translate'
import { getLocale } from '../i18n/locale'
import { displayWorkspaceName, localized } from '../i18n/content'
import { countWord, plusDays } from '../utils/format'
import { initialsFromName } from '../utils/initials'
import { colorAt } from '../utils/memberColor'
import { statusText } from '../utils/labels'
import { createBoard, fetchBoards } from '../lib/boards'
import { useAuthStore } from './useAuthStore'
import { addTaskCount, makeActivity, makeTask, uid } from './records'

let toastTimer: number | undefined

interface AppState {
  currentUserId: string
  workspaceId: string
  sidebarOpen: boolean
  searchQuery: string
  projectFilterId: string | null
  taskModalOpen: boolean
  users: User[]
  projects: Project[]
  remoteProjects: Project[]
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
  loadRemoteBoards: () => Promise<void>
  addBoard: (input: { name: string; description: string; memberIds: string[] }) => Promise<boolean>
  updateBoard: (
    id: string,
    input: { name: string; description: string; memberIds: string[] },
  ) => boolean
  deleteBoard: (id: string) => void
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
  remoteProjects: [],
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
    const name = displayWorkspaceName(getLocale(), workspaces.find((item) => item.id === workspaceId))
    set({ workspaceId, projectFilterId: null, searchQuery: '' })
    void get().loadRemoteBoards()
    get().showToast(t('toastWorkspace', { name }))
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setProjectFilter: (projectFilterId) => set({ projectFilterId }),
  openTaskModal: () => set({ taskModalOpen: true }),
  closeTaskModal: () => set({ taskModalOpen: false }),

  addTask: (input) => {
    const title = input.title.trim()
    if (!title) return
    const task = makeTask({ ...input, title })
    const activity = makeActivity({
      workspaceId: input.workspaceId,
      userId: get().currentUserId,
      target: title,
      timestamp: task.createdAt,
    })
    set((state) => ({
      tasks: [task, ...state.tasks],
      activities: [activity, ...state.activities],
      projects: addTaskCount(state.projects, input.projectId, 1),
      taskModalOpen: false,
    }))
    get().showToast(t('toastTaskCreated'))
  },

  addGeneratedTasks: ({ projectId, tasks: drafts, workspaceId }) => {
    if (drafts.length === 0) return
    const createdAt = new Date().toISOString()
    const created = drafts.map((draft, index) =>
      makeTask({
        workspaceId,
        projectId,
        title: draft.title,
        assigneeId: draft.assigneeId,
        priority: draft.priority,
        deadline: plusDays(3 + index * 2),
        createdAt,
      }),
    )
    const project = get().projects.find((item) => item.id === projectId)
    const locale = getLocale()
    const word = countWord(locale, created.length, 'taskAcc')
    const projectName = project ? localized(locale, `project.${project.id}.name`, project.name) : ''
    const activity = makeActivity({
      workspaceId,
      userId: get().currentUserId,
      target: project
        ? t('generatedInProject', { count: created.length, word, name: projectName })
        : t('generatedTasks', { count: created.length, word }),
      timestamp: createdAt,
    })
    set((state) => ({
      tasks: [...created, ...state.tasks],
      activities: [activity, ...state.activities],
      projects: addTaskCount(state.projects, projectId, created.length),
    }))
    get().showToast(
      project
        ? t('toastAddedToProject', { name: projectName, count: created.length })
        : t('toastAddedCount', { count: created.length }),
    )
  },

  setTaskStatus: (id, status) => {
    const current = get().tasks.find((task) => task.id === id)
    if (!current || current.status === status) return
    const activity = makeActivity({
      workspaceId: current.workspaceId,
      type: status === 'done' ? 'task_completed' : 'status_changed',
      userId: get().currentUserId,
      target: current.title,
      meta: status,
      timestamp: new Date().toISOString(),
    })
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, status } : task)),
      activities: [activity, ...state.activities],
    }))
    get().showToast(status === 'done' ? t('toastTaskDone') : t('toastStatus', { status: statusText(status) }))
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
    get().showToast(telegramConnected ? t('toastTelegramOn') : t('toastTelegramOff'))
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
    get().showToast(t('toastProfile'))
  },
  loadRemoteBoards: async () => {
    const sessionUserId = useAuthStore.getState().sessionUserId
    if (!sessionUserId) {
      set({ remoteProjects: [] })
      return
    }
    try {
      const boards = await fetchBoards(get().workspaceId)
      set({ remoteProjects: boards })
    } catch {
      set({ remoteProjects: [] })
    }
  },
  addBoard: async ({ name, description, memberIds }) => {
    const title = name.trim()
    const text = description.trim()
    const people = [...new Set(memberIds)]
    if (!title || !text || people.length === 0) return false
    const sessionUserId = useAuthStore.getState().sessionUserId
    const workspaceId = get().workspaceId
    const deadline = plusDays(30)

    if (sessionUserId) {
      try {
        const project = await createBoard({
          workspaceId,
          name: title,
          description: text,
          memberIds: people,
          createdBy: sessionUserId,
          deadline,
        })
        set((state) => ({
          remoteProjects: [project, ...state.remoteProjects.filter((item) => item.id !== project.id)],
        }))
        get().showToast(t('toastBoardCreated', { name: title }))
        return true
      } catch {
        get().showToast(t('boardSaveFailed'))
        return false
      }
    }

    const project: Project = {
      id: uid(),
      workspaceId,
      name: title,
      description: text,
      status: 'on_track',
      progress: 0,
      taskCount: 0,
      deadline,
      memberIds: people,
    }
    set((state) => ({ remoteProjects: [project, ...state.remoteProjects] }))
    get().showToast(t('toastBoardCreated', { name: title }))
    return true
  },
  updateBoard: (id, { name, description, memberIds }) => {
    const title = name.trim()
    const text = description.trim()
    const people = [...new Set(memberIds)]
    if (!title || !text || people.length === 0) return false
    set((state) => {
      const patch = (item: Project): Project =>
        item.id === id ? { ...item, name: title, description: text, memberIds: people } : item
      const inRemote = state.remoteProjects.some((item) => item.id === id)
      return inRemote
        ? { remoteProjects: state.remoteProjects.map(patch) }
        : { projects: state.projects.map(patch) }
    })
    get().showToast(t('toastBoardUpdated', { name: title }))
    return true
  },
  deleteBoard: (id) => {
    const state = get()
    const project =
      state.remoteProjects.find((item) => item.id === id) ?? state.projects.find((item) => item.id === id)
    const title = project?.name ?? ''
    set((current) => {
      const inRemote = current.remoteProjects.some((item) => item.id === id)
      return {
        remoteProjects: inRemote
          ? current.remoteProjects.filter((item) => item.id !== id)
          : current.remoteProjects,
        projects: inRemote ? current.projects : current.projects.filter((item) => item.id !== id),
        projectFilterId: current.projectFilterId === id ? null : current.projectFilterId,
      }
    })
    if (title) get().showToast(t('toastBoardDeleted', { name: title }))
  },
  inviteMember: ({ name, email, role }) => {
    const workspaceId = get().workspaceId
    const user: User = {
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Участник',
      initials: initialsFromName(name),
      color: colorAt(get().users.length),
      workspaceIds: [workspaceId],
    }
    const workspaceName = displayWorkspaceName(
      getLocale(),
      workspaces.find((item) => item.id === workspaceId),
    )
    const activity = makeActivity({
      workspaceId,
      type: 'member_added',
      userId: get().currentUserId,
      target: workspaceName,
      meta: user.name,
      timestamp: new Date().toISOString(),
    })
    set((state) => ({
      users: [...state.users, user],
      activities: [activity, ...state.activities],
    }))
    get().showToast(t('toastInvited', { name: user.name }))
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
