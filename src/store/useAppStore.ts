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
  ProjectStatus,
  Task,
  TaskPriority,
  TaskStatus,
  ToastMessage,
  User,
} from '../types'
import { t } from '../i18n/translate'
import { getLocale } from '../i18n/locale'
import { asTeamRole, displayWorkspaceName, localized } from '../i18n/content'
import { countWord, plusDays } from '../utils/format'
import { initialsFromName } from '../utils/initials'
import { colorAt } from '../utils/memberColor'
import { statusText } from '../utils/labels'
import { createBoard, fetchBoards } from '../lib/boards'
import { createBoardTask, deleteBoardTask, fetchBoardTasks, updateBoardTask } from '../lib/tasks'
import { useAuthStore } from './useAuthStore'
import { addTaskCount, makeActivity, makeTask, uid } from './records'

let toastTimer: number | undefined

const UUID_PROJECT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPersistedBoard(remoteProjects: Project[], projectId: string): boolean {
  if (!useAuthStore.getState().sessionUserId) return false
  if (remoteProjects.some((project) => project.id === projectId)) return true
  return UUID_PROJECT.test(projectId)
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
  addTask: (input: NewTaskInput) => Promise<void>
  addGeneratedTasks: (input: {
    projectId: string
    tasks: GeneratedTask[]
    workspaceId: string
    memberIds?: string[]
  }) => Promise<boolean>
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  updateTask: (
    id: string,
    patch: {
      title?: string
      assigneeId?: string
      priority?: TaskPriority
      deadline?: string
      status?: TaskStatus
    },
  ) => Promise<void>
  deleteTask: (id: string) => Promise<void>
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
    input: {
      name: string
      description: string
      memberIds: string[]
      status: ProjectStatus
      deadline: string
    },
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

  addTask: async (input) => {
    const title = input.title.trim()
    if (!title) return
    const sessionUserId = useAuthStore.getState().sessionUserId
    if (sessionUserId && isPersistedBoard(get().remoteProjects, input.projectId)) {
      try {
        const task = await createBoardTask({
          boardId: input.projectId,
          workspaceId: input.workspaceId,
          title,
          assigneeId: input.assigneeId,
          priority: input.priority,
          status: input.status ?? 'todo',
          deadline: input.deadline,
          createdBy: sessionUserId,
        })
        const activity = makeActivity({
          workspaceId: input.workspaceId,
          userId: get().currentUserId,
          target: title,
          timestamp: task.createdAt,
        })
        set((state) => ({
          tasks: [task, ...state.tasks.filter((item) => item.id !== task.id)],
          activities: [activity, ...state.activities],
          projects: addTaskCount(state.projects, input.projectId, 1),
          remoteProjects: addTaskCount(state.remoteProjects, input.projectId, 1),
          taskModalOpen: false,
        }))
        get().showToast(t('toastTaskCreated'))
      } catch {
        get().showToast(t('taskSaveFailed'))
      }
      return
    }
    const task = makeTask({ ...input, title, status: input.status })
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
      remoteProjects: addTaskCount(state.remoteProjects, input.projectId, 1),
      taskModalOpen: false,
    }))
    get().showToast(t('toastTaskCreated'))
  },

  addGeneratedTasks: async ({ projectId, tasks: drafts, workspaceId, memberIds }) => {
    if (drafts.length === 0) return false
    const allowedAssignees = memberIds?.length ? new Set(memberIds) : null
    const normalized = drafts.map((draft, index) => {
      let assigneeId = draft.assigneeId
      if (allowedAssignees && (!assigneeId || !allowedAssignees.has(assigneeId))) {
        assigneeId = memberIds![index % memberIds!.length] ?? memberIds![0] ?? assigneeId
      }
      return { ...draft, assigneeId }
    })
    const sessionUserId = useAuthStore.getState().sessionUserId
    if (sessionUserId && isPersistedBoard(get().remoteProjects, projectId)) {
      try {
        const created = await Promise.all(
          normalized.map((draft, index) =>
            createBoardTask({
              boardId: projectId,
              workspaceId,
              title: draft.title,
              assigneeId: draft.assigneeId,
              priority: draft.priority,
              status: 'todo',
              deadline: plusDays(3 + index * 2),
              createdBy: sessionUserId,
            }),
          ),
        )
        const project =
          get().remoteProjects.find((item) => item.id === projectId) ??
          get().projects.find((item) => item.id === projectId)
        const locale = getLocale()
        const word = countWord(locale, created.length, 'taskAcc')
        const projectName = project ? localized(locale, `project.${project.id}.name`, project.name) : ''
        const activity = makeActivity({
          workspaceId,
          userId: get().currentUserId,
          target: project
            ? t('generatedInProject', { count: created.length, word, name: projectName })
            : t('generatedTasks', { count: created.length, word }),
          timestamp: created[0]?.createdAt ?? new Date().toISOString(),
        })
        set((state) => ({
          tasks: [...created, ...state.tasks.filter((item) => !created.some((task) => task.id === item.id))],
          activities: [activity, ...state.activities],
          remoteProjects: addTaskCount(state.remoteProjects, projectId, created.length),
          projects: addTaskCount(state.projects, projectId, created.length),
        }))
        get().showToast(
          project
            ? t('toastAddedToProject', { name: projectName, count: created.length })
            : t('toastAddedCount', { count: created.length }),
        )
        return true
      } catch {
        get().showToast(t('taskSaveFailed'))
        void get().loadRemoteBoards()
        return false
      }
    }
    const createdAt = new Date().toISOString()
    const created = normalized.map((draft, index) =>
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
    return true
  },

  setTaskStatus: async (id, status) => {
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
    if (!isPersistedBoard(get().remoteProjects, current.projectId)) return
    try {
      await updateBoardTask(id, { status })
    } catch {
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: current.status } : task)),
      }))
      get().showToast(t('taskSaveFailed'))
    }
  },

  updateTask: async (id, patch) => {
    const current = get().tasks.find((task) => task.id === id)
    if (!current) return
    const title = (patch.title ?? current.title).trim()
    if (!title) return
    const next: Task = {
      ...current,
      title,
      assigneeId: patch.assigneeId ?? current.assigneeId,
      priority: patch.priority ?? current.priority,
      deadline: patch.deadline ?? current.deadline,
      status: patch.status ?? current.status,
    }
    const same =
      next.title === current.title &&
      next.assigneeId === current.assigneeId &&
      next.priority === current.priority &&
      next.deadline === current.deadline &&
      next.status === current.status
    if (same) return
    const statusChanged = next.status !== current.status
    const onlyAssignee =
      next.assigneeId !== current.assigneeId &&
      next.title === current.title &&
      next.priority === current.priority &&
      next.deadline === current.deadline &&
      !statusChanged
    const activity = statusChanged
      ? makeActivity({
          workspaceId: current.workspaceId,
          type: next.status === 'done' ? 'task_completed' : 'status_changed',
          userId: get().currentUserId,
          target: next.title,
          meta: next.status,
          timestamp: new Date().toISOString(),
        })
      : null
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? next : task)),
      activities: activity ? [activity, ...state.activities] : state.activities,
    }))
    if (onlyAssignee) {
      const name = get().users.find((user) => user.id === next.assigneeId)?.name ?? ''
      get().showToast(t('toastTaskAssigned', { name }))
    } else if (
      statusChanged &&
      next.title === current.title &&
      next.assigneeId === current.assigneeId &&
      next.priority === current.priority &&
      next.deadline === current.deadline
    ) {
      get().showToast(next.status === 'done' ? t('toastTaskDone') : t('toastStatus', { status: statusText(next.status) }))
    } else {
      get().showToast(t('toastTaskUpdated'))
    }
    if (!isPersistedBoard(get().remoteProjects, current.projectId)) return
    try {
      await updateBoardTask(id, {
        title: next.title,
        assigneeId: next.assigneeId,
        priority: next.priority,
        deadline: next.deadline,
        status: next.status,
      })
    } catch {
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? current : task)),
      }))
      get().showToast(t('taskSaveFailed'))
    }
  },

  deleteTask: async (id) => {
    const current = get().tasks.find((task) => task.id === id)
    if (!current) return
    const persisted = isPersistedBoard(get().remoteProjects, current.projectId)
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      projects: addTaskCount(state.projects, current.projectId, -1),
      remoteProjects: addTaskCount(state.remoteProjects, current.projectId, -1),
    }))
    if (!persisted) {
      get().showToast(t('toastTaskDeleted'))
      return
    }
    try {
      await deleteBoardTask(id)
      get().showToast(t('toastTaskDeleted'))
    } catch {
      set((state) => ({
        tasks: state.tasks.some((task) => task.id === current.id) ? state.tasks : [current, ...state.tasks],
        projects: addTaskCount(state.projects, current.projectId, 1),
        remoteProjects: addTaskCount(state.remoteProjects, current.projectId, 1),
      }))
      get().showToast(t('taskSaveFailed'))
    }
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
    const role = asTeamRole(patch.role)
    if (!role) return
    const id = get().currentUserId
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...patch, role, initials: initialsFromName(patch.name) } : user,
      ),
    }))
    get().showToast(t('toastProfile'))
  },
  loadRemoteBoards: async () => {
    const sessionUserId = useAuthStore.getState().sessionUserId
    if (!sessionUserId) {
      set((state) => {
        const remoteIds = new Set(state.remoteProjects.map((project) => project.id))
        return {
          remoteProjects: [],
          tasks: state.tasks.filter((task) => !remoteIds.has(task.projectId)),
        }
      })
      return
    }
    try {
      const boards = await fetchBoards(get().workspaceId)
      let remoteTasks: Task[]
      try {
        remoteTasks = await fetchBoardTasks(boards.map((board) => board.id))
      } catch {
        set({ remoteProjects: boards })
        get().showToast(t('taskSaveFailed'))
        return
      }
      set((state) => {
        const remoteIds = new Set([
          ...state.remoteProjects.map((project) => project.id),
          ...boards.map((board) => board.id),
        ])
        return {
          remoteProjects: boards,
          tasks: [...remoteTasks, ...state.tasks.filter((task) => !remoteIds.has(task.projectId))],
        }
      })
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
  updateBoard: (id, { name, description, memberIds, status, deadline }) => {
    const title = name.trim()
    const text = description.trim()
    const people = [...new Set(memberIds)]
    if (!title || !text || people.length === 0 || !deadline) return false
    set((state) => {
      const patch = (item: Project): Project =>
        item.id === id
          ? { ...item, name: title, description: text, memberIds: people, status, deadline }
          : item
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
