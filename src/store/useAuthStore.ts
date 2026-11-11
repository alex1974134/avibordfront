import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { create } from 'zustand'
import { asTeamRole } from '../i18n/content'
import { t } from '../i18n/translate'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { colorFromId } from '../utils/memberColor'
import { initialsFromName } from '../utils/initials'
import { messageFromError, type AuthFeedback } from './authErrors'
import { useAppStore } from './useAppStore'

const workspaceIds = ['ws-studio']

export type { AuthFeedback }

interface AuthState {
  sessionUserId: string | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<AuthFeedback | null>
  register: (input: { name: string; email: string; password: string; role: string }) => Promise<AuthFeedback | null>
  logout: () => void
  syncUser: (user: User) => void
}

interface ProfileSnapshot {
  name: string
  email: string
  role: string
}

let remoteProfile: ProfileSnapshot | null = null
let applyingSession = false

function textMeta(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function snapshot(user: User): ProfileSnapshot {
  return { name: user.name, email: user.email, role: user.role }
}

function sameProfile(user: User, profile: ProfileSnapshot): boolean {
  return user.name === profile.name && user.email === profile.email && user.role === profile.role
}

function toAppUser(user: SupabaseUser): User {
  const name =
    textMeta(user.user_metadata?.name) ||
    textMeta(user.user_metadata?.full_name) ||
    user.email?.split('@')[0] ||
    'Участник'
  const role = textMeta(user.user_metadata?.role) || 'Участник'
  return {
    id: user.id,
    name,
    email: user.email ?? '',
    role,
    initials: initialsFromName(name),
    color: colorFromId(user.id),
    workspaceIds,
  }
}

function adoptUser(user: User) {
  useAppStore.setState((state) => ({
    currentUserId: user.id,
    users: state.users.some((item) => item.id === user.id)
      ? state.users.map((item) => (item.id === user.id ? { ...item, ...user } : item))
      : [...state.users, user],
  }))
}

function applySession(session: Session | null) {
  applyingSession = true
  try {
    const authUser = session?.user
    if (!authUser) {
      remoteProfile = null
      useAuthStore.setState({ sessionUserId: null, hydrated: true })
      void useAppStore.getState().loadRemoteBoards()
      return
    }
    const user = toAppUser(authUser)
    remoteProfile = snapshot(user)
    adoptUser(user)
    useAuthStore.setState({ sessionUserId: user.id, hydrated: true })
    void useAppStore.getState().loadRemoteBoards()
  } finally {
    applyingSession = false
  }
}

function redirectTo(): string {
  return `${window.location.origin}/dashboard`
}

export function startAuthListener(): () => void {
  localStorage.removeItem('aivibe-auth')
  let active = true
  void supabase.auth.getSession().then(({ data }) => {
    if (!active) return
    applySession(data.session)
  }).catch(() => {
    if (!active) return
    useAuthStore.setState({ hydrated: true })
  })

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session)
  })

  return () => {
    active = false
    data.subscription.unsubscribe()
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  sessionUserId: null,
  hydrated: false,
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return messageFromError(error, 'authLoginFailed')
    if (!data.session || !data.user) return { message: t('authLoginFailed') }
    applySession(data.session)
    return null
  },
  register: async ({ name, email, password, role }) => {
    const nextName = name.trim()
    const nextEmail = email.trim()
    const nextRole = role.trim()
    if (!nextRole) return { message: t('authRoleRequired') }
    const { data, error } = await supabase.auth.signUp({
      email: nextEmail,
      password,
      options: {
        data: { name: nextName, role: nextRole },
        emailRedirectTo: redirectTo(),
      },
    })
    if (error) return messageFromError(error, 'authSignupFailed')
    if (data.user && data.user.identities?.length === 0) return { message: t('emailTaken') }
    if (!data.session || !data.user) {
      return {
        confirm: true,
        message: t('authCheckEmail'),
      }
    }
    applySession(data.session)
    return null
  },
  logout: () => {
    remoteProfile = null
    set({ sessionUserId: null })
    void useAppStore.getState().loadRemoteBoards()
    void supabase.auth.signOut()
  },
  syncUser: (user) => {
    const role = asTeamRole(user.role)
    if (applyingSession || get().sessionUserId !== user.id || !role) return
    const next = { ...user, role }
    if (remoteProfile && sameProfile(next, remoteProfile)) return
    const previous = remoteProfile
    remoteProfile = snapshot(next)
    const data = { name: next.name, role: next.role }
    const attributes = previous && next.email !== previous.email ? { email: next.email, data } : { data }
    void supabase.auth.updateUser(attributes).then(({ error }) => {
      if (error && remoteProfile && sameProfile(next, remoteProfile)) remoteProfile = previous
    })
  },
}))
