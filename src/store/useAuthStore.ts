import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { initialsFromName } from '../utils/initials'
import { useAppStore } from './useAppStore'

const memberColors = ['#0f766e', '#1d4ed8', '#9a3412', '#6d28d9', '#0369a1', '#9d174d']
const workspaceIds = ['ws-studio']

export interface AuthFeedback {
  message: string
  confirm?: boolean
}

interface AuthState {
  sessionUserId: string | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<AuthFeedback | null>
  register: (input: { name: string; email: string; password: string }) => Promise<AuthFeedback | null>
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

function colorFromId(id: string): string {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return memberColors[hash % memberColors.length] ?? '#475569'
}

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
      return
    }
    const user = toAppUser(authUser)
    remoteProfile = snapshot(user)
    adoptUser(user)
    useAuthStore.setState({ sessionUserId: user.id, hydrated: true })
  } finally {
    applyingSession = false
  }
}

function redirectTo(): string {
  return `${window.location.origin}/dashboard`
}

function messageFromError(error: { message: string; code?: string }, fallback: string): AuthFeedback {
  const code = error.code ?? ''
  const text = error.message.toLowerCase()
  if (code === 'invalid_credentials' || text.includes('invalid login credentials')) {
    return { message: 'Неверная почта или пароль.' }
  }
  if (code === 'email_not_confirmed' || text.includes('email not confirmed')) {
    return { message: 'Сначала подтвердите почту по ссылке из письма.' }
  }
  if (
    code === 'user_already_exists' ||
    text.includes('already registered') ||
    text.includes('already been registered')
  ) {
    return { message: 'Эта почта уже занята.' }
  }
  if (code === 'weak_password' || text.includes('password')) {
    return { message: 'Пароль должен быть не короче 6 символов.' }
  }
  if (code === 'over_request_rate_limit' || text.includes('rate limit')) {
    return { message: 'Слишком много попыток. Подождите немного и попробуйте снова.' }
  }
  if (code === 'email_address_invalid' || text.includes('email address') && text.includes('invalid')) {
    return { message: 'Эта почта не принимается. Укажите настоящий адрес.' }
  }
  if (code === 'signup_disabled' || text.includes('signups not allowed')) {
    return { message: 'Регистрация сейчас отключена.' }
  }
  return { message: fallback }
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
    if (error) return messageFromError(error, 'Не удалось войти. Попробуйте ещё раз.')
    if (!data.session || !data.user) return { message: 'Не удалось войти. Попробуйте ещё раз.' }
    applySession(data.session)
    return null
  },
  register: async ({ name, email, password }) => {
    const nextName = name.trim()
    const nextEmail = email.trim()
    const { data, error } = await supabase.auth.signUp({
      email: nextEmail,
      password,
      options: {
        data: { name: nextName, role: 'Участник' },
        emailRedirectTo: redirectTo(),
      },
    })
    if (error) return messageFromError(error, 'Не удалось создать аккаунт. Попробуйте ещё раз.')
    if (data.user && data.user.identities?.length === 0) return { message: 'Эта почта уже занята.' }
    if (!data.session || !data.user) {
      return {
        confirm: true,
        message: 'Аккаунт создан. Подтвердите почту по ссылке из письма — после этого откроется главная страница.',
      }
    }
    applySession(data.session)
    return null
  },
  logout: () => {
    remoteProfile = null
    set({ sessionUserId: null })
    void supabase.auth.signOut()
  },
  syncUser: (user) => {
    if (applyingSession || get().sessionUserId !== user.id) return
    if (remoteProfile && sameProfile(user, remoteProfile)) return
    const previous = remoteProfile
    remoteProfile = snapshot(user)
    const data = { name: user.name, role: user.role }
    const attributes = previous && user.email !== previous.email ? { email: user.email, data } : { data }
    void supabase.auth.updateUser(attributes).then(({ error }) => {
      if (error && remoteProfile && sameProfile(user, remoteProfile)) remoteProfile = previous
    })
  },
}))
