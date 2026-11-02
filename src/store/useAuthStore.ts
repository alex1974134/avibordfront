import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { users as seedUsers } from '../data/mockUsers'
import type { User } from '../types'
import { initialsFromName } from '../utils/initials'
import { useAppStore } from './useAppStore'

export const DEMO_PASSWORD = 'aivibe'

const memberColors = ['#0f766e', '#1d4ed8', '#9a3412', '#6d28d9', '#0369a1', '#9d174d']

export interface AuthAccount {
  password: string
  user: User
}

interface AuthState {
  sessionUserId: string | null
  accounts: AuthAccount[]
  hydrated: boolean
  login: (email: string, password: string) => string | null
  register: (input: { name: string; email: string; password: string }) => string | null
  logout: () => void
  syncUser: (user: User) => void
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function adoptUser(user: User) {
  useAppStore.setState((state) => ({
    currentUserId: user.id,
    users: state.users.some((item) => item.id === user.id)
      ? state.users.map((item) => (item.id === user.id ? { ...item, ...user } : item))
      : [...state.users, user],
  }))
}

export function restoreSession(sessionUserId: string | null, accounts: AuthAccount[]) {
  if (!sessionUserId) return
  const account = accounts.find((item) => item.user.id === sessionUserId)
  if (account) {
    adoptUser(account.user)
    return
  }
  if (seedUsers.some((item) => item.id === sessionUserId)) {
    useAppStore.setState({ currentUserId: sessionUserId })
    return
  }
  queueMicrotask(() => useAuthStore.setState({ sessionUserId: null }))
}

let markHydrated: (() => void) | undefined

export function finishAuthHydration() {
  const { hydrated, sessionUserId, accounts } = useAuthStore.getState()
  if (hydrated) return
  restoreSession(sessionUserId, accounts)
  useAuthStore.setState({ hydrated: true })
}

function emailTaken(email: string, accounts: AuthAccount[]): boolean {
  const normalized = normalizeEmail(email)
  return (
    seedUsers.some((item) => item.email.toLowerCase() === normalized) ||
    accounts.some((item) => item.user.email.toLowerCase() === normalized) ||
    useAppStore.getState().users.some((item) => item.email.toLowerCase() === normalized)
  )
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      markHydrated = () => set({ hydrated: true })
      return {
      sessionUserId: null,
      accounts: [],
      hydrated: false,
      login: (email, password) => {
        const normalized = normalizeEmail(email)
        const account = get().accounts.find((item) => item.user.email.toLowerCase() === normalized)
        if (account) {
          if (account.password !== password) return 'Неверная почта или пароль.'
          set({ sessionUserId: account.user.id })
          adoptUser(account.user)
          return null
        }
        const seed = seedUsers.find((item) => item.email.toLowerCase() === normalized)
        if (!seed || password !== DEMO_PASSWORD) return 'Неверная почта или пароль.'
        set({ sessionUserId: seed.id })
        adoptUser(seed)
        return null
      },
      register: ({ name, email, password }) => {
        const nextName = name.trim()
        const nextEmail = email.trim()
        if (emailTaken(nextEmail, get().accounts)) return 'Эта почта уже занята.'
        const user: User = {
          id: crypto.randomUUID(),
          name: nextName,
          email: nextEmail,
          role: 'Участник',
          initials: initialsFromName(nextName),
          color: memberColors[(seedUsers.length + get().accounts.length) % memberColors.length] ?? '#475569',
          workspaceIds: ['ws-studio'],
        }
        set({
          accounts: [...get().accounts, { password, user }],
          sessionUserId: user.id,
        })
        adoptUser(user)
        return null
      },
      logout: () => set({ sessionUserId: null }),
      syncUser: (user) => {
        set({
          accounts: get().accounts.map((item) => (item.user.id === user.id ? { ...item, user } : item)),
        })
      },
    }
    },
    {
      name: 'aivibe-auth',
      partialize: (state) => ({
        sessionUserId: state.sessionUserId,
        accounts: state.accounts,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) restoreSession(state.sessionUserId, state.accounts)
        markHydrated?.()
      },
    },
  ),
)
